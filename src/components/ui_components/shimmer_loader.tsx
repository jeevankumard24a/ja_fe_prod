import React from "react";

export const ShimmerLoader = () => {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse flex items-center gap-4 p-2 border-b"
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 w-48 rounded-md"></div>
        </div>
      ))}
    </div>
  );
};
