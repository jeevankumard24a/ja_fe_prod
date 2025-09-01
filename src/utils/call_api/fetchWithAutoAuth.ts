import type { NextRequest } from "next/server";
import ApiError from "@/components/utils/ApiError";
import { parseBackendResponse } from "@/utils/parseBackendResponse";

/** Names we’ll accept for the Access-Token cookie */
const AT_COOKIE_NAMES = ["__Secure-at", "__Host-at"];

/** Split multiple Set-Cookie headers safely */
function splitSetCookie(headerVal: string | null): string[] {
    if (!headerVal) return [];
    return headerVal.split(/,(?=\s*[^;=]+?=)/g).map(s => s.trim()).filter(Boolean);
}

function getCookie(req: NextRequest, name: string): string | null {
    // Works on both Node/Edge: read raw Cookie header and parse
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

function readAccessTokenFromCookies(req: NextRequest): string | null {
    for (const name of AT_COOKIE_NAMES) {
        const v = getCookie(req, name);
        if (v) return v;
    }
    return null;
}

/** Collect Set-Cookie headers for forwarding back to the browser */
function collectSetCookies(from: Response, bag: string[]) {
    const all = splitSetCookie(from.headers.get("set-cookie"));
    if (all.length) bag.push(...all);
}

/** Call our internal refresh API (which talks to Express using the refresh cookie) */
async function mintAccessTokenViaInternalRoute(
    req: NextRequest,
    correlationHeaders: Record<string, string>,
    requestId?: string,
    actionId?: string
): Promise<{ accessToken: string | null; setCookies: string[] }> {
    const setCookies: string[] = [];
    const origin = new URL(req.url).origin;
    const cookie = req.headers.get("cookie") || "";

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
    } catch (err) {
        throw new ApiError(503, "Failed to connect to backend (refresh)", "NETWORK_ERROR", { error: err }, requestId, actionId);
    }

    collectSetCookies(r, setCookies);

    const env = await parseBackendResponse(r, "Failed to refresh token", requestId, actionId, req);
    const raw = env?.data ?? env ?? {};
    const at: string | undefined = raw?.accessToken;

    return { accessToken: at ?? null, setCookies };
}

/**
 * Main helper: fetch upstream with auto auth
 * - Reads AT from HttpOnly cookie (__Secure-at/__Host-at). If missing → try internal refresh → retry.
 * - If first call returns 401 → refresh → retry once.
 * - Returns the upstream response + any Set-Cookie headers to forward.
 */
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
        return fetch(upstreamUrl, {
            ...init,
            headers,
            cache: "no-store",
            redirect: "manual",
        });
    };

    // Step 1: try AT from cookie; if none, do a refresh first
    let at = readAccessTokenFromCookies(req);
    if (!at) {
        const minted = await mintAccessTokenViaInternalRoute(req, correlationHeaders, requestId, actionId);
        stagedCookies.push(...minted.setCookies);
        at = minted.accessToken;
    }

    // First attempt
    let resp: Response;
    try {
        resp = await doFetch(at || undefined);
    } catch (err) {
        throw new ApiError(503, "Failed to connect to backend", "NETWORK_ERROR", { error: err }, requestId, actionId);
    }

    if (resp.status !== 401) {
        collectSetCookies(resp, stagedCookies);
        return { response: resp, setCookies: stagedCookies };
    }

    // 401 → refresh then retry once
    const minted = await mintAccessTokenViaInternalRoute(req, correlationHeaders, requestId, actionId);
    stagedCookies.push(...minted.setCookies);

    if (!minted.accessToken) {
        // refresh failed → propagate 401
        collectSetCookies(resp, stagedCookies);
        throw new ApiError(401, "Unauthorized (refresh failed)", "TOKEN_REFRESH_FAILED", null, requestId, actionId);
    }

    let retry: Response;
    try {
        retry = await doFetch(minted.accessToken);
    } catch (err) {
        throw new ApiError(503, "Failed to connect to backend", "NETWORK_ERROR", { error: err }, requestId, actionId);
    }

    if (retry.status === 401) {
        collectSetCookies(retry, stagedCookies);
        throw new ApiError(401, "Unauthorized", "INVALID_ACCESS_TOKEN", null, requestId, actionId);
    }

    collectSetCookies(retry, stagedCookies);
    return { response: retry, setCookies: stagedCookies };
}

/** Utility to append Set-Cookie headers to a NextResponse */
export function appendSetCookies(nextRes: Response, cookies: string[]) {
    const hdrs = (nextRes as any).headers as Headers;
    for (const c of cookies) hdrs.append("set-cookie", c);
}
