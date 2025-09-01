import { NextRequest } from "next/server";
import { withApiHandler } from "@/utils/withApiHandler";
import { createSuccessResponse } from "@/utils/apiResponse";
import { parseBackendResponse } from "@/utils/parseBackendResponse";
import { getRequestContext } from "@/utils/requestLogger";
import ApiError from "@/components/utils/ApiError";
import { fetchWithAutoAuth, appendSetCookies } from "@/utils/call_api/fetchWithAutoAuth";

export const GET = withApiHandler(async (req: NextRequest, API_BASE_URL: string) => {
    const { logger, requestId, actionId, correlationHeaders } = getRequestContext(req, "load_dashboard");

    if (!API_BASE_URL) {
        throw new ApiError(500, "API base URL not configured", "CONFIG_ERROR", null, requestId, actionId);
    }

    const qs = req.nextUrl.search || "";
    const upstreamUrl = `${API_BASE_URL}/ipa/v1/dashboard/load-dashboard/${qs}`;

    // One-liner: auto read AT cookie → refresh if needed → retry
    const { response: upstream, setCookies } = await fetchWithAutoAuth(req, upstreamUrl, { method: "GET" }, {
        correlationHeaders,
        requestId,
        actionId,
    });

    // Parse standard Express envelope
    const env = await parseBackendResponse(upstream, "Failed to load dashboard", requestId, actionId, req);

    // Normalize to our envelope
    const res = createSuccessResponse(
        env?.message || "OK",
        env?.data ?? env,
        "OK",
        200,
        requestId,
        actionId
    );

    // Forward any Set-Cookie from refresh/express
    appendSetCookies(res as unknown as Response, setCookies);

    logger.info("dashboard.load.success", { requestId, actionId });
    return res;
});
