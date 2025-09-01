import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
//import * as Sentry from "@sentry/nextjs";

const createErrorResponse = (
  code: string,
  message: string,
  status: number,
  errorDetails?: any,
) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(`Error [${code}]: ${message}`, errorDetails || "");
  }
  return NextResponse.json(
    {
      error: true,
      code,
      message,
    },
    { status },
  );
};

export async function POST(req: NextRequest) {
  const Api_Base_Url = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Validate environment variables
  if (!Api_Base_Url) {
    const error = new Error("API base URL is not configured");
    if (process.env.NODE_ENV === "production") {
      //Sentry.captureException(error);
    }
    return createErrorResponse(
      "ENV_ERROR",
      "API base URL is not configured",
      500,
      error,
    );
  }

  try {
    const body = await req.json();

    const response = await fetch(
      `${Api_Base_Url}/ipa/v1/auth/submit-register-data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      // Handle server errors from external API
      const errorData = await response.json();
      console.log("3333333333333", errorData);

      // Use the code provided by the external API if available
      const errorCode = errorData?.code || "SERVER_ERROR";

      return createErrorResponse(
        errorCode, // Forward the external API error code (e.g., INVALID_CREDENTIALS)
        errorData?.message || "Failed to Submit Register Data",
        response.status,
        errorData,
      );
    }

    // Parse and return successful response
    const data = await response.json();
    return NextResponse.json({
      error: false,
      data,
      message: "Registration Successfull",
    });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "production") {
      //Sentry.captureException(error);
    }

    if (error instanceof Error) {
      return createErrorResponse(
        "KNOWN_ERROR",
        error.message || "An unexpected error occurred",
        500,
        error,
      );
    }

    return createErrorResponse(
      "UNKNOWN_ERROR",
      "An unexpected error occurred",
      500,
      error,
    );
  }
}
