// utils/call_api/cookieNames.ts
export const IS_CROSS_SITE = process.env.COOKIE_CROSS_SITE === "true";
export const PARENT_DOMAIN = process.env.COOKIE_PARENT_DOMAIN || ".jalgo.ai";

export const ACCESS_COOKIE  = IS_CROSS_SITE ? "__Secure-at" : "__Host-at";
export const REFRESH_COOKIE = IS_CROSS_SITE ? "__Secure-rt" : "__Host-rt";

// Keep these in sync with your token TTLs
function parseMs(str = "15m") {
    const m = /^(\d+)([smhd])$/i.exec(String(str).trim());
    if (!m) return 15 * 60 * 1000;
    const n = +m[1];
    const u = m[2].toLowerCase();
    return u === "s" ? n * 1000 : u === "m" ? n * 60000 : u === "h" ? n * 3600000 : n * 86400000;
}

export const ACCESS_MAX_AGE_MS  = parseMs(process.env.ACCESS_TOKEN_EXPIRY  || "15m");
export const REFRESH_MAX_AGE_MS = parseMs(process.env.REFRESH_TOKEN_EXPIRY || "7d");

export const accessCookieOptions = IS_CROSS_SITE
    ? { httpOnly: true, secure: true, sameSite: "none" as const, path: "/", domain: PARENT_DOMAIN, maxAge: ACCESS_MAX_AGE_MS }
    : { httpOnly: true, secure: true, sameSite: "lax"  as const, path: "/",                            maxAge: ACCESS_MAX_AGE_MS };

// Optional “display name” cookie (readable on client)
export const USERNAME_COOKIE = IS_CROSS_SITE ? "__Secure-un" : "__Host-un";
export const usernameCookieOptions = IS_CROSS_SITE
    ? { httpOnly: false, secure: true, sameSite: "none" as const, path: "/", domain: PARENT_DOMAIN, maxAge: REFRESH_MAX_AGE_MS }
    : { httpOnly: false, secure: true, sameSite: "lax"  as const, path: "/",                            maxAge: REFRESH_MAX_AGE_MS };
