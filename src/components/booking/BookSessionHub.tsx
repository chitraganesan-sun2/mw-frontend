"use client";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { HiOutlineArrowRight, HiOutlineBolt, HiOutlineCalendarDays } from "react-icons/hi2";
import { MdOutlineGroups } from "react-icons/md";
import { HELP, TERMS } from "@/constants/copy";
import { WINGTIME_ENABLED } from "@/config/wingtime";
import { useComponentStore } from "@/store/useComponenetStore";
import { getHeaderIcon } from "@/layouts/helper";
import type { ScheduleRole } from "@/components/schedule/Dashboard/scheduleCategories";

interface OptionCardProps {
    href: string;
    icon: React.ReactNode;
    title: string;
    when: string;
    description: string;
    points: string[];
    cta: string;
    /** Distinguishes the two cards at a glance without relying on colour alone. */
    accent: string;
}

function OptionCard({ href, icon, title, when, description, points, cta, accent }: OptionCardProps) {
    return (
        <Link
            href={href}
            className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
            <div className="flex items-center gap-3">
                <span aria-hidden="true" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${accent}`}>
                    {icon}
                </span>
                <div className="min-w-0">
                    <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{when}</p>
                </div>
            </div>
            <p className="text-sm text-gray-700">{description}</p>
            <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-sm text-gray-600">
                {points.map((point) => (
                    <li key={point}>{point}</li>
                ))}
            </ul>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-gray-900 group-hover:underline">
                {cta}
                <HiOutlineArrowRight aria-hidden="true" size={16} />
            </span>
        </Link>
    );
}

/**
 * Book a Session: the one entry point for getting a session, with its two options side by side -
 * Instant Sessions (start now) and Book for Later (a date and time you choose). Each opens its own
 * page, which keeps the same switch at the top. WingTime (group sessions) is a separate section and
 * is only linked to, never mixed in.
 */
export default function BookSessionHub({ role }: { role: ScheduleRole }) {
    const pathname = usePathname();
    const { setHeaderOptions } = useComponentStore();
    useEffect(() => {
        setHeaderOptions({
            title: TERMS.bookSession,
            titleIcon: getHeaderIcon(pathname),
            hideSearch: true,
            showButton: false,
        });
    }, [setHeaderOptions, pathname]);

    const learner = role === "learner";

    return (
        <div className="h-full w-full animate-fadeIn overflow-y-auto p-4 lg:p-6">
            <div className="mx-auto flex max-w-4xl flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-medium text-gray-900">{TERMS.bookSession}</h1>
                    <p className="max-w-2xl text-sm text-gray-600">{HELP.bookSession}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <OptionCard
                        href={`/${role}/instant-sessions`}
                        icon={<HiOutlineBolt />}
                        accent="bg-teal-50 text-teal-800"
                        title={TERMS.instantSessions}
                        when="Today or tomorrow"
                        description={learner ? HELP.instantSessionsLearner : HELP.instantSessionsVolunteer}
                        points={
                            learner
                                ? ["No volunteer to pick", "The first volunteer to accept gets the session", "Starts within a day"]
                                : ["Post when you are free", "A learner can join straight away", "Starts within a day"]
                        }
                        cta={learner ? "Find an Instant Session" : "Post an Instant Session"}
                    />
                    <OptionCard
                        href={`/${role}/book-for-later`}
                        icon={<HiOutlineCalendarDays />}
                        accent="bg-slate-100 text-slate-700"
                        title={TERMS.bookForLater}
                        when="Any future date and time"
                        description={learner ? HELP.bookForLaterLearner : HELP.bookForLaterVolunteer}
                        points={
                            learner
                                ? ["Choose the volunteer and the time", "The volunteer accepts or declines", "See it in My Schedule and your calendar"]
                                : ["Propose a time to a learner", "Set the weekly hours learners can book", "See it in My Schedule and your calendar"]
                        }
                        cta={learner ? "Book for Later" : "Plan a session"}
                    />
                </div>

                <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-gray-600">
                    <span>
                        Everything you book appears in <Link className="font-medium underline" href={`/${role}/schedule`}>My Schedule</Link>.
                    </span>
                    {WINGTIME_ENABLED && (
                        <span className="inline-flex items-center gap-1">
                            <MdOutlineGroups aria-hidden="true" size={18} />
                            Looking for a group session? See <Link className="font-medium underline" href={`/${role}/wingtime`}>WingTime</Link>.
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}
