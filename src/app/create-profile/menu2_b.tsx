import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Link from "next/link";
import {FaUniversity, FaUserPlus} from "react-icons/fa";
import {BiSolidSelectMultiple} from "react-icons/bi";
import {MdOutlineMenu} from "react-icons/md";
import React from "react";
import { usePathname } from "next/navigation";

const solutions = [
    { name: 'Coaching Centers', description: 'Learn about tips, product updates and company culture', href: '#' },
    { name: 'Training Centers', description: 'Get all of your questions answered in our forums of contact support', href: '#' },
    { name: 'Guides', description: 'Learn how to maximize our platform to get the most out of it', href: '#' },
    { name: 'Events', description: 'Check out webinars with experts and learn about our annual conference', href: '#' },
    { name: 'Security', description: 'Understand how we take your privacy seriously', href: '#' },
]

export default function Example() {

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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        flex-col flex-nowrap items-center gap-4 overflow-x-auto
    sm:flex-wrap sm:overflow-visible sm:gap-6 md:gap-8
    font-ibmm font-medium
    min-w-0
  "
                    >
                        {/* Create Profile/Login */}


                        {/* Colleges */}
                        <Link
                            href="/colleges"
                            className={`
      flex flex-col items-center gap-1 sm:gap-2
      px-2 sm:px-4 py-1 sm:py-2
      rounded-lg sm:rounded-xl
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
                            <FaUniversity className={`text-xl sm:text-2xl ${pathname === "/colleges" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-xs sm:text-sm font-medium">Colleges</span>
                        </Link>

                        {/* Job Exams */}
                        <Link
                            href="/job-exams"
                            className={`
      flex flex-col items-center gap-1 sm:gap-2
      px-2 sm:px-4 py-1 sm:py-2
      rounded-lg sm:rounded-xl
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
                            <BiSolidSelectMultiple className={`text-xl sm:text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-xs sm:text-sm font-medium">Job Exams</span>
                        </Link>

                        <Link
                            href="/job-exams"
                            className={`
      flex flex-col items-center gap-1 sm:gap-2
      px-2 sm:px-4 py-1 sm:py-2
      rounded-lg sm:rounded-xl
      transition-all duration-200 cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
      hover:bg-gray-100 hover:shadow-md hover:scale-105
      ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
    `}
                            aria-current={pathname === "/job-exams" ? "page" : undefined}
                            title="Coaching Centers"
                        >
                            <BiSolidSelectMultiple className={`text-xl sm:text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-xs sm:text-sm font-medium">Coaching Centers</span>
                        </Link>
                        <Link
                            href="/job-exams"
                            className={`
      flex flex-col items-center gap-1 sm:gap-2
      px-2 sm:px-4 py-1 sm:py-2
      rounded-lg sm:rounded-xl
      transition-all duration-200 cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
      hover:bg-gray-100 hover:shadow-md hover:scale-105
      ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
    `}
                            aria-current={pathname === "/job-exams" ? "page" : undefined}
                            title="Training Centers"
                        >
                            <BiSolidSelectMultiple className={`text-xl sm:text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-xs sm:text-sm font-medium">Training Centers</span>
                        </Link>
                        <Link
                            href="/job-exams"
                            className={`
      flex flex-col items-center gap-1 sm:gap-2
      px-2 sm:px-4 py-1 sm:py-2
      rounded-lg sm:rounded-xl
      transition-all duration-200 cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
      hover:bg-gray-100 hover:shadow-md hover:scale-105
      ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
    `}
                            aria-current={pathname === "/job-exams" ? "page" : undefined}
                            title="Schools"
                        >
                            <BiSolidSelectMultiple className={`text-xl sm:text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-xs sm:text-sm font-medium">Schools</span>
                        </Link>
                        <Link
                            href="/job-exams"
                            className={`
      flex flex-col items-center gap-1 sm:gap-2
      px-2 sm:px-4 py-1 sm:py-2
      rounded-lg sm:rounded-xl
      transition-all duration-200 cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
      hover:bg-gray-100 hover:shadow-md hover:scale-105
      ${pathname === "/job-exams"
                                ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                : "text-gray-700 hover:text-[#005b9a]"}
    `}
                            aria-current={pathname === "/job-exams" ? "page" : undefined}
                            title="Companies"
                        >
                            <BiSolidSelectMultiple className={`text-xl sm:text-2xl ${pathname === "/job-exams" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                            <span className="text-xs sm:text-sm font-medium">Companies</span>
                        </Link>


                    </div>
                </div>
            </PopoverPanel>
        </Popover>
    )
}
