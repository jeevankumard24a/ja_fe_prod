export const make_api_request = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<any> => {
  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      let errorData = {
        message: "An unknown error occurred",
        code: "UNKNOWN_ERROR",
      };

      try {
        errorData = await response.json();
      } catch (jsonError) {
        console.log("Error parsing error response:", jsonError);
      }

      const error = new Error(
        errorData.message || "An unknown error occurred.",
      );
      (error as any).code = errorData.code || "UNKNOWN_ERROR";
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.log("Error in API request:", error);
    throw error;
  }
};
