"use client";
import React from "react";
import Image from "next/image";
import { safeImageSrc } from "@/utils/safeHref";
import { useAppStore } from "@/store/useAppStore";
import { formatProfileTimestamp } from "@/utils/sessionDisplay";

interface MessageBubbleProps {
    message: string;
    timestamp: string;
    date: string;
    isOwnMessage: boolean;
    userImage?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    timestamp,
    date,
    isOwnMessage,
    userImage: rawUserImage,
}) => {
    const { volunteerDetails, learnerDetails } = useAppStore();
    // Only render avatars next/image can load - a bad URL would throw and crash the chat.
    const userImage = safeImageSrc(rawUserImage);

    const timezoneRaw =
        (volunteerDetails as { volunteer_contact_details?: { timezone?: string } })
            ?.volunteer_contact_details?.timezone ||
        (learnerDetails as {
            learner_personal_info?: { learner_contact_details?: { timezone?: string } };
        })?.learner_personal_info?.learner_contact_details?.timezone ||
        "";

    // App date style ("October 6, 2026 · 11:51 AM") in the profile timezone. The chat API
    // sends created_at with an offset; a naive (optimistic/socket) value is read as UTC.
    const formattedMessageTime = formatProfileTimestamp(date, timezoneRaw, { withZone: false });

    return (
        <div
            className={`w-full h-fit flex items-${
                isOwnMessage ? "end" : "start"
            } mt-5 flex-col gap-4`}
        >
            <div
                className={`flex gap-2 transition-all duration-300 ease-in-out max-w-[85%] md:max-w-none ${
                    isOwnMessage
                        ? "flex-row-reverse ml-auto md:ml-0 md:flex-row"
                        : "flex-row mr-auto md:mr-0"
                }`}
            >
                {!isOwnMessage && userImage && (
                    <div className="flex items-end gap-2 flex-shrink-0">
                        <div className="relative hidden md:block w-6 h-6 rounded-full overflow-hidden">
                            <Image src={userImage} alt="message" fill className="object-cover" />
                        </div>
                    </div>
                )}
                <div
                    className={`${
                        isOwnMessage
                            ? "bg-[#e6e6e6] border border-gray-200 text-white shadow-sm md:bg-[#f4f7fb] text-[#121212]"
                            : "bg-white border border-gray-200 text-[#121212] md:border md:border-gray-200"
                    } max-w-[450px] rounded-xl rounded-br-md md:rounded-lg px-3 py-3 md:px-2 md:py-4 transition-all duration-300 ease-in-out hover:shadow-sm min-w-0`}
                >
                    <p className="md:text-base text-[16px] text-[#121212] break-words">{message}</p>
                    <div
                        className={`flex justify-end mt-2 items-center gap-1.5 md:gap-2 md:text-sm text-[16px] font-normal ${
                            isOwnMessage
                                ? "text-[#4F4F4F] md:text-gray-500"
                                : "text-[#4F4F4F] md:text-gray-500"
                        }`}
                    >
                        <span>{formattedMessageTime}</span>
                    </div>
                </div>
                {isOwnMessage && userImage && (
                    <div className="flex items-end gap-2 flex-shrink-0">
                        <div className="relative hidden md:block w-6 h-6 rounded-full overflow-hidden">
                            <Image src={userImage} alt="message" fill className="object-cover" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
