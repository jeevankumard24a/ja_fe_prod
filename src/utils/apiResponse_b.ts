// utils/apiResponse.ts
import { NextResponse } from "next/server";

export type ApiResponse = {
    status: "success" | "error";
    error: boolean;
    statusCode: number;       // <-- add
    code?: string;
    message: string;
    requestId?: string;       // <-- add
    data?: any;
};

export function createErrorResponse(
    code: string,
    message: string,
    status: number,
    errorDetails?: any,
    requestId?: string        // <-- add
) {
    // Keep this pure; logging at caller
    return NextResponse.json<ApiResponse>(
        {
            status: "error",
            error: true,
            statusCode: status,   // <-- add
            code,
            message,
            requestId,            // <-- add
            ...(errorDetails !== undefined && { response: errorDetails }),
        },
        { status }
    );
}

export function createSuccessResponse(
    message: string,
    data?: any,
    code = "SUCCESS",
    status = 200,             // <-- add
    requestId?: string        // <-- add
) {
    return NextResponse.json<ApiResponse>(
        {
            status: "success",
            error: false,
            statusCode: status,   // <-- add
            code,
            message,
            requestId,            // <-- add
            data,
        },
        { status }
    );
}
