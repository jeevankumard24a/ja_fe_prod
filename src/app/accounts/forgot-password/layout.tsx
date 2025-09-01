"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Providers from "@/providers/react_query";
import { Divider } from "@/catalyst/divider";

import { MdOutlineMenu } from "react-icons/md";
import Drop_Menu from "@/components/ui_components/drop_menu"
import {
    FaUserPlus,
    FaUniversity,
 FaCode, FaInfoCircle,
} from "react-icons/fa";
import { BiSolidSelectMultiple } from "react-icons/bi";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    TransitionChild,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import {PiExamFill} from "react-icons/pi";
import {IoSchoolSharp} from "react-icons/io5";
import {SiBmcsoftware} from "react-icons/si";
import {GrContact} from "react-icons/gr";

export default function Home_Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const baseImageUrl =
        process.env.NEXT_PUBLIC_IMAGE_URL ||
        "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";
    const baseDomainUrl =
        process.env.NEXT_PUBLIC_DOMAIN_BASE_URL || "https://jalgo.shop";

    const menuItems = [
        { label: "Create Profile/Login", icon: <FaUserPlus className="text-xl" />, href: "/profile/create" },
        { label: "Schools",      icon: <FaUniversity className="text-xl" />, href: "/schools" },
        { label: "Colleges",      icon: <FaUniversity className="text-xl" />, href: "/colleges" },
        { label: "Companies",      icon: <SiBmcsoftware className="text-xl" />, href: "/companies" },
        { label: "Job Exams",     icon: <BiSolidSelectMultiple className="text-xl" />, href: "/job-exams" },
        { label: "Coaching Centers",     icon: <PiExamFill className="text-xl" />, href: "/coaching-centers" },
        { label: "Training Centers",     icon: <FaCode className="text-xl" />, href: "/training-centers" },
        { label: "About Us",     icon: <FaInfoCircle className="text-xl" />, href: "/about-us" },
    ];

    const navItems = [
        { label: "Colleges", href: "/colleges", icon: <FaUniversity className="text-xl" /> },
        { label: "Job Exams", href: "/job-exams", icon: <BiSolidSelectMultiple className="text-xl" /> },
        { label: "Coaching Centers", href: "/coaching-centers", icon: <PiExamFill className="text-xl" /> },
        { label: "Training Centers", href: "/training-centers", icon: <FaCode className="text-xl" /> },
        { label: "Schools", href: "/schools", icon: <IoSchoolSharp className="text-xl" /> },
        { label: "Companies", href: "/companies", icon: <SiBmcsoftware className="text-xl" /> },
        { label: "Contact Us", href: "/contact-us", icon: <GrContact className="text-xl" /> },
        { label: "About Us", href: "/about-us", icon: <FaInfoCircle className="text-xl" /> },
    ];

    const sidebarItems = [
        { label: "Schools",   href: `${baseDomainUrl}/schools-home`,        image: "/school_6.png",      desktopImage: `${baseImageUrl}/school_logo.png` },
        { label: "Companies", href: `${baseDomainUrl}/colleges-home`,       image: "/schools_7.png",     desktopImage: "/company2.png" },
        { label: "Menu",      href: `${baseDomainUrl}/about-us`,           image: "/more3.png",         desktopImage: `${baseImageUrl}/all_links.png` },
    ];

    return (
        <div className="bg-white">
            {/* Mobile Sidebar */}
            <Dialog
                open={sidebarOpen}
                onClose={() => setSidebarOpen}
                className="relative z-50 lg:hidden"
            >
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
                />

                <div className="fixed inset-0 flex">
                    <DialogPanel
                        transition
                        className="relative mr-16 flex w-full max-w-xs flex-auto transform transition-all duration-300 ease-in-out data-[closed]:-translate-x-full"
                    >
                        <TransitionChild>
                            <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[0]:opacity-0">
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    className="relative -m-2.5 p-2.5 text-white hover:text-gray-300 transition-colors"
                                >
                                    <span className="absolute sr-only">Close sidebar</span>
                                    <XMarkIcon aria-hidden="true" className="size-6" />
                                </button>
                            </div>
                        </TransitionChild>

                        {/* Mobile Sidebar Content */}
                        <div className="flex items-center grow flex-col gap-y-5 overflow-y-auto rounded-l-[40px] bg-gradient-to-r1 px-6 pb-4">
                            {/* Logo Section */}
                            <div className="flex flex-col mt-4 gap-4 h-16 shrink-0 items-center">
                                <Link href="https://jalgo.tech/" className="block">
                                    <Image
                                        src={`${baseImageUrl}/jalgo_short_logo.png`}
                                        alt="JALGO Logo"
                                        width={75}
                                        height={38}
                                        className="rounded-lg hover:opacity-80 transition-opacity duration-200"
                                    />
                                </Link>
                                <Divider />
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="flex flex-1 flex-col gap-y-4">
                                {/*{menuItems.map((item, index) => (*/}
                                {/*    <Link*/}
                                {/*        key={index}*/}
                                {/*        href={item.href}*/}
                                {/*        className={`*/}
                                {/*            flex flex-row items-center gap-3*/}
                                {/*            px-4 py-2*/}
                                {/*            rounded-lg*/}
                                {/*            transition-all duration-200 cursor-pointer*/}
                                {/*            focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#005b9a]*/}
                                {/*            hover:bg-white/10 hover:shadow-md*/}
                                {/*            ${pathname === item.href*/}
                                {/*            ? "bg-white/20 shadow-lg border-l-4 border-white text-white"*/}
                                {/*            : "text-white hover:text-gray-200"}*/}
                                {/*        `}*/}
                                {/*        aria-current={pathname === item.href ? "page" : undefined}*/}
                                {/*        title={item.label}*/}
                                {/*    >*/}
                                {/*        {React.cloneElement(item.icon, {*/}
                                {/*            className: `text-xl ${pathname === item.href ? "text-white" : "text-white"}`*/}
                                {/*        })}*/}
                                {/*        <span className="text-sm font-medium font-ibmm">{item.label}</span>*/}
                                {/*    </Link>*/}
                                {/*))}*/}

                                <div className="flex-auto rounded-3xl text-sm/6  ">
                                    <div
                                        className="
                    grid grid-cols-1 gap-4
                    sm:gap-6 md:gap-8
                    p-4
                    font-ibmm font-medium
                "
                                    >
                                        {navItems.map((item, index) => (
                                            <Link
                                                key={index}
                                                href={item.href}
                                                className={`
                            flex flex-row items-center gap-3
                            px-4 py-2
                            rounded-xl
                            transition-all duration-200 cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800
                            hover:bg-white/10 hover:shadow-md
                            ${pathname === item.href
                                                    ? "bg-white/20 shadow-lg border-l-4 border-white text-white"
                                                    : "text-white hover:text-gray-200"}
                        `}
                                                aria-current={pathname === item.href ? "page" : undefined}
                                                title={item.label}
                                            >
                                                {React.cloneElement(item.icon, {
                                                    className: `text-xl ${pathname === item.href ? "text-white" : "text-white"}`
                                                })}
                                                <span className="text-sm font-medium font-ibmm whitespace-nowrap">{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-[160px] lg:flex-col">
                <div className="flex w-full grow flex-col gap-y-5 overflow-y-auto rounded-l-[40px] bg-gradient-to-r1 px-6 pb-4">
                    <div className="flex flex-col h-[100px] shrink-0 justify-between items-center">
                        <Link href={baseDomainUrl} className="flex h-full justify-center items-center">
                            <Image
                                src={`${baseImageUrl}/jalgo_short_logo.png`}
                                alt="JALGO Logo"
                                width={75}
                                height={38}
                                className="rounded-lg hover:opacity-80 transition-opacity duration-200"
                            />
                        </Link>
                        <Divider />
                    </div>
                    <nav className="flex flex-1 w-full flex-col items-center">
                        {sidebarItems.map((item, i) => (
                            <div key={i} className={`${i > 0 ? 'pt-6' : ''} flex flex-col items-center`}>
                                <Link
                                    href={item.href}
                                    className="flex flex-col items-center p-3 rounded-lg hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    <Image
                                        src={item.desktopImage || item.image}
                                        alt={`${item.label} icon`}
                                        width={75}
                                        height={item.label === "Companies" ? 54 : 44}
                                        className="rounded-lg hover:opacity-80 transition-opacity duration-200"
                                    />
                                    <div className="mt-2 font-kalam text-lg tracking-widest text-white">
                                        {item.label}
                                    </div>
                                </Link>
                                {i < sidebarItems.length - 1 && <Divider />}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:pl-[160px] min-h-screen">
                {/* Top Navigation Bar */}
                <div className="sticky top-0 z-40 w-full h-[100px] border-b border-gray-300 bg-white flex items-center px-4">
                    {/* Mobile Menu Button */}
                    <div className="flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-full border-2 border-[#005b9a] transition-colors duration-200 focus:outline-none "
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Bars3Icon aria-hidden="true" className="size-6" />
                        </button>
                    </div>
                    {/* Centered Content: Logo and Menu Items */}
                    <div className="flex-grow flex justify-center">
                        <div className="flex flex-row items-center justify-center gap-6 md:gap-8">
                            {/* Logo */}
                            <Image
                                src="/jalgo_logo_40.png"
                                alt="JALGO Logo"
                                width={100}
                                height={20}
                                className="block sm:hidden rounded-lg hover:opacity-80 transition-opacity duration-200"
                            />
                            <Image
                                src="/jalgo_logo_40.png"
                                alt="JALGO Logo"
                                width={203}
                                height={40}
                                className="hidden sm:block rounded-lg hover:opacity-80 transition-opacity duration-200"
                            />
                            {/* Menu Items */}
                            <div className="hidden sm:flex flex-nowrap items-center gap-4 sm:gap-6 md:gap-8 font-ibmm font-medium min-w-0">
                                {/* Create Profile/Login */}
                                <Link
                                    href="/profile/create"
                                    className={`
                                        flex flex-col items-center gap-1 sm:gap-2
                                        px-2 sm:px-4 py-1 sm:py-2
                                        rounded-lg sm:rounded-xl
                                        transition-all duration-200 cursor-pointer
                                        focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
                                        hover:bg-gray-100 hover:shadow-md hover:scale-105
                                        ${pathname === "/profile/create"
                                        ? "bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]"
                                        : "text-gray-700 hover:text-[#005b9a]"}
                                    `}
                                    aria-current={pathname === "/profile/create" ? "page" : undefined}
                                    title="Create Profile or Login"
                                >
                                    <FaUserPlus className={`text-xl sm:text-2xl ${pathname === "/profile/create" ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                                    <span className="text-xs sm:text-sm font-medium">Create Profile/Login</span>
                                </Link>
                                {/* Only visible ≥1024px (lg) */}
                                <div className="hidden lg:flex flex-nowrap items-center gap-4">
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
                                    {/* Solutions Dropdown */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        title="Solutions"
                                        className={`
                                            flex flex-col items-center 
                                            px-2 sm:px-4 py-1 sm:py-2 gap-2
                                            rounded-lg sm:rounded-xl
                                            transition-all duration-200 
                                            focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2
                                            hover:bg-gray-100 hover:shadow-md hover:scale-105
                                            ${pathname.startsWith('/solutions')
                                            ? 'bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]'
                                            : 'text-gray-700 hover:text-[#005b9a]'}
                                        `}
                                        aria-current={pathname.startsWith('/solutions') ? 'page' : undefined}
                                    >
                                        <MdOutlineMenu className={`text-xl sm:text-2xl ${pathname.startsWith("/solutions") ? "text-[#007a88]" : "text-[#005b9a]"}`} />
                                        <div><Drop_Menu /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Optional Right-Aligned Content */}
                    <div className="flex-shrink-0">
                        {/* Add content here if needed */}
                    </div>
                </div>

                {/* Page Content */}
                <main className="h-full w-full">
                    <Providers>{children}</Providers>
                </main>
            </div>
        </div>
    );
}