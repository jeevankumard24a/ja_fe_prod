'use client';

export function readCookie(name: string) {
    const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[2]) : null;
}

export async function refreshAccessToken() {
    const csrf = readCookie("csrfToken");
    const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: csrf ? { "X-CSRF-Token": csrf } : {},
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Refresh failed");
    return res.json() as Promise<{ ok: true; accessToken: string; user_id?: string }>;
}
