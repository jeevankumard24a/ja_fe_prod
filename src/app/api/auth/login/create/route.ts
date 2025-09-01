// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { withApiHandler } from "@/utils/call_api/withApiHandler";
import { createSuccessResponse } from "@/utils/call_api/apiResponse";
import { parseBackendResponse } from "@/utils/call_api/parseBackendResponse";
import { getRequestContext } from "@/utils/call_api/requestLogger";
import ApiError from "@/utils/call_api/ApiError";

type LoginBody = { user_id?: string; password?: string };
type User = { user_id: string; user_name: string };
type LoginResult = { user: User; accessToken: string };

export const POST = withApiHandler(async (req: NextRequest, API_BASE_URL: string) => {
  const { logger, requestId, actionId, correlationHeaders } = getRequestContext(req, "login_attempt");

  if (!API_BASE_URL) {
    throw new ApiError(500, "API base URL not configured", "CONFIG_ERROR", null, requestId, actionId);
  }

  // 1) Parse & validate body
  let body: LoginBody;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON payload", "INVALID_JSON", null, requestId, actionId);
  }
  if (!body?.user_id || !body?.password) {
    throw new ApiError(400, "Invalid user_id or password", "VALIDATION_ERROR", null, requestId, actionId);
  }

  // 2) Call Express (Express sets the refresh cookie; we will forward it)
  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/ipa/v1/auth/submit-login-data`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        ...correlationHeaders, // x-request-id / x-action-id
        "user-agent": req.headers.get("user-agent") || "",
        ...(req.headers.get("x-forwarded-for")
            ? { "x-forwarded-for": req.headers.get("x-forwarded-for") as string }
            : {}),
      },
      body: JSON.stringify({ user_id: body.user_id, password: body.password }),
      redirect: "manual",
    });
  } catch (error) {
    throw new ApiError(503, "Failed to connect to backend", "NETWORK_ERROR", { error }, requestId, actionId);
  }

  // 3) Parse backend envelope (AT in JSON; RT only via Set-Cookie)
  const env = await parseBackendResponse(upstream, "Failed to login", requestId, actionId, req);
  const raw = env?.data ?? env ?? {};

  // Accept both shapes: { data: { user_id, user_name, accessToken } } and { data: { user: {...}, accessToken } }
  const user: User | null =
      raw?.user && typeof raw.user === "object"
          ? ({ user_id: raw.user.user_id, user_name: raw.user.user_name } as User)
          : (raw?.user_id && raw?.user_name ? ({ user_id: raw.user_id, user_name: raw.user_name } as User) : null);

  const accessToken: string | undefined = raw?.accessToken;

  if (!user?.user_id || !user?.user_name || !accessToken) {
    throw new ApiError(500, "Invalid response from backend", "INVALID_RESPONSE", { backendEnvelope: env }, requestId, actionId);
  }

  // 4) Build normalized success response (no refreshToken in JSON)
  const res = createSuccessResponse<LoginResult>(
      "Login successful",
      { user, accessToken },
      "LOGIN_SUCCESS",
      200,
      requestId,
      actionId
  );

  // 5) Forward ALL Set-Cookie headers from Express to the browser
  const setCookieAll = upstream.headers.get("set-cookie");
  if (setCookieAll) {
    for (const c of setCookieAll.split(/,(?=\s*[^;=]+?=)/g)) {
      if (c) (res as any).headers.append("set-cookie", c);
    }
  }

  logger.info("login.success.next_response_prepared", { requestId, actionId, user_id: user.user_id });
  return res;
});
