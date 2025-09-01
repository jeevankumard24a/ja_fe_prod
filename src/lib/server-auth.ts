// lib/server-auth.ts (server-only)
import { cookies, headers } from "next/headers";

type Session = { user_id: string } | null;

export async function serverRefreshIfNeeded(): Promise<Session> {
    const jar = await cookies();                // synchronous in Next 14/15
    const sid = jar.get("__Host-sid")?.value;
    const uid = jar.get("__Host-uid")?.value;

    // Fast path: already have session markers
    if (sid && uid) return { user_id: uid };

    // Need to refresh once
    const csrf = jar.get("csrfToken")?.value || "";
    const refresh = jar.get("refreshToken")?.value || "";

    // If we don't even have the cookies, don't bother calling refresh
    if (!csrf || !refresh) return null;

    // Correlate logs
    const h = await headers();
    const reqId = h.get("x-request-id") ?? "";

    // IMPORTANT: explicitly forward cookies to the refresh route
    // Keep it minimal (only what's needed) and respect the refresh path.
    const cookieHeader = `refreshToken=${refresh}; csrfToken=${csrf}`;

    // If your refresh endpoint lives on a different subdomain,
    // set NEXT_PUBLIC_AUTH_ORIGIN to e.g. "https://auth.jalgo.ai".
    const base =
        process.env.NEXT_PUBLIC_AUTH_ORIGIN?.trim() ||
        process.env.NEXT_PUBLIC_APP_ORIGIN?.trim() ||
        ""; // fallback: if empty, use a relative URL

    const url = base
        ? `${base}/api/auth/refresh`
        : `/api/auth/refresh`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Cookie: cookieHeader,        // <-- this is the fix
            "X-CSRF-Token": csrf,        // double-submit
            "x-request-id": reqId,
            Accept: "application/json",
        },
        cache: "no-store",
    });

    if (!res.ok) return null;

    const data = (await res.json().catch(() => null)) as { user_id?: string } | null;
    if (!data?.user_id) return null;

    // At this point, the refresh route should have set __Host-sid/__Host-uid,
    // so subsequent calls will hit the fast path above.
    return { user_id: data.user_id };
}
