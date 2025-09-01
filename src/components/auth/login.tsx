// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { make_api_request } from "@/components/utils/make_api_req";
import { FaSpinner } from "react-icons/fa";
import Footer_W from "@/components/ui_components/footer_w";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiError from "@/components/utils/ApiError";

import { useAuthStore } from "@/stores/auth/auth-store";

// logging & correlation ids (same as your other component)
import log, { setActionId, getActionId } from "@/utils/logs";
import { newId } from "@/utils/ids";

// ---------- Types aligned to your server envelope ----------
type ApiEnvelope<T> = {
    status: "success" | "error";
    error: boolean;
    statusCode: number;
    code?: string;
    message: string;
    requestId?: string;
    actionId?: string;      // <-- include this if you log action IDs
    data: T;
};

//type User = { user_id: string; user_name: string };
//type LoginSuccess = { user: User; accessToken: string };
type LoginSuccessData = {
       user: { user_id: string; user_name: string };
    // user_id: string;
    // user_name: string
    accessToken?: string; // if your API includes it here
};
type LoginResponse = ApiEnvelope<LoginSuccessData>;
// type LoginResponse = {
//     status: "success" | "error";
//     error: boolean;
//     statusCode: number;
//     code?: string;
//     message: string;
//     requestId?: string;
//     actionId?: string;
//     data: LoginSuccess | null;
// };

const loginSchema = z.object({
    user_id: z
        .string()
        .min(3, "User ID must be at least 3 characters")
        .max(50, "User ID must be at most 50 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
export type Login_Type = z.infer<typeof loginSchema>;

// Your Next API returns cookies and (in JSON) data: { user_id, user_name }
//type LoginSuccessData = { user_id: string; user_name: string };



// ---------- API caller (for react-query) ----------
const submitLoginData = async (login_data: Login_Type): Promise<LoginResponse> => {
    const aid = getActionId();
    log.warn("login.submit.start", { actionId: aid, user_id: login_data.user_id });

    try {
        const res = await make_api_request<LoginSuccessData>("/api/auth/login/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(aid ? { "x-action-id": aid } : {}),
            },
            body: JSON.stringify(login_data),
            credentials: "include",
            // cookies are set by server; nothing else to do here
        });

        // Log the envelope (status/statusCode/code), not tokens (they come via cookies)
        log.warn("login.submit.response", {
            status: res?.status,
            statusCode: res?.statusCode,
            code: res?.code,
            requestId: res?.requestId,
            actionId: aid,
        });

        return res as LoginResponse;
    } catch (e: any) {
        if (e instanceof ApiError) {
            log.error("login.submit.error", {
                actionId: aid,
                requestId: e.requestId,
                code: (e as any).code,
                message: e.message,
            });
        } else {
            log.error("login.submit.error", { actionId: aid, message: String(e) });
        }
        throw e;
    }
};

// ---------- Component ----------
export default function Login() {
    const baseImageUrl =
        process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const setSession = useAuthStore((s) => s.setSession); // <-- get action from store

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        watch,
        setError,
        reset,
    } = useForm<Login_Type>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        defaultValues: {
            user_id: "",
            password: "",
        },
    });

    // Debug logs (dev only)
    const formValues = watch();
    useEffect(() => {
        log.debug("login.page.mount");
        if (process.env.NODE_ENV === "development") {
            log.debug("login.form.state", { user_id: formValues.user_id, isValid, errors });
        }
        return () => log.debug("login.page.unmount");
    }, [formValues.user_id, isValid, errors]);


// --- keep your mutation, but replace its content with this ---

    const mutation = useMutation<LoginResponse, ApiError, Login_Type>({
        mutationFn: submitLoginData,
        onSuccess: (res) => {
            const actionId = getActionId();

            // Narrow & validate the envelope + required fields
            const data = res?.data;
            const isOk =
                res.status === "success" &&
                !res.error &&
                res.statusCode >= 200 &&
                res.statusCode < 300 &&
                !!data &&
                !!data.user &&
                typeof data.user.user_id === "string" &&
                typeof data.user.user_name === "string" &&
                typeof data.accessToken === "string" &&
                data.accessToken.length > 0;

            if (isOk) {
                // After the guard, it's safe to treat accessToken as required
                const { user, accessToken } = data as Required<LoginSuccessData>;

                console.log("Madhuuuuuuuuuuuuuuuuu",accessToken)
                console.log("Madhuuuuuuuuuuuuuuuuu123",user)


                setSession({
                    user: { user_id: user.user_id, user_name: user.user_name },
                    accessToken,
                    actionId,
                });

                log.warn("login.success", {
                    actionId,
                    requestId: res.requestId,
                    user_id: user.user_id,
                });

                router.push(`/${encodeURIComponent(user.user_id)}`);
                return;
            }

            // Not OK → surface server message to the form
            log.warn("login.server.reported_failure", {
                actionId,
                requestId: res.requestId,
                message: res.message,
                statusCode: res.statusCode,
                code: res.code,
            });

            setError("user_id", {
                type: "manual",
                message: res.message || "Login failed. Please try again.",
            });
        },
        onError: (error) => {
            const actionId = getActionId();
            const ref = error.requestId ? ` (ref: ${error.requestId})` : "";

            log.error("login.error", {
                actionId,
                requestId: error.requestId,
                code: error.code,            // <- no "any" cast needed
                message: error.message,
            });

            const code = error.code;
            if (code === "INVALID_CREDENTIALS") {
                const msg = "User ID and Password do not match.";
                reset({ user_id: "", password: "" });
                setError("user_id", { type: "manual", message: msg });
                setError("password", { type: "manual", message: msg });
            } else if (code === "VALIDATION_ERROR") {
                const msg = "Please check your input fields.";
                setError("user_id", { type: "manual", message: msg });
                setError("password", { type: "manual", message: msg });
            } else {
                const msg = `${error.message}${ref}`;
                setError("user_id", {
                    type: "manual",
                    message: msg || "Login failed. Please try again.",
                });
            }
        },
        onSettled: () => {
            setActionId(undefined);
            setSubmitting(false);
            log.debug("login.settled");
        },
    });



    const onSubmit = (data: Login_Type) => {
        // new action id for THIS submit flow
        const actionId = newId();
        setActionId(actionId);
        log.warn("login.action.start", { actionId, user_id: data.user_id });

        setSubmitting(true);
        mutation.mutate(data);
    };

    return (
        <>
            <div className="flex w-full h-full justify-center items-center">
                <div className="w-full max-w-[1280px] h-full flex flex-col justify-center items-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl mt-6 px-2 font-semibold font-ibmm leading-tight mb-8 text-gray-900 flex justify-center items-center w-full">
                        Welcome Back to JALGO.AI
                    </div>
                    <div className="text-base sm:text-lg lg:text-xl px-2 text-gray-600 font-ibmm leading-tight mb-8 text-gray-900 flex justify-center items-center w-full">
                        Step into your smart career workspace — built for learning, networking, and getting hired.
                    </div>
                    <div className="w-full font-ibmm font-bold mx-auto p-10 rounded-[100px] lg:rounded-full mt-6 mb-12 border-2 border-gray-300">
                        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} aria-label="Login form">
                            <div className="w-5/6 max-w-[800px] mx-auto">
                                <div className="mt-6">
                                    <label htmlFor="user_id" className="block text-sm font-bold leading-6 pl-6 text-gray-900">
                                        Enter User ID:
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            {...register("user_id")}
                                            id="user_id"
                                            type="text"
                                            autoComplete="off"
                                            data-norton-idsafe-ignore="true"
                                            data-lpignore="true"
                                            data-1p-ignore
                                            data-form-type="other"
                                            placeholder="Enter User ID"
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

                                <div className="mt-6">
                                    <label htmlFor="password" className="block text-sm font-bold leading-6 pl-6 text-gray-900">
                                        Enter Password:
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            {...register("password")}
                                            id="password"
                                            type="password"
                                            autoComplete="off"
                                            data-norton-idsafe-ignore="true"
                                            data-lpignore="true"
                                            data-1p-ignore
                                            data-form-type="other"
                                            placeholder="Enter User Password"
                                            aria-describedby={errors.password ? "password-error" : undefined}
                                            className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                                                errors.password
                                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                            } focus:ring-0 focus:outline-none`}
                                        />
                                    </div>
                                    {errors.password && (
                                        <p id="password-error" className="mt-2 text-sm text-red-600 pl-6">
                                            {errors.password.message}
                                        </p>
                                    )}
                                    <div className="mt-2 text-base sm:text-sm text-gray-600 font-ibmm flex justify-end items-center w-full">
                                        <Link href="/forgot-password" className="text-[#00CED1] hover:underline">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </div>

                                <div className="mt-6 flex font-kalam text-xl justify-center mb-6 items-center gap-1">
                                    <Image src={`${baseImageUrl}/left.png`} width={26} height={50} alt="Decorative left arrow" />
                                    <button
                                        type="submit"
                                        disabled={!isValid || isSubmitting || mutation.isPending || submitting}
                                        className={`py-2 px-8 rounded-full transition duration-300 flex items-center justify-center gap-2 font-gm tracking-widest
                    ${
                                            !isValid || isSubmitting || mutation.isPending || submitting
                                                ? "bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed"
                                                : "bg-white text-gray-700 border-2 border-[#00CED1] hover:bg-[#00CED1] hover:text-white cursor-pointer"
                                        }`}
                                        aria-label="Submit login form"
                                    >
                                        {mutation.isPending || isSubmitting || submitting ? (
                                            <>
                                                <span>Submitting...</span>
                                                <FaSpinner className="animate-spin" />
                                            </>
                                        ) : (
                                            "LOGIN"
                                        )}
                                    </button>
                                    <Image src={`${baseImageUrl}/right.png`} width={26} height={50} alt="Decorative right arrow" />
                                </div>
                            </div>
                        </form>

                        <div className="mt-6 w-5/6 max-w-[800px] mx-auto bg-gray-50 rounded-3xl py-4 px-6 text-center flex flex-col justify-center items-center gap-1">
                            <p className="text-base sm:text-lg text-gray-600 font-ibmm">Don’t have an account?</p>
                            <Link href="/signup" className="text-[#00CED1] font-bold hover:underline">
                                Create your profile
                            </Link>
                            <p className="text-base sm:text-lg text-gray-600 font-ibmm">and start building your future today.</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer_W />
        </>
    );
}
