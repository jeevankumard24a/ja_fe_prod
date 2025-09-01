// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/utils/withApiHandler";
import { createSuccessResponse } from "@/utils/apiResponse";
import { parseBackendResponse } from "@/utils/parseBackendResponse";
import { getRequestLogger } from "@/utils/requestLogger";

export const runtime = "nodejs";

function maskBody(body: any) {
    if (!body || typeof body !== "object") return body;
    const clone: any = { ...body };
    for (const k of ["password", "confirm_password", "otp", "token"]) if (k in clone) clone[k] = "***";
    return clone;
}

async function registerHandler(req: NextRequest, API_BASE_URL: string) {
    const requestId = req.headers.get("x-request-id") || "no-request-id";
    const actionId = req.headers.get("x-action-id") || undefined;
    const log: any = getRequestLogger(req);
    const startedAt = Date.now();

    log.info("register.start");

    let body: any;
    try {
        body = await req.json();
        log.debug("register.body", { body: maskBody(body) });
    } catch (err) {
        log.error("register.body.parse_error", { err });
        throw err;
    }

    const url = `${API_BASE_URL}/ipa/v1/auth/submit-register-data`;
    const controller = new AbortController();
    const timeoutMs = 10_000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    log.info("register.backend.request", { url, timeoutMs });

    let response: Response;
    try {
        response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-request-id": requestId,
                ...(actionId ? { "x-action-id": actionId } : {}),
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        console.log("222222222222222222", response)
        log.info("register.backend.response", { status: response.status, ok: response.ok });
    } catch (err: any) {
        if (err?.name === "AbortError") {
            log.error("register.backend.abort", { durationMs: Date.now() - startedAt });
        } else {
            log.error("register.backend.fetch_error", { err });
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }

    let parsed: any;
    try {
        parsed = await parseBackendResponse(response, "Failed to Submit Register Data", requestId, actionId);
    } catch (err) {
        log.error("register.backend.parse_error", { err });
        throw err;
    }

    if (parsed instanceof Response) {
        (parsed as NextResponse).headers.set("x-request-id", requestId);
        if (actionId) (parsed as NextResponse).headers.set("x-action-id", actionId);
        log.warn("register.backend.forwarded_response", { status: (parsed as NextResponse).status, durationMs: Date.now() - startedAt });
        return parsed;
    }

    log.info("register.success", { user_id: parsed?.data?.user_id });

    const ok = createSuccessResponse(
        parsed?.message || "Registration Successful",
        parsed?.data ?? parsed,
        "OK",
        201,
        requestId
    );
    ok.headers.set("x-request-id", requestId);
    if (actionId) ok.headers.set("x-action-id", actionId);

    log.info("register.completed", { durationMs: Date.now() - startedAt });
    return ok;
}
export const POST = withApiHandler(registerHandler);


