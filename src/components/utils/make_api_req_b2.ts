import ApiError from "@/components/utils/ApiError";

export const make_api_request = async <T = any>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> => {
  try {
    const response = await fetch(endpoint, options);
    let json: any;

    try {
      json = await response.json();
    } catch (e) {
      throw new ApiError(
          response.status,
          "Invalid server response",
          "INVALID_JSON",
          { rawResponse: await response.text() }
      );
    }

    // Prefer your standardized API response structure
    if (json.status === "error" || json.error) {
      throw new ApiError(
          json.statusCode || response.status,
          json.message || "API Error",
          json.code || json.errorCode || "API_ERROR",
          json
      );
    }
    // Return the actual data (or the whole object if no .data field)
    return (json.data ?? json) as T;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("API request error:", error);
    }
    throw error;
  }
};
