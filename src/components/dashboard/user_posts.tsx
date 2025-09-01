import Image from "next/image";
import React from "react";
import { FaCheck } from "react-icons/fa";
import { MdArrowForward } from "react-icons/md";
import { FaArrowDown } from "react-icons/fa6";
export default function User_Posts({ user_id }: { user_id: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  return (
    <div
      className={` font-pop flex flex-col  mx-auto  justify-center items-center mb-6 mt-6 w-[1000px]`}
    >
      <div
        className={`w-full flex flex-col justify-center text-c1 c-border-c  items-center border-2 mt-10 rounded-full `}
      >
        <div
          className={`font-bold font-rm text-xl mt-4    underline-offset-4  tracking-widest`}
        >
          {" "}
          DSA in Java
        </div>
        <Image
          src="/puppy_cat_bf.png"
          //  src={`${baseUrl}/Ashuuu.png`}
          alt="Ashritha"
          width={100}
          height={100}
          className={`rounded-full m-6`}
        />
        <div className={`grid font-rm italic  grid-cols-2 gap-10`}>
          <div className={`grid grid-cols-1 gap-2`}>
            <div className={`flex gap-2`}>
              <FaCheck color={`green`} />
              <div>ClassRoom and Live</div>
            </div>
            <div className={`flex gap-2`}>
              <FaCheck color={`green`} />
              <div>Beginner , Learn and Practice</div>
            </div>
            <div className={`flex gap-2`}>
              <FaCheck color={`green`} />
              <div>Starting on Oct 24th 2024</div>
            </div>
          </div>
          <div className={`grid grid-cols-1 gap-2`}>
            <div className={`flex gap-2`}>
              <FaCheck color={`green`} />
              <div>Campus Recuritment</div>
            </div>
            <div className={`flex gap-2`}>
              <FaCheck color={`green`} />
              <div>Rating : 4.7</div>
            </div>
            <div className={`flex gap-2`}>
              <FaCheck color={`green`} />
              <div>Ending on 24th Nov 2024</div>
            </div>
          </div>
        </div>
        <div
          className={`grid grid-cols-2 mt-6 font-sg  tracking-widest mb-10 gap-10`}
        >
          <button
            className={` c-btn-bg hover:bg-btnhover c-btn-text-color  hover:text-btnhovertextcolor  py-2 px-8 rounded-full transition duration-300 `}
          >
            <div className={`flex gap-1 justify-center items-center`}>
              <div className={`italic   `}>COURSE DETAILS</div>
              <MdArrowForward />
            </div>
          </button>

          <button
            className={` c-btn-bg hover:bg-btnhover c-btn-text-color  hover:text-btnhovertextcolor py-2 px-8 rounded-full transition duration-300 `}
          >
            <div className={`flex gap-1 justify-center items-center`}>
              <div className={`italic   `}>GO TO COURSE</div>
              <MdArrowForward />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
