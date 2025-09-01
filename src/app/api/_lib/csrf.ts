// app/api/_lib/csrf.ts
import type { NextRequest } from "next/server";

export const CSRF_COOKIE = "csrfToken";

// Generate a strong token (Edge/Node compatible)
export function createCsrfToken() {
    // 32 random bytes → base64url (~43 chars)
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    // base64url without padding
    let b64 = btoa(String.fromCharCode(...bytes));
    b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return b64;
}

// Write the readable CSRF cookie
export function setCsrfCookie(res: Response & { cookies: any }, token: string, maxAgeSeconds = 60 * 60) {
    res.cookies.set(CSRF_COOKIE, token, {
        httpOnly: false,     // readable by client JS
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: maxAgeSeconds,
    });
}

// Read helpers
export function getCsrfFromCookie(req: NextRequest) {
    return req.cookies.get(CSRF_COOKIE)?.value ?? null;
}
export function getCsrfFromHeader(req: NextRequest) {
    // accept either header name
    return req.headers.get("x-csrf-token") || req.headers.get("x-xsrf-token");
}

// Only enforce on state-changing methods
export function methodNeedsCsrf(method: string) {
    return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

// Origin/Referer allowlist (supports prod + dev)
export function assertOrigin(req: NextRequest, allowedHostSuffix = ".jalgo.ai") {
    const src = req.headers.get("origin") || req.headers.get("referer");
    try {
        const host = src ? new URL(src).hostname : "";
        const ok =
            host === "jalgo.ai" ||
            host.endsWith(allowedHostSuffix) ||
            host === "localhost" ||
            host === "127.0.0.1";
        if (ok) return;
    } catch {}
    throw new Error("ORIGIN_CHECK_FAILED");
}

// Double-submit check (cookie vs header)
export function assertCsrf(req: NextRequest) {
    const cookie = getCsrfFromCookie(req);
    const header = getCsrfFromHeader(req);
    if (!cookie || !header || cookie !== header) {
        throw new Error("CSRF_VALIDATION_FAILED");
    }
}
