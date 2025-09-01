"use client";

import { Divider } from "@/catalyst/divider";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa6";
import { FcDislike } from "react-icons/fc";
import { FaRegThumbsDown } from "react-icons/fa6";
import { RiUserFollowFill, RiUserUnfollowFill } from "react-icons/ri";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { FaRegComment } from "react-icons/fa6";
import { BiRepost } from "react-icons/bi";
import { RiShareCircleFill } from "react-icons/ri";
import { Tooltip } from "react-tooltip";

interface PlayIconsProps {
  userId: string;
  entityId: string; // Replaces itemId, can be course_id or question_id
  entityType?: "course" | "question"; // Optional, defaults to "course"
}

export default function PlayIcons({
  userId,
  entityId,
  entityType = "course",
}: PlayIconsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch initial status from database
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `/api/utils/icons_status/${entityType}/${entityId}`,
        );
        const data = await response.json();
        setIsLiked(data.isLiked || false);
        setIsDisliked(data.isDisliked || false);
        setIsFollowing(data.isFollowing || false);
        setIsBookmarked(data.isBookmarked || false);
      } catch (error) {
        console.error(`Error fetching ${entityType} status:`, error);
      }
    };
    fetchStatus();
  }, [userId, entityId, entityType]);

  // Helper function to update database
  const updateStatus = async (field: string, value: boolean) => {
    try {
      await fetch(`/api/status/${entityType}/${userId}/${entityId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (error) {
      console.error(`Error updating ${entityType} ${field}:`, error);
    }
  };

  const handleLikeToggle = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if (isDisliked) setIsDisliked(false);
    updateStatus("isLiked", newLikedState);
    if (isDisliked) updateStatus("isDisliked", false);
  };

  const handleDislikeToggle = () => {
    const newDislikedState = !isDisliked;
    setIsDisliked(newDislikedState);
    if (isLiked) setIsLiked(false);
    updateStatus("isDisliked", newDislikedState);
    if (isLiked) updateStatus("isLiked", false);
  };

  const handleFollowToggle = () => {
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    updateStatus("isFollowing", newFollowingState);
  };

  const handleBookmarkToggle = () => {
    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);
    updateStatus("isBookmarked", newBookmarkedState);
  };

  return (
    <div className="flex h-full justify-center items-center">
      <div className="flex gap-6 justify-center border-2 border-gray-300 px-6 py-3 rounded-full items-center">
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          className="focus:outline-none"
          data-tooltip-id="play-icons-tooltip"
          data-tooltip-content={isLiked ? "Unlike" : "Like"}
        >
          {isLiked ? (
            <FcLike className="w-6 h-6 text-pink-600" />
          ) : (
            <FaRegHeart className="w-6 h-6 text-gray-600" />
          )}
        </button>

        <Divider className="h-6 border-l-[1px] border-gray-300" />

        {/* Dislike Button */}
        <button
          onClick={handleDislikeToggle}
          className="focus:outline-none"
          data-tooltip-id="play-icons-tooltip"
          data-tooltip-content={isDisliked ? "Remove Dislike" : "Dislike"}
        >
          {isDisliked ? (
            <FcDislike className="w-6 h-6 text-blue-600" />
          ) : (
            <FaRegThumbsDown className="w-6 h-6 text-gray-600" />
          )}
        </button>

        <Divider className="h-6 border-l-[1px] border-gray-300" />

        {/* Follow/Unfollow Button */}
        <button
          onClick={handleFollowToggle}
          className="focus:outline-none"
          data-tooltip-id="play-icons-tooltip"
          data-tooltip-content={isFollowing ? "Unfollow" : "Follow"}
        >
          {isFollowing ? (
            <RiUserUnfollowFill className="w-6 h-6 text-red-600" />
          ) : (
            <RiUserFollowFill className="w-6 h-6 text-green-600" />
          )}
        </button>

        <Divider className="h-6 border-l-[1px] border-gray-300" />

        {/* Repost Icon */}
        <div data-tooltip-id="play-icons-tooltip" data-tooltip-content="Repost">
          <BiRepost className="w-8 h-8 text-gray-600" />
        </div>

        <Divider className="h-6 border-l-[1px] border-gray-300" />

        {/* Comment Icon */}
        <div
          data-tooltip-id="play-icons-tooltip"
          data-tooltip-content="Comment"
        >
          <FaRegComment className="w-6 h-6 text-gray-600" />
        </div>

        <Divider className="h-6 border-l-[1px] border-gray-300" />

        {/* Share Icon */}
        <div data-tooltip-id="play-icons-tooltip" data-tooltip-content="Share">
          <RiShareCircleFill className="w-6 h-6 text-gray-600" />
        </div>

        <Divider className="h-6 border-l-[1px] border-gray-300" />

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkToggle}
          className="focus:outline-none"
          data-tooltip-id="play-icons-tooltip"
          data-tooltip-content={isBookmarked ? "Remove Bookmark" : "Bookmark"}
        >
          {isBookmarked ? (
            <FaBookmark className="w-[22px] h-[22px] text-yellow-600" />
          ) : (
            <FaRegBookmark className="w-[22px] h-[22px] text-gray-600" />
          )}
        </button>
      </div>

      {/* Single Tooltip Component */}
      <Tooltip
        id="play-icons-tooltip"
        place="top"
        className="!bg-pink-500 !text-black !rounded-lg !px-3 !py-2"
      />
    </div>
  );
}
