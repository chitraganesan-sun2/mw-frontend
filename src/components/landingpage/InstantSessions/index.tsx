"use client";

import React from "react";
import ContainerWrapper from "../components/ContainerWrapper";
import ContainerHeader from "../components/ContainerHeader";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import TagComponent from "@/components/common/Tag";
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
        const date = new Date(d + "T00:00:00");
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{session.title}</h3>
                <TagComponent
                    text="Available"
                    tagClassName="!bg-[#DCFCE7] !text-[#16A34A] !border-none !px-2 !py-0.5 !text-xs flex-shrink-0"
                />
            </div>
            {session.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{session.description}</p>
            )}
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <TimeIcon />
                <span>{formatDate(session.date)} · {formatTime(session.start_time)} – {formatTime(session.end_time)}</span>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">By <span className="font-medium text-gray-800">{session.volunteer_first_name}</span></p>
                {session.duration && (
                    <span className="text-xs text-gray-400">{session.duration} min</span>
                )}
            </div>
        </div>
    );
};

const InstantSessionsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
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
    if (!isLoading && sessions.length === 0) return null;

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
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
