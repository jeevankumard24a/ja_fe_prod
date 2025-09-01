// utils/make_api_request.ts
import ApiError from "@/components/utils/ApiError";

export interface ApiEnvelope<T = unknown> {
  status: "success" | "error";
  error: boolean;
  statusCode: number;
  message: string;
  code?: string;
  requestId?: string;
  actionId?: string;
  data?: T | null; // allow null for 204/205/304/HEAD and similar cases
}

function newId() {
  try { return crypto.randomUUID(); }
  catch { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
}

function withCorrelationHeaders(init: RequestInit): {
  init: RequestInit; requestId: string; actionId?: string
} {
  const headers = new Headers(init.headers || undefined);
  const requestId = headers.get("x-request-id") ?? newId();
  const actionId  = headers.get("x-action-id") ?? undefined;

  headers.set("x-request-id", requestId);
  if (actionId) headers.set("x-action-id", actionId);
  if (!headers.has("accept")) headers.set("accept", "application/json");

  return { init: { ...init, headers }, requestId, actionId };
}

export async function make_api_request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiEnvelope<T>> {
  // Ensure correlation headers exist on the outbound request
  const { init, requestId, actionId } = withCorrelationHeaders(options);

  let res: Response;
  try {
    res = await fetch(endpoint, init);
  } catch (err: any) {
    // Network / DNS / CORS / Abort, etc.
    throw new ApiError(
        502,
        err?.message || "Network error",
        "NETWORK_ERROR",
        { original: { name: err?.name, message: err?.message } },
        requestId,
        actionId
    );
  }

  // Prefer ids from response; fall back to generated
  const rid = res.headers.get("x-request-id") || requestId;
  const aid = res.headers.get("x-action-id") || actionId;

  // No-content / not-modified / HEAD
  if (res.status === 204 || res.status === 205 || res.status === 304 || init.method === "HEAD") {
    return {
      status: "success",
      error: false,
      statusCode: res.status,
      code: res.status === 304 ? "NOT_MODIFIED" : "NO_CONTENT",
      message: res.statusText || (res.status === 304 ? "Not Modified" : "No Content"),
      requestId: rid,
      actionId: aid,
      data: null,
    };
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson =
      contentType.includes("application/json") ||
      contentType.includes("application/problem+json") ||
      contentType.includes("application/vnd.api+json");

  // Read body once
  let raw: string | null = null;
  try {
    raw = await res.text();
  } catch {
    raw = null;
  }

  // Parse JSON only when appropriate
  let body: any = undefined;
  if (raw && isJson) {
    try {
      body = JSON.parse(raw);
    } catch {
      throw new ApiError(
          res.status || 500,
          "Invalid server JSON",
          "INVALID_JSON",
          { rawPreview: raw.slice(0, 2000), contentType },
          rid,
          aid
      );
    }
  }

  // Non-OK HTTP status → throw, include upstream details if any
  if (!res.ok) {
    const msg = (body && body.message) || res.statusText || "API Error";
    const code = (body && (body.code || body.errorCode)) || "HTTP_ERROR";
    throw new ApiError(
        (body && body.statusCode) || res.status || 500,
        msg,
        code,
        body ?? { rawPreview: (raw ?? "").slice(0, 2000), contentType },
        rid,
        aid
    );
  }

  // 2xx but non-JSON → return as success with raw text
  if (!isJson) {
    return {
      status: "success",
      error: false,
      statusCode: res.status,
      message: "OK",
      requestId: rid,
      actionId: aid,
      data: (raw as unknown as T),
    };
  }

  // 2xx JSON with error envelope
  if (body && (body.status === "error" || body.error === true)) {
    throw new ApiError(
        body.statusCode || res.status || 500,
        body.message || "API Error",
        body.code || body.errorCode || "API_ERROR",
        body,
        rid,
        aid
    );
  }

  // 2xx JSON success envelope (preferred)
  if (body && typeof body === "object") {
    return {
      requestId: body.requestId ?? rid,
      actionId: body.actionId ?? aid,
      status: body.status ?? "success",
      error: body.error ?? false,
      statusCode: body.statusCode ?? res.status,
      message: body.message ?? "OK",
      code: body.code,
      data: (body.data as T) ?? null,
    };
  }

  // 2xx JSON empty/missing → normalize
  return {
    status: "success",
    error: false,
    statusCode: res.status,
    message: "OK",
    requestId: rid,
    actionId: aid,
    data: null,
  };
}
