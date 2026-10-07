"use client";

import React from "react";
import ContainerWrapper from "../components/ContainerWrapper";
import ContainerHeader from "../components/ContainerHeader";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { TimeIcon } from "@/assets/icons";
import { useQueryState } from "nuqs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { formatSessionDate, formatSessionTime, zoneAbbreviation } from "@/utils/sessionDisplay";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PublicSession {
    volunteer_slot_id: string;
    /** The host volunteer's local date/time. */
    date: string;
    start_time: string;
    end_time: string;
    duration: string;
    title: string;
    description: string;
    volunteer_first_name: string;
    tag_ids?: any[];
    /** Absolute start, when the API provides it - lets each visitor see their own time. */
    utc_start_date?: string;
    utc_start_time?: string;
}

/** "Today, 6:00 PM EDT" in the VISITOR's timezone. Today/Tomorrow used to be decided by
 * comparing the host's local date with the UTC date, with no timezone shown. */
function describeWhen(session: PublicSession): string {
    const viewerTz = dayjs.tz.guess();
    const now = dayjs();
    const instant =
        session.utc_start_date && session.utc_start_time
            ? dayjs.utc(`${session.utc_start_date} ${session.utc_start_time.slice(0, 5)}`, "YYYY-MM-DD HH:mm", true)
            : null;
    if (instant?.isValid()) {
        const local = instant.tz(viewerTz);
        const date = local.format("YYYY-MM-DD");
        const dayLabel = date === now.format("YYYY-MM-DD")
            ? "Today"
            : date === now.add(1, "day").format("YYYY-MM-DD")
              ? "Tomorrow"
              : formatSessionDate(date);
        return `${dayLabel}, ${local.format("h:mm A")} ${zoneAbbreviation(viewerTz, instant)}`.trim();
    }
    // No absolute time from the API: show the host's local date/time without claiming a
    // timezone, and compare dates in the visitor's calendar (not UTC's).
    const dayLabel = session.date === now.format("YYYY-MM-DD")
        ? "Today"
        : session.date === now.add(1, "day").format("YYYY-MM-DD")
          ? "Tomorrow"
          : formatSessionDate(session.date);
    return `${dayLabel}, ${formatSessionTime(session.start_time)}`;
}

// High-level preview row for the public landing page - just when it is and what it's
// about (timestamp + subject), not the full detail the in-app session card shows.
const SessionPill = ({ session }: { session: PublicSession }) => {

    return (
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-sm text-gray-700 flex-shrink-0">
                <TimeIcon />
                <span className="font-medium whitespace-nowrap">
                    {describeWhen(session)}
                </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1 text-right">
                {session.title}
            </h3>
        </div>
    );
};

const InstantSessionsSkeleton = () => (
    <div className="flex flex-col gap-3 w-full">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 animate-pulse flex items-center justify-between gap-3">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
        ))}
    </div>
);

const InstantSessions = () => {
    // Opens the learner sign-up in place (same as the Hero / For Learners buttons). The links
    // used to go to /join-us, which is the staff recruiting page.
    const [, setParamMode] = useQueryState("signup_as");
    const openLearnerSignUp = () => setParamMode("learner");

    const { data: sessions = [], isLoading } = useQuery<PublicSession[]>({
        queryKey: ["public-instant-sessions"],
        queryFn: async () => {
            const res = await GET_API((endpoints as any).publicSessions.getInstantSessions(6));
            return Array.isArray(res?.data) ? res.data : [];
        },
        refetchInterval: 60000, // refresh every 60 seconds
        staleTime: 30000,
    });

    // Don't render section if no sessions and not loading
    if (!isLoading && sessions.length === 0) {
        return (
            <ContainerWrapper>
                <div className="flex flex-col gap-10 w-full">
                    <ContainerHeader
                        title="Live Now"
                        subTitle="Instant Sessions"
                        description="Browse available volunteer sessions and connect instantly — no scheduling needed."
                    />
                    <div className="bg-gray-50 rounded-2xl p-8 text-center">
                        <p className="text-4xl mb-3">📺</p>
                        <p className="text-gray-600 font-medium mb-1">No live sessions right now</p>
                        <p className="text-gray-400 text-sm">Volunteers host sessions throughout the week. Sign up to get notified!</p>
                    </div>
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={openLearnerSignUp}
                            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm border-0 cursor-pointer"
                        >
                            Sign up to get notified
                        </button>
                    </div>
                </div>
            </ContainerWrapper>
        );
    }

    return (
        <ContainerWrapper>
            <div className="flex flex-col gap-10 w-full">
                <ContainerHeader
                    title="Live Now"
                    subTitle="Instant Sessions Available"
                    description="Join a live session right now — browse available volunteer sessions and connect instantly."
                />
                {isLoading ? (
                    <InstantSessionsSkeleton />
                ) : (
                    <div className="flex flex-col gap-3 w-full">
                        {sessions.map((session) => (
                            <SessionPill key={session.volunteer_slot_id} session={session} />
                        ))}
                    </div>
                )}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={openLearnerSignUp}
                        className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm border-0 cursor-pointer"
                    >
                        Sign up to join a session
                    </button>
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default InstantSessions;
