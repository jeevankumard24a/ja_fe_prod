"use client";
import { useRouter, useSearchParams } from "next/navigation";
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
import { HiArrowSmRight } from "react-icons/hi";
import Image from "next/image";
//import * as Sentry from "@sentry/nextjs";

export default function Home_Dashboard_Other({ user_id }: { user_id: string }) {
  const authenticatedUserId = "current_user_id_from_token"; // Replace with actual logic
  const router = useRouter();

  const baseDomainUrl =
    process.env.NEXT_PUBLIC_DOMAIN_BASE_URL || "https://jalgo.shop";

  const baseImageUrl =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
    "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";

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
    data: data_cun,
    isError: isError_cun,
    error: error_cun,
    isLoading: isLoading_cun,
    isFetching: isFetching_cun,
  } = useQuery({
    queryKey: ["user_id", user_id],
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

  if (isLoading_cun || isFetching_cun) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-col justify-start c-text-c1 mt-1 items-center w-full">
        <div className="flex flex-col mb-10 justify-center mt-10 items-center w-full border-[1px]  border-gray-300 rounded-3xl lg:rounded-[100px] xl:rounded-full ">
          {/* Top Section - Username + Buttons */}
          <div className="w-full flex flex-col justify-center items-center px-3 sm:px-6 lg:px-8 mt-2">
            {/* User ID with Verified Icon */}
            <div className="flex flex-wrap justify-center items-center gap-2 py-2">
              <div className="font-bold text-lg sm:text-xl md:text-2xl">
                {user_id}
              </div>
              <MdVerified className="text-blue-600" size="1.5em" />
            </div>

            {/* Buttons: Edit Profile & Remove DP */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
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
                  className="border-2 border-pink-300 hover:bg-pink-300 py-2 px-6 sm:px-8 rounded-full transition duration-300 w-full"
                >
                  <div className="flex justify-center items-center gap-2 font-kalam tracking-wide">
                    {relationshipStatus === "following"
                      ? "UNFOLLOW"
                      : relationshipStatus === "requested"
                        ? "REQUESTED"
                        : "FOLLOW"}
                    <HiArrowSmRight />
                  </div>

                  <div className="flex gap-1 font-gm tracking-widest">
                    {mutation.isPending &&
                      (pendingAction === "follow" ||
                        pendingAction === "unfollow") && (
                        <FaSpinner className="mr-2 animate-spin" />
                      )}
                  </div>
                </button>
              </div>

              <button
                className="border-2 border-pink-300 hover:bg-pink-300 py-2 px-6 sm:px-8 rounded-full transition duration-300 w-full"
                onClick={() => router.push("/forgot_password")}
              >
                <div className="flex justify-center items-center gap-2 font-kalam tracking-wide">
                  <span>MESSAGE</span>
                  <HiArrowSmRight />
                </div>
              </button>
              <div>
                <button
                  disabled={mutation.isPending}
                  onClick={() =>
                    handleFollowAction(
                      relationshipStatus === "blocked" ? "unblock" : "block",
                    )
                  }
                  className="border-2 border-pink-300 hover:bg-pink-300 py-2 px-6 sm:px-8 rounded-full transition duration-300 w-full"
                >
                  <div className="flex justify-center items-center gap-2 font-kalam tracking-wide">
                    {relationshipStatus === "blocked" ? "UNBLOCK" : "BLOCK"}
                    <HiArrowSmRight />
                  </div>

                  <div className="flex gap-1 font-gm tracking-widest">
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

          {/* Middle Section - Profile & Stats */}
          <div className="w-full flex justify-center px-3 sm:px-6 lg:px-8 mt-4">
            <div className="w-full max-w-6xl bg-white rounded-xl   flex flex-col md:flex-row gap-8 items-center">
              {/* Profile Picture */}
              <div className="flex-shrink-0 w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden">
                <ImageComponent image_nm={data_cun?.data?.user_dp} />
              </div>

              {/* User Info & Stats */}
              <div className="flex-1 w-full border-[1px] border-gray-300 py-4  rounded-full">
                <div className="flex flex-wrap font-ibmm justify-center items-center text-center text-lg font-bold tracking-wider gap-x-6 sm:gap-x-10 md:gap-x-16 lg:gap-x-24 xl:gap-x-32 gap-y-4">
                  <div className="">
                    <span className="font-bold ">
                      {data_cun?.data?.no_posts}
                    </span>{" "}
                    <span className={`  text-[#FF1493] `}>POSTS</span>
                  </div>
                  <button
                    //  onClick={() => openDialog("followers", { user_id: "123" })}
                    className=""
                  >
                    <span className=" font-bold">
                      {data_cun?.data?.no_followers}
                    </span>{" "}
                    <span className={`text-[#FF1493] `}>fOLLOWERS</span>
                  </button>
                  <div className="">
                    <span className="font-bold">
                      {data_cun?.data?.no_following}
                    </span>{" "}
                    <span className={`text-[#FF1493]  font-bold`}>
                      {" "}
                      fOLLOWING
                    </span>
                  </div>
                </div>

                {/* Display Name & About */}
                <div className="mt-10 text-center font-rm space-y-2">
                  <div className="text-2xl font-kalam tracking-wider font-bold text-gray-800">
                    {data_cun?.data?.user_display_name}
                  </div>
                  <div className="italic text-gray-600 tracking-widest  font-la text-xl">
                    {data_cun?.data?.user_about}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="w-full flex justify-center px-3 sm:px-6 lg:px-8">
            <div className="w-full font-rm font-bold max-w-6xl flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 mt-2 mb-2">
              {/* Feedback */}
              <button className="border-0 py-2 px-4 rounded-full transition duration-300 flex flex-col items-center">
                <Image
                  src={`${baseImageUrl}/db_feedback_7.png`}
                  alt="Feedback"
                  width={100}
                  height={45}
                  className="rounded-lg hover:opacity-80 transition"
                />
                <div className=" text-gray-800 mt-2 font-la tracking-wider  text-sm sm:text-base">
                  Feedback
                </div>
              </button>

              {/* Profile */}
              <button className="text-orange-600 border-0 py-2 px-4 rounded-full transition duration-300 flex flex-col items-center">
                <Image
                  src={`${baseImageUrl}/db_user_profile_7.png`}
                  alt="Profile"
                  width={100}
                  height={45}
                  className="rounded-lg hover:opacity-80 transition"
                />
                <div className=" text-gray-800 mt-2 font-la tracking-wider  text-sm sm:text-base">
                  Profile
                </div>
              </button>

              {/* V-Book */}
              <button className="text-red-600 border-0 py-2 px-4 rounded-full transition duration-300 flex flex-col items-center">
                <Image
                  src={`${baseImageUrl}/db_vbook_7.png`}
                  alt="V-Book"
                  width={100}
                  height={45}
                  className="rounded-lg hover:opacity-80 transition"
                />
                <div className=" text-gray-800 font-la tracking-wider   mt-2 text-sm sm:text-base">
                  V-Book
                </div>
              </button>

              {/* T-Book */}
              <button className="text-black-600 border-0 py-2 px-4 rounded-full transition duration-300 flex flex-col items-center">
                <Image
                  src={`${baseImageUrl}/db_tbook_10.png`}
                  alt="T-Book"
                  width={100}
                  height={45}
                  className="rounded-lg hover:opacity-80 transition"
                />
                <div className="text-gray-800 font-la tracking-wider  mt-2 text-sm sm:text-base">
                  T-Book
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
