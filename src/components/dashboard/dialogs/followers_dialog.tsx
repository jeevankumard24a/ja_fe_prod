import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useDbDialogStore } from "@/stores/dashboard/db_store";

export const FollowersDialog = () => {
  const { activeDialog, dialogParams, closeDialog } = useDbDialogStore();
  const isOpen = activeDialog === "followers";

  return (
    <Dialog open={isOpen} onClose={closeDialog} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="max-w-lg bg-white p-6 rounded">
          <DialogTitle className="text-lg font-bold">Followers</DialogTitle>
          <p>Showing followers for user: {dialogParams.user_id || "N/A"}</p>
          {/* Replace with actual follower list logic */}
          <ul>
            <li>Follower 1</li>
            <li>Follower 2</li>
          </ul>
          <button
            onClick={closeDialog}
            className="mt-4 p-2 bg-gray-200 rounded"
          >
            Close
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
