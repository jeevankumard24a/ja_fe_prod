import React from "react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useDbDialogStore } from "@/stores/dashboard/db_store";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/components/dashboard/utils";
import { toast } from "react-toastify";
//import * as Sentry from "@sentry/nextjs";

const schema = z.object({
  value: z
    .string()
    .min(1, "Field cannot be empty")
    .max(100, "Max 100 characters allowed"),
});

type UserProfileUpdate = {
  field: string;
  value: string;
};

export const EditUserProfileDialog = () => {
  const { activeDialog, dialogParams, closeDialog } = useDbDialogStore();
  const isOpen = activeDialog === "edituserprofile";

  const { label, initialValue, columnName, onUpdate } = dialogParams || {}; // Add fallback

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    reset,
  } = useForm<{ value: string }>({
    resolver: zodResolver(schema),
    defaultValues: { value: initialValue || "" },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (updateData: UserProfileUpdate) => {
      const result = await updateUserProfile(updateData);
      return result;
    },
    onSuccess: (data) => {
      console.log("Update successful:", JSON.stringify(data));
      const updatedValue = data.data[columnName];
      if (onUpdate) onUpdate(updatedValue, columnName); // Check for onUpdate existence
      closeDialog();
      toast.success(`${label || "Field"} updated successfully!`, {
        className: "font-kalam",
      });
      reset({ value: updatedValue });
    },
    onError: (error: unknown) => {
      let errorMessage = "An unknown error occurred.";
      if (error instanceof Error) {
        const errorCode = (error as any).code;
        switch (errorCode) {
          case "INVALID_CREDENTIALS":
            errorMessage = "Invalid credentials.";
            break;
          default:
            errorMessage = error.message || "Error updating field.";
        }
      }

      if (process.env.NODE_ENV === "production") {
        //        Sentry.captureException(error);
      } else {
        console.log("Error Details:", error);
      }

      toast.error(errorMessage, {
        className: "font-kalam",
        autoClose: false,
        closeOnClick: true,
      });
    },
  });

  const onSubmit = (data: { value: string }) => {
    if (columnName) {
      mutation.mutate({ field: columnName, value: data.value });
    }
  };

  React.useEffect(() => {
    console.log("Dialog isOpen:", isOpen, "activeDialog:", activeDialog);
    if (isOpen && initialValue) {
      setValue("value", initialValue);
    }
  }, [isOpen, initialValue, setValue]);

  return (
    <Dialog open={isOpen} onClose={closeDialog} className="relative z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-3xl space-y-4 bg-white p-12 rounded-3xl"
        >
          <DialogTitle className="text-lg font-bold">
            Update {label || "Field"}
          </DialogTitle>
          <Description>
            Enter a new value for {label || "this field"}
          </Description>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register("value")}
              className="w-full p-2 border rounded"
              placeholder={`Enter new ${label || "value"}`}
            />
            {errors.value && (
              <p className="text-red-500">{errors.value.message}</p>
            )}
            <div className="flex gap-4">
              <button type="button" onClick={closeDialog}>
                Cancel
              </button>
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
                  "SAVE"
                )}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
