// app/api/dashboard/update-user-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/utils/withApiHandler";
import { createSuccessResponse } from "@/utils/apiResponse";
import { parseBackendResponse } from "@/utils/parseBackendResponse";
import { getRequestLogger } from "@/utils/requestLogger";
import ApiError from "@/components/utils/ApiError";

export const runtime = "nodejs";

function maskBody(body: any) {
    if (!body || typeof body !== "object") return body;
    const clone: any = { ...body };
    for (const k of ["password", "confirm_password", "otp", "token"]) {
        if (k in clone) clone[k] = "***";
    }
    return clone;
}

async function updateUserProfileHandler(req: NextRequest, API_BASE_URL: string) {
    const requestId = req.headers.get("x-request-id") || "no-request-id";
    const actionId = req.headers.get("x-action-id") || undefined;
    const log = getRequestLogger(req);
    const startedAt = Date.now();

    log.info("dashboard.updateProfile.start");

    // 1) Read & log (masked) body
    let body: any;
    try {
        body = await req.json();
        log.debug("dashboard.updateProfile.body", { body: maskBody(body) });
    } catch (err) {
        log.error("dashboard.updateProfile.body.parse_error", { err });
        throw err;
    }

    // 2) Read auth cookies (prefer new names; fallback to legacy)
    const accessToken =
        req.cookies.get("jaAccessToken")?.value ||
        req.cookies.get("accessToken")?.value || // legacy
        undefined;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!accessToken || !refreshToken) {
        log.warn("dashboard.updateProfile.tokens.missing");
        throw new ApiError(
            401,
            "Authentication tokens are missing",
            "TOKEN_MISSING",
            undefined,
            requestId,
            actionId
        );
    }

    // 3) Call upstream with timeout + correlation headers
    const url = `${API_BASE_URL}/ipa/v1/dashboard/update-user-profile/`;
    const controller = new AbortController();
    const timeoutMs = 10_000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    log.info("dashboard.updateProfile.backend.request", { url, timeoutMs });

    let upstream: Response;
    try {
        upstream = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${accessToken}`,
                "x-refresh-token": refreshToken!,
                "x-request-id": requestId,
                ...(actionId ? { "x-action-id": actionId } : {}),
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        log.info("dashboard.updateProfile.backend.response", {
            status: upstream.status,
            ok: upstream.ok,
        });
    } catch (err: any) {
        if (err?.name === "AbortError") {
            log.error("dashboard.updateProfile.backend.abort", {
                durationMs: Date.now() - startedAt,
            });
        } else {
            log.error("dashboard.updateProfile.backend.fetch_error", { err });
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }

    // 4) Normalize upstream result (throws ApiError on failure)
    let parsed: any;
    try {
        parsed = await parseBackendResponse(
            upstream,
            "Failed to update user profile",
            requestId,
            actionId
        );
    } catch (err) {
        log.error("dashboard.updateProfile.backend.parse_error", { err });
        throw err;
    }

    // 5) If upstream returned a Response directly, forward it with headers
    if (parsed instanceof Response) {
        (parsed as NextResponse).headers.set("x-request-id", requestId);
        if (actionId) (parsed as NextResponse).headers.set("x-action-id", actionId);
        log.warn("dashboard.updateProfile.backend.forwarded_response", {
            status: (parsed as NextResponse).status,
            durationMs: Date.now() - startedAt,
        });
        return parsed;
    }

    // 6) Success envelope
    const ok = createSuccessResponse(
        parsed?.message || "User profile updated",
        parsed?.data ?? parsed,
        "OK",
        200,
        requestId
    );
    ok.headers.set("x-request-id", requestId);
    if (actionId) ok.headers.set("x-action-id", actionId);

    log.info("dashboard.updateProfile.completed", {
        durationMs: Date.now() - startedAt,
    });

    return ok;
}

export const POST = withApiHandler(updateUserProfileHandler);
