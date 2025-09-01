import { create } from "zustand";

// Define the possible dialog types
type DialogType =
  | "followers"
  | "following"
  | "posts"
  | "courses"
  | "notifications"
  | "edituserprofile"
  | "dpchange"
  | null;

// Define the optional parameters that can be passed to dialogs
interface DialogParams {
  user_id?: string;
  post_id?: string;
  course_id?: string;
  [key: string]: any;
}

// Define the state and actions for the store
interface DbDialogState {
  activeDialog: DialogType;
  dialogParams: DialogParams;
  openDialog: (dialog: DialogType, params?: DialogParams) => void;
  closeDialog: () => void;
}

export const useDbDialogStore = create<DbDialogState>((set) => ({
  activeDialog: null,
  dialogParams: {},

  openDialog: (dialog, params = {}) => {
    console.log("Opening dialog:", dialog, "with params:", params);
    return set(() => ({
      activeDialog: dialog,
      dialogParams: params,
    }));
  },

  closeDialog: () => {
    console.log("Closing dialog");
    return set((state) => ({
      activeDialog: null,
      dialogParams: state.dialogParams,
    }));
  },
}));
