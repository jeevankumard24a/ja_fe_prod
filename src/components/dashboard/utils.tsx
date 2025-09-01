// components/dashboard/utils.ts
"use client";

import { make_api_request, type ApiEnvelope } from "@/utils/call_api/make_api_req";
import ApiError from "@/components/utils/ApiError";
import log, { getActionId, setActionId } from "@/utils/call_api/logs";
import { newId } from "@/utils/call_api/ids";
import { getAccessToken } from "@/stores/auth/auth-store";

/** Match fields your page reads from `data` */
export type DashboardPayload = {
  user_dp?: string;
  no_posts?: number;
  no_followers?: number;
  no_following?: number;
  user_display_name?: string;
  user_about?: string;
  [key: string]: unknown;
};

export type LoadDashboardResponse = ApiEnvelope<DashboardPayload>;

/**
 * Calls NextJS GET /api/dashboard/load-dashboard?user_id=<id>
 * - Sends Authorization: Bearer <accessToken>
 * - Adds x-action-id for correlation
 */
export const load_dashboard = async (user_id: string): Promise<LoadDashboardResponse> => {
  const accessToken = getAccessToken();

  console.log("hiiiiiiiiiiiiMadhuuuuuuuuuu", accessToken);
  console.log("hiiiiiiiiiiiiMadhuuuuuuuuuu222222222", user_id);

  // if (!accessToken) {
  //   throw new ApiError(401, "Access token missing", "TOKEN_MISSING");
  // }

  // correlate this action
  const existingAid = getActionId();
  const actionId = existingAid ?? newId();
  if (!existingAid) setActionId(actionId);

  const qs = user_id ? `?${new URLSearchParams({ user_id }).toString()}` : "";
  const url = `/api/dashboard/load_user_dashboard${qs}`;

  log.warn("dashboard.load.start", { actionId, user_id });

  try {
    const res = await make_api_request<DashboardPayload>(url, {
      method: "GET",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-action-id": actionId,
        accept: "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    log.warn("dashboard.load.response", {
      actionId: res.actionId ?? actionId,
      requestId: res.requestId,
      status: res.status,
      statusCode: res.statusCode,
      code: res.code,
    });

    return res as LoadDashboardResponse;
  } catch (err: unknown) {
    const apiErr = err instanceof ApiError ? err : undefined;
    const message =
        apiErr?.message ?? (err && typeof err === "object" && "message" in err ? String((err as any).message) : String(err));

    log.error("dashboard.load.error", {
      actionId,
      requestId: apiErr?.requestId,
      code: (apiErr as any)?.code,
      message,
    });

    throw err; // preserve original error
  } finally {
    setActionId(undefined);
  }
};

export const getUserCourses = async (): Promise<any> => {
  return make_api_request(`/api/dashboard/user_courses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
