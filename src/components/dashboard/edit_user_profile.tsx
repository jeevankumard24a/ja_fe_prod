"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import EditableField from "@/components/ui_components/EditableFields";
import { getUserProfileData, removeDP } from "@/components/dashboard/utils";
import { EditUserProfileDialog } from "@/components/dashboard/dialogs/edit_user_profile_dialog";
import { UploadDpDialog } from "@/components/dashboard/dialogs/upload_dp_dialog";
import { useDbDialogStore } from "@/stores/dashboard/db_store";

export default function EditUserProfile() {
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [about, setAbout] = useState("");
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const baseImageUrl =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
    "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";

  const { activeDialog, closeDialog, openDialog } = useDbDialogStore();

  const {
    data: userProfileData,
    isError: userProfileError,
    error: userProfileErrorObj,
    isLoading: userProfileIsLoading,
  } = useQuery({
    queryKey: ["user_profile"],
    queryFn: getUserProfileData,
    enabled: true,
  });

  useEffect(() => {
    console.log("EditUserProfile mounted, resetting dialog state");
    closeDialog();
  }, [closeDialog]);

  useEffect(() => {
    console.log("useEffect userProfileData:", JSON.stringify(userProfileData));
    if (
      userProfileData &&
      userProfileData.data &&
      userProfileData.data.length > 0
    ) {
      const userData = userProfileData.data[0];
      setFullName(userData.user_name || "");
      setDisplayName(userData.user_display_name || "");
      setAbout(userData.user_about || "");
      setCroppedImage(
        userData.user_dp ? `${baseImageUrl}/${userData.user_dp}` : null,
      );
    }
  }, [userProfileData]);

  const handleUpdateField = (newValue: string, column_name: string) => {
    if (column_name === "user_name") {
      setFullName(newValue);
    } else if (column_name === "user_display_name") {
      setDisplayName(newValue);
    } else if (column_name === "user_about") {
      setAbout(newValue);
    } else if (column_name === "user_dp") {
      const url = newValue.startsWith("http")
        ? newValue
        : `${baseImageUrl}/${newValue}`;
      setCroppedImage(url);
    }
  };

  console.log("EditUserProfile render, activeDialog:", activeDialog);

  if (userProfileIsLoading) {
    return <div>Loading profile...</div>;
  }

  if (userProfileError) {
    return (
      <div>
        Error loading profile: {userProfileErrorObj?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Profile Page</h1>

      {/* Centered Profile Image with Attached Edit Button */}
      <div className="relative w-56 h-56 mb-6">
        <div className="w-full h-full rounded-full overflow-hidden border border-gray-300 flex items-center justify-center">
          {croppedImage ? (
            <img
              // cache‐bust so browser fetches the new one
              src={`${croppedImage}?t=${Date.now()}`}
              alt="Profile"
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-500">No Image</span>
          )}
        </div>
        <button
          type="button"
          onClick={() =>
            openDialog("dpchange", { onUpdate: handleUpdateField })
          }
          className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-2 text-sm shadow-md hover:bg-blue-600 transition"
        >
          Edit
        </button>
      </div>

      <div className={`flex  justify-center items-center `}> Remove DP </div>

      {/* Editable Fields */}
      <div className="w-full max-w-md space-y-4">
        <EditableField
          label="Full Name"
          value={fullName}
          columnName="user_name"
          onUpdate={handleUpdateField}
        />
        <EditableField
          label="Display Name"
          value={displayName}
          columnName="user_display_name"
          onUpdate={handleUpdateField}
        />
        <EditableField
          label="About"
          value={about}
          columnName="user_about"
          onUpdate={handleUpdateField}
        />
      </div>

      {/* Dialogs */}
      <EditUserProfileDialog />
      <UploadDpDialog />
    </div>
  );
}
