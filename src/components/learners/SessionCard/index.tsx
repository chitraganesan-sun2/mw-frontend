"use client";

import React from "react";
import ProfileNameLink from "@/components/common/ProfileNameLink";
import Image from "next/image";
import TagComponent from "@/components/common/Tag";
import { TimeIcon } from "@/assets/icons";
import DummyProfileImg from "@/assets/images/dummy-profile.webp";
import PersonImg from "@/assets/images/Person.png";
import { onEnterOrSpace } from "@/utils/a11y";
import {
    canJoinSession,
    formatSessionDate,
    getSessionInstantBounds,
    getStatusLabel,
    getStatusPillClass,
    type SessionInstantFields,
} from "@/utils/sessionDisplay";
import { safeHref } from "@/utils/safeHref";

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
        /** 24h local times, used to hide Join once the session has ended. */
        start_time_24?: string;
        end_time_24?: string;
        /** UTC fields - the absolute end decides whether Join is still offered. */
        instant?: SessionInstantFields;
        instructor: {
            name: string;
            profilePicture?: string;
            /** volunteer_id - makes the name open the volunteer's profile. */
            id?: string;
        };
    };
    onClick: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onClick }) => {
    // "claimed" is shown as "Booked" - one status vocabulary across the app (sessionDisplay).
    const status = { label: getStatusLabel(session.status), className: getStatusPillClass(session.status) };
    // Absolute end from the UTC fields (the 24h times are profile-local wall clock, which the
    // browser's timezone would misread).
    const endsAt = getSessionInstantBounds(session.instant, {
        date: session.date,
        start: session.start_time_24,
        end: session.end_time_24,
    })?.end;
    const joinHref = safeHref(session.meetLink);
    const showJoin =
        session.status === "claimed" &&
        session.claimedByMe &&
        canJoinSession({ status: "booked", meet_link: joinHref }, endsAt);

    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={onEnterOrSpace(onClick)}
            className="bg-white rounded-xl  p-[12px] md:p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
            {/* Header: Title and Status */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-medium text-[#121212] flex-1 pr-2">{session.title}</h2>
                <TagComponent
                    text={status.label}
                    tagClassName={`${status.className} !border-none !px-3 !py-1 md:!text-sm !text-[12px] !font-medium`}
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
                                tagClassName="!bg-gray-100 !border-none !text-black !px-3 !py-1 !text-sm"
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
                    
                    {/* Wraps on narrow screens - whitespace-nowrap pushed "… 2:30 PM EDT" past the card edge. */}
                    <span className="min-w-0 text-[16px] font-medium text-black break-words">
                        {session.date && `${formatSessionDate(session.date)} · `}
                        {session.startTime} – {session.endTime} {session.timezone}
                        {session.duration && ` · ${session.duration}`}
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
                    {/* The card is clickable (opens the session); the name opens the volunteer. */}
                    <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <ProfileNameLink
                            role="volunteer"
                            id={session.instructor.id}
                            name={session.instructor.name}
                            className="text-base"
                        />
                    </span>
                </div>
            </div>

            {/* Join - shown directly on the learner's own claimed cards, below the time,
                so they don't have to open the detail modal to join. */}
            {showJoin && (
                <a
                    href={joinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 inline-flex items-center justify-center rounded-xl btn-primary-fill px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                >
                    Join
                </a>
            )}
        </div>
    );
};

export default SessionCard;
