"use client";

import { Divider } from "@/catalyst/divider";
import Image from "next/image";
import { FaCheck } from "react-icons/fa";
import { MdArrowForward } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { getUserCourses } from "@/components/dashboard/utils";
import React from "react";
import { HiArrowSmRight } from "react-icons/hi";

// Type definition for course data based on your response
type Course = {
  course_id: string;
  course_name_raw: string;
  faculty_id: string;
  faculty_full_name: string;
  lm_name: string;
  clevel_name: string;
  start_date: string;
  end_date: string;
};

type UserCourseData = {
  error: boolean;
  data: Course[];
  message: string;
};

export default function UserCourses({ user_id }: { user_id: string }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://example.com";

  const {
    data: userCourseData,
    isError: userCourseError,
    error: userCourseErrorObj,
    isLoading: userCourseIsLoading,
    isFetching: userCourseIsFetching,
  } = useQuery<UserCourseData>({
    queryKey: ["user_courses", user_id],
    queryFn: () => getUserCourses(), // Pass user_id to fetch specific user's courses if needed
    enabled: true,
  });

  // Helper to format ISO dates (e.g., "2025-03-02T18:30:00.000Z" -> "2nd Mar 2025")
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (userCourseIsLoading || userCourseIsFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading courses...
      </div>
    );
  }

  if (userCourseError) {
    return (
      <div className="flex h-screen items-center justify-center">
        Error: {userCourseErrorObj?.message || "Failed to load courses"}
      </div>
    );
  }

  if (!userCourseData?.data?.length) {
    return (
      <div className="flex h-screen items-center justify-center">
        No courses found for user {user_id}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-center items-center mx-auto">
      {userCourseData.data.map((course, index) => (
        <div
          key={course.course_id}
          className={`w-[800px] h-auto border-x-[1px] ${
            index === userCourseData.data.length - 1
              ? "border-b-[0px]"
              : "border-b-[1px]"
          } border-slate-300 flex justify-center items-center`}
        >
          <div
            className={`w-11/12 flex font-la flex-col m-10 justify-center border-${
              index % 2 === 0 ? "pink" : "blue"
            }-300 items-center border-[1px] rounded-[50px]`}
          >
            <div
              className={`font-bold italic font-la text-${
                index % 2 === 0 ? "pink" : "blue"
              }-600 text-2xl mt-4 underline-offset-4 px-6 tracking-widest`}
            >
              {course.course_name_raw}
            </div>
            <div className={`w-full mt-2 bg-gray-300`}>
              <Divider className="my-1" />
            </div>
            <div className="my-6 flex gap-4 font-la italic font-medium  tracking-widest rounded-full justify-center items-center">
              <Image
                src={`${baseUrl}/${course.faculty_id}.png`}
                alt={`${course.faculty_full_name} Profile`}
                width={50}
                height={50}
                className="rounded-full"
                onError={(e) =>
                  (e.currentTarget.src = `${baseUrl}/default.png`)
                } // Fallback image
              />
              <div>{course.faculty_full_name}</div>
            </div>

            <div className="flex items-center w-full mb-6">
              <span className="flex-1 bg-gray-300">
                <Divider />
              </span>
              <span className="mx-4 whitespace-nowrap font-ibmm  font-bold  uppercase text-green-700">
                COURSE FEATURES
              </span>
              <span className="flex-1 bg-gray-300">
                <Divider />
              </span>
            </div>
            <div className="grid font-ibmm grid-cols-2 mb-6  gap-10">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex gap-2 items-center">
                  <FaCheck color="green" />
                  <div>{course.lm_name}</div>
                </div>
                <Divider className="my-2" />
                <div className="flex gap-2 font-la tracking-widest items-center">
                  <button
                    className="border-1 border-pink-300 hover:bg-pink-300 py-2 px-6 sm:px-8 rounded-full transition duration-300 w-[200px]"
                    // onClick={() => router.push("/forgot_password")}
                  >
                    <div className="flex justify-center items-center gap-2 font-kalam tracking-wide">
                      <span>PREREQUISITES</span>
                      <HiArrowSmRight />
                    </div>
                  </button>
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    className="border-1 border-pink-300 hover:bg-pink-300 py-2 px-6 sm:px-8 rounded-full transition duration-300 w-[300px]"
                    // onClick={() => router.push("/forgot_password")}
                  >
                    <div className="flex justify-center items-center gap-2 font-kalam tracking-wide">
                      <span>LEAVE FEEDBACK</span>
                      <HiArrowSmRight />
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1">
                <div className="flex gap-2 items-center">
                  <FaCheck color="green" />
                  <div>{course.clevel_name}</div>
                </div>
                <Divider className="my-2" />
                <div className="flex gap-2 items-center">
                  <FaCheck color="green" />
                  <div>Starting on {formatDate(course.start_date)}</div>
                </div>
                <Divider className="my-2" />
                <div className="flex gap-2  font-la tracking-wider items-center"></div>
                <div className="flex gap-2 items-center">
                  <FaCheck color="green" />
                  <div>Ending on {formatDate(course.end_date)}</div>
                </div>
              </div>
            </div>
            <div className={`w-full my-3 bg-gray-300`}>
              <Divider className="" />
            </div>

            <div className="w-full font-kalam   font-medium my-6 flex  tracking-widest justify-around">
              <button
                className="border-1 border-pink-300 hover:bg-pink-300 py-1 px-3 sm:px-1 rounded-full transition duration-300 w-[150px]"
                // onClick={() => router.push("/forgot_password")}
              >
                <div className="flex justify-center items-center gap-2 font-kalam tracking-wide">
                  <span>FEEDBACK</span>
                  <HiArrowSmRight />
                </div>
              </button>

              <button
                className="border-1 border-pink-300 hover:bg-pink-300 py-2 px-6 sm:px-2 rounded-full transition duration-300 w-[200px]"
                // onClick={() => router.push("/forgot_password")}
              >
                <div className="flex justify-center items-center gap-2 font-kalam tracking-wide">
                  <span>COURSE DETAILS</span>
                  <HiArrowSmRight />
                </div>
              </button>

              <button
                className="border-1 border-pink-300 hover:bg-pink-300 py-2 px-2 sm:px-2 rounded-full transition duration-300 w-[230px]"
                // onClick={() => router.push("/forgot_password")}
              >
                <div className="flex justify-center items-center gap-2 font-kalam tracking-wide">
                  <span>GO TO COURSE</span>
                  <HiArrowSmRight />
                </div>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
