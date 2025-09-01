// utils/withApiHandler.ts
import ApiError from "@/components/utils/ApiError";
import { NextRequest, NextResponse } from "next/server";
import logger from "@/utils/logger";

// If you have a request-scoped logger util, you can import it:
// import { getRequestLogger } from "@/utils/requestLogger";

function newId() {
    try { return crypto.randomUUID(); } catch { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
}

/** Build a NextResponse from an upstream Response and ensure correlation headers are present */
function toNextResponse(upstream: Response, ids: { requestId: string; actionId?: string }) {
    const headers = new Headers(upstream.headers);
    headers.set("x-request-id", ids.requestId);
    if (ids.actionId) headers.set("x-action-id", ids.actionId);
    // let browsers read the IDs
    headers.set("Access-Control-Expose-Headers", "X-Request-Id, X-Action-Id");

    // Avoid copying hop-by-hop headers; Next sets content-length itself.
    headers.delete("content-length");

    // Pass through body and status
    return new NextResponse(upstream.body, { status: upstream.status, headers });
}

type Handler = (req: NextRequest, API_BASE_URL: string) => Promise<Response>;

export function withApiHandler(handler: Handler) {
    return async (req: NextRequest) => {
        const requestId = req.headers.get("x-request-id") || newId();
        const actionId  = req.headers.get("x-action-id") || undefined;

        // Prefer per-request logger if you have one:
        const log = /* getRequestLogger ? getRequestLogger(req) : */ logger;

        const API_BASE_URL = process.env.API_BASE_URL || "";
        if (!API_BASE_URL) {
            const ae = new ApiError(500, "Server misconfiguration: API_BASE_URL is not set", "CONFIG_ERROR", undefined, requestId, actionId);
            log.error("api.config_error", {
                path: req.nextUrl.pathname,
                method: req.method,
                statusCode: ae.statusCode,
                code: ae.code,
                message: ae.message,
                requestId,
                actionId,
            });
            return NextResponse.json(
                {
                    status: "error",
                    statusCode: ae.statusCode,
                    code: ae.code,
                    message: ae.message,
                    requestId,
                    actionId,
                },
                {
                    status: ae.statusCode,
                    headers: {
                        "x-request-id": requestId,
                        ...(actionId ? { "x-action-id": actionId } : {}),
                        "Access-Control-Expose-Headers": "X-Request-Id, X-Action-Id",
                    },
                }
            );
        }

        try {
            const upstream = await handler(req, API_BASE_URL);
            // DO NOT set headers on `upstream.headers` directly (immutable).
            return toNextResponse(upstream, { requestId, actionId });
        } catch (err) {
            const ae = ApiError.fromUnknown(err, requestId, actionId);

            // Optional: mini redactor to avoid leaking secrets in logs
            const details = ae.details && typeof ae.details === "object"
                ? redact(ae.details as Record<string, unknown>)
                : ae.details;

            log.error("api.error", {
                path: req.nextUrl.pathname,
                method: req.method,
                statusCode: ae.statusCode,
                code: ae.code,
                message: ae.message,
                requestId: ae.requestId,
                actionId: ae.actionId,
                details,
            });

            return NextResponse.json(
                {
                    status: "error",
                    statusCode: ae.statusCode,
                    code: ae.code,
                    message: ae.message,
                    requestId: ae.requestId,
                    actionId: ae.actionId,
                },
                {
                    status: ae.statusCode,
                    headers: {
                        "x-request-id": requestId,
                        ...(actionId ? { "x-action-id": actionId } : {}),
                        "Access-Control-Expose-Headers": "X-Request-Id, X-Action-Id",
                    },
                }
            );
        }
    };
}

// --- tiny redactor used above (optional) ---
const SECRET_KEYS = ["authorization", "cookie", "token", "password", "secret", "otp", "refresh", "access"];
function redact(v: any, seen = new WeakSet()): any {
    if (v == null || typeof v !== "object") return v;
    if (seen.has(v)) return "[circular]";
    seen.add(v);
    if (Array.isArray(v)) return v.length > 50 ? `[array(${v.length})]` : v.map((x) => redact(x, seen));
    const out: any = {};
    for (const [k, val] of Object.entries(v)) {
        const lk = k.toLowerCase();
        if (SECRET_KEYS.some((s) => lk.includes(s))) out[k] = "[REDACTED]";
        else out[k] = typeof val === "object" ? redact(val, seen) : val;
    }
    return out;
}
