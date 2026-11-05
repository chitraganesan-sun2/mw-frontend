"use client";

import React from "react";
import { FiCalendar } from "react-icons/fi";
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
import { formatSessionDate, zoneAbbreviation } from "@/utils/sessionDisplay";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PublicWingTime {
    wingtime_id: string;
    /** The host volunteer's local date/time. */
    date: string;
    start_time: string;
    end_time: string;
    topic: string;
    description: string;
    volunteer_first_name: string;
    tags?: string[];
    /** Absolute start, when the API provides it - lets each visitor see their own time. */
    utc_start_date?: string;
    utc_start_time?: string;
    capacity?: number;
    registered_count?: number;
}

/** "Today, 6:00 PM EDT" in the VISITOR's timezone. Today/Tomorrow used to be decided by
 * comparing the host's local date with the UTC date, with no timezone shown. */
function describeWhen(wingtime: PublicWingTime): string {
    const viewerTz = dayjs.tz.guess();
    const now = dayjs();
    const instant =
        wingtime.utc_start_date && wingtime.utc_start_time
            ? dayjs.utc(`${wingtime.utc_start_date} ${wingtime.utc_start_time.slice(0, 5)}`, "YYYY-MM-DD HH:mm", true)
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
    const dayLabel = wingtime.date === now.format("YYYY-MM-DD")
        ? "Today"
        : wingtime.date === now.add(1, "day").format("YYYY-MM-DD")
          ? "Tomorrow"
          : formatSessionDate(wingtime.date);
    // Format time from 24h to 12h format
    const formatTime = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${hour12}:${minutes} ${ampm}`;
    };
    return `${dayLabel}, ${formatTime(wingtime.start_time)}`;
}

// High-level preview row for the public landing page - just when it is and what it's
// about (timestamp + subject), not the full detail the in-app wingtime card shows.
const WingTimePill = ({ wingtime }: { wingtime: PublicWingTime }) => {
    // Both CTAs open the LEARNER sign-up, so they carry the learner colour (blue = Learner).
    const spotsLeft = wingtime.capacity && wingtime.registered_count !== undefined
        ? wingtime.capacity - wingtime.registered_count
        : null;

    return (
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-sm text-gray-700 flex-shrink-0">
                <TimeIcon />
                <span className="font-medium whitespace-nowrap">
                    {describeWhen(wingtime)}
                </span>
            </div>
            <div className="flex items-center gap-3 flex-1 justify-end">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-1 text-right">
                    {wingtime.topic}
                </h3>
                {spotsLeft !== null && spotsLeft > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                        {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                    </span>
                )}
            </div>
        </div>
    );
};

const WingTimeSkeleton = () => (
    <div className="flex flex-col gap-3 w-full">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 animate-pulse flex items-center justify-between gap-3">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
        ))}
    </div>
);

const WingTime = () => {
    // Opens the learner sign-up in place (same as the Hero / For Learners buttons).
    const [, setParamMode] = useQueryState("signup_as");
    const openLearnerSignUp = () => setParamMode("learner");

    const { data: wingtimes = [], isLoading } = useQuery<PublicWingTime[]>({
        queryKey: ["public-wingtimes"],
        queryFn: async () => {
            const res = await GET_API((endpoints as any).publicSessions.getWingTimes(6));
            return Array.isArray(res?.data) ? res.data : [];
        },
        refetchInterval: 60000, // refresh every 60 seconds
        staleTime: 30000,
    });

    // Don't render the list if no wingtimes and not loading: a compact notice with the sign-up CTA.
    if (!isLoading && wingtimes.length === 0) {
        return (
            <ContainerWrapper>
                <div className="flex flex-col gap-4 w-full">
                    <ContainerHeader
                        title="Scheduled"
                        subTitle="WingTime"
                        description="Join scheduled group learning sessions led by experienced volunteers on various topics."
                    />
                    <div className="bg-gray-50 rounded-2xl px-6 py-6 flex flex-col items-center gap-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                            <FiCalendar size={28} className="mb-1 text-gray-400" aria-hidden="true" />
                            <p className="text-gray-600 font-medium">No scheduled sessions right now</p>
                            <p className="text-gray-400 text-sm">Volunteers schedule group sessions throughout the week. Sign up to get notified.</p>
                        </div>
                        <button
                            type="button"
                            onClick={openLearnerSignUp}
                            className="btn-learner-fill px-8 py-3 rounded-full font-medium transition-colors text-sm cursor-pointer"
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
            <div className="flex flex-col gap-6 w-full">
                <ContainerHeader
                    title="Scheduled"
                    subTitle="WingTime Sessions Available"
                    description="Register for upcoming group sessions — learn together with other learners and volunteers."
                />
                {isLoading ? (
                    <WingTimeSkeleton />
                ) : (
                    <div className="flex flex-col gap-3 w-full">
                        {wingtimes.map((wingtime) => (
                            <WingTimePill key={wingtime.wingtime_id} wingtime={wingtime} />
                        ))}
                    </div>
                )}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={openLearnerSignUp}
                        className="btn-learner-fill px-8 py-3 rounded-full font-medium transition-colors text-sm cursor-pointer"
                    >
                        Sign up to register
                    </button>
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default WingTime;
