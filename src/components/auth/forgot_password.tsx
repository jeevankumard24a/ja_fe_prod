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

export type ForgotPassword_Type = {
  jalgo_email: string;
};

const submitForgotPasswordData = async (data: ForgotPassword_Type): Promise<any> => {
  return make_api_request("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.jalgo_email,
    }),
  });
};

export default function ForgotPassword() {
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
  } = useForm<ForgotPassword_Type>({
    mode: "onChange",
    defaultValues: {
      jalgo_email: "",
    },
  });

  // Debug form state
  const formValues = watch();
  useEffect(() => {
    console.log("Form Values:", formValues);
    console.log("isValid:", isValid);
    console.log("Errors:", errors);
  }, [formValues, isValid, errors]);

  const onSubmit = (data: ForgotPassword_Type) => {
    console.log("Form Submitted:", data);
    mutation.mutate(data);
  };

  const mutation = useMutation({
    mutationFn: submitForgotPasswordData,
    onSuccess: (data) => {
      console.log("Password reset link sent:", data);
      alert("A password reset link has been sent to your email.");
      router.push("/login");
    },
    onError: (error) => {
      console.error("Failed to send reset link:", error);
      alert("Failed to send reset link. Please try again or contact support.");
    },
  });

  return (
      <>
        <div className={`w-full h-full flex-col justify-center items-center`}>
          <div className="text-2xl sm:text-3xl lg:text-4xl mt-6 px-2 font-semibold font-ibmm font-bold leading-tight mb-8 text-gray-900 flex justify-center items-center w-full">
            Forgot Your Password?
          </div>
          <div className="text-base sm:text-lg lg:text-xl px-2 text-gray-600 font-ibmm leading-tight mb-8 text-gray-900 flex justify-center items-center w-full">
            No worries — we’ve got your back.
          </div>
          <div className={`w-full font-ibmm font-bold mx-auto p-10 rounded-[100px] lg:rounded-full mt-6 mb-12 border-2 border-gray-300`}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
              <div className={`w-5/6 max-w-[800px] mx-auto`}>
                <div className={`mt-6`}>
                  <label htmlFor="jalgo_email" className="block text-sm font-bold leading-6 pl-6 text-gray-900">
                    📩 Email Address
                  </label>
                  <div className="mt-2">
                    <input
                        {...register("jalgo_email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Enter a valid email address",
                          },
                        })}
                        id="jalgo_email"
                        type="email"
                        autoComplete="off"
                        data-norton-idsafe-ignore="true"
                        data-lpignore="true"
                        data-1p-ignore
                        data-form-type="other"
                        placeholder="Enter the email address linked to your JALGO profile"
                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                            errors.jalgo_email
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } focus:ring-0 focus:outline-none`}
                    />
                  </div>
                  {errors.jalgo_email && (
                      <p className="mt-2 text-sm text-red-600 pl-6">{errors.jalgo_email.message}</p>
                  )}
                  <div className="mt-2 text-base sm:text-sm text-gray-600 font-ibmm flex justify-end items-center w-full">
                    <Link href="/login" className="text-[#00CED1] hover:underline">
                      Remembered your password? Log In instead.
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
                        "🔘 Send Reset Link"
                    )}
                  </button>
                  <Image src={`${baseImageUrl}/right.png`} width={26} height={50} alt="logo" />
                </div>
              </div>
            </form>
            <div className="mt-6 w-5/6 max-w-[800px] mx-auto bg-gray-50 rounded-3xl py-4 px-6 text-center flex flex-col justify-center items-center gap-1">
              <p className="text-base sm:text-lg text-gray-600 font-ibmm">
                Need help?
              </p>
              <Link href="mailto:support@jalgo.ai" className="text-[#00CED1] font-bold hover:underline">
                Contact us at support@jalgo.ai
              </Link>
            </div>
          </div>
        </div>
        <Footer_W />
      </>
  );
}