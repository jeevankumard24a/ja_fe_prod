// utils/make_api_request.ts
import ApiError from "@/components/utils/ApiError";

export interface ApiEnvelope<T = any> {
  status: "success" | "error";
  error: boolean;
  statusCode: number;
  message: string;
  code?: string;
  requestId?: string;
  data: T;
}

export async function make_api_request<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiEnvelope<T>> {
  let res: Response;

  try {
    res = await fetch(endpoint, options);
  } catch (err: any) {
    // Network / CORS / DNS / Abort, etc.
    throw new ApiError(
        503,
        err?.message || "Network error",
        "NETWORK_ERROR"
    );
  }

  // No content -> fabricate a success envelope with null data
  if (res.status === 204 || res.status === 205) {
    const reqId = res.headers.get("x-request-id") || undefined;
    return {
      status: "success",
      error: false,
      statusCode: res.status,
      code: "NO_CONTENT",
      message: res.statusText || "No Content",
      requestId: reqId,
      // @ts-expect-error: T may not include null; callers can refine
      data: null,
    };
  }

  // Read body once, then try JSON
  const raw = await res.text();
  let json: any = undefined;

  if (raw) {
    try {
      json = JSON.parse(raw);
    } catch {
      // Not valid JSON from server
      throw new ApiError(
          res.status,
          "Invalid server response",
          "INVALID_JSON",
          { rawResponse: raw },
          res.headers.get("x-request-id") || undefined
      );
    }
  } else {
    // Body expected but missing
    json = undefined;
  }

  // Prefer requestId in body, else header
  const requestId: string | undefined =
      (json && (json.requestId as string)) || res.headers.get("x-request-id") || undefined;

  // Treat any non-2xx as error even if body exists but isn't your envelope
  if (!res.ok) {
    const message =
        (json && (json.message as string)) || res.statusText || "API Error";
    const code =
        (json && ((json.code as string) || (json.errorCode as string))) ||
        "HTTP_ERROR";

    throw new ApiError(
        (json && (json.statusCode as number)) || res.status,
        message,
        code,
        json ?? { rawResponse: raw },
        requestId
    );
  }

  // Your API error envelope
  if (json && (json.status === "error" || json.error)) {
    throw new ApiError(
        (json.statusCode as number) || res.status,
        (json.message as string) || "API Error",
        (json.code as string) || (json.errorCode as string) || "API_ERROR",
        json,
        requestId
    );
  }

  // Success: return full envelope; inject requestId if server forgot it
  if (json && typeof json === "object") {
    return {
      requestId,
      statusCode: json.statusCode ?? res.status,
      status: json.status ?? "success",
      error: json.error ?? false,
      message: json.message ?? "OK",
      code: json.code,
      data: json.data as T,
    };
  }

  // If server returned 2xx but not an envelope, normalize it
  return {
    status: "success",
    error: false,
    statusCode: res.status,
    message: "OK",
    requestId,
    data: (json as T) ?? (raw as unknown as T),
  };
}
