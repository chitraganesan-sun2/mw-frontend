"use client";

import React, { useMemo, useState, useEffect } from "react";
import { getApiErrorMessage } from "@/utils/apiError";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import SessionCard from "@/components/learners/SessionCard";

dayjs.extend(customParseFormat);
import { InstantSessionDetailModal } from "@/components/learners/Modals";
import RequestInstantSessionModal from "@/components/learners/RequestInstantSessionModal";
import CenterModal from "@/components/common/Modals/CenterModal";
import Button from "@/components/common/Button";
import TagComponent from "@/components/common/Tag";
import { useComponentStore } from "@/store/useComponenetStore";
import { getHeaderIcon } from "@/layouts/helper";
import { usePathname } from "next/navigation";
import { GET_API, DELETE_API, PUT_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/components/common/Toast";
import { Spin } from "antd";
import LottieLoader from "@/components/common/Loader/Lottie";
import { useQueryState } from "nuqs";
import ProfileNameLink from "@/components/common/ProfileNameLink";
import WhenLine from "@/components/common/WhenLine";
import JoinButton from "@/components/common/JoinButton";
import JoinOpensNote from "@/components/common/JoinOpensNote";
import VolunteerViewModal from "@/components/learners/VolunteerViewModal";
import { useDebounce } from "use-debounce";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import { useConfirm } from "@/hooks/useConfirm";
import {
    joinState,
    formatDuration,
    formatLevel,
    formatSessionDate,
    formatSessionTime,
    formatSessionWhen,
    getDurationMinutes,
    getSessionInstantBounds,
    getStatusLabel,
    getStatusPillClass,
    shortTimeZone,
    type SessionInstantFields,
} from "@/utils/sessionDisplay";
import { safeHref } from "@/utils/safeHref";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import { useNow, useProfileTimeZone, useProfileToday } from "@/hooks/schedule/useProfileTimeZone";

export interface Session {
    id: string;
    title: string;
    status: "available" | "claimed";
    tags: string[];
    description: string;
    startTime: string;
    endTime: string;
    timezone: string;
    duration: string;
    date: string;
    startDateTime?: string;
    /** Meet link - present on claimed sessions so the card can offer Join directly. */
    meetLink?: string;
    /** True when this learner is the one who claimed the session (backend `is_learner`). */
    claimedByMe?: boolean;
    /** For claim API: volunteer_id, start_time and end_time in 24h (HH:mm) */
    volunteer_id?: string;
    start_time_24?: string;
    end_time_24?: string;
    /** UTC fields of the post/session - for "has it ended" (Join) decisions. */
    instant?: SessionInstantFields;
    instructor: {
        name: string;
        profilePicture?: string;
        id?: string;
    };
}

/** Map API response item to Session (handles common field names) */
function mapItemToSession(item: any, date: string): Session {
    const id = item.session_id ?? item.volunteer_slot_id ?? item.id ?? "";
    const title = item.title ?? item.session_title ?? "Session";
    const desc = item.description ?? item.session_description ?? "";
    const startTimeRaw = item.start_time ?? item.learner_start_time ?? item.startTime ?? "00:00";
    const endTimeRaw = item.end_time ?? item.learner_end_time ?? item.endTime ?? "00:00";
    const startTime = formatSessionTime(startTimeRaw);
    const endTime = formatSessionTime(endTimeRaw);
    const duration = formatDuration(
        typeof item.duration === "number" ? item.duration : getDurationMinutes(startTimeRaw, endTimeRaw)
    );
    const timezone =
        shortTimeZone(item.volunteer_timezone ?? item.learner_timezone, item.date ?? date);
    const instructorName =
        item.volunteer_full_name ?? item.instructor?.name ?? item.volunteer_name ?? "Instructor";
    const rawTags = Array.isArray(item.tags)
        ? item.tags
        : Array.isArray(item.skills)
            ? item.skills
            : item.skill
                ? [item.skill]
                : [];
    const tags: string[] = rawTags
        .map((t: any) =>
            typeof t === "string"
                ? t
                : t?.skill_name ?? t?.name ?? (t?.skill_id != null ? String(t.skill_id) : "")
        )
        .filter(Boolean);
    // The level the volunteer is teaching at (grade or Beginner/Intermediate/Expert) - shown
    // alongside the skill, like "Level" on the learner's own request cards.
    const level = formatLevel(item.grade_level || item.expertise_level);
    if (level) tags.push(level);
    const isClaimed =
        item.is_accepted === true || item.status === "claimed" || item.status === "accepted";
    const startDateTime =
        item.learner_start_date && item.learner_start_time
            ? `${item.learner_start_date} ${item.learner_start_time}`
            : `${date} ${startTimeRaw}`;

    return {
        id,
        title,
        status: isClaimed ? "claimed" : "available",
        tags,
        description: desc,
        startTime,
        endTime,
        timezone,
        duration,
        date,
        startDateTime,
        meetLink: item.meet_link,
        claimedByMe: item.is_learner === true,
        volunteer_id: item.volunteer_id,
        start_time_24: item.start_time ?? startTimeRaw,
        end_time_24: item.end_time ?? endTimeRaw,
        instant: {
            utc_start_date: item.utc_start_date,
            utc_start_time: item.utc_start_time,
            utc_end_date: item.utc_end_date,
            utc_end_time: item.utc_end_time,
            session_date: item.session_date,
            session_start_time: item.session_start_time,
            session_end_time: item.session_end_time,
        },
        instructor: {
            id: item.volunteer_id,
            name: instructorName,
            profilePicture:
                item.volunteer_image?.image_url ??
                item.volunteer_picture ??
                item.instructor?.profilePicture,
        },
    };
}





const REQUESTS_PAGE_SIZE = 5;

function RequestedSessionCard({
    request,
    isActionLoading,
    onCancel,
    onView,
    timeZoneLabel,
}: {
    request: any;
    isActionLoading: boolean;
    onCancel: (requestId: string) => void;
    onView: (sessionId: string) => void;
    timeZoneLabel?: string;
}) {
    const statusClass = getStatusPillClass(request.status);
    const statusLabel = getStatusLabel(request.status);
    const canCancelPending = request.status === "pending";
    const canView = Boolean(request.session_id) && request.status !== "pending";

    const when = `${formatSessionDate(request.availability_date)} · ${formatSessionTime(request.availability_start_time)}${
        timeZoneLabel ? ` ${shortTimeZone(timeZoneLabel, request.availability_date)}` : ""
    } · ${formatDuration(request.duration)}`;
    const subjects = [
        Array.isArray(request.skills) ? request.skills.join(", ") : "",
        formatLevel(request.grade_level || request.expertise_level),
    ]
        .filter(Boolean)
        .join(" · ");
    const actionClass = "text-xs font-semibold bg-transparent border-0 p-0 cursor-pointer disabled:opacity-50";

    return (
        <article className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {request.session_type === "academic" ? "Academic Session" : "Arts & Life Skills Session"}
                    </h3>
                    {request.volunteer_name && (
                        <p className="text-sm text-gray-700 break-words">
                            <span className="text-gray-500">Volunteer: </span>
                            <ProfileNameLink
                                role="volunteer"
                                id={request.accepted_by}
                                name={request.volunteer_name}
                                className="font-semibold"
                            />
                        </p>
                    )}
                </div>
                <span className={`${statusClass} shrink-0 rounded-full px-2 py-0.5 text-xs font-medium`}>{statusLabel}</span>
            </div>
            <WhenLine text={when} />
            {subjects && <p className="text-xs text-gray-600 break-words">{subjects}</p>}
            {request.session_details && (
                <p className="text-xs text-gray-600 line-clamp-2 break-words">{request.session_details}</p>
            )}
            {(canView || canCancelPending) && (
                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 pt-0.5">
                    {canCancelPending && (
                        <button
                            className={`${actionClass} text-red-600 hover:text-red-700`}
                            disabled={isActionLoading}
                            onClick={() => onCancel(request.request_id)}
                        >
                            Cancel Request
                        </button>
                    )}
                    {canView &&
                        (request.status === "accepted" || request.status === "active" ? (
                            <button
                                className="rounded-full btn-primary-fill px-3 py-1 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                                disabled={isActionLoading}
                                onClick={() => onView(request.session_id)}
                            >
                                View / Join
                            </button>
                        ) : (
                            <button
                                className={`${actionClass} text-gray-700 underline underline-offset-2 hover:text-gray-900`}
                                disabled={isActionLoading}
                                onClick={() => onView(request.session_id)}
                            >
                                View
                            </button>
                        ))}
                </div>
            )}
        </article>
    );
}

export default function InstantSessionsPage() {
    const { confirm: askConfirm, confirmModal } = useConfirm();
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [sessionDetail, setSessionDetail] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const queryClient = useQueryClient();
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();

    // Today/tomorrow in the learner's PROFILE timezone (not the browser's), re-evaluated every
    // minute and on focus so an open tab rolls over at midnight.
    const timeZoneLabel = useProfileTimeZone("learner");
    // Ticks so Join appears 3 minutes before the start without a reload.
    const now = useNow();
    const todayStr = useProfileToday("learner");
    const tomorrowStr = useMemo(() => dayjs(todayStr).add(1, "day").format("YYYY-MM-DD"), [todayStr]);
    // Browsing is always "today + tomorrow" combined, no per-date navigation - users
    // shouldn't have to click forward just to see whether tomorrow has anything.
    const browseDates = useMemo(() => [todayStr, tomorrowStr], [todayStr, tomorrowStr]);

    const [query] = useQueryState("query");
    // Volunteer names on cards open the volunteer's profile (?volunteerId=).
    const [profileVolunteerId, setProfileVolunteerId] = useQueryState("volunteerId");
    const [debouncedQuery] = useDebounce(query, 400);
    const [requestsPage, setRequestsPage] = useQueryState("requests_page", { defaultValue: "1" });
    // Deep link from the "new instant session" notification email:
    // /learner/instant-sessions?session=<volunteer_slot_id> -> open that session's detail.
    const [sessionParam, setSessionParam] = useQueryState("session");

    // Available Instant Sessions (volunteer-opened slots) for today and tomorrow, fetched in
    // parallel and merged - the endpoint only takes a single date, so this can't be one call.
    const availableQueries = useQueries({
        queries: browseDates.map((date) => ({
            queryKey: ["learner-instant-sessions", date, debouncedQuery],
            queryFn: async () => {
                const res = await GET_API(
                    endpoints.session.getLearnerInstantSession(date, undefined, debouncedQuery || undefined)
                );
                return res?.data;
            },
            staleTime: 30000,
            refetchOnWindowFocus: false,
        })),
    });
    const isLoading = availableQueries.some((q) => q.isLoading);
    const isError = availableQueries.some((q) => q.isError);

    const claimedQueries = useQueries({
        queries: browseDates.map((date) => ({
            queryKey: ["learner-accepted-instant-sessions", date],
            queryFn: async () => {
                const res = await GET_API(
                    endpoints.session.getAcceptedInstantSessionsByDate(date)
                );
                return res?.data;
            },
            staleTime: 30000,
            refetchOnWindowFocus: false,
        })),
    });
    const isClaimedLoading = claimedQueries.some((q) => q.isLoading);
    const isClaimedError = claimedQueries.some((q) => q.isError);

    // My Requested Sessions (the learner-initiated request flow - any volunteer can accept)
    const {
        data: myRequestsData,
        isLoading: isMyRequestsLoading,
        isError: isMyRequestsError,
        refetch: refetchMyRequests,
    } = useQuery({
        queryKey: ["learner-my-requests", requestsPage, debouncedQuery],
        queryFn: async () => {
            const res = await GET_API(
                endpoints.session.getLearnerRequests(
                    Number(requestsPage) || 1,
                    REQUESTS_PAGE_SIZE,
                    debouncedQuery || undefined,
                    undefined
                )
            );
            return res?.data;
        },
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
    });
    const myRequests: any[] = myRequestsData?.items ?? [];
    const myRequestsTotal: number = myRequestsData?.total ?? 0;
    const myRequestsHasMore = Number(requestsPage) * REQUESTS_PAGE_SIZE < myRequestsTotal;

    const availableSessions: Session[] = useMemo(() => {
        // The today and tomorrow fetches can both return the same post (the backend pads the
        // date window) - keep one copy per id, or React gets duplicate keys and the card shows twice.
        const seen = new Set<string>();
        return availableQueries
            .flatMap((q, i) => {
                const apiData = q.data;
                if (!apiData) return [];
                const raw = Array.isArray(apiData) ? apiData : apiData.items ?? apiData.sessions ?? [];
                return raw.map((item: any) => mapItemToSession(item, browseDates[i]));
            })
            .filter((s: Session) => s.status === "available")
            .filter((s: Session) => !seen.has(s.id) && Boolean(seen.add(s.id)))
            .sort((a: Session, b: Session) =>
                a.startDateTime && b.startDateTime
                    ? dayjs(a.startDateTime).valueOf() - dayjs(b.startDateTime).valueOf()
                    : 0
            );
    }, [availableQueries, browseDates]);

    const claimedSessions: Session[] = useMemo(() => {
        return claimedQueries
            .flatMap((q, i) => {
                const claimedApiData = q.data;
                if (!claimedApiData) return [];
                const raw = Array.isArray(claimedApiData)
                    ? claimedApiData
                    : claimedApiData.items ?? claimedApiData.sessions ?? [];
                const date = browseDates[i];
                return raw
                    .map((item: any) => mapItemToSession(item, date))
                    .filter((s: Session) => s.date === date);
            })
            // Same de-duplication as the available list.
            .filter((s: Session, index: number, all: Session[]) => all.findIndex((o) => o.id === s.id) === index)
            .sort((a: Session, b: Session) =>
                a.startDateTime && b.startDateTime
                    ? dayjs(a.startDateTime).valueOf() - dayjs(b.startDateTime).valueOf()
                    : 0
            );
    }, [claimedQueries, browseDates]);

    const handleSessionClick = (session: Session) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSession(null);
    };

    /** Claimed volunteer-opened slots live in instant_session_collection, keyed by
     * volunteer_slot_id, and are un-joined via the unclaim endpoint. */
    const handleClaimedSessionClick = async (session: Session) => {
        setIsDetailLoading(true);
        try {
            const res = await GET_API(endpoints.session.getLearnerInstantSessionDetail(session.id));
            const apiData = res?.data;
            setSessionDetail({
                title: apiData?.title ?? session.title,
                description: apiData?.description ?? session.description,
                whenLabel: formatSessionWhen({
                    date: apiData?.date ?? session.date,
                    start: apiData?.start_time ?? session.start_time_24,
                    end: apiData?.end_time ?? session.end_time_24,
                    timeZoneLabel,
                }),
                hostName: apiData?.volunteer_name ?? session.instructor.name,
                meetLink: safeHref(apiData?.meet_link),
                // Absolute start/end (UTC fields) - the local fields are in the profile timezone.
                joinBounds: getSessionInstantBounds(
                    { ...session.instant, ...apiData },
                    {
                        date: apiData?.date ?? session.date,
                        start: apiData?.start_time ?? session.start_time_24,
                        end: apiData?.end_time ?? session.end_time_24,
                        timeZoneLabel,
                    }
                ),
                status: "accepted",
                cancelAction: "unclaim",
                identifier: session.id,
            });
        } catch (error) {
            showToast({ message: "Couldn't load the session details. Please try again.", type: "error" });
        } finally {
            setIsDetailLoading(false);
        }
    };

    // Handle a ?session=<id> deep link from the notification email once the lists load:
    // open the claim modal if it's still available, or the claimed-detail view if this
    // learner already has it. Consume the param either way so it doesn't re-fire on close.
    useEffect(() => {
        if (!sessionParam || isLoading || isClaimedLoading) return;
        const available = availableSessions.find((s) => s.id === sessionParam);
        const claimed = claimedSessions.find((s) => s.id === sessionParam);
        if (available) {
            setSelectedSession(available);
            setIsModalOpen(true);
        } else if (claimed?.claimedByMe) {
            // Already claimed by this learner - show the claimed-detail view. If someone
            // else claimed it, fall through: it just shows as "Claimed" in the list.
            handleClaimedSessionClick(claimed);
        }
        setSessionParam(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionParam, isLoading, isClaimedLoading, availableSessions, claimedSessions]);

    /** Sessions created from an accepted learner request live in sessions_collection,
     * keyed by session_id, and are cancelled via the generic PUT /session/{id} endpoint. */
    const handleViewRequestedSession = async (sessionId: string) => {
        setIsDetailLoading(true);
        try {
            const res = await GET_API(endpoints.session.getSessionDetail(sessionId));
            const apiData = res?.data;
            setSessionDetail({
                title: apiData?.session_title,
                description: apiData?.session_description,
                whenLabel: formatSessionWhen({
                    date: apiData?.learner_start_date,
                    start: apiData?.learner_start_time,
                    end: apiData?.learner_end_time,
                    timeZoneLabel,
                }),
                hostName: apiData?.volunteer_full_name,
                meetLink: safeHref(apiData?.meet_link),
                joinBounds: getSessionInstantBounds(apiData, {
                    date: apiData?.learner_start_date,
                    start: apiData?.learner_start_time,
                    end: apiData?.learner_end_time,
                    timeZoneLabel,
                }),
                status: apiData?.status,
                cancelAction: ["completed", "cancelled", "expired"].includes(apiData?.status) ? "none" : "cancel",
                identifier: sessionId,
            });
        } catch (error) {
            showToast({ message: "Couldn't load the session details. Please try again.", type: "error" });
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleCancelRequest = async (requestId: string) => {
        if (!(await askConfirm({ title: "Cancel request", description: "Are you sure you want to cancel this request?", confirmText: "Cancel request", cancelText: "Keep it", danger: true }))) return;
        setIsActionLoading(true);
        try {
            await DELETE_API(endpoints.session.cancelLearnerRequest(requestId));
            invalidateScheduleViews(queryClient, "learner");
            showToast({ message: "Request cancelled successfully", type: "success" });
        } catch (e: any) {
            showToast({ message: getApiErrorMessage(e, "Couldn't cancel the request. Please try again."), type: "error" });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelDetail = async () => {
        if (isActionLoading || !sessionDetail?.identifier || sessionDetail.cancelAction === "none") return;
        if (!(await askConfirm({ title: "Cancel session", description: "Are you sure you want to cancel this session?", confirmText: "Cancel session", cancelText: "Keep it", danger: true }))) return;
        setIsActionLoading(true);
        try {
            if (sessionDetail.cancelAction === "unclaim") {
                await DELETE_API(endpoints.session.unclaimInstantSession(sessionDetail.identifier));
            } else {
                await PUT_API(endpoints.session.cancelSession(sessionDetail.identifier), { status: "cancelled" });
            }
            showToast({ message: "Session cancelled successfully", type: "success" });
            invalidateScheduleViews(queryClient, "learner");
            setSessionDetail(null);
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't cancel the session. Please try again."), type: "error" });
        } finally {
            setIsActionLoading(false);
        }
    };

    useEffect(() => {
        setHeaderOptions({
            title: "Instant Sessions",
            titleIcon: getHeaderIcon(pathname),
            searchPlaceholder: "Search sessions",
            showButton: false,
        });
    }, [setHeaderOptions, pathname]);

    // Only block the whole page on the very first load; background refetches
    // should update data quietly without hiding already-rendered sessions.
    const isPageLoading = isLoading || isClaimedLoading;

    if (isError || isClaimedError) {
        return (
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 text-lg">Failed to load sessions. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="h-full animate-fadeIn p-4 lg:p-6 overflow-y-auto relative">
            {confirmModal}
            <VolunteerViewModal isOpen={!!profileVolunteerId} onClose={() => setProfileVolunteerId(null)} />
            {(isPageLoading || isActionLoading || isDetailLoading) && (
                <div className="fixed top-4 right-4 z-20 bg-white rounded-full shadow-md p-2">
                    <Spin size="small" />
                </div>
            )}

            <div className="flex flex-col items-center text-center gap-2 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Instant Sessions</h1>
                <p className="text-sm text-gray-500 max-w-2xl">
                    Instant Sessions are sessions available <strong>today or tomorrow.</strong> You
                    can browse available Instant Sessions or request a specific session based on
                    your preferred time and subject.
                </p>
            </div>

            {/* My Requested Sessions (the learner-request-for-any-volunteer flow) - shown first */}
            <div className="mb-10">
                {/* Same header row as the volunteer page: title left, action right, wraps on phones. */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                    <h2 className="md:text-[20px] text-[16px] font-medium text-[#121212]">
                        My Requested Instant Sessions
                    </h2>
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="btn-primary-fill h-10 inline-flex items-center px-5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity ml-auto shrink-0 whitespace-nowrap"
                    >
                        + Request a Session
                    </button>
                </div>

                {isMyRequestsLoading ? (
                    <div className="flex justify-center py-6">
                        <LottieLoader isLoading={true} />
                    </div>
                ) : isMyRequestsError && !myRequestsData ? (
                    <QueryErrorNotice message="Couldn't load your requests." onRetry={() => refetchMyRequests()} />
                ) : myRequests.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {myRequests.map((req) => (
                                <RequestedSessionCard
                                    key={req.request_id}
                                    request={req}
                                    isActionLoading={isActionLoading}
                                    onCancel={handleCancelRequest}
                                    onView={handleViewRequestedSession}
                                    timeZoneLabel={timeZoneLabel}
                                />
                            ))}
                        </div>
                        {(Number(requestsPage) > 1 || myRequestsHasMore) && (
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    className="text-sm font-medium disabled:opacity-40"
                                    disabled={Number(requestsPage) <= 1}
                                    onClick={() => setRequestsPage(String(Number(requestsPage) - 1))}
                                >
                                    Previous
                                </button>
                                <button
                                    className="text-sm font-medium disabled:opacity-40"
                                    disabled={!myRequestsHasMore}
                                    onClick={() => setRequestsPage(String(Number(requestsPage) + 1))}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="text-5xl mb-4">📋</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Requested Sessions
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Requests you send will show up here
                        </p>
                        <button
                            onClick={() => setIsRequestModalOpen(true)}
                            className="btn-primary-fill px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Request a Session
                        </button>
                    </div>
                )}
            </div>

            {/* Available Instant Sessions (volunteer-opened slots, browse + join) */}
            <div>
                <h2 className="md:text-[20px] text-[16px] font-medium text-[#121212] mb-4">
                    Instant Sessions posted by Volunteers
                </h2>

                {availableSessions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
                        {availableSessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                onClick={() => handleSessionClick(session)}
                            />
                        ))}
                    </div>
                )}

                {claimedSessions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {claimedSessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                onClick={() => handleClaimedSessionClick(session)}
                            />
                        ))}
                    </div>
                )}

                {availableSessions.length === 0 && claimedSessions.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="text-5xl mb-4">🕒</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Instant Sessions
                        </h3>
                        <p className="text-sm text-gray-500">
                            Sessions volunteers open up for this date will show up here
                        </p>
                    </div>
                )}
            </div>

            {selectedSession && (
                <InstantSessionDetailModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    session={selectedSession}
                    onClaim={() => {
                        handleCloseModal();
                    }}
                    onClaimLoadingChange={setIsActionLoading}
                />
            )}

            <CenterModal
                isOpen={Boolean(sessionDetail) && !isDetailLoading}
                onClose={() => setSessionDetail(null)}
                title={sessionDetail?.title ?? "Session Details"}
                width={520}
                footerComponent={
                    <div className="w-full flex gap-3">
                        <Button
                            title="Close"
                            btnVariant="outline"
                            customClassName="flex-1"
                            onClick={() => setSessionDetail(null)}
                        />
                        {sessionDetail && sessionDetail.meetLink && (
                            <JoinButton
                                variant="block"
                                state={joinState({ status: sessionDetail.status, meet_link: sessionDetail.meetLink }, sessionDetail.joinBounds, now)}
                                href={sessionDetail.meetLink}
                                wrapperClassName="flex-1"
                            />
                        )}
                        {sessionDetail?.cancelAction && sessionDetail.cancelAction !== "none" && (
                            <Button
                                title="Cancel"
                                btnVariant="tertiary"
                                customClassName="!bg-white !text-red-600 !border !border-red-200 flex-1"
                                loading={isActionLoading}
                                disabled={isActionLoading}
                                onClick={handleCancelDetail}
                            />
                        )}
                    </div>
                }
            >
                {sessionDetail && (
                    <div className="flex flex-col gap-3 text-sm text-[#121212]">
                        {sessionDetail.description && <p>{sessionDetail.description}</p>}
                        <p>
                            <span className="font-medium">When: </span>
                            {sessionDetail.whenLabel}
                        </p>
                        <JoinOpensNote
                            status={sessionDetail.status}
                            meetLink={sessionDetail.meetLink}
                            bounds={sessionDetail.joinBounds}
                            now={now}
                        />
                        {sessionDetail.hostName && (
                            <p>
                                <span className="font-medium">Volunteer: </span>
                                {sessionDetail.hostName}
                            </p>
                        )}
                    </div>
                )}
            </CenterModal>

            <RequestInstantSessionModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSuccess={() => invalidateScheduleViews(queryClient, "learner")}
            />
        </div>
    );
}
