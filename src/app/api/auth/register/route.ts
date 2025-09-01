import { NextRequest } from "next/server";
import { createSuccessResponse } from "@/utils/apiResponse";
import { parseBackendResponse } from "@/utils/parseBackendResponse";
import { withApiHandler } from "@/utils/withApiHandler";
import logger from "@/utils/logger";

async function registerHandler(req: NextRequest, API_BASE_URL: string) {
    const body = await req.json();
    logger.info("Register request received", { body: { ...body, password: "***" } }); // Don't log plain password

    const response = await fetch(`${API_BASE_URL}/ipa/v1/auth/submit-register-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const apiDataOrError = await parseBackendResponse(response, "Failed to Submit Register Data");
    if ("status" in apiDataOrError && apiDataOrError.status === "error") {
        logger.warn("Registration failed", { error: apiDataOrError });
        return apiDataOrError;
    }

    logger.info("Registration succeeded", { user: apiDataOrError?.data?.user_id ?? "unknown" });
    return createSuccessResponse(
        apiDataOrError?.message || "Registration Successful",
        apiDataOrError?.data ?? apiDataOrError
    );
}

export const POST = withApiHandler(registerHandler);
