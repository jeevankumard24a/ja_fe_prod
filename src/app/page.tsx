"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Home_Page from "@/components/home/home";

import { Divider } from "@/catalyst/divider";
import {
    FaUserPlus,
    FaUniversity,
    FaClipboardCheck,
    FaChalkboardTeacher,
    FaLaptopCode,
} from "react-icons/fa";

import { RiCheckboxMultipleLine } from "react-icons/ri";
import { BiSolidSelectMultiple } from "react-icons/bi";

import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaCode } from "react-icons/fa";
import { usePathname } from "next/navigation";

export default function Home_Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Use environment variable for S3 base URL
    const baseImageUrl =
        process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
        "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";

    const baseDomainUrl =
        process.env.NEXT_PUBLIC_DOMAIN_BASE_URL || "https://jalgo.shop";

    // Navigation menu items with proper routing
    const menuItems = [
        { label: "Create Profile", icon: <FaUserPlus className="text-xl" />, href: "/profile/create" },
        { label: "Colleges", icon: <FaUniversity className="text-xl" />, href: "/colleges" },
        { label: "Job Exams", icon: <BiSolidSelectMultiple className="text-xl" />, href: "/job-exams" },
        { label: "Coaching Centers", icon: <FaChalkboardTeacher className="text-xl" />, href: "/coaching-centers" },
        { label: "Training Centers", icon: <FaCode className="text-2xl" />, href: "/training-centers" },
    ];

    // Sidebar navigation items
    const sidebarItems = [
        { label: "Schools", href: `${baseDomainUrl}/schools-home`, image: "/school_6.png", desktopImage: `${baseImageUrl}/school_logo.png` },
        { label: "Companies", href: `${baseDomainUrl}/colleges-home`, image: "/schools_7.png", desktopImage: "/company2.png" },

        { label: "Menu", href: `${baseDomainUrl}/all-links`, image: "/more3.png", desktopImage: `${baseImageUrl}/all_links.png` },
    ];

    return (
        <div className="bg-white">
            {/* Mobile Sidebar */}
            <Dialog
                open={sidebarOpen}
                onClose={setSidebarOpen}
                className="relative z-50 lg:hidden"
            >
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
                />

                <div className="fixed inset-0 flex">
                    <DialogPanel
                        transition
                        className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
                    >
                        <TransitionChild>
                            <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    className="-m-2.5 p-2.5 text-white hover:text-gray-300 transition-colors"
                                >
                                    <span className="sr-only">Close sidebar</span>
                                    <XMarkIcon aria-hidden="true" className="size-6" />
                                </button>
                            </div>
                        </TransitionChild>

                        {/* Mobile Sidebar Content */}
                        <div className="flex grow flex-col gap-y-5 overflow-y-auto rounded-l-[40px] bg-gradient-to-r5 px-6 pb-4">
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
                            <nav className="flex flex-1 gap-4 flex-col">
                                {sidebarItems.map((item, index) => (
                                    <div key={index} className="mt-6">
                                        <Link
                                            href={item.href}
                                            className="flex flex-row gap-2 justify-around items-center p-2 rounded-lg hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                                        >
                                            <Image
                                                src={item.image}
                                                alt={`${item.label} icon`}
                                                width={75}
                                                height={item.label === "Companies" ? 48 : item.label === "Coaching Centers" ? 70 : 44}
                                                className="rounded-lg hover:opacity-80 transition-opacity duration-200"
                                            />
                                            <div className="flex font-kalam font-bold text-xl tracking-widest justify-center items-center text-white">
                                                {item.label === "Coaching Centers" ? "COACHING-C" : item.label}
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </nav>

                            {/* Logout Section */}
                            <div className="mt-6">
                                <Link
                                    href="https://example.com"
                                    className="flex flex-row gap-2 justify-around items-center p-2 rounded-lg hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    <Image
                                        src="/girl_login_2.png"
                                        alt="Logout icon"
                                        width={75}
                                        height={58}
                                        className="rounded-lg hover:opacity-80 transition-opacity duration-200"
                                    />
                                    <div className="flex font-kalam font-bold text-xl tracking-widest justify-center items-center text-white">
                                        Logout
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-[160px] lg:flex-col">
                <div className="flex w-full grow flex-col gap-y-5 overflow-y-auto rounded-l-[40px] bg-gradient-to-r1 px-6 pb-4">
                    {/* Desktop Logo Section */}
                    <div className="flex flex-col h-[100px] shrink-0 justify-between items-center">
                        <Link href={`${baseDomainUrl}/`} className="flex h-full justify-center items-center">
                            <Image
                                src={`${baseImageUrl}/jalgo_short_logo.png`}
                                alt="JALGO Logo"
                                width={75}
                                height={38}
                                className="rounded-lg hover:opacity-80 transition-opacity duration-200"
                            />
                        </Link>
                        <div className="w-full">
                            <Divider />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="flex flex-1 w-full flex-col">
                        {sidebarItems.map((item, index) => (
                            <div key={index} className={`${index > 0 ? 'pt-6' : ''} flex flex-col w-full gap-2 justify-center items-center`}>
                                <Link
                                    href={item.href}
                                    className="block w-full text-center focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-2 hover:bg-white/10 transition-all duration-200"
                                >
                                    <div className="flex justify-center items-center">
                                        <Image
                                            src={item.desktopImage || item.image}
                                            alt={`${item.label} icon`}
                                            width={75}
                                            height={item.label === "Companies" ? 54 : 44}
                                            className="rounded-lg hover:opacity-80 transition-opacity duration-200"
                                        />
                                    </div>
                                    <div className="flex font-kalam font-normal text-lg mt-2 tracking-widest justify-center items-center text-white">
                                        {item.label}
                                    </div>
                                </Link>
                                {index < sidebarItems.length - 1 && <Divider />}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:pl-[160px] min-h-screen">
                {/* Top Navigation Bar */}
                <div className="sticky top-0 z-40 flex h-[100px] shrink-0 border-b border-gray-300 items-center gap-x-4 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8">
                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon aria-hidden="true" className="size-6" />
                    </button>

                    {/* Top Navigation Menu */}
                    <div className="w-full flex justify-center py-4">
                        <div className="flex flex-wrap justify-center items-center gap-8 px-4 font-ibmm font-medium">
                            {menuItems.map(({ label, icon, href }, index) => (
                                <Link
                                    key={index}
                                    href={href}
                                    className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005b9a] focus:ring-offset-2 hover:bg-gray-100 hover:shadow-md hover:scale-105 font-ibmm
                                    ${pathname === href
                                        ? 'bg-[#e0f7fa] shadow-lg scale-105 border-b-4 border-[#00aab0] text-[#007a88]'
                                        : 'text-gray-700 hover:text-[#005b9a]'
                                    }`}
                                    aria-current={pathname === href ? 'page' : undefined}
                                >
                                    <div className={`text-2xl ${pathname === href ? 'text-[#007a88]' : 'text-[#005b9a]'}`}>
                                        {icon}
                                    </div>
                                    <span className="text-sm font-medium">{label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="h-full  w-full">
                    <div className="w-full h-full">
                        <Home_Page />
                    </div>
                </main>
            </div>
        </div>
    );
}
