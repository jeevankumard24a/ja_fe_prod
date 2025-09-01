// utils/apiResponse.ts
import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
    status: "success" | "error";
    error: boolean;
    statusCode: number;
    code?: string;
    message: string;
    requestId?: string;
    actionId?: string;            // <-- add
    data?: T;
    // details?: unknown;         // usually omit in prod; include only when you choose
};

type HeaderPairs = Record<string, string | number | undefined>;

/** Ensure correlation headers are on the response */
function withCorrelationHeaders(res: NextResponse, ids?: { requestId?: string; actionId?: string }) {
    if (ids?.requestId) res.headers.set("x-request-id", ids.requestId);
    if (ids?.actionId)  res.headers.set("x-action-id", ids.actionId);
    // Optionally expose for browser access (not needed same-origin)
    res.headers.set("Access-Control-Expose-Headers", "X-Request-Id, X-Action-Id");
    return res;
}

export function createErrorResponse(
    code: string,
    message: string,
    status: number,
    errorDetails?: unknown,
    requestId?: string,
    actionId?: string,                       // <-- add
    extraHeaders?: HeaderPairs
) {
    const body: ApiResponse = {
        status: "error",
        error: true,
        statusCode: status,
        code,
        message,
        requestId,
        actionId,
        // Include details only when you explicitly want to (e.g., in dev):
        // ...(process.env.NODE_ENV !== "production" && errorDetails !== undefined ? { details: errorDetails } : {})
    };

    const res = NextResponse.json<ApiResponse>(body, { status });
    Object.entries(extraHeaders ?? {}).forEach(([k, v]) => {
        if (v !== undefined) res.headers.set(k, String(v));
    });
    return withCorrelationHeaders(res, { requestId, actionId });
}

export function createSuccessResponse<T>(
    message: string,
    data?: T,
    code = "OK",                               // <-- default aligns with Express success
    status = 200,
    requestId?: string,
    actionId?: string,                         // <-- add
    extraHeaders?: HeaderPairs
) {
    const body: ApiResponse<T> = {
        status: "success",
        error: false,
        statusCode: status,
        code,
        message,
        requestId,
        actionId,
        data,
    };

    const res = NextResponse.json<ApiResponse<T>>(body, { status });
    Object.entries(extraHeaders ?? {}).forEach(([k, v]) => {
        if (v !== undefined) res.headers.set(k, String(v));
    });
    return withCorrelationHeaders(res, { requestId, actionId });
}

/**
 * Optional: proxy helper to pass through an Express response as-is,
 * preserving body, status, and correlation headers. Use this if your Next API
 * route simply forwards the Express API result.
 */
export async function proxyExpressResponse(r: Response) {
    // Copy headers selectively (avoid hop-by-hop)
    const headers = new Headers();
    for (const [k, v] of r.headers.entries()) {
        if (/^content-length$/i.test(k)) continue; // Next will set it
        headers.set(k, v);
    }
    // Ensure correlation headers are present (some proxies strip them)
    const requestId = r.headers.get("x-request-id") ?? undefined;
    const actionId  = r.headers.get("x-action-id") ?? undefined;
    if (requestId) headers.set("x-request-id", requestId);
    if (actionId)  headers.set("x-action-id", actionId);
    headers.set("Access-Control-Expose-Headers", "X-Request-Id, X-Action-Id");

    // If you need streaming, return new Response(r.body, ...) directly.
    // For JSON bodies, this is safe too:
    const cloned = r.clone();
    // If content-type is JSON, we could pass body through directly; safest is streaming:
    return new Response(cloned.body, { status: r.status, headers });
}
