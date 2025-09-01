import ApiError from "@/utils/call_api/ApiError";
import { getRequestLogger } from "@/utils/requestLogger";
import logger from "@/utils/logger";
import type { NextRequest } from "next/server";
import type { Logger } from "@/utils/loggerType";

type AnyJson = unknown;

/** ---- Debug toggles (env-based) ----
 * LOG_BACKEND_RAW=true     -> log raw upstream responses
 * LOG_BACKEND_RAW_LIMIT    -> max chars to log (default 4000)
 * LOG_BACKEND_RAW_FILE=/path/to/file.log  -> also append raw logs to a file (Node runtime only)
 */
const RAW_DEBUG = process.env.LOG_BACKEND_RAW === "true";
const RAW_LIMIT = Number(process.env.LOG_BACKEND_RAW_LIMIT || 4000);
const RAW_FILE  = process.env.LOG_BACKEND_RAW_FILE;

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
            out[k] = v as any;
        }
    }
    return out;
}

function newId() {
    try {
        // @ts-ignore
        if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    } catch {}
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Optional helper to log raw upstream body (console + file) */
async function debugRawResponse(
    res: Response,
    requestLogger: Logger,
    rid: string,
    aid?: string
) {
    try {
        const clone = res.clone(); // don't consume the original stream
        const raw = await clone.text().catch(() => "<unreadable>");
        const meta = {
            tag: "express.raw",
            status: res.status,
            url: res.url || "",
            contentType: res.headers.get("content-type") || "",
            preview: raw.slice(0, RAW_LIMIT),
            requestId: rid,
            actionId: aid,
        };

        // Goes to console (dev) and to files if your winston file transport is enabled
        requestLogger.debug("Express RAW response", meta);

        // --- OPTIONAL direct console (uncomment if you want noisier logs) ---
        // console.warn("[EXPRESS RAW]", JSON.stringify(meta, null, 2));

        // --- OPTIONAL file append (enable via env LOG_BACKEND_RAW_FILE=/tmp/backend-raw.log) ---
        if (RAW_FILE) {
            try {
                // Edge / serverless often block fs; guard behind env to avoid runtime errors.
                const fs = await import("fs/promises");
                await fs.appendFile(
                    RAW_FILE,
                    JSON.stringify(
                        {
                            ts: new Date().toISOString(),
                            ...meta,
                            // full raw, NOT truncated, so you have everything when writing to your own file
                            raw,
                        },
                        null,
                        2
                    ) + "\n"
                );
            } catch (e: any) {
                requestLogger.warn("raw_file_write_failed", { message: e?.message, file: RAW_FILE, requestId: rid, actionId: aid });
            }
        }
    } catch (e: any) {
        requestLogger.warn("raw_debug_failed", { message: e?.message, requestId: rid, actionId: aid });
    }
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
    const ct = (res.headers.get("content-type") || "").toLowerCase();
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
            // If raw debugging is on, log the raw response and parse from that same text.
            if (RAW_DEBUG) {
                await debugRawResponse(res, requestLogger, rid, aid);
                const rawTxt = await res.clone().text().catch(() => "");
                if (!rawTxt) throw new Error("Empty JSON body");
                body = JSON.parse(rawTxt);
            } else {
                // Normal path: parse JSON directly
                body = await res.json();

            }
            requestLogger.info("Hello Parsed Express JSON response", { response: body, status, requestId: rid, actionId: aid });

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

            // --- OPTIONAL: blast raw to console for immediate visibility (comment out after debugging) ---
            // console.error("[EXPRESS INVALID JSON]", { status, raw: text });

            throw new ApiError(status || 500, fallbackMessage, "INVALID_JSON", { status, text }, rid, aid);
        }
    } else {
        // Non-JSON response
        const text = await res.text().catch(() => "<unreadable>");

        if (RAW_DEBUG) {
            // Log the non-JSON body as well when debugging
            requestLogger.debug("Express RAW non-JSON response", {
                status,
                contentType: ct,
                preview: text.slice(0, RAW_LIMIT),
                requestId: rid,
                actionId: aid,
            });

            // --- OPTIONAL: direct console (uncomment if needed) ---
            // console.warn("[EXPRESS RAW non-JSON]", { status, preview: text.slice(0, RAW_LIMIT) });
        }

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
