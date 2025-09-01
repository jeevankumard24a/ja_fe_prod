// app/api/auth/refresh/route.ts
import { NextRequest } from "next/server";
import { withApiHandler } from "@/utils/withApiHandler";
import { createSuccessResponse } from "@/utils/apiResponse";
import { parseBackendResponse } from "@/utils/parseBackendResponse";
import { getRequestContext } from "@/utils/requestLogger";
import ApiError from "@/components/utils/ApiError";

import {
    ACCESS_COOKIE,
    accessCookieOptions,
    USERNAME_COOKIE,
    usernameCookieOptions,
} from "@/utils/call_api/cookieNames";

type User = { user_id: string; user_name: string };
type RefreshResult = { accessToken: string; user?: User };

export const POST = withApiHandler(async (req: NextRequest, API_BASE_URL: string) => {
    const { logger, requestId, actionId, correlationHeaders } = getRequestContext(req, "refresh_token");

    if (!API_BASE_URL) {
        throw new ApiError(500, "API base URL not configured", "CONFIG_ERROR", null, requestId, actionId);
    }

    // forward browser cookies so Express can read the refresh token cookie
    const cookie = req.headers.get("cookie") || "";

    let upstream: Response;
    try {
        upstream = await fetch(`${API_BASE_URL}/ipa/v1/auth/refresh-token`, {
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
    } catch (error) {
        throw new ApiError(503, "Failed to connect to backend", "NETWORK_ERROR", { error }, requestId, actionId);
    }

    // Expect Express to return { data: { accessToken, user? } } and possibly rotate the refresh cookie
    const env = await parseBackendResponse(upstream, "Failed to refresh token", requestId, actionId, req);
    const raw = env?.data ?? env ?? {};
    const accessToken: string | undefined = raw?.accessToken;

    // Allow both shapes for user
    const user: User | undefined =
        raw?.user && raw.user.user_id && raw.user.user_name
            ? { user_id: raw.user.user_id, user_name: raw.user.user_name }
            : raw?.user_id && raw?.user_name
                ? { user_id: raw.user_id, user_name: raw.user_name }
                : undefined;

    if (!accessToken) {
        throw new ApiError(500, "Invalid response from backend", "INVALID_RESPONSE", { backendEnvelope: env }, requestId, actionId);
    }

    // Build normalized success response
    const res = createSuccessResponse<RefreshResult>(
        "Access token refreshed",
        { accessToken, ...(user ? { user } : {}) },
        "TOKEN_REFRESHED",
        200,
        requestId,
        actionId
    );

    // Set the new HttpOnly Access Token cookie (mirrors Express’s AT TTL)
    res.cookies.set(ACCESS_COOKIE, accessToken, accessCookieOptions);

    // Forward any rotated cookies from Express (e.g., new refresh token)
    const setCookieAll = upstream.headers.get("set-cookie");
    if (setCookieAll) {
        for (const c of setCookieAll.split(/,(?=\s*[^;=]+?=)/g)) {
            (res as any).headers.append("set-cookie", c);
        }
    }

    // Optional: also refresh a readable username cookie used by your UI
    if (user?.user_name) {
        res.cookies.set(USERNAME_COOKIE, encodeURIComponent(user.user_name), usernameCookieOptions);
    }

    logger.info("auth.refresh.success", { requestId, actionId, user_id: user?.user_id });
    return res;
});
