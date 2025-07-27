"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

//import { Submit_Register_Data } from "@/actions/auth/submit_register";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FaSpinner } from "react-icons/fa";
import Footer_W from "@/components/ui_components/footer_w";
import { z } from "zod";
import {make_api_request} from "@/components/utils/make_api_req";

type Register_Type = {
    user_id: string;
    user_name: string;
    user_email: string;
    // phone_number: string;
    // country_code: string;
};

const Register_Schema = z.object({
    user_id: z
        .string()
        .min(2, "user_id must be at least 2 characters long")
        .refine((value) => /^[a-zA-Z0-9._]+$/.test(value), {
            message:
                "user_id must contain only alphabets, numbers, dots (.), and underscores (_), with no spaces",
        }),
    user_name: z.string().min(2, "UserName must be at least 2 characters long"),
    user_email: z.string().email("Please enter a valid email address"),
});

const Check_User_Name_Uniqueness = async (
    v_user_id: string,
): Promise<any> => {
    return make_api_request(`/api/auth/register/check-userid-unique/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: v_user_id }),
    });
};

const submitRegistertData = async (
    register_data: Register_Type,
): Promise<any> => {
    return make_api_request(`/api/auth/register/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(register_data),
    });
};


export default function Create_Profile() {
    const router = useRouter();

    const baseImageUrl =
        process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
        "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";

    const [isClient, setIsClient] = useState(false);
    const [isChecking, setIsChecking] = useState(false);



    const {
        register,
        handleSubmit,
        setError,
        watch,
        clearErrors,
        trigger,
        reset,
        setValue,
        formState: { isSubmitting, errors, touchedFields, isValid },
    } = useForm<Register_Type>({
        resolver: zodResolver(Register_Schema),
        mode: "onChange",
        //mode: "onBlur",
        defaultValues: {},
    });

    const user_id_val = watch("user_id");

    const {
        refetch: refetch_cun,
        data: data_cun,
        isError: isError_cun,
        error: error_cun,
        isLoading: isLoading_cun,
        isFetching: isFetching_cun,
        isSuccess: isSuccess_cun,
    } = useQuery({
        queryKey: ["user_id", user_id_val],
        queryFn: () => Check_User_Name_Uniqueness(user_id_val),
        enabled: false,
        retry: false,
    });

    const mutation = useMutation({
        mutationFn: async (register_data: Register_Type) => {
            const result = await submitRegistertData(register_data);
            console.log(JSON.stringify(result));
            return result; // Access `data` in the success branch
        },
        onSuccess: (data) => {
            console.log("Registration successfully:", data);
            reset();

            const message = encodeURIComponent(
                "Login-after-Register-Password-Sent-to-Your-Email",
            );
            router.push(`/login?message=${message}`);

            toast.success("Registration successfully!", {
                className: "font-kalam",
            });
            // queryClient.invalidateQueries(["tags"]);
        },
        onError: (error: unknown) => {
            reset();
            if (process.env.NODE_ENV === "production") {
                //Sentry.captureException(error);
                toast.error(
                    "Something went wrong,  contact support or refresh page and try again.",
                    { className: "font-kalam" },
                );
            } else {
                console.log(error);
                toast.error("Error in Registering Data", {
                    className: "font-kalam",
                });
            }
        },
    });


    const onSubmit = async (data: Register_Type) => {
        await trigger();

        if (!isValid) {
            return;
        }

        setIsChecking(true);

        console.log("Register_Typeeeeeeeeee", JSON.stringify(data));

        try {
            const data_cun = await refetch_cun(); // Extract `data` from refetch result

            console.log(" Checking  Data Cunnnnn", JSON.stringify(data_cun));
            //

            if (data_cun.isError) {
                reset();
                toast.error(
                    "Error checking UserId exists. Refresh Page and try Again or contact Customer Support.",
                    {
                        className: "font-kalam",
                    },
                );
                setError("user_id", {
                    type: "manual",
                    message:
                        "Error checking UserId exists. Refresh Page and try Again or contact Customer Support.",
                });
                setIsChecking(false);
                return;
            } else if (!data_cun.data.data.isUnique) {
                // reset();
                toast.error(" UserId already  exists. Please choose another ID.", {
                    className: "font-kalam",
                });
                setError("user_id", {
                    type: "manual",
                    message: "UserId already  exists. Please choose another ID.",
                });
            } else {
                mutation.mutate(data);
            }
        } catch (error) {
            if (process.env.NEXT_PUBLIC_APP_ENV === "production") {

            }

            setIsChecking(false);
            return;
        } finally {
            setIsChecking(false); // Reset the loading state
        }
    };

    return (
        <>
            <div className="sm:mx-auto sm:w-full sm:max-w-11/12 mt-6 font-ibmm flex flex-col ">
                <div className=" flex items-center flex-col font-ibmm justify-center">
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

                <div className=" flex items-center justify-center font-ibmm` font-bold my-6 ">
                 Already Signed Up, then
                    <span className="bg-gradient-to-r pl-4 from-[#00aab0] to-[#007a88] bg-clip-text text-transparent">Login
                    </span>
                </div>



                <div className=" flex items-center justify-center font-ibmm` font-bold italic ">
                    Upon Successful SignUp, the Password will be sent to your
                    Registered Email
                </div>
                <div
                    className={`w-full   mx-auto p-10 rounded-[100px] lg:rounded-full mt-6 mb-24 border-2 border-gray-300`}
                >
                    <form
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                        method="POST"
                    >
                        <div
                            className={`w-5/6 max-w-[800px] font-ibmm  font-bold  mx-auto`}
                        >
                            <div className={`mt-6  font-rm  `}>
                                <label
                                    htmlFor="user_id"
                                    className="block text-sm font-bold  leading-6 pl-6 text-gray-900 "
                                >
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
                                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                                            errors.user_id
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        } focus:ring-0 focus:outline-none`}
                                    />
                                </div>
                                {errors.user_id && (
                                    <p className="mt-2 text-sm text-red-600 pl-6">
                                        {errors.user_id.message}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 font-rm  ">
                                <label
                                    htmlFor="user_name"
                                    className="block text-sm font-bold  leading-6 pl-6 text-gray-900"
                                >
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
                                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                                            errors.user_name
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        } focus:ring-0 focus:outline-none`}
                                    />
                                </div>
                                {errors.user_name && (
                                    <p className="mt-2 text-sm text-red-600 pl-6">
                                        {errors.user_name.message}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 font-rm  ">
                                <label
                                    htmlFor="user_email"
                                    className="block text-sm font-bold  leading-6 pl-6 text-gray-900"
                                >
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
                                        className={`block w-full rounded-3xl border h-12 text-gray-900 shadow-sm px-4 sm:text-sm sm:leading-6 ${
                                            errors.user_email
                                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        } focus:ring-0 focus:outline-none`}
                                    />
                                </div>
                                {errors.user_email && (
                                    <p className="mt-2 text-sm text-red-600 pl-6">
                                        {errors.user_email.message}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 flex font-kalam  text-xl justify-center mb-6 items-center gap-1">
                                {/* Left Image */}
                                <Image
                                    src="/left.png"
                                    width={26}
                                    height={50}
                                    alt="logo"
                                />

                                {/* Button */}
                                <button
                                    type="submit"
                                    disabled={!isValid || isSubmitting || mutation.isPending}
                                    className={`py-2 px-8 rounded-full transition duration-300 flex items-center justify-center gap-2 font-gm tracking-widest
    ${
                                        !isValid || isSubmitting || mutation.isPending
                                            ? "bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed"
                                            : "bg-white text-gray-700 border-2 border-[#00CED1] hover:bg-[#00CED1] hover:text-white cursor-pointer"
                                    }
  `}
                                >
                                    {mutation.isPending || isSubmitting ? (
                                        <>
                                            <span>Submitting...</span>
                                            <FaSpinner className="animate-spin" />
                                        </>
                                    ) : (
                                        "REGISTER"
                                    )}
                                </button>

                                {/* Right Image */}
                                <Image
                                    src="/right.png"
                                    width={26}
                                    height={50}
                                    alt="logo"
                                />
                            </div>
                        </div>
                    </form>
                </div>


            </div>
            <Footer_W />
        </>
    );

}
