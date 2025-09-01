"use client";

import React, { useState, useCallback } from "react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useDbDialogStore } from "@/stores/dashboard/db_store";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Cropper, { Area } from "react-easy-crop";
import * as Slider from "@radix-ui/react-slider";
import { toast } from "react-toastify";
import { uploadProfilePic } from "@/components/dashboard/utils";
import { compressFile } from "@/utils/imageCompression_2";

// Zod schema & type
const fileSchema = z.custom<File>(
  (file) =>
    file instanceof File &&
    file.size > 0 &&
    file.size <= 5 * 1024 * 1024 && // 5MB limit
    ["image/jpeg", "image/png"].includes(file.type),
  { message: "Upload a JPG or PNG image under 5MB." }, // Updated message
);

const formSchema = z.object({
  image: fileSchema.optional(), // Allow undefined initially
});

type T = z.infer<typeof formSchema>;

interface UploadResponse {
  url: string;
}

interface DialogParams {
  onUpdate?: (url: string, field: string) => void;
}

export const UploadDpDialog = () => {
  const [fileName, setFileName] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const { activeDialog, dialogParams, closeDialog } = useDbDialogStore();
  const isOpen = activeDialog === "dpchange";
  const { onUpdate } = (dialogParams as DialogParams) || {};

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<T>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      image: undefined, // Explicitly set to undefined
    },
  });

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedArea(croppedAreaPixels);
    },
    [],
  );

  const createCroppedImage = async (): Promise<Blob | null> => {
    if (!imageSrc || !croppedArea) return null;

    const canvas = document.createElement("canvas");
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve) => {
      image.onload = () => {
        const ctx = canvas.getContext("2d");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = croppedArea.width;
        canvas.height = croppedArea.height;

        if (ctx) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);

          ctx.drawImage(
            image,
            croppedArea.x * scaleX,
            croppedArea.y * scaleY,
            croppedArea.width * scaleX,
            croppedArea.height * scaleY,
            0,
            0,
            croppedArea.width,
            croppedArea.height,
          );
        }

        canvas.toBlob((blob) => resolve(blob), fileType || "image/png");
      };
    });
  };

  const mutation = useMutation<UploadResponse, Error, FormData>({
    mutationFn: uploadProfilePic,
    onSuccess: (data) => {
      console.log("Ashuuuuuuuuuuuuuuu :", JSON.stringify(data));
      const uploadedImageUrl = data.url;
      if (onUpdate) onUpdate(uploadedImageUrl, "user_dp");
      closeDialog();
      toast.success("Profile picture updated successfully!", {
        className: "font-kalam",
      });
      resetState();
    },
    onError: (error: Error) => {
      console.error("Error uploading image:", error);
      if (error.message.includes("too large")) {
        toast.error("File exceeds server limit. Try a smaller image.", {
          className: "font-kalam",
          autoClose: false,
          closeOnClick: true,
        });
      } else {
        toast.error("Failed to upload image: " + error.message, {
          className: "font-kalam",
          autoClose: false,
          closeOnClick: true,
        });
      }
    },
  });

  const onSubmit: SubmitHandler<T> = async (data) => {
    console.log("Original file size:", data.image?.size); // Debug original size
    const croppedBlob = await createCroppedImage();
    if (!croppedBlob || !fileType) {
      toast.error("Please crop an image before saving.");
      return;
    }

    // Use the external helper
    const compressed = await compressFile(croppedBlob, 500, 0.8);
    console.log("Compressed size:", compressed.size);

    console.log("Cropped blob size:", croppedBlob.size); // Debug cropped size

    if (croppedBlob.size > 5 * 1024 * 1024) {
      toast.error("Cropped image exceeds 5MB. Please try a smaller image.");
      return;
    }

    if (compressed.size > 5 * 1024 * 1024) {
      toast.error(
        "Even after compression it's over 5MB. Please reduce resolution.",
      );
      return;
    }

    const allowedTypes: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpeg",
    };

    const extension = allowedTypes[fileType];

    if (!extension) {
      toast.error("Only JPG and PNG formats are allowed.");
      return;
    }

    const formData = new FormData();
    //formData.append("file", croppedBlob, `user_dp.${extension}`);
    formData.append("file", compressed, `user_dp.${extension}`);
    formData.append("extension", extension);
    mutation.mutate(formData);
  };

  const resetState = () => {
    setImageSrc(null);
    setFileType(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedArea(null);
    reset({ image: undefined });
    setFileName("");
  };

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
            Change Profile Picture
          </DialogTitle>
          <Description>Upload and crop your new profile picture</Description>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                📁 Choose Image
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                {...register("image", {
                  onChange: (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const maxSizeBytes = 10 * 1024 * 1024; // 5 MB
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

                    if (file.size > maxSizeBytes) {
                      // alert the user with the current size and the 5 MB limit
                      alert(
                        `Selected file is ${sizeMB} MB. Maximum allowed size is 5 MB.`,
                      );
                      // clear the input so they can try again
                      e.target.value = "";
                      return;
                    }

                    // …the rest of your existing logic…
                    setFileName(file.name);
                    setFileType(file.type);
                    const reader = new FileReader();
                    reader.onload = () => setImageSrc(reader.result as string);
                    reader.readAsDataURL(file);
                    setValue("image", file, { shouldValidate: true });
                  },
                })}
                className="hidden"
              />

              {fileName && (
                <p className="mt-2 text-sm text-gray-700">
                  Selected file: <span className="font-medium">{fileName}</span>
                </p>
              )}
              {errors.image?.message && (
                <p className="text-red-500 text-sm">{errors.image.message}</p>
              )}
            </div>

            {imageSrc && (
              <>
                <div className="relative" style={{ width: 400, height: 300 }}>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                  />
                </div>

                <div className="my-2">
                  <label className="mr-2">Zoom:</label>
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    min={1}
                    max={3}
                    step={0.1}
                    value={[zoom]}
                    onValueChange={(value: number[]) => setZoom(value[0])}
                  >
                    <Slider.Track className="bg-gray-200 relative flex-grow rounded-full h-2">
                      <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-md" />
                  </Slider.Root>
                </div>

                <div className="my-2">
                  <label className="mr-2">Rotation:</label>
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    min={0}
                    max={360}
                    step={1}
                    value={[rotation]}
                    onValueChange={(value: number[]) => setRotation(value[0])}
                  >
                    <Slider.Track className="bg-gray-200 relative flex-grow rounded-full h-2">
                      <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-md" />
                  </Slider.Root>
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button type="button" onClick={closeDialog}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending || !isValid}
                className={`py-2 px-8 rounded-full transition duration-300 flex items-center justify-center gap-2 font-gm tracking-widest
                  ${
                    mutation.isPending || !isValid
                      ? "bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed"
                      : "bg-white text-gray-700 border-2 border-[#00CED1] hover:bg-[#00CED1] hover:text-white cursor-pointer"
                  }
                `}
              >
                {mutation.isPending ? (
                  <>
                    <div>Uploading...</div>
                    <FaSpinner className="animate-spin" />
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
