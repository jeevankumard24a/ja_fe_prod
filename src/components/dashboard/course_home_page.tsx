"use client";

import React from "react";
import { Suspense } from "react";
import { MdArrowForward, MdVerified } from "react-icons/md";
import { LuListVideo, LuTextQuote } from "react-icons/lu";
import Image from "next/image";
import { FaArrowDown } from "react-icons/fa6";
import ImageComponent from "@/components/ui_components/image_component";
import { useQuery } from "@tanstack/react-query";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { load_dashboard } from "@/components/dashboard/utils";
import { Divider } from "@/catalyst/divider";
//import UserCourses from "./UserCourses"; // Assuming UserCourses is in the same directory
import UserCourses from "@/components/dashboard/user_courses";

// Placeholder components for COURSES and NOTIFICATIONS
function CoursesTab() {
  return (
    <div className="p-4 text-center text-gray-700 font-kalam">
      Courses content goes here.
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="p-4 text-center text-gray-700 font-kalam">
      Notifications content goes here.
    </div>
  );
}

export default function Course_Home_Page({ user_id }: { user_id: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

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

  return (
    <div className="flex flex-col justify-start c-text-c1 mt-1 items-center w-full">
      {/* Profile Section */}
      <div className="flex flex-row justify-center mt-10 items-center w-full border-2 bg-custom-gradient11 c-border-c rounded-full">
        <div>
          <ImageComponent user_id={user_id} />
        </div>
        <div>
          <div className="grid grid-cols-1 mt-6 gap-4">
            <div className="flex justify-center py-2 px-8">
              <div className="font-bold">{user_id}</div>
              <MdVerified className="text-blue-600" size="1.2em" />
            </div>
            <div className="grid grid-cols-2 font-kalam font-bold tracking-widest max-w-[500px] mx-auto gap-4">
              <button className="bg-customButton1-bg hover:bg-customButton1-hoverBg text-customButton1-text hover:text-customButton1-hoverText py-2 px-8 rounded-full transition duration-300">
                EDIT PROFILE
              </button>
              <button className="bg-customButton1-bg hover:bg-customButton1-hoverBg text-customButton1-text hover:text-customButton1-hoverText py-2 px-8 rounded-full transition duration-300">
                REMOVE DP
              </button>
            </div>
          </div>

          <div className="flex font-co tracking-widest max-w-[500px] mt-8 c-text-c1 mx-auto gap-4">
            <div className="flex gap-2 p-4">
              <div className="flex justify-center">
                {data_cun?.data.no_posts}
              </div>
              <div className="font-co">POSTS</div>
            </div>
            <div className="flex gap-2 p-4">
              <div className="flex justify-center">
                {data_cun?.data?.no_followers}
              </div>
              <div className="font-co">FOLLOWERS</div>
            </div>
            <div className="flex gap-2 p-4">
              <div className="flex justify-center">
                {data_cun?.data?.no_following}
              </div>
              <div className="font-co">FOLLOWING</div>
            </div>
          </div>

          <div className="grid grid-cols-1 font-kalam text-xl gap-2 mt-8 font-bold tracking-wider p-4">
            <div className="flex items-center justify-center">
              {data_cun?.data?.user_display_name}
            </div>
            <div className="flex items-center font-kalam font-bold justify-center">
              {data_cun?.data?.user_about}
            </div>
          </div>

          <div className="flex font-kalam font-bold tracking-widest max-w-[600px] justify-center items-center mb-8 mt-4 gap-4">
            <button className="text-blue-600 border-0 hover:border-[1px] border-blue-600 py-2 px-4 rounded-full transition duration-300 flex items-center gap-1">
              <span>VIEW FEEDBACK</span>
              <MdArrowForward />
            </button>
            <button className="text-orange-600 border-0 hover:border-[1px] border-blue-600 py-2 px-4 rounded-full transition duration-300 flex items-center gap-1">
              <span>PROFILE</span>
              <MdArrowForward />
            </button>
            <button className="text-red-600 border-0 hover:border-[1px] border-blue-600 py-2 px-4 rounded-full transition duration-300 flex items-center gap-1">
              <span>V-BOOK</span>
              <LuListVideo />
            </button>
            <button className="text-black-600 border-0 hover:border-[1px] border-blue-600 py-2 px-4 rounded-full transition duration-300 flex items-center gap-1">
              <span>T-BOOK</span>
              <LuTextQuote />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full max-w-4xl mt-14">
        <TabGroup>
          <TabList className="grid grid-cols-3 gap-4 font-co tracking-widest">
            <Tab
              className={({ selected }) =>
                `flex items-center justify-center gap-1 py-2 px-8 rounded-full transition duration-300 ${
                  selected
                    ? "bg-btnhover text-btnhovertextcolor"
                    : "c-btn-bg c-btn-text-color hover:bg-btnhover hover:text-btnhovertextcolor"
                }`
              }
            >
              <span>COURSE CONTENTS</span>
              <FaArrowDown className="mt-1" />
            </Tab>
            <Tab
              className={({ selected }) =>
                `flex items-center justify-center gap-1 py-2 px-8 rounded-full transition duration-300 ${
                  selected
                    ? "bg-btnhover text-btnhovertextcolor"
                    : "c-btn-bg c-btn-text-color hover:bg-btnhover hover:text-btnhovertextcolor"
                }`
              }
            >
              <span>POSTS</span>
              <FaArrowDown className="mt-1" />
            </Tab>
            <Tab
              className={({ selected }) =>
                `flex items-center justify-center gap-1 py-2 px-8 rounded-full transition duration-300 ${
                  selected
                    ? "bg-btnhover text-btnhovertextcolor"
                    : "c-btn-bg c-btn-text-color hover:bg-btnhover hover:text-btnhovertextcolor"
                }`
              }
            >
              <span>NOTIFICATIONS</span>
              <FaArrowDown className="mt-1" />
            </Tab>
          </TabList>

          <Divider className="mt-2" />

          <TabPanels>
            <TabPanel>
              <Suspense fallback={<div>Loading Posts...</div>}>
                <UserCourses user_id={user_id} />
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
    </div>
  );
}
