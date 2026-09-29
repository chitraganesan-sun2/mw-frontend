"use client";
import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useAppStore } from "@/store/useAppStore";
import { formatDisplayDate, DISPLAY_DATE_FORMAT } from "@/utils/timeFunctions";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
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
    userImage,
}) => {
    const { volunteerDetails, learnerDetails } = useAppStore();

    const timezoneMapping: Record<string, string> = {
        AKST: "America/Anchorage",
        AST: "America/Halifax",
        CST: "America/Chicago",
        EST: "America/New_York",
        HST: "Pacific/Honolulu",
        MST: "America/Denver",
        NST: "America/St_Johns",
        PST: "America/Los_Angeles",
        IST: "Asia/Kolkata",
    };

    const timezoneRaw =
        (volunteerDetails as { volunteer_contact_details?: { timezone?: string } })
            ?.volunteer_contact_details?.timezone ||
        (learnerDetails as {
            learner_personal_info?: { learner_contact_details?: { timezone?: string } };
        })?.learner_personal_info?.learner_contact_details?.timezone ||
        "";

    const rawAbbreviation = timezoneRaw.includes(" - ")
        ? (timezoneRaw.split(" - ")[0]?.trim() ?? "")
        : timezoneRaw.trim();

    const ianaTimezone = timezoneMapping[rawAbbreviation];
    const formattedMessageTime = ianaTimezone
        ? dayjs(date).tz(ianaTimezone)
        : dayjs(date);

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
                        <span className="md:hidden">{formattedMessageTime.format(DISPLAY_DATE_FORMAT)}</span>
                        <span className="md:hidden font-black">•</span>
                        <span className="md:hidden">{formattedMessageTime.format("h:mm a")}</span>
                        <span className="hidden md:inline">
                            {formattedMessageTime.format("Do MMM • h:mm a")}
                        </span>
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
