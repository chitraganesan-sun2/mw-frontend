"use client";

import React from "react";
import ContainerWrapper from "../components/ContainerWrapper";
import ContainerHeader from "../components/ContainerHeader";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { TimeIcon } from "@/assets/icons";
import Link from "next/link";

interface PublicSession {
    volunteer_slot_id: string;
    date: string;
    start_time: string;
    end_time: string;
    duration: string;
    title: string;
    description: string;
    volunteer_first_name: string;
    tag_ids?: any[];
}

// High-level preview row for the public landing page - just when it is and what it's
// about (timestamp + subject), not the full detail the in-app session card shows.
const SessionPill = ({ session }: { session: PublicSession }) => {
    const formatTime = (t: string) => {
        if (!t) return "";
        const [h, m] = t.split(":").map(Number);
        const suffix = h >= 12 ? "PM" : "AM";
        const hour = h % 12 || 12;
        return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
    };

    const formatDate = (d: string) => {
        if (!d) return "";
        const todayStr = new Date().toISOString().slice(0, 10);
        const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
        if (d === todayStr) return "Today";
        if (d === tomorrowStr) return "Tomorrow";
        const date = new Date(d + "T00:00:00");
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    return (
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-sm text-gray-700 flex-shrink-0">
                <TimeIcon />
                <span className="font-medium whitespace-nowrap">
                    {formatDate(session.date)}, {formatTime(session.start_time)}
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
                        <Link
                            href="/join-us?signup_as=learner"
                            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
                        >
                            Sign up to get notified
                        </Link>
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
                    <Link
                        href="/join-us?signup_as=learner"
                        className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm"
                    >
                        Sign up to join a session
                    </Link>
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default InstantSessions;
