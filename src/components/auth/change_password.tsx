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

export type ChangePassword_Type = {
  jalgo_new_password: string;
  jalgo_confirm_password: string;
};

const submitChangePasswordData = async (data: ChangePassword_Type & { token: string }): Promise<any> => {
  return make_api_request("/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      new_password: data.jalgo_new_password,
      token: data.token,
    }),
  });
};

export default function ChangePassword() {
  const baseImageUrl =
      process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
      "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm<ChangePassword_Type>({
    mode: "onChange",
    defaultValues: {
      jalgo_new_password: "",
      jalgo_confirm_password: "",
    },
  });

  // Debug form state
  const formValues = watch();
  useEffect(() => {
    console.log("Form Values:", formValues);
    console.log("isValid:", isValid);
    console.log("Errors:", errors);
    console.log("Token:", token);
  }, [formValues, isValid, errors, token]);

  const onSubmit = (data: ChangePassword_Type) => {
    if (data.jalgo_new_password !== data.jalgo_confirm_password) {
      alert("Passwords do not match");
      return;
    }
    console.log("Form Submitted:", data);
    mutation.mutate({ ...data, token });
  };

  const mutation = useMutation({
    mutationFn: submitChangePasswordData,
    onSuccess: (data) => {
      console.log("Password updated successfully:", data);
      alert("Your password has been updated successfully.");
      router.push("/login");
    },
    onError: (error) => {
      console.error("Failed to update password:", error);
      alert("Failed to update password. Please try again or contact support.");
    },
  });

  return (
      <>
        <div className={`w-full h-full font-ibmm flex-col justify-center items-center`}>
          <div className="text-2xl sm:text-3xl lg:text-4xl mt-6 px-2 font-semibold font-ibmm font-bold leading-tight mb-8 text-gray-900 flex justify-center items-center w-full">
            🔐 Change Your Password
          </div>
          <div className="text-base sm:text-lg lg:text-xl px-2 text-gray-600 font-ibmm leading-tight mb-8 text-gray-900 flex justify-center items-center w-full">
            Time for a reset? Enter your new password below to secure your JALGO profile.
          </div>
          <div className={`w-full font-ibmm font-bold mx-auto p-10 rounded-[100px] lg:rounded-full mt-6 mb-12 border-2 border-gray-300`}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
              <div className={`w-5/6 max-w-[800px] mx-auto`}>
                <div className={`mt-6`}>
                  <label htmlFor="jalgo_new_password" className="block text-sm font-bold leading-6 pl-6 text-gray-900">
                    🔑 New Password
                  </label>
                  <div className="mt-2">
                    <input
                        {...register("jalgo_new_password", {
                          required: "New password is required",
                          minLength: { value: 8, message: "Password must be at least 8 characters" },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message: "Password must include uppercase, lowercase, number, and symbol",
                          },
                        })}
                        id="jalgo_new_password"
                        type="password"
                        autoComplete="new-password"
                        data-norton-idsafe-ignore="true"
                        data-lpignore="true"
                        data-1p-ignore
                        data-form-type="other"
                        placeholder="Enter new password"
                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                            errors.jalgo_new_password
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } focus:ring-0 focus:outline-none`}
                    />
                  </div>
                  {errors.jalgo_new_password && (
                      <p className="mt-2 text-sm text-red-600 pl-6">{errors.jalgo_new_password.message}</p>
                  )}
                </div>

                <div className="mt-6">
                  <label htmlFor="jalgo_confirm_password" className="block text-sm font-bold leading-6 pl-6 text-gray-900">
                    🔁 Confirm New Password
                  </label>
                  <div className="mt-2">
                    <input
                        {...register("jalgo_confirm_password", {
                          required: "Please confirm your password",
                          minLength: { value: 8, message: "Password must be at least 8 characters" },
                        })}
                        id="jalgo_confirm_password"
                        name="jalgo_confirm_password"
                        type="password"
                        autoComplete="new-password"
                        data-norton-idsafe-ignore="true"
                        data-lpignore="true"
                        data-1p-ignore
                        data-form-type="other"
                        placeholder="Confirm new password"
                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                            errors.jalgo_confirm_password
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } focus:ring-0 focus:outline-none`}
                    />
                  </div>
                  {errors.jalgo_confirm_password && (
                      <p className="mt-2 text-sm text-red-600 pl-6">{errors.jalgo_confirm_password.message}</p>
                  )}
                  <div className="mt-2 text-base sm:text-sm text-gray-600 font-ibmm flex justify-end items-center w-full">
                    <Link href="/login" className="text-[#00CED1] hover:underline">
                      Done updating? 👉 Back to Login
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
                        "🔘 Update Password"
                    )}
                  </button>
                  <Image src={`${baseImageUrl}/right.png`} width={26} height={50} alt="logo" />
                </div>
              </div>
            </form>
            <div className="mt-6 w-5/6 max-w-[800px] mx-auto bg-gray-50 rounded-3xl py-4 px-6 text-center flex flex-col justify-center items-center gap-2">
              <p className="text-base sm:text-lg text-gray-600 font-ibmm font-medium">✅ Tips for a strong password:</p>
              <ul className="text-base sm:text-lg text-gray-600 font-ibmm font-normal list-disc list-inside">
                <li>At least 8 characters</li>
                <li>Use uppercase, lowercase, numbers, and symbols</li>
                <li>Avoid common words or personal info</li>
              </ul>
            </div>
          </div>
        </div>
        <Footer_W />
      </>
  );
}