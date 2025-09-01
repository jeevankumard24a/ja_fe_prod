"use client";

import React from "react";
import { Button } from "@/catalyst/button";
import { useDbDialogStore } from "@/stores/dashboard/db_store";

type EditableFieldProps = {
  label: string;
  value: string;
  columnName: string;
  onUpdate: (newValue: string, column_name: string) => void;
};

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  columnName,
  onUpdate,
}) => {
  const { openDialog } = useDbDialogStore();

  const handleOpenDialog = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log("EditableField opening dialog for:", label);
    openDialog("edituserprofile", {
      label,
      initialValue: value,
      columnName,
      onUpdate,
    });
  };

  return (
    <div className="flex items-center max-w-7xl justify-between p-3 border-b">
      <span className="text-gray-800 font-medium">{label}</span>
      <div className="flex gap-4 items-center">
        <span className="text-gray-500">{value}</span>
        <Button onClick={handleOpenDialog}>Update</Button>
      </div>
    </div>
  );
};

export default EditableField;
