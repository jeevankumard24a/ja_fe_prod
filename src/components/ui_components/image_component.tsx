"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion } from "framer-motion";

const ImageComponent = ({ image_nm }: { image_nm: string }) => {
  console.log("Imageeeeeeeeeeeeeeeee", image_nm);

  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL; // Get from env
  const imageUrl = `${baseUrl}/${image_nm}`; // Construct full image URL

  // State for image loading, error handling, and dialog open state
  const [imageSrc, setImageSrc] = useState(imageUrl);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Open dialog and start loading
  const openDialog = () => {
    setIsLoading(true);
    setIsOpen(true);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Clickable Profile Image */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Image
          src={imageSrc}
          alt="User Profile"
          width={200}
          height={200}
          onError={() => setImageSrc("/avatar.png")} // Fallback to default image
          className="w-[200px] h-[200px] object-cover rounded-full border border-gray-300 cursor-pointer"
          onClick={openDialog} // Open dialog on click
        />
      </motion.div>

      {/* Headless UI Dialog with Framer Motion Animations */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <DialogPanel className="bg-white p-4 rounded-lg shadow-lg relative">
            <DialogTitle className="text-lg font-semibold mb-4">
              Profile Image
            </DialogTitle>

            {/* Loading Indicator with Motion Effect */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
              </motion.div>
            )}

            {/* Full-Size Image with Fade-in Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoading ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={imageSrc}
                alt="User Profile"
                width={480}
                height={640}
                className="rounded-md border border-gray-300"
                onLoadingComplete={() => setIsLoading(false)} // Hide loading when image is ready
                onError={() => {
                  setIsLoading(false);
                  setImageSrc("/avatar.png");
                }}
              />
            </motion.div>

            {/* Close Button with Motion Effect */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Close
            </motion.button>
          </DialogPanel>
        </motion.div>
      </Dialog>
    </div>
  );
};

export default ImageComponent;
