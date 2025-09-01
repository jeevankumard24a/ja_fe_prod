"use client";

import clsx from "clsx";
import React from "react";
import { Suspense } from "react";
import { MdArrowForward, MdVerified } from "react-icons/md";
import { HiArrowSmRight } from "react-icons/hi";
import { LuListVideo, LuTextQuote } from "react-icons/lu";
import Image from "next/image";
import { FaArrowDown } from "react-icons/fa6";
import ImageComponent from "@/components/ui_components/image_component";
import { useQuery } from "@tanstack/react-query";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { load_dashboard } from "@/components/dashboard/utils";
import { Divider } from "@/catalyst/divider";
import { useRouter, useSearchParams } from "next/navigation";
import UserCourses from "@/components/dashboard/user_courses";

import { useDbDialogStore } from "@/stores/dashboard/db_store";
import { FollowingDialog } from "@/components/dashboard/dialogs/following_dialog";
import { FollowersDialog } from "@/components/dashboard/dialogs/followers_dialog";

// Placeholder components for COURSES and NOTIFICATIONS
function CoursesTab() {
  return (
    <div className="p-4 text-center text-gray-700 font-kalam">
      Courses content goes here.
    </div>
  );
}
//
function NotificationsTab() {
  return (
    <div className="p-4 text-center text-gray-700 font-kalam">
      Notifications content goes here.
    </div>
  );
}

export default function Home_Dashboard({ user_id }: { user_id: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  const router = useRouter();
  const baseImageUrl =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
    "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";

  console.log("HomeeeeeeeeeDashhhhhhhhhhhhhh",user_id)

  const baseDomainUrl =
    process.env.NEXT_PUBLIC_DOMAIN_BASE_URL || "https://jalgo.ai";

  const { activeDialog, dialogParams, openDialog, closeDialog } =
    useDbDialogStore();

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

  if (isLoading_cun || isFetching_cun) {
    return <div>Loading...</div>;
  }

  if (!isLoading_cun) {
    console.log("Vasaiiiiiiiiiiiiiiii:", JSON.stringify(data_cun));
  }

  return (
    <div className="flex flex-col justify-start c-text-c1 mt-1 items-center w-full">
      {/*  Profile Section */}

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
          <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <button
              className="border-2 border-pink-300 hover:bg-pink-300 py-2 px-6 sm:px-8 rounded-full transition duration-300 w-full"
              onClick={() => router.push("/forgot_password")}
            >
              <div className="flex justify-center items-center gap-2 font-kalam tracking-wide">
                <span>EDIT PROFILE</span>
                <HiArrowSmRight />
              </div>
            </button>

            <button
              className="border-2 border-pink-300 hover:bg-pink-300 py-2 px-6 sm:px-8 rounded-full transition duration-300 w-full"
              onClick={() => router.push("/forgot_password")}
            >
              <div className="flex justify-center items-center gap-2 font-kalam tracking-wide">
                <span>REMOVE DP</span>
                <HiArrowSmRight />
              </div>
            </button>
          </div>
        </div>

        {/* Middle Section - Profile & Stats */}
        <div className="w-full flex justify-center px-3 sm:px-6 lg:px-8 mt-4">
          <div className="w-full max-w-6xl bg-white rounded-xl   flex flex-col md:flex-row gap-8 items-center">
            {/* Profile Picture */}
            <div className="flex-shrink-0 w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden">
              {/*<ImageComponent image_nm={data_cun?.data?.user_dp} />*/}
            </div>

            {/* User Info & Stats */}
            <div className="flex-1 w-full border-[1px] border-gray-300 py-4  rounded-full">
              <div className="flex flex-wrap font-ibmm justify-center items-center text-center text-lg font-bold tracking-wider gap-x-6 sm:gap-x-10 md:gap-x-16 lg:gap-x-24 xl:gap-x-32 gap-y-4">
                <div className="">
                  <span className="font-bold ">{data_cun?.data?.no_posts}</span>{" "}
                  <span className={`  text-[#FF1493] `}>POSTS</span>
                </div>
                <button
                  onClick={() => openDialog("followers", { user_id: "123" })}
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

      {/*  Tabs Section */}

      <div className="w-full font-ibmm max-w-4xl mt-14">
        <TabGroup>
          <TabList className="grid grid-cols-3 gap-4  tracking-widest">
            <Tab
              className={({ selected }) =>
                clsx(
                  "flex items-center justify-center gap-1 py-2 px-8 rounded-full transition duration-300",
                  // background & outline when selected…
                  selected && "bg-gray-300 outline-0",
                  // text color: pink when selected, gray when not
                  selected
                    ? "text-[#FF1493]"
                    : "text-gray-500 hover:text-[#FF1493]",
                )
              }
            >
              {/* now none of these need explicit color classes… they’ll inherit */}
              <span className="font-ibmm text-xl italic">f</span>
              <span className="font-ibmm font-medium">(</span>
              <span>COURSES</span>
              <span className="font-ibmm font-medium">)</span>
              <FaArrowDown className="mt-1" />
            </Tab>
            <Tab
              className={({ selected }) =>
                clsx(
                  "flex items-center justify-center gap-1 py-2 px-8 rounded-full transition duration-300",
                  // background & outline when selected…
                  selected && "bg-gray-300 outline-0",
                  // text color: pink when selected, gray when not
                  selected
                    ? "text-[#FF1493]"
                    : "text-gray-500 hover:text-[#FF1493]",
                )
              }
            >
              {/* now none of these need explicit color classes… they’ll inherit */}
              <span className="font-ibmm text-xl italic">f</span>
              <span className="font-ibmm font-medium">(</span>
              <span>POSTS</span>
              <span className="font-ibmm font-medium">)</span>
              <FaArrowDown className="mt-1" />
            </Tab>
            <Tab
              className={({ selected }) =>
                clsx(
                  "flex items-center justify-center gap-1 py-2 px-8 rounded-full transition duration-300",
                  // background & outline when selected…
                  selected && "bg-gray-300 outline-0",
                  // text color: pink when selected, gray when not
                  selected
                    ? "text-[#FF1493]"
                    : "text-gray-500 hover:text-[#FF1493]",
                )
              }
            >
              {/* now none of these need explicit color classes… they’ll inherit */}
              <span className="font-ibmm text-xl italic">f</span>
              <span className="font-ibmm font-medium">(</span>
              <span>NOTIFICATIONS</span>
              <span className="font-ibmm font-medium">)</span>
              <FaArrowDown className="mt-1" />
            </Tab>
          </TabList>
          <div className={`w-full  bg-gray-300`}>
            <Divider className="mt-2" />
          </div>

          <TabPanels>
            <TabPanel>
              <Suspense fallback={<div>Loading Posts...</div>}>
                {/*<UserCourses user_id={user_id} />*/}
              </Suspense>
            </TabPanel>
            <TabPanel>
              <Suspense fallback={<div>Loading Courses...</div>}>
                <CoursesTab />
              </Suspense>
            </TabPanel>
            <TabPanel>
              <Suspense fallback={<div>Loading Notifications...</div>}>
                <NotificationsTab />
              </Suspense>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
      <FollowingDialog />
      <FollowersDialog />
    </div>
  );
}
