import type { NextRequest } from "next/server";
import ApiError from "@/components/utils/ApiError";
import { parseBackendResponse } from "@/utils/parseBackendResponse";

/** Names we’ll accept for the Access-Token cookie */
const AT_COOKIE_NAMES = ["__Secure-at", "__Host-at"];

/* ---------------- logging-safe helpers ---------------- */
function splitSetCookie(headerVal: string | null): string[] {
    if (!headerVal) return [];
    return headerVal.split(/,(?=\s*[^;=]+?=)/g).map(s => s.trim()).filter(Boolean);
}

function cookieNamesFromHeader(raw: string) {
    if (!raw) return [];
    return raw
        .split(";")
        .map(s => s.trim())
        .filter(Boolean)
        .map(p => p.split("=")[0].trim())
        .filter(Boolean);
}

function getCookie(req: NextRequest, name: string): string | null {
    const raw = req.headers.get("cookie") || "";
    const parts = raw.split(";").map(p => p.trim());
    for (const p of parts) {
        const idx = p.indexOf("=");
        if (idx === -1) continue;
        const k = p.slice(0, idx).trim();
        if (k === name) return decodeURIComponent(p.slice(idx + 1));
    }
    return null;
}

function readAccessTokenFromCookies(req: NextRequest): { token: string | null; foundIn: string | null } {
    for (const name of AT_COOKIE_NAMES) {
        const v = getCookie(req, name);
        if (v) return { token: v, foundIn: name };
    }
    return { token: null, foundIn: null };
}

/** Collect Set-Cookie headers for forwarding back to the browser */
function collectSetCookies(from: Response, bag: string[]) {
    const all = splitSetCookie(from.headers.get("set-cookie"));
    if (all.length) bag.push(...all);
}

function short(s: string | null | undefined, max = 600) {
    if (!s) return "";
    return s.length > max ? s.slice(0, max) + "…[truncated]" : s;
}

/* ---------------- internal refresh (calls Next route → Express) ---------------- */
async function mintAccessTokenViaInternalRoute(
    req: NextRequest,
    correlationHeaders: Record<string, string>,
    requestId?: string,
    actionId?: string
): Promise<{ accessToken: string | null; setCookies: string[] }> {
    const setCookies: string[] = [];
    const origin = req.nextUrl.origin;
    const cookie = req.headers.get("cookie") || "";
    const cookieNames = cookieNamesFromHeader(cookie);
    const start = Date.now();

    console.info("auth.refresh.begin", {
        requestId,
        actionId,
        origin,
        path: "/api/auth/refresh",
        hasCookie: Boolean(cookie),
        cookieNames, // names only, never values
        corrHdrs: Object.keys(correlationHeaders),
    });

    let r: Response;
    try {
        r = await fetch(`${origin}/api/auth/refresh`, {
            method: "POST",
            cache: "no-store",
            redirect: "manual",
            headers: {
                ...correlationHeaders,
                ...(cookie ? { cookie } : {}),
                "user-agent": req.headers.get("user-agent") || "",
                ...(req.headers.get("x-forwarded-for")
                    ? { "x-forwarded-for": req.headers.get("x-forwarded-for") as string }
                    : {}),
            },
        });
    } catch (err: any) {
        console.error("auth.refresh.fetch_failed", {
            requestId,
            actionId,
            errName: err?.name,
            errMsg: err?.message,
            durationMs: Date.now() - start,
        });
        throw new ApiError(
            503,
            "Failed to connect to backend (refresh)",
            "NETWORK_ERROR",
            { error: { name: err?.name, message: err?.message } },
            requestId,
            actionId
        );
    }

    const status = r.status;
    const ct = r.headers.get("content-type") || "";
    const respReqId = r.headers.get("x-request-id") || undefined;
    const respActId = r.headers.get("x-action-id") || undefined;
    const bodyPreview = short(await r.clone().text().catch(() => ""));

    console.info("auth.refresh.response", {
        requestId,
        actionId,
        respRequestId: respReqId,
        respActionId: respActId,
        status,
        contentType: ct,
        hasSetCookie: Boolean(r.headers.get("set-cookie")),
        bodyPreview: status >= 400 ? bodyPreview : undefined, // only on error
        durationMs: Date.now() - start,
    });

    collectSetCookies(r, setCookies);

    try {
        const env = await parseBackendResponse(r, "Failed to refresh token", requestId, actionId, req);
        const raw = env?.data ?? env ?? {};
        const at: string | undefined = raw?.accessToken;

        console.info("auth.refresh.parsed", {
            requestId,
            actionId,
            hasAccessToken: Boolean(at), // never log token value
            setCookieCount: setCookies.length,
        });

        return { accessToken: at ?? null, setCookies };
    } catch (err: any) {
        console.error("auth.refresh.parse_failed", {
            requestId,
            actionId,
            status,
            contentType: ct,
            bodyPreview, // truncated
            errName: err?.name,
            errMsg: err?.message,
            durationMs: Date.now() - start,
        });
        throw err;
    }
}

/* ---------------- main helper: fetch upstream with auto auth ---------------- */
export async function fetchWithAutoAuth(
    req: NextRequest,
    upstreamUrl: string,
    init: RequestInit = {},
    opts?: {
        correlationHeaders?: Record<string, string>;
        requestId?: string;
        actionId?: string;
    }
): Promise<{ response: Response; setCookies: string[] }> {
    const correlationHeaders = opts?.correlationHeaders ?? {};
    const requestId = opts?.requestId;
    const actionId = opts?.actionId;

    const stagedCookies: string[] = [];
    const start = Date.now();

    console.info("auth.auto.start", {
        requestId,
        actionId,
        upstreamUrl,
        method: (init.method || "GET").toUpperCase(),
    });

    const commonHeaders = {
        ...correlationHeaders,
        "user-agent": req.headers.get("user-agent") || "",
        ...(req.headers.get("x-forwarded-for")
            ? { "x-forwarded-for": req.headers.get("x-forwarded-for") as string }
            : {}),
    };

    const doFetch = async (accessToken?: string) => {
        const headers = new Headers(init.headers || undefined);
        for (const [k, v] of Object.entries(commonHeaders)) headers.set(k, v);
        if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
        const resp = await fetch(upstreamUrl, {
            ...init,
            headers,
            cache: "no-store",
            redirect: "manual",
        });
        return resp;
    };

    // Step 1: try AT from cookie; if none, refresh first
    const { token: atCookie, foundIn } = readAccessTokenFromCookies(req);
    console.info("auth.auto.cookie_check", {
        requestId,
        actionId,
        foundIn,            // which cookie name, not the value
        hasAccessToken: Boolean(atCookie),
    });

    let at = atCookie;
    if (!at) {
        console.info("auth.auto.no_cookie_token_refreshing", { requestId, actionId });
        const minted = await mintAccessTokenViaInternalRoute(req, correlationHeaders, requestId, actionId);
        stagedCookies.push(...minted.setCookies);
        at = minted.accessToken;
        console.info("auth.auto.refresh_result", {
            requestId,
            actionId,
            obtainedToken: Boolean(at),
            cookiesFromRefresh: minted.setCookies.length,
        });
    }

    // First attempt
    let resp: Response;
    try {
        resp = await doFetch(at || undefined);
    } catch (err: any) {
        console.error("auth.auto.fetch_failed", {
            requestId,
            actionId,
            errName: err?.name,
            errMsg: err?.message,
            durationMs: Date.now() - start,
        });
        throw new ApiError(503, "Failed to connect to backend", "NETWORK_ERROR", { error: err }, requestId, actionId);
    }

    console.info("auth.auto.first_response", {
        requestId,
        actionId,
        status: resp.status,
        hasSetCookie: Boolean(resp.headers.get("set-cookie")),
    });

    if (resp.status !== 401) {
        collectSetCookies(resp, stagedCookies);
        console.info("auth.auto.done_first_ok", {
            requestId,
            actionId,
            forwardedCookies: stagedCookies.length,
            durationMs: Date.now() - start,
        });
        return { response: resp, setCookies: stagedCookies };
    }

    // 401 → refresh then retry once
    console.warn("auth.auto.first_401_refreshing", { requestId, actionId });

    const minted = await mintAccessTokenViaInternalRoute(req, correlationHeaders, requestId, actionId);
    stagedCookies.push(...minted.setCookies);

    if (!minted.accessToken) {
        collectSetCookies(resp, stagedCookies);
        console.error("auth.auto.refresh_failed_no_token", {
            requestId,
            actionId,
            forwardedCookies: stagedCookies.length,
            durationMs: Date.now() - start,
        });
        throw new ApiError(401, "Unauthorized (refresh failed)", "TOKEN_REFRESH_FAILED", null, requestId, actionId);
    }

    let retry: Response;
    try {
        retry = await doFetch(minted.accessToken);
    } catch (err: any) {
        console.error("auth.auto.retry_fetch_failed", {
            requestId,
            actionId,
            errName: err?.name,
            errMsg: err?.message,
            durationMs: Date.now() - start,
        });
        throw new ApiError(503, "Failed to connect to backend", "NETWORK_ERROR", { error: err }, requestId, actionId);
    }

    console.info("auth.auto.retry_response", {
        requestId,
        actionId,
        status: retry.status,
        hasSetCookie: Boolean(retry.headers.get("set-cookie")),
    });

    if (retry.status === 401) {
        collectSetCookies(retry, stagedCookies);
        console.error("auth.auto.retry_still_401", {
            requestId,
            actionId,
            forwardedCookies: stagedCookies.length,
            durationMs: Date.now() - start,
        });
        throw new ApiError(401, "Unauthorized", "INVALID_ACCESS_TOKEN", null, requestId, actionId);
    }

    collectSetCookies(retry, stagedCookies);
    console.info("auth.auto.done_retry_ok", {
        requestId,
        actionId,
        forwardedCookies: stagedCookies.length,
        durationMs: Date.now() - start,
    });

    return { response: retry, setCookies: stagedCookies };
}

/** Utility to append Set-Cookie headers to a NextResponse */
export function appendSetCookies(nextRes: Response, cookies: string[]) {
    const hdrs = (nextRes as any).headers as Headers;
    for (const c of cookies) hdrs.append("set-cookie", c);
    console.info("auth.auto.append_set_cookies", { appended: cookies.length });
}
