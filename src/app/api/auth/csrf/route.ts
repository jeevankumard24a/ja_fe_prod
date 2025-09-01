// app/api/auth/csrf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createCsrfToken } from "../../_lib/csrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // ensure no static caching

export async function GET(_req: NextRequest) {
    const token = createCsrfToken();

    // Host-only CSRF cookie (recommended):
    // - NOT HttpOnly (client must read to send X-CSRF-Token header)
    // - Secure + SameSite=Lax + Path=/
    const res = NextResponse.json({ ok: true, message: "CSRF issued" }, { status: 200 });
    res.cookies.set("csrfToken", token, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
    });

    // No-store headers
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");

    return res;
}
