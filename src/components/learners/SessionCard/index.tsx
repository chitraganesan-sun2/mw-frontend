"use client";

import React from "react";
import ProfileNameLink from "@/components/common/ProfileNameLink";
import WhenLine from "@/components/common/WhenLine";
import JoinButton from "@/components/common/JoinButton";
import { onEnterOrSpace } from "@/utils/a11y";
import {
    joinState,
    formatSessionDate,
    getSessionInstantBounds,
    getStatusLabel,
    getStatusPillClass,
    type SessionInstantFields,
} from "@/utils/sessionDisplay";
import { safeHref } from "@/utils/safeHref";
import { useNow } from "@/hooks/schedule/useProfileTimeZone";

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
    const bounds = getSessionInstantBounds(session.instant, {
        date: session.date,
        start: session.start_time_24,
        end: session.end_time_24,
    });
    // Ticks so Join appears 3 minutes before the start without a reload.
    const now = useNow();
    const joinHref = safeHref(session.meetLink);
    const joinStatus =
        session.status === "claimed" && session.claimedByMe && joinHref
            ? joinState({ status: "booked", meet_link: joinHref }, bounds, now)
            : "none";

    const tags = (session.tags || [])
        .map((tag) => (typeof tag === "string" ? tag : (tag as any)?.skill_name ?? (tag as any)?.name ?? ""))
        .filter(Boolean);
    const when = `${session.date ? `${formatSessionDate(session.date)} · ` : ""}${session.startTime} – ${session.endTime} ${session.timezone}${
        session.duration ? ` · ${session.duration}` : ""
    }`;

    return (
        <article
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={session.title}
            onKeyDown={onEnterOrSpace(onClick)}
            className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 flex flex-col gap-1.5 cursor-pointer hover:shadow-sm transition-shadow"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{session.title}</h3>
                    <p className="text-sm text-gray-700 break-words">
                        <span className="text-gray-500">Volunteer: </span>
                        {/* The card is clickable (opens the session); the name opens the volunteer. */}
                        <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                            <ProfileNameLink
                                role="volunteer"
                                id={session.instructor.id}
                                name={session.instructor.name}
                                className="font-semibold"
                            />
                        </span>
                    </p>
                </div>
                <span className={`${status.className} shrink-0 rounded-full px-2 py-0.5 text-xs font-medium`}>
                    {status.label}
                </span>
            </div>
            <WhenLine text={when} />
            {tags.length > 0 && <p className="text-xs text-gray-600 break-words">{tags.join(", ")}</p>}
            {session.description && (
                <p className="text-xs text-gray-600 line-clamp-2 break-words">{session.description}</p>
            )}
            {/* Join - shown directly on the learner's own claimed cards so they don't have to
                open the detail modal to join. */}
            {joinStatus !== "none" && (
                <div className="flex justify-end pt-0.5">
                    <JoinButton state={joinStatus} href={joinHref} stopPropagation />
                </div>
            )}
        </article>
    );
};

export default SessionCard;
