// app/api/upload-profile-pic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/utils/withApiHandler";
import { createSuccessResponse } from "@/utils/apiResponse";
import { parseBackendResponse } from "@/utils/parseBackendResponse";
import { getRequestLogger } from "@/utils/requestLogger";
import ApiError from "@/components/utils/ApiError";

export const runtime = "nodejs";

async function uploadProfilePicHandler(req: NextRequest, API_BASE_URL: string) {
    const requestId = req.headers.get("x-request-id") || "no-request-id";
    const actionId = req.headers.get("x-action-id") || undefined;
    const log = getRequestLogger(req);
    const startedAt = Date.now();

    log.info("upload.profilePic.start");

    // 1) Read auth cookies (prefer new names; fallback to legacy)
    const accessToken =
        req.cookies.get("jaAccessToken")?.value ||
        req.cookies.get("accessToken")?.value || // legacy fallback
        undefined;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!accessToken || !refreshToken) {
        log.warn("upload.profilePic.tokens.missing");
        throw new ApiError(
            401,
            "Authentication tokens are missing",
            "TOKEN_MISSING",
            undefined,
            requestId,
            actionId
        );
    }

    // 2) Parse multipart/form-data (file + optional extension)
    let file: File | null = null;
    let extension: string | null = null;
    try {
        const formData = await req.formData();
        file = formData.get("file") as File | null;
        extension = (formData.get("extension") as string | null) ?? null;
    } catch (err) {
        log.error("upload.profilePic.form.parse_error", { err });
        throw err;
    }

    if (!file) {
        log.warn("upload.profilePic.file.missing");
        throw new ApiError(
            400,
            "No file provided in the request",
            "INVALID_REQUEST",
            undefined,
            requestId,
            actionId
        );
    }

    // 3) Build upstream form-data
    const upstreamForm = new FormData();
    upstreamForm.append("file", file);
    if (extension) upstreamForm.append("extension", extension);

    // 4) Call upstream with timeout + correlation headers
    const url = `${API_BASE_URL}/ipa/v1/utils/upload-file-s3`;
    const controller = new AbortController();
    const timeoutMs = 10_000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    log.info("upload.profilePic.backend.request", { url, timeoutMs });

    let upstream: Response;
    try {
        upstream = await fetch(url, {
            method: "POST",
            // IMPORTANT: do NOT set 'Content-Type' manually for multipart; fetch sets the boundary.
            headers: {
                authorization: `Bearer ${accessToken}`,
                "x-refresh-token": refreshToken!,
                "x-request-id": requestId,
                ...(actionId ? { "x-action-id": actionId } : {}),
            },
            body: upstreamForm,
            signal: controller.signal,
        });

        log.info("upload.profilePic.backend.response", {
            status: upstream.status,
            ok: upstream.ok,
        });
    } catch (err: any) {
        if (err?.name === "AbortError") {
            log.error("upload.profilePic.backend.abort", {
                durationMs: Date.now() - startedAt,
            });
        } else {
            log.error("upload.profilePic.backend.fetch_error", { err });
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }

    // 5) Normalize upstream result (throws ApiError on failure)
    let parsed: any;
    try {
        parsed = await parseBackendResponse(
            upstream,
            "Failed to upload file",
            requestId,
            actionId
        );
    } catch (err) {
        log.error("upload.profilePic.backend.parse_error", { err });
        throw err;
    }

    // 6) If upstream was forwarded as-is, attach correlation headers and return
    if (parsed instanceof Response) {
        (parsed as NextResponse).headers.set("x-request-id", requestId);
        if (actionId) (parsed as NextResponse).headers.set("x-action-id", actionId);
        log.warn("upload.profilePic.backend.forwarded_response", {
            status: (parsed as NextResponse).status,
            durationMs: Date.now() - startedAt,
        });
        return parsed;
    }

    // 7) Success envelope
    const ok = createSuccessResponse(
        parsed?.message || "File uploaded successfully",
        parsed?.data ?? parsed,
        "OK",
        200,
        requestId
    );
    ok.headers.set("x-request-id", requestId);
    if (actionId) ok.headers.set("x-action-id", actionId);

    log.info("upload.profilePic.completed", {
        durationMs: Date.now() - startedAt,
    });

    return ok;
}

export const POST = withApiHandler(uploadProfilePicHandler);
