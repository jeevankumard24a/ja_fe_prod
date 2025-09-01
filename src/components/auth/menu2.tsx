
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Link from "next/link";
import {FaUniversity} from "react-icons/fa";
import {BiSolidSelectMultiple} from "react-icons/bi";

import React from "react";
import { usePathname } from "next/navigation";

import { GrContact } from "react-icons/gr";
import { SiBmcsoftware } from "react-icons/si";
import { IoSchoolSharp } from "react-icons/io5";
import { FaCode } from "react-icons/fa";
import { PiExamFill } from "react-icons/pi";
import { FaInfoCircle } from "react-icons/fa";


export default function Drop_Menu() {

    const pathname = usePathname();

    return (
        <Popover className="relative">
            <PopoverButton className="inline-flex focus:outline-none cursor-pointer items-center gap-x-1 text-sm/6 font-semibold text-gray-900">
                <span>Menu</span>
                <ChevronDownIcon aria-hidden="true" className="size-5" />
            </PopoverButton>

            <PopoverPanel
                transition
                className="absolute right-0 z-10 flex max-w-max transition data-closed:translate-y-0 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
            >
                <div className="w-screen max-w-sm flex-auto rounded-3xl bg-white text-sm/6 shadow-lg ring-1 ring-gray-900/5">
                    <div
                        className="
      grid grid-cols-2 gap-4
      sm:gap-6 md:gap-8
      p-4
      font-ibmm font-medium
    "
                    >
                        {/* Colleges */}
                        <Link
                            href="/colleges"
                            className={`
        flex flex-col items-center gap-2
        px-4 py-2
        rounded-xl
        transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
        hover:bg-gray-100 hover:shadow-md hover:scale-105
        ${pathname === "/colleges"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
      `}
                            aria-current={pathname === "/colleges" ? "page" : undefined}
                            title="Colleges"
                        >
                            <FaUniversity className={`text-2xl ${pathname === "/colleges" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-sm font-medium whitespace-nowrap">Colleges</span>
                        </Link>

                        {/* Job Exams */}
                        <Link
                            href="/job-exams"
                            className={`
        flex flex-col items-center gap-2
        px-4 py-2
        rounded-xl
        transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
        hover:bg-gray-100 hover:shadow-md hover:scale-105
        ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
      `}
                            aria-current={pathname === "/job-exams" ? "page" : undefined}
                            title="Job Exams"
                        >
                            <BiSolidSelectMultiple className={`text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-sm font-medium whitespace-nowrap">Job Exams</span>
                        </Link>

                        {/* Coaching Centers */}
                        <Link
                            href="/job-exams"
                            className={`
        flex flex-col items-center gap-2
        px-4 py-2
        rounded-xl
        transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
        hover:bg-gray-100 hover:shadow-md hover:scale-105
        ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
      `}
                            title="Coaching Centers"
                        >
                            <PiExamFill   className={`text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-sm font-medium whitespace-nowrap">Coaching Centers</span>
                        </Link>

                        {/* Training Centers */}
                        <Link
                            href="/job-exams"
                            className={`
        flex flex-col items-center gap-2
        px-4 py-2
        rounded-xl
        transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
        hover:bg-gray-100 hover:shadow-md hover:scale-105
        ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
      `}
                            title="Training Centers"
                        >
                            <FaCode  className={`text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-sm font-medium whitespace-nowrap">Training Centers</span>
                        </Link>

                        {/* Schools */}
                        <Link
                            href="/job-exams"
                            className={`
        flex flex-col items-center gap-2
        px-4 py-2
        rounded-xl
        transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
        hover:bg-gray-100 hover:shadow-md hover:scale-105
        ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
      `}
                            title="Schools"
                        >
                            <IoSchoolSharp  className={`text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-sm font-medium whitespace-nowrap">Schools</span>
                        </Link>

                        {/* Companies */}
                        <Link
                            href="/job-exams"
                            className={`
        flex flex-col items-center gap-2
        px-4 py-2
        rounded-xl
        transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
        hover:bg-gray-100 hover:shadow-md hover:scale-105
        ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
      `}
                            title="Companies"
                        >
                            <SiBmcsoftware  className={`text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-sm font-medium whitespace-nowrap">Companies</span>
                        </Link>

                        <Link
                            href="/job-exams"
                            className={`
        flex flex-col items-center gap-2
        px-4 py-2
        rounded-xl
        transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
        hover:bg-gray-100 hover:shadow-md hover:scale-105
        ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
      `}
                            title="Companies"
                        >
                            <GrContact  className={`text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-sm font-medium whitespace-nowrap">Contact Us</span>
                        </Link>

                        <Link
                            href="/job-exams"
                            className={`
        flex flex-col items-center gap-2
        px-4 py-2
        rounded-xl
        transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
        hover:bg-gray-100 hover:shadow-md hover:scale-105
        ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
      `}
                            title="Companies"
                        >
                            <FaInfoCircle   className={`text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-sm font-medium whitespace-nowrap">About Us</span>
                        </Link>
                    </div>
                </div>


            </PopoverPanel>
        </Popover>
    )
}
