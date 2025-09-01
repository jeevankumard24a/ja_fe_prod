// utils/call_api/fetchWithAutoAuth.ts
import type { NextRequest } from "next/server";
import ApiError from "@/components/utils/ApiError";
import { parseBackendResponse } from "@/utils/parseBackendResponse";

const AT_COOKIE_NAMES = ["__Secure-at", "__Host-at"];
const RT_COOKIE_NAMES = ["__Secure-rt", "__Host-rt"];

const splitSetCookie = (v: string | null) =>
    v ? v.split(/,(?=\s*[^;=]+?=)/g).map(s => s.trim()).filter(Boolean) : [];

const hasAny = (cookieHdr: string, names: string[]) =>
    names.some(n => new RegExp(`(?:^|;\\s*)${n}=`).test(cookieHdr));

const readAtFromCookies = (cookieHdr: string) => {
    for (const n of AT_COOKIE_NAMES) {
        const m = new RegExp(`(?:^|;\\s*)${n}=([^;]*)`).exec(cookieHdr);
        if (m) return decodeURIComponent(m[1]);
    }
    return null;
};

export async function fetchWithAutoAuth(
    req: NextRequest,
    upstreamUrl: string,
    init: RequestInit = {},
    opts?: {
        API_BASE_URL?: string;                    // pass from your route
        correlationHeaders?: Record<string,string>;
        requestId?: string;
        actionId?: string;
    }
): Promise<{ response: Response; setCookies: string[] }> {
    const API_BASE_URL = opts?.API_BASE_URL || process.env.API_BASE_URL || "";
    if (!API_BASE_URL) throw new Error("API_BASE_URL missing");

    const correlationHeaders = opts?.correlationHeaders ?? {};
    const { requestId, actionId } = opts ?? {};
    const stagedCookies: string[] = [];

    const cookieHdr = req.headers.get("cookie") || "";
    const at = readAtFromCookies(cookieHdr);

    const common = {
        ...correlationHeaders,
        "user-agent": req.headers.get("user-agent") || "",
        ...(req.headers.get("x-forwarded-for")
            ? { "x-forwarded-for": req.headers.get("x-forwarded-for") as string }
            : {}),
    };

    const doFetch = (accessToken?: string) => {
        const headers = new Headers(init.headers || undefined);
        for (const [k, v] of Object.entries(common)) headers.set(k, v);
        if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
        return fetch(upstreamUrl, { ...init, headers, cache: "no-store", redirect: "manual" });
    };

    const refreshAT = async (): Promise<string | null> => {
        // must have RT cookie to refresh
        if (!hasAny(cookieHdr, RT_COOKIE_NAMES)) return null;

        let r: Response;
        try {
            r = await fetch(`${API_BASE_URL}/ipa/v1/auth/refresh-token`, {
                method: "POST",
                headers: {
                    ...common,
                    ...(cookieHdr ? { cookie: cookieHdr } : {}),
                },
                cache: "no-store",
                redirect: "manual",
            });
        } catch (err) {
            throw new ApiError(503, "Failed to connect to backend (refresh)", "NETWORK_ERROR", { error: err }, requestId, actionId);
        }

        splitSetCookie(r.headers.get("set-cookie")).forEach(c => stagedCookies.push(c));

        const env = await parseBackendResponse(r, "Failed to refresh token", requestId, actionId, req);
        const raw = env?.data ?? env ?? {};
        return raw?.accessToken ?? null;
    };

    // First attempt (use cookie AT if present)
    let resp: Response;
    try {
        resp = await doFetch(at || undefined);
    } catch (err) {
        throw new ApiError(503, "Failed to connect to backend", "NETWORK_ERROR", { error: err }, requestId, actionId);
    }

    if (resp.status !== 401) {
        splitSetCookie(resp.headers.get("set-cookie")).forEach(c => stagedCookies.push(c));
        return { response: resp, setCookies: stagedCookies };
    }

    // 401 → refresh then retry once
    const minted = await refreshAT();
    if (!minted) {
        splitSetCookie(resp.headers.get("set-cookie")).forEach(c => stagedCookies.push(c));
        throw new ApiError(401, "Unauthorized (refresh failed)", "TOKEN_REFRESH_FAILED", null, requestId, actionId);
    }

    let retry: Response;
    try {
        retry = await doFetch(minted);
    } catch (err) {
        throw new ApiError(503, "Failed to connect to backend", "NETWORK_ERROR", { error: err }, requestId, actionId);
    }

    splitSetCookie(retry.headers.get("set-cookie")).forEach(c => stagedCookies.push(c));
    if (retry.status === 401) {
        throw new ApiError(401, "Unauthorized", "INVALID_ACCESS_TOKEN", null, requestId, actionId);
    }

    return { response: retry, setCookies: stagedCookies };
}
