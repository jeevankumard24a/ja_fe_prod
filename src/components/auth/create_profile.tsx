// app/(your-path)/Create_Profile.tsx
"use client";

import React, { useEffect, useState } from "react";
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
import ApiError from "@/components/utils/ApiError";

// Logging + ids (paths match your code)
import log, { setActionId, getActionId } from "@/utils/logs";
import { newId } from "@/utils/ids";

// ---------------- Types ----------------
type ApiEnvelope<T> = {
    status: "success" | "error";
    error: boolean;
    statusCode: number;
    code?: string;
    message: string;
    requestId?: string;
    data: T;
};

interface UserIdCheckPayload { isUnique: boolean }
type UserIdCheckResponse = ApiEnvelope<UserIdCheckPayload>;

// IMPORTANT: match your API shape (data: { user_id })
interface RegisterPayload { user_id: string }
type RegisterResponse = ApiEnvelope<RegisterPayload>;

interface Register_Type {
    user_id: string;
    user_name: string;
    user_email: string;
}

const Register_Schema = z.object({
    user_id: z
        .string()
        .min(2, "User ID must be at least 2 characters long")
        .refine((val) => /^[a-zA-Z0-9._]+$/.test(val), {
            message: "User ID must contain only letters, numbers, dots (.) and underscores (_)",
        }),
    user_name: z.string().min(2, "User Name must be at least 2 characters long"),
    user_email: z.string().email("Please enter a valid email address"),
});

// ---------------- API callers ----------------
const Check_User_Name_Uniqueness = async (v_user_id: string) => {
    const aid = getActionId();
    log.warn("register.userid.check.start", { user_id: v_user_id, actionId: aid });

    const res = await make_api_request<UserIdCheckPayload>(
        `/api/auth/register/check-userid-unique/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(aid ? { "x-action-id": aid } : {}),
            },
            body: JSON.stringify({ user_id: v_user_id }),
        }
    );

    log.warn("register.userid.check.result", {
        user_id: v_user_id,
        isUnique: res?.data?.isUnique,
        requestId: res?.requestId,
        actionId: aid,
    });

    return res as UserIdCheckResponse;
};

const submitRegistertData = async (register_data: Register_Type) => {
    const aid = getActionId();
    log.warn("register.submit.start", { actionId: aid, user_id: register_data.user_id });

    try {
        const res = await make_api_request<RegisterPayload>(`/api/auth/register/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(aid ? { "x-action-id": aid } : {}),
            },
            body: JSON.stringify(register_data),
        });

        // Log the envelope (status/StatusCode/code), not non-existent data.success
        log.warn("register.submit.response", {
            status: res?.status,
            statusCode: res?.statusCode,
            code: res?.code,
            requestId: res?.requestId,
            actionId: aid,
        });

        return res as RegisterResponse;
    } catch (e: any) {
        if (e instanceof ApiError) {
            log.error("register.submit.error", {
                actionId: aid,
                requestId: e.requestId,
                code: (e as any).code,
                message: e.message,
            });
        } else {
            log.error("register.submit.error", { actionId: aid, message: String(e) });
        }
        throw e;
    }
};

// ---------------- Component ----------------
export default function Create_Profile() {
    const router = useRouter();
    const baseImageUrl =
        process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
        "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";
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

    useEffect(() => {
        log.debug("Create_Profile.mount");
        return () => log.debug("Create_Profile.unmount");
    }, []);

    useEffect(() => {
        if (user_id_val && !errors.user_id) {
            log.debug("register.userid.input.valid", { user_id: user_id_val });
        }
    }, [user_id_val, errors.user_id]);

    const {
        data: data_cun,
        error: error_cun,
        isError: isError_cun,
    } = useQuery<UserIdCheckResponse>({
        queryKey: ["user_id", user_id_val],
        queryFn: () => Check_User_Name_Uniqueness(user_id_val),
        enabled: !!user_id_val && !errors.user_id,
        retry: false,
    });

    const mutation = useMutation<RegisterResponse, ApiError, Register_Type>({
        mutationFn: submitRegistertData,
        onSuccess: (res, vars) => {
            const actionId = getActionId();

            // ✅ Treat envelope success as success
            const isOk = res.status === "success" && !res.error && res.statusCode >= 200 && res.statusCode < 300;

            if (isOk) {
                log.warn("register.success", {
                    actionId,
                    requestId: res.requestId,
                    user_id: res.data?.user_id,
                });
                reset();
                router.push(
                    `/accounts/login?message=${encodeURIComponent(
                        "Login-after-Register-Password-Sent-to-Your-Email"
                    )}`
                );
                toast.success("Registration successful! Please login.", {
                    className: "font-kalam",
                });
            } else {
                log.warn("register.server.reported_failure", {
                    actionId,
                    requestId: res.requestId,
                    message: res.message,
                    statusCode: res.statusCode,
                    code: res.code,
                });
                toast.error(res.message || "Registration failed.", {
                    className: "font-kalam",
                });
            }
        },
        onError: (err) => {
            const actionId = getActionId();
            const msg = `${err.message}${
                err.requestId ? ` (ref: ${err.requestId})` : ""
            }`;
            log.error("register.error", {
                actionId,
                requestId: err.requestId,
                code: (err as any).code,
                message: err.message,
            });
            toast.error(msg, { className: "font-kalam" });
            if (process.env.NODE_ENV !== "production") {
                console.error("Registration error:", err);
            }
        },
        onSettled: () => {
            setActionId(undefined);
            log.debug("register.settled");
        },
    });

    const onSubmit = async (data: Register_Type) => {
        if (!isValid) return;

        // New action id for THIS submit flow
        const actionId = newId();
        setActionId(actionId);
        log.warn("register.action.start", { actionId, user_id: data.user_id });

        setIsChecking(true);
        try {
            await trigger();

            if (isError_cun) {
                const msg =
                    error_cun instanceof ApiError
                        ? `${error_cun.message}${
                            error_cun.requestId ? ` (ref: ${error_cun.requestId})` : ""
                        }`
                        : "Error checking User ID. Please try again or contact support.";
                log.error("register.userid.check.error", {
                    actionId,
                    requestId:
                        error_cun instanceof ApiError ? error_cun.requestId : undefined,
                    message: String((error_cun as any)?.message || error_cun),
                });
                setError("user_id", { type: "manual", message: msg });
                toast.error(msg, { className: "font-kalam" });
                return;
            }

            const isUnique = data_cun?.data?.isUnique;

            if (isUnique === true) {
                log.warn("register.userid.unique", { actionId, user_id: data.user_id });
            } else if (isUnique === false) {
                log.warn("register.userid.taken", { actionId, user_id: data.user_id });
                setError("user_id", {
                    type: "manual",
                    message: "User ID already exists. Please choose another ID.",
                });
                toast.error("User ID already exists.", { className: "font-kalam" });
                return;
            } else {
                log.warn("register.userid.unknown_state", {
                    actionId,
                    user_id: data.user_id,
                    isUnique,
                });
                setError("user_id", {
                    type: "manual",
                    message: "Please check your network or contact support.",
                });
                toast.error("Please check your network or contact support.", {
                    className: "font-kalam",
                });
                return;
            }

            mutation.mutate(data);
        } catch (err: any) {
            log.error("register.flow.error", {
                actionId,
                message: err?.message || String(err),
                ...(err instanceof ApiError
                    ? { requestId: err.requestId, code: (err as any).code }
                    : {}),
            });
            const msg =
                err instanceof ApiError
                    ? `${err.message}${err.requestId ? ` (ref: ${err.requestId})` : ""}`
                    : "Error checking User ID. Please try again.";
            toast.error(msg, { className: "font-kalam" });
            if (process.env.NODE_ENV !== "production") {
                console.error("Uniqueness check error:", err);
            }
        } finally {
            setIsChecking(false);
            log.debug("register.flow.finished", { actionId });
            // actionId cleared in onSettled()
        }
    };

    // Example dev log (safe to remove)
    useEffect(() => {
        log.info(
            "Create_Profile.dev.banner",
            { note: "Component loaded in dev" }
        );
    }, []);

    // ---------------- UI ----------------
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
                    <span className="bg-gradient-to-r pl-4 from-[#00aab0] to-[#007a88] bg-clip-text text-transparent">
            Login
          </span>
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
