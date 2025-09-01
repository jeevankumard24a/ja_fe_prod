"use client";

import React, { useState } from "react";
import { MdVerified } from "react-icons/md";
import { FaArrowDown } from "react-icons/fa6";
import { FaSpinner } from "react-icons/fa";
import ImageComponent from "@/components/ui_components/image_component";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  insert_follow,
  load_dashboard,
  get_relationship_status,
} from "@/components/dashboard/utils";
import { toast } from "react-toastify";
//import * as Sentry from "@sentry/nextjs";

export default function Home_Dashboard_Other({ user_id }: { user_id: string }) {
  const authenticatedUserId = "current_user_id_from_token"; // Replace with actual logic

  const {
    refetch: refetch_dashboard,
    data: dashboardData,
    isError: isError_dashboard,
    error: error_dashboard,
    isLoading: isLoading_dashboard,
    isFetching: isFetching_dashboard,
    isSuccess: isSuccess_dashboard,
  } = useQuery({
    queryKey: ["user_id_dashboard_stats", user_id],
    queryFn: () => load_dashboard(user_id),
    enabled: true,
    retry: false,
  });

  const {
    refetch: refetch_relation,
    data: relationData,
    isError: isError_relation,
    error: error_relation,
    isLoading: isLoading_relation,
    isFetching: isFetching_relation,
    isSuccess: isSuccess_relation,
  } = useQuery({
    queryKey: ["user_id_relation_status", user_id],
    queryFn: () => get_relationship_status(user_id), // Pass both IDs
    enabled: !!authenticatedUserId,
    retry: false,
  });

  const [relationshipStatus, setRelationshipStatus] = useState<string | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  React.useEffect(() => {
    console.log(JSON.stringify(relationData));
    if (isSuccess_relation && relationData?.data) {
      setRelationshipStatus(
        relationData.data.relationship_status === "none"
          ? null
          : relationData.data.relationship_status,
      );
    }
  }, [isSuccess_relation, relationData]);

  const mutation = useMutation({
    mutationFn: async ({
      targetUserId,
      reqType,
    }: {
      targetUserId: string;
      reqType: string;
    }) => {
      setPendingAction(reqType);
      const result = await insert_follow(targetUserId, reqType); // Pass follower_id first
      return result.data;
    },
    onSuccess: (data) => {
      setRelationshipStatus(
        data === "unblocked" || data === "not_blocked" ? null : data,
      );
      refetch_dashboard(); // Updates no_followers after block/unblock
      refetch_relation();
      setPendingAction(null);
      if (data === "following") {
        toast.success("Now following this user!", { className: "font-kalam" });
      } else if (data === "requested") {
        toast.success("Follow request sent!", { className: "font-kalam" });
      } else if (data === "unfollowed") {
        toast.success("Unfollowed successfully!", { className: "font-kalam" });
      } else if (data === "blocked") {
        toast.success("User blocked!", { className: "font-kalam" });
      } else if (data === "unblocked") {
        toast.success("User unblocked!", { className: "font-kalam" });
      } else if (data === "not_blocked") {
        toast.info("User was not blocked!", { className: "font-kalam" });
      }
    },
    onError: (error: unknown) => {
      setPendingAction(null);
      toast.error(`Error: ${error}`, { className: "font-kalam" });
    },
  });

  const handleFollowAction = (reqType: string) => {
    mutation.mutate({ targetUserId: user_id, reqType });
  };

  if (isLoading_dashboard || isLoading_relation) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-500"></div>
      </div>
    );
  }

  if (isError_dashboard || isError_relation) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>
          Error loading data:{" "}
          {error_dashboard?.message || error_relation?.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-start c-text-c1 mt-10 items-center w-full font-pop">
        <div className="flex flex-row justify-center mt-10 items-center w-full border-2 bg-custom-gradient11 c-border-c rounded-full">
          <div>
            <ImageComponent image_nm={user_id} />
          </div>
          <div>
            <div className="grid grid-cols-1 mt-6 gap-4">
              <div className="flex justify-center py-2 px-8">
                <div className="font-bold">{user_id}</div>
                <div>
                  <MdVerified className="text-blue-600" size="1.2em" />
                </div>
              </div>
              <div className="grid grid-cols-3 font-gm tracking-widest max-w-[500px] mx-auto gap-4">
                <div>
                  <button
                    disabled={
                      mutation.isPending ||
                      relationshipStatus === "blocked" ||
                      relationData?.data?.is_blocked_by_target
                    }
                    onClick={() =>
                      handleFollowAction(
                        relationshipStatus === "following"
                          ? "unfollow"
                          : "follow",
                      )
                    }
                    className="bg-customButton1-bg hover:bg-customButton1-hoverBg text-customButton1-text hover:text-customButton1-hoverText py-2 px-8 rounded-full transition duration-300"
                  >
                    <div className="flex gap-1 font-gm tracking-widest">
                      <div className="flex justify-center items-center">
                        {relationshipStatus === "following"
                          ? "UNFOLLOW"
                          : relationshipStatus === "requested"
                            ? "REQUESTED"
                            : "FOLLOW"}
                      </div>
                      {mutation.isPending &&
                        (pendingAction === "follow" ||
                          pendingAction === "unfollow") && (
                          <FaSpinner className="mr-2 animate-spin" />
                        )}
                    </div>
                  </button>
                </div>
                <div>
                  <button className="bg-customButton1-bg hover:bg-customButton1-hoverBg text-customButton1-text hover:text-customButton1-hoverText py-2 px-8 rounded-full transition duration-300">
                    MESSAGE
                  </button>
                </div>
                <div>
                  <button
                    disabled={mutation.isPending}
                    onClick={() =>
                      handleFollowAction(
                        relationshipStatus === "blocked" ? "unblock" : "block",
                      )
                    }
                    className="bg-customButton1-bg hover:bg-customButton1-hoverBg text-customButton1-text hover:text-customButton1-hoverText py-2 px-8 rounded-full transition duration-300"
                  >
                    <div className="flex gap-1 font-gm tracking-widest">
                      <div className="flex justify-center items-center">
                        {relationshipStatus === "blocked" ? "UNBLOCK" : "BLOCK"}
                      </div>
                      {mutation.isPending &&
                        (pendingAction === "block" ||
                          pendingAction === "unblock") && (
                          <FaSpinner className="mr-2 animate-spin" />
                        )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex font-co tracking-widest max-w-[500px] mt-8 c-text-c1 mx-auto gap-4">
              <div className="flex gap-2 p-4">
                <div className="flex justify-center font-rm">
                  {dashboardData?.data.no_posts}
                </div>
                <div>POSTS</div>
              </div>
              <div className="flex gap-2 p-4">
                <div className="flex justify-center font-rm">
                  {dashboardData?.data?.no_followers}
                </div>
                <div>FOLLOWERS</div>
              </div>
              <div className="flex gap-2 p-4">
                <div className="flex justify-center font-rm">
                  {dashboardData?.data?.no_following}
                </div>
                <div>FOLLOWING</div>
              </div>
            </div>
            <div className="grid grid-cols-1 font-kalam font-xl gap-2 mt-8 font-bold tracking-wider p-4">
              <div className="flex items-center justify-center">
                {dashboardData?.data?.user_display_name}
              </div>
              <div className="flex items-center justify-center">
                {dashboardData?.data?.user_about}
              </div>
            </div>

            <div className="flex font-gm tracking-widest max-w-[500px] justify-center items-center mb-8 gap-4">
              <div>
                <button className="c-btn-bg hover:text-btnhovertextcolor py-2 px-8 rounded-full c-btn-text-color hover:bg-btnhover transition duration-300">
                  RATINGS
                </button>
              </div>
              <div>
                <button className="c-btn-bg hover:text-btnhovertextcolor py-2 px-8 rounded-full c-btn-text-color hover:bg-btnhover transition duration-300">
                  PROFILE
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 mt-14 font-sg tracking-widest gap-4">
          <button className="c-btn-bg hover:bg-btnhover c-btn-text-color hover:text-btnhovertextcolor py-2 px-8 rounded-full transition duration-300">
            <div className="flex gap-1 justify-center items-center">
              <div className="italic shadow-amber-600">POSTS</div>
              <FaArrowDown className="mt-1" />
            </div>
          </button>
          <button className="c-btn-bg hover:bg-btnhover c-btn-text-color hover:text-btnhovertextcolor py-2 px-8 rounded-full transition duration-300">
            <div className="flex gap-1 justify-center items-center">
              <div className="italic">COURSES</div>
              <FaArrowDown className="mt-1" />
            </div>
          </button>
        </div>
        <div className="border-2 w-4/5 c-border-c mt-4"></div>
      </div>
    </>
  );
}
