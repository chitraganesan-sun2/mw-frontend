"use client";
import Image from "next/image";
import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "@/utils/auth";
import dayjs from "dayjs";
const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);

    // Format date as DD/MM/YY
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`;

    // Format time as HH:MM AM/PM
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}.${minutes.toString().padStart(2, "0")}${ampm}`;

    return { formattedDate, formattedTime };
};

const MessageCard = ({
    name,
    message,
    time,
    date,
    image,
    unreadMessages,
    chat_id,
    volunteerId,
    learnerId,
    isIndividualChatLoading,
}: MessageCardProps) => {
    const router = useRouter();
    const params = useSearchParams();
    const chatId = params.get("chatId");
    const role = getCookie("role");

    const handleClick = () => {
        if (isIndividualChatLoading) return;
        if (role === "learner") {
            router.push(`/learner/messages?chatId=${chat_id}&volunteerId=${volunteerId}`);
        } else {
            router.push(`/volunteer/messages?chatId=${chat_id}&learnerId=${learnerId}`);
        }
    };
    return (
        <div
            onClick={handleClick}
            className={`flex w-full max-w-[407px] items-center gap-4 border-b border-gray-200 p-4 hover:bg-[#f4f7fb] cursor-pointer transition-all duration-300 ${
                chat_id === chatId ? "bg-[#f4f7fb]" : ""
            }`}
        >
            <div className="relative w-11 h-11 rounded-full overflow-hidden">
                <Image src={image} alt={name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2 justify-between">
                    <p className="text-base font-medium">{name}</p>
                    <div>
                        {unreadMessages > 0 ? (
                            <p className="text-xs font-normal text-[#22c55e]">
                                {dayjs(date).format("h.mm a")}
                            </p>
                        ) : (
                            <>
                                <p className="text-xs text-[#4F4F4F] max-md:block md:hidden">
                                    {dayjs(date).format("DD/MM/YYYY")}
                                </p>
                                <p className="text-xs text-[#4F4F4F] hidden md:block">
                                    {dayjs(date).format("DD MMM, YYYY")}
                                </p>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-sm font-normal text-gray-500 truncate w-full overflow-hidden whitespace-nowrap block">
                        {message ? message : "No message yet"}
                    </p>
                    {unreadMessages > 0 && (
                        <span className="text-[10px] w-4 h-4 rounded-full bg-[#22c55e] text-white flex items-center justify-center">
                            {unreadMessages}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageCard;
