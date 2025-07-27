"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FaSpinner } from "react-icons/fa";
import Footer_W from "@/components/ui_components/footer_w";
import { z } from "zod";
import { make_api_request } from "@/components/utils/make_api_req";

interface Register_Type {
    user_id: string;
    user_name: string;
    user_email: string;
}

interface UserIdCheckResponse {
    data: { isUnique: boolean };
}

interface RegisterResponse {
    data: { success: boolean; message?: string };
}

const Register_Schema = z.object({
    user_id: z
        .string()
        .min(2, "User ID must be at least 2 characters long")
        .refine((value) => /^[a-zA-Z0-9._]+$/.test(value), {
            message: "User ID must contain only alphabets, numbers, dots (.), and underscores (_), with no spaces",
        }),
    user_name: z.string().min(2, "User Name must be at least 2 characters long"),
    user_email: z.string().email("Please enter a valid email address"),
});

const Check_User_Name_Uniqueness = async (v_user_id: string): Promise<UserIdCheckResponse> => {
    return make_api_request(`/api/auth/register/check-userid-unique/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: v_user_id }),
    });
};

const submitRegistertData = async (register_data: Register_Type): Promise<RegisterResponse> => {
    return make_api_request(`/api/auth/register/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(register_data),
    });
};

export default function Create_Profile() {
    const router = useRouter();
    const baseImageUrl =
        process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";
    const [isChecking, setIsChecking] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        watch,
        trigger,
        reset,
        formState: { isSubmitting, errors, isValid },
    } = useForm<Register_Type>({
        resolver: zodResolver(Register_Schema),
        mode: "onChange",
        defaultValues: {},
    });

    const user_id_val = watch("user_id");

    const {
        data: data_cun,
        isError: isError_cun,
        isFetching: isFetching_cun,
    } = useQuery({
        queryKey: ["user_id", user_id_val],
        queryFn: () => Check_User_Name_Uniqueness(user_id_val),
        enabled: !!user_id_val && !errors.user_id, // Only run when user_id is valid
        retry: false,
    });

    const mutation = useMutation({
        mutationFn: submitRegistertData,
        onSuccess: (data) => {
            reset();
            router.push(`/login?message=${encodeURIComponent("Login-after-Register-Password-Sent-to-Your-Email")}`);
            toast.success("Registration successful!", { className: "font-kalam" });
        },
        onError: (error: unknown) => {
            toast.error("Error registering. Please try again or contact support.", {
                className: "font-kalam",
            });
            if (process.env.NODE_ENV !== "production") {
                console.error("Registration error:", error);
            }
        },
    });

    const onSubmit = async (data: Register_Type) => {
        if (!isValid) return;

        setIsChecking(true);
        try {
            await trigger(); // Ensure validation is up-to-date
            if (isError_cun) {
                setError("user_id", {
                    type: "manual",
                    message: "Error checking User ID. Please try again or contact support.",
                });
                toast.error("Error checking User ID. Please try again.", { className: "font-kalam" });
                return;
            }
            if (!data_cun?.data.isUnique) {
                setError("user_id", {
                    type: "manual",
                    message: "User ID already exists. Please choose another ID.",
                });
                toast.error("User ID already exists.", { className: "font-kalam" });
                return;
            }
            mutation.mutate(data);
        } catch (error) {
            toast.error("Error checking User ID. Please try again.", { className: "font-kalam" });
            if (process.env.NODE_ENV !== "production") {
                console.error("Uniqueness check error:", error);
            }
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <>
            <div className="sm:mx-auto sm:w-full sm:max-w-5/6 mt-6 font-ibmm flex flex-col">
                <div className="flex items-center flex-col font-ibmm justify-center">
                    <div className="text-2xl md:text-4xl lg:text-6xl font-ibmm font-bold leading-tight mb-8 text-gray-900">
                        SignUp Form
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-ibmm font-bold leading-tight mb-8 text-gray-900">
                        Sign up to Learn, Network, and
                        <span className="bg-gradient-to-r pl-8 from-[#00aab0] to-[#007a88] bg-clip-text text-transparent">
                        Get Hired
                            </span>
                    </h1>
                </div>

                <div className="flex items-center justify-center font-ibmm font-bold my-6">
                    Already Signed Up, then
                    <span className="bg-gradient-to-r pl-4 from-[#00aab0] to-[#007a88] bg-clip-text text-transparent">Login</span>
                </div>

                <div className="flex items-center justify-center font-ibmm font-bold italic">
                    Upon Successful SignUp, the Password will be sent to your Registered Email
                </div>
                <div className="w-full mx-auto p-10 rounded-[100px] xl:rounded-full mt-6 mb-24 border-2 border-gray-300">
                    <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} method="POST">
                        <div className="w-5/6 max-w-[800px] font-ibmm font-bold mx-auto">
                            <div className="mt-6 font-rm">
                                <label htmlFor="user_id" className="block text-sm font-bold leading-6 pl-6 text-gray-900">
                                    Choose User ID :
                                </label>
                                <div className="mt-2">
                                    <input
                                        {...register("user_id")}
                                        id="user_id"
                                        type="text"
                                        autoComplete="off"
                                        readOnly
                                        onFocus={(e) => e.target.removeAttribute("readonly")}
                                        placeholder="Choose User ID"
                                        aria-label="Choose User ID"
                                        aria-describedby={errors.user_id ? "user_id-error" : undefined}
                                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                                            errors.user_id
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        } focus:ring-0 focus:outline-none`}
                                    />
                                </div>
                                {errors.user_id && (
                                    <p id="user_id-error" className="mt-2 text-sm text-red-600 pl-6">
                                        {errors.user_id.message}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 font-rm">
                                <label htmlFor="user_name" className="block text-sm font-bold leading-6 pl-6 text-gray-900">
                                    User Full Name :
                                </label>
                                <div className="mt-2">
                                    <input
                                        {...register("user_name")}
                                        id="user_name"
                                        name="user_name"
                                        autoComplete="off"
                                        type="text"
                                        placeholder="Enter User Full Name"
                                        readOnly
                                        onFocus={(e) => e.target.removeAttribute("readonly")}
                                        aria-label="User Full Name"
                                        aria-describedby={errors.user_name ? "user_name-error" : undefined}
                                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                                            errors.user_name
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        } focus:ring-0 focus:outline-none`}
                                    />
                                </div>
                                {errors.user_name && (
                                    <p id="user_name-error" className="mt-2 text-sm text-red-600 pl-6">
                                        {errors.user_name.message}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 font-rm">
                                <label htmlFor="user_email" className="block text-sm font-bold leading-6 pl-6 text-gray-900">
                                    User Email :
                                </label>
                                <div className="mt-2">
                                    <input
                                        {...register("user_email")}
                                        id="user_email"
                                        name="user_email"
                                        autoComplete="off"
                                        type="email"
                                        placeholder="Enter User Email"
                                        readOnly
                                        onFocus={(e) => e.target.removeAttribute("readonly")}
                                        aria-label="User Email"
                                        aria-describedby={errors.user_email ? "user_email-error" : undefined}
                                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                                            errors.user_email
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        } focus:ring-0 focus:outline-none`}
                                    />
                                </div>
                                {errors.user_email && (
                                    <p id="user_email-error" className="mt-2 text-sm text-red-600 pl-6">
                                        {errors.user_email.message}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 flex font-kalam text-xl justify-center mb-6 items-center gap-1">
                                <Image src={`${baseImageUrl}/left.png`} width={26} height={50} alt="Left arrow icon" />
                                <button
                                    type="submit"
                                    disabled={!isValid || isSubmitting || mutation.isPending || isChecking}
                                    className={`py-2 px-8 rounded-full transition duration-300 flex items-center justify-center gap-2 font-gm tracking-widest ${
                                        !isValid || isSubmitting || mutation.isPending || isChecking
                                            ? "bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed"
                                            : "bg-white text-gray-700 border-2 border-[#00CED1] hover:bg-[#00CED1] hover:text-white cursor-pointer"
                                    }`}
                                >
                                    {mutation.isPending || isSubmitting || isChecking ? (
                                        <>
                                            <span>{isChecking ? "Checking User ID..." : "Submitting..."}</span>
                                            <FaSpinner className="animate-spin" />
                                        </>
                                    ) : (
                                        "REGISTER"
                                    )}
                                </button>
                                <Image src={`${baseImageUrl}/right.png`} width={26} height={50} alt="Right arrow icon" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <Footer_W />
        </>
    );
}