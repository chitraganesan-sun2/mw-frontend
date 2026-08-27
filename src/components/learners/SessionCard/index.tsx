"use client";

import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
import TagComponent from "@/components/common/Tag";
import { TimeIcon } from "@/assets/icons";
import DummyProfileImg from "@/assets/images/dummy-profile.webp";
import PersonImg from "@/assets/images/Person.png";

interface SessionCardProps {
    session: {
        id: string;
        title: string;
        status: "available" | "claimed";
        tags: string[];
        description: string;
        startTime: string;
        endTime: string;
        timezone: string;
        duration: string;
        date?: string;
        meetLink?: string;
        claimedByMe?: boolean;
        instructor: {
            name: string;
            profilePicture?: string;
        };
    };
    onClick: () => void;
}

// The instant-sessions list combines today + tomorrow into one feed - a plain time no longer
// tells you which day a card is for, so label it the same way the old single-date picker did.
const dayLabel = (date?: string) => {
    if (!date) return "";
    const today = dayjs().format("YYYY-MM-DD");
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
    if (date === today) return "Today";
    if (date === tomorrow) return "Tomorrow";
    return dayjs(date).format("DD MMM");
};

const SessionCard: React.FC<SessionCardProps> = ({ session, onClick }) => {
    const statusConfig = {
        available: {
            bg: "!bg-[#DCFCE7]",
            text: "!text-[#16A34A]",
            label: "Available",
        },
        claimed: {
            bg: "!bg-[#DFF5FF]",
            text: "!text-[#0096CC]",
            label: "Claimed",
        },
    };

    const status = statusConfig[session.status] || statusConfig.available;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl  p-[12px] md:p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
            {/* Header: Title and Status */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-medium text-[#121212] flex-1 pr-2">{session.title}</h2>
                <TagComponent
                    text={status.label}
                    tagClassName={`${status.bg} ${status.text} !border-none !px-3 !py-1 md:!text-sm !text-[12px] !font-medium`}
                />
            </div>

            {/* Tags */}
            {session.tags && session.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {session.tags.map((tag, index) => {
                        const label = typeof tag === "string" ? tag : (tag as any)?.skill_name ?? (tag as any)?.name ?? "";
                        if (!label) return null;
                        return (
                            <TagComponent
                                key={index}
                                text={label}
                                tagClassName="!bg-[#E0F2FE] !border-none !text-black !px-3 !py-1 !text-sm"
                            />
                        );
                    })}
                </div>
            )}

            {/* Description */}
            <p className="md:text-sm text-[14px] text-gray-700 mb-2 line-clamp-2 leading-relaxed">{session.description}</p>

            {/* Footer: Time and Instructor */}
            <div className="flex md:flex-row flex-col gap-2 md:items-center justify-between pt-3 ">
                {/* Time Info */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center pt-1! w-5 h-5 text-gray-600 flex-shrink-0">
                        <TimeIcon />
                        </div>
                    
                    <span className="text-[16px] font-medium text-black whitespace-nowrap">
                        {dayLabel(session.date) && `${dayLabel(session.date)}, `}
                        {session.startTime} - {session.endTime} {session.timezone} ({session.duration})
                    </span>
                </div>

                {/* Instructor Info */}
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                            src={session.instructor.profilePicture && session.instructor.profilePicture !== "/dummy-profile.webp"
                                ? session.instructor.profilePicture
                                : PersonImg}
                            alt={session.instructor.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-base font-medium text-[#121212]">{session.instructor.name}</span>
                </div>
            </div>

            {/* Join - shown directly on the learner's own claimed cards, below the time,
                so they don't have to open the detail modal to join. */}
            {session.status === "claimed" && session.claimedByMe && session.meetLink && (
                <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                    Join
                </a>
            )}
        </div>
    );
};

export default SessionCard;
