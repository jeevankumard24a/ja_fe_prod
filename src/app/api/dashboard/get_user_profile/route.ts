import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/utils/withApiHandler";
import { createSuccessResponse } from "@/utils/apiResponse";
import { parseBackendResponse } from "@/utils/parseBackendResponse";
import { getRequestLogger } from "@/utils/requestLogger";
import ApiError from "@/components/utils/ApiError";

export const runtime = "nodejs";

async function getUserProfileHandler(req: NextRequest, API_BASE_URL: string) {
  const requestId = req.headers.get("x-request-id") || "no-request-id";
  const actionId = req.headers.get("x-action-id") || undefined;
  const log = getRequestLogger(req);
  const startedAt = Date.now();

  log.info("dashboard.userProfile.start");

  // 1) Read auth cookies (prefer new names; fallback to legacy)
  const accessToken =
      req.cookies.get("jaAccessToken")?.value ||
      req.cookies.get("accessToken")?.value || // legacy
      undefined;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!accessToken || !refreshToken) {
    log.warn("dashboard.userProfile.tokens.missing");
    throw new ApiError(
        401,
        "Authentication tokens are missing",
        "TOKEN_MISSING",
        undefined,
        requestId,
        actionId
    );
  }

  // 2) Call upstream with timeout + correlation headers
  const url = `${API_BASE_URL}/ipa/v1/dashboard/get-user-profile/`;
  const controller = new AbortController();
  const timeoutMs = 10_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  log.info("dashboard.userProfile.backend.request", { url, timeoutMs });

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
        "x-refresh-token": refreshToken!,
        "x-request-id": requestId,
        ...(actionId ? { "x-action-id": actionId } : {}),
      },
      signal: controller.signal,
    });

    log.info("dashboard.userProfile.backend.response", {
      status: upstream.status,
      ok: upstream.ok,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      log.error("dashboard.userProfile.backend.abort", {
        durationMs: Date.now() - startedAt,
      });
    } else {
      log.error("dashboard.userProfile.backend.fetch_error", { err });
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  // 3) Normalize upstream result (throws ApiError on failure)
  let parsed: any;
  try {
    parsed = await parseBackendResponse(
        upstream,
        "Failed to get user profile",
        requestId,
        actionId
    );
  } catch (err) {
    log.error("dashboard.userProfile.backend.parse_error", { err });
    throw err;
  }

  // 4) If upstream was forwarded as-is (rare), attach correlation headers and return
  if (parsed instanceof Response) {
    (parsed as NextResponse).headers.set("x-request-id", requestId);
    if (actionId) (parsed as NextResponse).headers.set("x-action-id", actionId);
    log.warn("dashboard.userProfile.backend.forwarded_response", {
      status: (parsed as NextResponse).status,
      durationMs: Date.now() - startedAt,
    });
    return parsed;
  }

  // 5) Success envelope
  const ok = createSuccessResponse(
      parsed?.message || "User profile loaded",
      parsed?.data ?? parsed,
      "OK",
      200,
      requestId
  );
  ok.headers.set("x-request-id", requestId);
  if (actionId) ok.headers.set("x-action-id", actionId);

  log.info("dashboard.userProfile.completed", {
    durationMs: Date.now() - startedAt,
  });

  return ok;
}

export const GET = withApiHandler(getUserProfileHandler);
