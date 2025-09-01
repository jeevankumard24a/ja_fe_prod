import ApiError from "@/components/utils/ApiError";
import { getRequestLogger } from "@/utils/requestLogger";
import logger from "@/utils/logger";
import type { NextRequest } from "next/server";
import type { Logger } from "@/utils/loggerType";

type AnyJson = unknown;

/** Minimal redactor for logging */
function redact(obj: any): any {
    if (obj == null || typeof obj !== "object") return obj;
    const out: any = Array.isArray(obj) ? [] : {};
    for (const [k, v] of Object.entries(obj)) {
        const lk = k.toLowerCase();
        if (lk.includes("password") || lk.includes("token") || lk.includes("secret") || lk.includes("otp")) {
            out[k] = "[REDACTED]";
        } else if (v && typeof v === "object") {
            out[k] = redact(v);
        } else {
            out[k] = v;
        }
    }
    return out;
}

function newId() {
    try {
        // Works in Edge (Web Crypto) and modern Node
        // @ts-ignore
        if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    } catch {}
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function parseBackendResponse(
    res: Response,
    fallbackMessage: string,
    parentRequestId?: string,
    actionId?: string,
    req?: NextRequest
): Promise<any /* your ApiResponse<T> or upstream body */> {
    const rid = res.headers.get("x-request-id") || parentRequestId || newId();
    const aid = res.headers.get("x-action-id") || actionId;
    const requestLogger: Logger = req ? getRequestLogger(req) : logger;

    const status = res.status;
    const ct = res.headers.get("content-type") || "";
    const isJson =
        ct.includes("application/json") ||
        ct.includes("application/problem+json") ||
        ct.includes("application/vnd.api+json");

    // Short-circuit: 204/205 No Content or 304 Not Modified
    if (status === 204 || status === 205 || status === 304) {
        requestLogger.debug("Express response: no content", { status, requestId: rid, actionId: aid });
        if (!res.ok) {
            throw new ApiError(status || 500, fallbackMessage, "NO_CONTENT_ERROR", { status }, rid, aid);
        }
        return null;
    }

    let body: AnyJson = null;

    // Try to parse JSON when it claims to be JSON
    if (isJson) {
        try {
            body = await res.json();
            const safe = redact(body);
            requestLogger.debug("Parsed Express JSON response", { response: safe, status, requestId: rid, actionId: aid });
        } catch (error) {
            // If backend sent invalid JSON
            const text = await res.clone().text().catch(() => "<unreadable>");
            requestLogger.error("Failed to parse Express JSON response", {
                status,
                text: text.slice(0, 2000),
                requestId: rid,
                actionId: aid,
            });
            throw new ApiError(status || 500, fallbackMessage, "INVALID_JSON", { status, text }, rid, aid);
        }
    } else {
        // Non-JSON response
        const text = await res.text().catch(() => "<unreadable>");
        if (!res.ok) {
            requestLogger.error("Express non-JSON error response", {
                status,
                contentType: ct,
                text: text.slice(0, 2000),
                requestId: rid,
                actionId: aid,
            });
            throw new ApiError(
                status || 500,
                fallbackMessage,
                "INVALID_CONTENT_TYPE",
                { status, contentType: ct, bodyPreview: text.slice(0, 2000) },
                rid,
                aid
            );
        }
        // Success but not JSON: return plain text
        requestLogger.debug("Express non-JSON success response", {
            status,
            contentType: ct,
            requestId: rid,
            actionId: aid,
        });
        return text;
    }

    // At this point we have JSON in `body`
    const statusField = (body as any)?.status;
    const codeField = (body as any)?.code || (body as any)?.errorCode;

    // Treat any non-OK HTTP status as error regardless of envelope
    if (!res.ok) {
        requestLogger.error("Express response error (non-OK HTTP)", {
            response: redact(body),
            status,
            requestId: rid,
            actionId: aid,
        });
        throw new ApiError(
            (body as any)?.statusCode || status || 500,
            (body as any)?.message || fallbackMessage,
            codeField || "API_ERROR",
            { details: body },
            rid,
            aid
        );
    }

    // Backend sometimes returns 200 with an error envelope
    if (statusField === "error") {
        requestLogger.error("Express response envelope indicates error", {
            response: redact(body),
            status,
            requestId: rid,
            actionId: aid,
        });
        throw new ApiError(
            (body as any)?.statusCode || 500,
            (body as any)?.message || fallbackMessage,
            codeField || "API_ERROR",
            { details: body },
            rid,
            aid
        );
    }

    // Success JSON
    return body;
}
