"use client";

import Image from "next/image";
import React from "react";
import { IoStarSharp } from "react-icons/io5";
import dayjs from "dayjs";
import { formatDisplayDate, DISPLAY_DATE_FORMAT } from "@/utils/timeFunctions";

const RatingCard: React.FC<RatingCardProps> = ({ profileImg, name, rating, day, review }) => {
    return (
        <div className="flex flex-col gap-5 pt-5">
            <div className="flex gap-1 md:w-[800px]">
                <div className="w-[40px] h-[40px] relative flex-shrink-0">
                    <Image
                        src={profileImg}
                        alt="profile picture"
                        fill
                        className="rounded-full object-cover"
                    />
                </div>
                <div className="ml-1 flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2 w-full">
                        <p className="font-semibold text-black text-sm">{name}</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-black max-md:hidden"></div>
                        <div className="flex items-center gap-1 max-md:hidden">
                            <p className="font-semibold text-black text-sm">{rating}</p>
                            <IoStarSharp className="text-[1rem] text-[#FFD700]" />
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                        <p className="font-semibold text-black text-sm">
                            {formatDisplayDate(day)}
                        </p>
                    </div>
                    <p className="text-sm font-normal text-gray-light flex flex-wrap">{review}</p>
                </div>
            </div>
        </div>
    );
};

export default RatingCard;
