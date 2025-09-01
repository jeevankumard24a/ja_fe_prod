
'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { make_api_request } from "@/components/utils/make_api_req";
import { FaSpinner } from "react-icons/fa";
import Footer_W from "@/components/ui_components/footer_w";
import Link from "next/link";
import React, { useEffect } from "react";

export type Login_Type = {
    jalgo_login_user_id: string;
    jalgo_login_user_password: string;
};

const submitLoginData = async (login_data: Login_Type): Promise<any> => {
    return make_api_request("/api/auth/login/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: login_data.jalgo_login_user_id,
            user_password: login_data.jalgo_login_user_password,
        }),
    });
};

export default function Login() {
    const baseImageUrl =
        process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
        "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";

    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        watch,
    } = useForm<Login_Type>({
        mode: "onChange", // Validate on change for immediate feedback
        defaultValues: {
            jalgo_login_user_id: "",
            jalgo_login_user_password: "",
        },
    });

    // Debug form state
    const formValues = watch(); // Watch all form values
    useEffect(() => {
        console.log("Form Values:", formValues);
        console.log("isValid:", isValid);
        console.log("Errors:", errors);
    }, [formValues, isValid, errors]);

    const onSubmit = (data: Login_Type) => {
        console.log("Form Submitted:", data);
        mutation.mutate(data);
    };

    const mutation = useMutation({
        mutationFn: submitLoginData,
        onSuccess: (data) => {
            console.log("Login successful:", data);
            router.push("/dashboard");
        },
        onError: (error) => {
            console.error("Login failed:", error);
            alert("Login failed. Please check your credentials and try again.");
        },
    });

    return (
        <>
            <div className={`flex w-full h-full  flex   justify-center items-center `}>
            <div className={`w-full max-w-[1280px]   h-full flex  flex-col justify-center items-center`}>
                <div className="text-2xl sm:text-3xl lg:text-4xl mt-6 px-2 font-semibold font-ibmm font-bold leading-tight mb-8 text-gray-900 flex justify-center items-center w-full">
                    Welcome Back to JALGO.AI
                </div>
                <div className="text-base sm:text-lg lg:text-xl px-2 text-gray-600 font-ibmm leading-tight mb-8 text-gray-900 flex justify-center items-center w-full">
                    Step into your smart career workspace — built for learning, networking, and getting hired.
                </div>
                <div className={`w-full font-ibmm font-bold mx-auto p-10 rounded-[100px] lg:rounded-full mt-6 mb-12 border-2 border-gray-300`}>
                    <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                        <div className={`w-5/6 max-w-[800px] mx-auto`}>
                            <div className={`mt-6`}>
                                <label htmlFor="jalgo_login_user_id" className="block text-sm font-bold leading-6 pl-6 text-gray-900">
                                    Enter User ID :
                                </label>
                                <div className="mt-2">
                                    <input
                                        {...register("jalgo_login_user_id", {
                                            required: "User ID is required",
                                            minLength: { value: 3, message: "User ID must be at least 3 characters" },
                                        })}
                                        id="jalgo_login_user_id"
                                        type="text"
                                        autoComplete="off"
                                        data-norton-idsafe-ignore="true"
                                        data-lpignore="true"
                                        data-1p-ignore
                                        data-form-type="other"
                                        placeholder="Enter User ID"
                                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                                            errors.jalgo_login_user_id
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        } focus:ring-0 focus:outline-none`}
                                    />
                                </div>
                                {errors.jalgo_login_user_id && (
                                    <p className="mt-2 text-sm text-red-600 pl-6">{errors.jalgo_login_user_id.message}</p>
                                )}
                            </div>

                            <div className="mt-6">
                                <label htmlFor="jalgo_login_user_password" className="block text-sm font-bold leading-6 pl-6 text-gray-900">
                                    Enter Password:
                                </label>
                                <div className="mt-2">
                                    <input
                                        {...register("jalgo_login_user_password", {
                                            required: "Password is required",
                                            minLength: { value: 6, message: "Password must be at least 6 characters" },
                                        })}
                                        id="jalgo_login_user_password"
                                        name="jalgo_login_user_password"
                                        type="password"
                                        autoComplete="off"
                                        data-norton-idsafe-ignore="true"
                                        data-lpignore="true"
                                        data-1p-ignore
                                        data-form-type="other"
                                        placeholder="Enter User Password"
                                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                                            errors.jalgo_login_user_password
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        } focus:ring-0 focus:outline-none`}
                                    />
                                </div>
                                {errors.jalgo_login_user_password && (
                                    <p className="mt-2 text-sm text-red-600 pl-6">{errors.jalgo_login_user_password.message}</p>
                                )}
                                <div className="mt-2 text-base sm:text-sm text-gray-600 font-ibmm flex justify-end items-center w-full">
                                    <Link href="/forgot-password" className="text-[#00CED1] hover:underline">
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-6 flex font-kalam text-xl justify-center mb-6 items-center gap-1">
                                <Image src={`${baseImageUrl}/left.png`} width={26} height={50} alt="logo" />
                                <button
                                    type="submit"
                                    disabled={!isValid || isSubmitting || mutation.isPending}
                                    className={`py-2 px-8 rounded-full transition duration-300 flex items-center justify-center gap-2 font-gm tracking-widest
                    ${
                                        !isValid || isSubmitting || mutation.isPending
                                            ? "bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed"
                                            : "bg-white text-gray-700 border-2 border-[#00CED1] hover:bg-[#00CED1] hover:text-white cursor-pointer"
                                    }`}
                                >
                                    {mutation.isPending || isSubmitting ? (
                                        <>
                                            <span>Submitting...</span>
                                            <FaSpinner className="animate-spin" />
                                        </>
                                    ) : (
                                        "LOGIN"
                                    )}
                                </button>
                                <Image src={`${baseImageUrl}/right.png`} width={26} height={50} alt="logo" />
                            </div>
                        </div>
                    </form>
                    <div className="mt-6 w-5/6 max-w-[800px] mx-auto bg-gray-50 rounded-3xl py-4 px-6 text-center flex flex-col justify-center items-center gap-1">
                        <p className="text-base sm:text-lg text-gray-600 font-ibmm">
                            Don’t have an account?
                        </p>
                        <Link href="/signup" className="text-[#00CED1] font-bold hover:underline">
                            Create your profile
                        </Link>
                        <p className="text-base sm:text-lg text-gray-600 font-ibmm">
                            and start building your future today.
                        </p>
                    </div>
                </div>
            </div>
            </div>
            <Footer_W />
        </>
    );
}