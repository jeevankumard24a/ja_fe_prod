import type { NextRequest } from "next/server";
import ApiError from "@/components/utils/ApiError";
import { parseBackendResponse } from "@/utils/parseBackendResponse";

// simple cookie parser for a single name
function getCookieVal(cookieHeader: string, name: string): string | undefined {
    const re = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`);
    const m = re.exec(cookieHeader);
    return m ? decodeURIComponent(m[1]) : undefined;
}

/**
 * Fetch an upstream (Express) URL ensuring a valid access token:
 * - Reads AT from HttpOnly cookie (__Secure-at, fallback __Host-at).
 * - Uses Authorization from init.headers if explicitly provided (overrides cookie).
 * - If upstream returns 401, calls internal /api/auth/refresh (using refresh cookie) to mint a new AT.
 * - Retries the upstream call once with the new AT.
 * - Returns the final upstream Response + any Set-Cookie headers to forward.
 */
export async function fetchWithAutoRefresh(
    req: NextRequest,
    upstreamUrl: string,
    init: RequestInit = {},
    options?: {
        correlationHeaders?: Record<string, string>;
        requestId?: string;
        actionId?: string;
    }
): Promise<{ response: Response; setCookies: string[] }> {
    const requestId = options?.requestId;
    const actionId = options?.actionId;
    const correlationHeaders = options?.correlationHeaders ?? {};

    const stagedCookies: string[] = [];
    const collectSetCookies = (r: Response) => {
        const sc = r.headers.get("set-cookie");
        if (!sc) return;
        for (const c of sc.split(/,(?=\s*[^;=]+?=)/g)) if (c) stagedCookies.push(c);
    };

    const cookieHeader = req.headers.get("cookie") || "";
    const atFromCookie =
        getCookieVal(cookieHeader, "__Secure-at") ??
        getCookieVal(cookieHeader, "__Host-at"); // fallback if you deploy same-site

    const hFromInit = new Headers(init.headers || undefined);
    const authFromInit = hFromInit.get("authorization"); // explicit override

    // initial Authorization preference:
    // 1) explicit init header
    // 2) cookie-derived AT
    const initialAuth = authFromInit || (atFromCookie ? `Bearer ${atFromCookie}` : "");

    const commonHeaders = {
        ...correlationHeaders,
        "user-agent": req.headers.get("user-agent") || "",
        ...(req.headers.get("x-forwarded-for")
            ? { "x-forwarded-for": req.headers.get("x-forwarded-for") as string }
            : {}),
    };

    const doFetch = (accessToken?: string) => {
        const headers = new Headers(init.headers || undefined);
        for (const [k, v] of Object.entries(commonHeaders)) headers.set(k, v);

        if (accessToken) {
            headers.set("authorization", `Bearer ${accessToken}`);
        } else if (initialAuth) {
            headers.set("authorization", initialAuth);
        }

        return fetch(upstreamUrl, {
            ...init,
            headers,
            cache: "no-store",
            redirect: "manual",
        });
    };

    const mintAccessToken = async (): Promise<string | null> => {
        // Call internal Next route /api/auth/refresh, forwarding the refresh cookie.
        const origin = new URL(req.url).origin;
        const r = await fetch(`${origin}/api/auth/refresh`, {
            method: "POST",
            cache: "no-store",
            redirect: "manual",
            headers: {
                ...correlationHeaders,
                ...(cookieHeader ? { cookie: cookieHeader } : {}),
                "user-agent": req.headers.get("user-agent") || "",
                ...(req.headers.get("x-forwarded-for")
                    ? { "x-forwarded-for": req.headers.get("x-forwarded-for") as string }
                    : {}),
            },
        });

        collectSetCookies(r);

        // Our internal route returns a standard envelope; parse it
        const env = await parseBackendResponse(r, "Failed to refresh token", requestId, actionId, req);
        const d = env?.data ?? env ?? {};
        const at: string | undefined = d?.accessToken;

        return at ?? null;
    };

    // First attempt
    let resp: Response;
    try {
        resp = await doFetch();
    } catch (err) {
        throw new ApiError(503, "Failed to connect to backend", "NETWORK_ERROR", { error: err }, requestId, actionId);
    }

    if (resp.status !== 401) {
        collectSetCookies(resp);
        return { response: resp, setCookies: stagedCookies };
    }

    // 401 → try silent refresh then retry once
    const minted = await mintAccessToken();
    if (!minted) {
        collectSetCookies(resp);
        throw new ApiError(401, "Unauthorized (refresh failed)", "TOKEN_REFRESH_FAILED", null, requestId, actionId);
    }

    let retry: Response;
    try {
        retry = await doFetch(minted);
    } catch (err) {
        throw new ApiError(503, "Failed to connect to backend", "NETWORK_ERROR", { error: err }, requestId, actionId);
    }

    collectSetCookies(retry);
    if (retry.status === 401) {
        throw new ApiError(401, "Unauthorized", "INVALID_ACCESS_TOKEN", null, requestId, actionId);
    }

    return { response: retry, setCookies: stagedCookies };
}
