// utils/make_api_request.ts
import ApiError from "@/components/utils/ApiError";

export const make_api_request = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ status: string; statusCode: number; message: string; code?: string; data: T }> => {
  const response = await fetch(endpoint, options);
  let json: any;

  try {
    json = await response.json();
  } catch {
    throw new ApiError(
        response.status,
        "Invalid server response",
        "INVALID_JSON",
        { rawResponse: await response.text() }
    );
  }

  if (json.status === "error" || json.error) {
    throw new ApiError(
        json.statusCode || response.status,
        json.message || "API Error",
        json.code || json.errorCode || "API_ERROR",
        json
    );
  }

  // ❌ Don’t unwrap—return the full envelope
  return json as {
    status: string;
    statusCode: number;
    message: string;
    code?: string;
    data: T;
  };
};
