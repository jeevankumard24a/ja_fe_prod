"use client";

import { Divider } from "@/catalyst/divider";
import { FaCode } from "react-icons/fa6";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCourseSyllabus } from "@/components/dashboard/utils";
import PlayIcons from "@/components/ui_components/icons"; // Adjust the import path as needed

// Define the shape of a single course item from the SQL query
interface CourseItem {
  base_course_id: string;
  order_of_group: number;
  course_group_name: string;
  stg_course_id: string;
  item_id: string;
  item_desc: string;
  order_of_items: number;
}

// Define the shape of a grouped course (for rendering)
interface GroupedCourse {
  base_course_id: string;
  course_group_name: string;
  order_of_group: number;
  items: {
    stg_course_id: string;
    item_id: string;
    item_desc: string;
    order_of_items: number;
  }[];
}

// Define the full API response structure
interface ApiResponse {
  error: boolean;
  data: CourseItem[];
  message: string;
}

export default function Home({
  course_id,
  userId,
}: {
  course_id: string;
  userId: string;
}) {
  const {
    data: courses,
    isLoading,
    isError,
    error,
  } = useQuery<ApiResponse, Error>({
    queryKey: ["course_syllabus", course_id],
    queryFn: () => getCourseSyllabus(course_id),
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading courses: {error?.message}
      </div>
    );
  }

  // Extract the data array from the response, default to empty array if not present
  const courseData: CourseItem[] =
    courses?.data && Array.isArray(courses.data) ? courses.data : [];

  // Log for debugging
  console.log("Course data:", courseData);

  // Group courses by base_course_id and course_group_name
  const groupedCourses: Record<string, GroupedCourse> = courseData.reduce(
    (
      acc: Record<string, GroupedCourse>,
      course: CourseItem,
    ): Record<string, GroupedCourse> => {
      const key = `${course.base_course_id}-${course.course_group_name}`;
      if (!acc[key]) {
        acc[key] = {
          base_course_id: course.base_course_id,
          course_group_name: course.course_group_name,
          order_of_group: course.order_of_group,
          items: [],
        };
      }
      acc[key].items.push({
        stg_course_id: course.stg_course_id,
        item_id: course.item_id,
        item_desc: course.item_desc,
        order_of_items: course.order_of_items,
      });
      return acc;
    },
    {},
  );

  // Convert grouped object to array and sort by order_of_group
  const courseGroups: GroupedCourse[] = Object.values(groupedCourses).sort(
    (a: GroupedCourse, b: GroupedCourse) => a.order_of_group - b.order_of_group,
  );

  return (
    <div className="w-full flex flex-col justify-center items-center mx-auto">
      {courseGroups.map((group: GroupedCourse, index: number) => (
        <div
          key={`${group.base_course_id}-${group.course_group_name}`}
          className={`w-[1000px] h-auto border-x-[1px] ${
            index !== courseGroups.length - 1 ? "border-b-[1px]" : ""
          } border-slate-300 flex justify-center items-center`}
        >
          <div
            className={`w-11/12 flex font-kalam tracking-wide text-xl pb-10 flex-col m-10 justify-center border-${
              index % 2 === 0 ? "pink" : "blue"
            }-300 items-center border-[1px] rounded-[50px]`}
          >
            <div
              className={`font-bold font-la mb-10 italic  underline text-${
                index % 2 === 0 ? "pink" : "sky"
              }-600 text-2xl mt-4 underline-offset-4 tracking-widest`}
            >
              {group.course_group_name}
            </div>

            {group.items
              .sort((a, b) => a.order_of_items - b.order_of_items)
              .map((item, idx, arr) => (
                <React.Fragment key={item.item_id}>
                  <div
                    className={`
          flex
          w-full
          gap-4
          font-la
          pl-14
          items-center
          justify-between
          pr-4
          ${idx % 2 === 0 ? "text-red-950" : "text-gray-950"}
        `}
                  >
                    <div className="flex gap-2 items-center">
                      <span className="w-10 h-10 flex text-sm justify-center items-center rounded-full bg-slate-300">
                        124
                      </span>
                      <FaCode
                        className={`w-6 h-6 text-${
                          index % 2 === 0 ? "sky" : "pink"
                        }-600`}
                      />
                      <div className="pl-2">{item.item_desc}</div>
                    </div>
                    {/*<PlayIcons … />*/}
                  </div>

                  {idx < arr.length - 1 && (
                    <div className="my-6 bg-gray-300 w-11/12">
                      <Divider />
                    </div>
                  )}
                </React.Fragment>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
