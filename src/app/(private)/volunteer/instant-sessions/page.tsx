"use client";

import { useState, useEffect, useCallback } from "react";
import { getApiErrorMessage } from "@/utils/apiError";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useComponentStore } from "@/store/useComponenetStore";
import { IoIosArrowBack } from "react-icons/io";
import { POST_API, GET_API, PUT_API, DELETE_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";
import { Spin } from "antd";
import LottieLoader from "@/components/common/Loader/Lottie";
import CenterModal from "@/components/common/Modals/CenterModal";
import Button from "@/components/common/Button";
import TagComponent from "@/components/common/Tag";
import { showToast } from "@/components/common/Toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import ProfileNameLink from "@/components/common/ProfileNameLink";
import WhenLine from "@/components/common/WhenLine";
import JoinButton from "@/components/common/JoinButton";
import JoinOpensNote from "@/components/common/JoinOpensNote";
import LearnerViewModal from "@/components/volunteers/Modals/LearnerViewModal";
import { useDebounce } from "use-debounce";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import QueryErrorNotice from "@/components/common/QueryErrorNotice";
import { useConfirm } from "@/hooks/useConfirm";
import {
    canCompleteSession,
    joinState,
    formatDuration,
    formatLevel,
    formatSessionDate,
    formatSessionTime,
    shortTimeZone,
    formatSessionWhen,
    getSessionInstantBounds,
    getStatusLabel,
    getStatusPillClass,
    isRedundantLevelDescription,
} from "@/utils/sessionDisplay";
import { safeHref } from "@/utils/safeHref";
import { timesAgo } from "@/utils/timeFunctions";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import { useNow, useProfileTimeZone } from "@/hooks/schedule/useProfileTimeZone";

// NewEventModal pulls in @mui/x-date-pickers - defer it to its own chunk.
const NewEventModal = dynamic(() => import("@/components/schedule/Modals/NewEventModal"), { ssr: false });

// dayjs(time, "HH:mm") needs this plugin - without it the parse is Invalid Date.
dayjs.extend(customParseFormat);

// Same style as the learner page's "+ Request a Session" (theme primary = volunteer orange).
const START_SESSION_BTN_CLASS =
    "btn-primary-fill px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity";
// Section-header controls (title + action button + filter) share one fixed height so the
// button and the status dropdown line up on one row.
const SECTION_CONTROL_HEIGHT = "h-10";



const MY_SESSIONS_STATUS_FILTERS = ["", "open", "accepted", "active", "completed", "cancelled", "expired"];

/** Absolute start/end of a session or open post (UTC fields; profile-local fallback). */
function sessionBounds(session: any, timeZoneLabel?: string) {
    return getSessionInstantBounds(session, {
        date: session?.volunteer_start_date,
        start: session?.volunteer_start_time,
        end: session?.volunteer_end_time,
        timeZoneLabel,
    });
}


function LearnerRequestCard({ req, isActionLoading, onAccept }: { req: any; isActionLoading: boolean; onAccept: (id: string) => void }) {
    // The volunteer's own local time (backend-converted); the raw availability_* fields are
    // the LEARNER's local time and used to be shown unlabelled.
    const when = `${formatSessionDate(req.volunteer_start_date ?? req.availability_date)} · ${formatSessionTime(
        req.volunteer_start_time ?? req.availability_start_time
    )}${req.volunteer_end_time ? ` – ${formatSessionTime(req.volunteer_end_time)}` : ""}${
        req.volunteer_timezone ? ` ${shortTimeZone(req.volunteer_timezone, req.volunteer_start_date)}` : ""
    } · ${formatDuration(req.duration)}`;
    const subjects = [
        Array.isArray(req.skills) ? req.skills.join(", ") : "",
        formatLevel(req.grade_level || req.expertise_level),
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <article className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {req.session_type === "academic" ? "Academic Session" : "Arts & Life Skills Session"}
                    </h3>
                    <p className="text-sm text-gray-700 break-words">
                        <span className="text-gray-500">Learner: </span>
                        <ProfileNameLink role="learner" id={req.learner_id} name={req.learner_name} className="font-semibold" />
                    </p>
                </div>
                <span className={`${getStatusPillClass("pending")} shrink-0 rounded-full px-2 py-0.5 text-xs font-medium`}>
                    {getStatusLabel("pending")}
                </span>
            </div>
            <WhenLine text={when} />
            {subjects && <p className="text-xs text-gray-600 break-words">{subjects}</p>}
            {req.session_details && <p className="text-xs text-gray-600 line-clamp-2 break-words">{req.session_details}</p>}
            <div className="flex items-center justify-end pt-0.5">
                <button
                    className="rounded-full btn-primary-fill px-3 py-1 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    disabled={isActionLoading}
                    onClick={() => onAccept(req.request_id)}
                >
                    Accept Request
                </button>
            </div>
        </article>
    );
}

function MySessionCard({
    session,
    isActionLoading,
    onView,
    onComplete,
    onCancel,
    onWithdraw,
    timeZoneLabel,
    now,
}: {
    session: any;
    isActionLoading: boolean;
    onView: (sessionId: string) => void;
    onComplete: (sessionId: string) => void;
    onCancel: (sessionId: string) => void;
    onWithdraw: (volunteerSlotId: string) => void;
    timeZoneLabel?: string;
    now: dayjs.Dayjs;
}) {
    const statusClass = getStatusPillClass(session.status);
    const statusLabel = getStatusLabel(session.status);
    const isLive = session.status === "accepted" || session.status === "active";
    const isOpen = session.status === "open";
    const bounds = sessionBounds(session, timeZoneLabel);
    const joinStatus = joinState({ status: session.status, meet_link: safeHref(session.meet_link) }, bounds, now);
    // Complete only once the scheduled end has passed (the backend rejects it before that).
    const completable = canCompleteSession(session, bounds, now);
    const level = session.requested_level || session.grade_level || session.expertise_level;
    const showDescription =
        Boolean(session.session_description) && !isRedundantLevelDescription(session.session_description, level);

    const when = formatSessionWhen({
        date: session.volunteer_start_date,
        start: session.volunteer_start_time,
        end: session.volunteer_end_time,
        timeZoneLabel,
    });
    const actionClass = "text-xs font-semibold bg-transparent border-0 p-0 cursor-pointer disabled:opacity-50";

    return (
        <article
            aria-label={session.session_title || "Instant session"}
            className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 flex flex-col gap-1.5 hover:shadow-sm transition-shadow"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{session.session_title || "Instant session"}</h3>
                    <p className="text-sm text-gray-700 break-words">
                        <span className="text-gray-500">Learner: </span>
                        {isOpen ? (
                            <span className="italic text-gray-500">Waiting for a learner to claim</span>
                        ) : session.learner_name ? (
                            <ProfileNameLink role="learner" id={session.learner_id} name={session.learner_name} className="font-semibold" />
                        ) : (
                            <span className="font-semibold text-gray-900">Learner</span>
                        )}
                    </p>
                </div>
                <span className={`${statusClass} shrink-0 rounded-full px-2 py-0.5 text-xs font-medium`}>{statusLabel}</span>
            </div>
            <WhenLine text={when} />
            {showDescription && (
                <p className="text-xs text-gray-600 line-clamp-2 break-words">{session.session_description}</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-0.5">
                {/* created_at is naive UTC - timesAgo parses it as UTC (it used to be read as local). */}
                <span className="text-[11px] text-gray-400">Posted {timesAgo(session.created_at)}</span>
                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                    {isOpen ? (
                        <button
                            className={`${actionClass} text-red-600 hover:text-red-700`}
                            disabled={isActionLoading}
                            onClick={() => onWithdraw(session.session_id)}
                        >
                            Withdraw
                        </button>
                    ) : (
                        <>
                            {isLive && (
                                <>
                                    {completable && (
                                        <button
                                            className={`${actionClass} text-green-700 hover:text-green-800`}
                                            disabled={isActionLoading}
                                            onClick={() => onComplete(session.session_id)}
                                        >
                                            Complete
                                        </button>
                                    )}
                                    <button
                                        className={`${actionClass} text-red-600 hover:text-red-700`}
                                        disabled={isActionLoading}
                                        onClick={() => onCancel(session.session_id)}
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                            <button
                                className={`${actionClass} text-gray-700 underline underline-offset-2 hover:text-gray-900`}
                                disabled={isActionLoading}
                                onClick={() => onView(session.session_id)}
                            >
                                View
                            </button>
                            {/* Always visible on a live session; disabled until 3 minutes before the start. */}
                            <JoinButton state={joinStatus} onClick={() => onView(session.session_id)} />
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function VolunteerInstantSessionsPage() {
    const { confirm: askConfirm, confirmModal } = useConfirm();
    const { setHeaderOptions } = useComponentStore();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isActionLoading, setIsActionLoading] = useState(false);
    // Which detail-modal action is in flight (loading spinner on that button, both disabled).
    const [detailAction, setDetailAction] = useState<"complete" | "cancel" | null>(null);
    const timeZoneLabel = useProfileTimeZone("volunteer");
    const now = useNow();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [sessionDetail, setSessionDetail] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const role = getCookie("role") || "volunteer";

    const [query] = useQueryState("query");
    // Learner names on cards open the learner's profile (?learnerId=).
    const [profileLearnerId, setProfileLearnerId] = useQueryState("learnerId");
    const [debouncedQuery] = useDebounce(query, 400);
    const [requestsPage, setRequestsPage] = useQueryState("requests_page", { defaultValue: "1" });
    const [sessionsPage, setSessionsPage] = useQueryState("sessions_page", { defaultValue: "1" });
    const [sessionsStatus, setSessionsStatus] = useQueryState("sessions_status", { defaultValue: "" });

    useEffect(() => {
        setHeaderOptions({
            title: "Instant Sessions",
            titleIcon: <IoIosArrowBack className="text-lg" />,
            titleIconClick: () => router.push(`/${role}/schedule`),
            searchPlaceholder: "Search",
            showButton: false,
            showTitleButton: true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {
        data: learnerRequestsData,
        isLoading: isLearnerRequestsLoading,
        isFetching: isLearnerRequestsFetching,
        isError: isLearnerRequestsError,
        refetch: refetchLearnerRequests,
    } = useQuery({
        queryKey: ["volunteer-learner-requests", requestsPage, debouncedQuery],
        queryFn: async () => {
            const res = await GET_API(
                endpoints.session.getVolunteerLearnerRequests(Number(requestsPage) || 1, 10, debouncedQuery || undefined)
            );
            return res?.data;
        },
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
    });
    const learnerRequests: any[] = learnerRequestsData?.items ?? [];
    const learnerRequestsTotal: number = learnerRequestsData?.total ?? 0;
    const learnerRequestsHasMore = Number(requestsPage) * 10 < learnerRequestsTotal;

    const {
        data: mySessionsData,
        isLoading: isMySessionsLoading,
        isFetching: isMySessionsFetching,
        isError: isMySessionsError,
        refetch: refetchMySessions,
    } = useQuery({
        queryKey: ["volunteer-my-instant-sessions", sessionsPage, sessionsStatus, debouncedQuery],
        queryFn: async () => {
            const res = await GET_API(
                endpoints.session.getMyInstantSessions(
                    Number(sessionsPage) || 1,
                    12,
                    debouncedQuery || undefined,
                    sessionsStatus || undefined
                )
            );
            return res?.data;
        },
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
    });
    const mySessions: any[] = mySessionsData?.items ?? [];
    const mySessionsTotal: number = mySessionsData?.total ?? 0;
    const mySessionsHasMore = Number(sessionsPage) * 12 < mySessionsTotal;

    const handleAcceptRequest = async (requestId: string) => {
        setIsActionLoading(true);
        try {
            await POST_API(endpoints.session.acceptLearnerRequest(requestId));
            showToast({ message: "Request accepted! A session has been created.", type: "success" });
            invalidateScheduleViews(queryClient, "volunteer");
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't accept the request. Please try again."), type: "error" });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleViewSession = async (sessionId: string) => {
        setIsDetailLoading(true);
        try {
            const res = await GET_API(endpoints.session.getSessionDetail(sessionId));
            setSessionDetail(res?.data);
        } catch (error) {
            showToast({ message: "Couldn't load the session details. Please try again.", type: "error" });
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleCompleteSession = async (sessionId: string) => {
        if (isActionLoading) return;
        if (!(await askConfirm({ title: "Mark as completed", description: "Mark this session as completed? This can't be undone.", confirmText: "Mark as completed", cancelText: "Not yet" }))) return;
        setIsActionLoading(true);
        setDetailAction("complete");
        try {
            await PUT_API(endpoints.session.markAsCompleted(sessionId), {});
            showToast({ message: "Session marked as completed", type: "success" });
            invalidateScheduleViews(queryClient, "volunteer");
            setSessionDetail(null);
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't complete the session. Please try again."), type: "error" });
        } finally {
            setIsActionLoading(false);
            setDetailAction(null);
        }
    };

    const handleWithdrawOpenSession = async (volunteerSlotId: string) => {
        if (!(await askConfirm({ title: "Withdraw session", description: "Withdraw this open instant session? Learners will no longer see it.", confirmText: "Withdraw", cancelText: "Keep it", danger: true }))) return;
        setIsActionLoading(true);
        try {
            await DELETE_API(endpoints.session.withdrawInstantSession(volunteerSlotId));
            showToast({ message: "Instant session withdrawn", type: "success" });
            invalidateScheduleViews(queryClient, "volunteer");
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't withdraw the session. Please try again."), type: "error" });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelSession = async (sessionId: string) => {
        if (isActionLoading) return;
        if (!(await askConfirm({ title: "Cancel session", description: "Are you sure you want to cancel this session?", confirmText: "Cancel session", cancelText: "Keep it", danger: true }))) return;
        setIsActionLoading(true);
        setDetailAction("cancel");
        try {
            await PUT_API(endpoints.session.cancelSession(sessionId), { status: "cancelled" });
            showToast({ message: "Session cancelled", type: "success" });
            invalidateScheduleViews(queryClient, "volunteer");
            setSessionDetail(null);
        } catch (error: any) {
            showToast({ message: getApiErrorMessage(error, "Couldn't cancel the session. Please try again."), type: "error" });
        } finally {
            setIsActionLoading(false);
            setDetailAction(null);
        }
    };

    const detailBounds = sessionDetail ? sessionBounds(sessionDetail, timeZoneLabel) : null;
    const detailJoinHref = safeHref(sessionDetail?.meet_link);

    const isLoading = isLearnerRequestsLoading || isMySessionsLoading;

    if (isLoading && learnerRequests.length === 0 && mySessions.length === 0) {
        return (
            <div className="h-full w-full flex-center">
                <LottieLoader isLoading={isLoading} />
            </div>
        );
    }

    return (
        <div className="h-full animate-fadeIn p-4 lg:p-6 overflow-y-auto relative">
            {confirmModal}
            <LearnerViewModal isOpen={!!profileLearnerId} onClose={() => setProfileLearnerId(null)} />
            {(isLearnerRequestsFetching || isMySessionsFetching || isActionLoading) && (
                <div className="fixed top-4 right-4 z-20 bg-white rounded-full shadow-md p-2">
                    <Spin size="small" />
                </div>
            )}

            <div className="flex flex-col items-center text-center gap-2 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Instant Sessions</h1>
                <p className="text-sm text-gray-500 max-w-2xl">
                    Instant Sessions are sessions available <strong>today or tomorrow.</strong> You
                    can post an Instant Session for learners to join, or accept a session a learner
                    has requested.
                </p>
            </div>

            <NewEventModal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSubmit={() => {
                    setShowCreateForm(false);
                    // A posted session also shows on the Schedule calendar and dashboard - keep
                    // those caches in sync too, instead of leaving them stale until their poll.
                    invalidateScheduleViews(queryClient, "volunteer");
                }}
            />

            {/* My Posted Instant Sessions (sessions this volunteer started or accepted) - shown first */}
            <div className="mb-10">
                {/* Title left; "+ Start a New Session" and the status filter side by side on
                    the right. On narrow phones the pair wraps under the title as one row and
                    the dropdown shrinks rather than dropping to a third line / overflowing. */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                    <h2 className="md:text-[20px] text-[16px] font-medium text-[#121212]">
                        My Posted Instant Sessions
                    </h2>
                    <div className="flex items-center justify-end gap-3 ml-auto min-w-0 max-w-full">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className={`${START_SESSION_BTN_CLASS} ${SECTION_CONTROL_HEIGHT} !py-0 max-sm:!px-4 inline-flex items-center shrink-0 whitespace-nowrap`}
                        >
                            + Start a New Session
                        </button>
                        <select
                            aria-label="Filter by status"
                            className={`${SECTION_CONTROL_HEIGHT} min-w-0 flex-1 sm:flex-none px-3 border border-gray-200 rounded-xl text-sm bg-white`}
                            value={sessionsStatus || ""}
                            onChange={(e) => {
                                setSessionsStatus(e.target.value || null);
                                setSessionsPage("1");
                            }}
                        >
                            {MY_SESSIONS_STATUS_FILTERS.map((s) => (
                                <option key={s} value={s}>
                                    {s ? getStatusLabel(s) : "All statuses"}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {isMySessionsError && !mySessionsData ? (
                    <QueryErrorNotice message="Couldn't load your instant sessions." onRetry={() => refetchMySessions()} />
                ) : mySessions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="text-5xl mb-4">📺</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Instant Sessions</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Sessions you start or accept will show up here
                        </p>
                        <button onClick={() => setShowCreateForm(true)} className={START_SESSION_BTN_CLASS}>
                            Start a New Session
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {mySessions.map((session) => (
                                <MySessionCard
                                    key={session.session_id}
                                    session={session}
                                    isActionLoading={isActionLoading}
                                    onView={handleViewSession}
                                    onComplete={handleCompleteSession}
                                    onCancel={handleCancelSession}
                                    onWithdraw={handleWithdrawOpenSession}
                                    timeZoneLabel={timeZoneLabel}
                                    now={now}
                                />
                            ))}
                        </div>
                        {(Number(sessionsPage) > 1 || mySessionsHasMore) && (
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    className="text-sm font-medium disabled:opacity-40"
                                    disabled={Number(sessionsPage) <= 1}
                                    onClick={() => setSessionsPage(String(Number(sessionsPage) - 1))}
                                >
                                    Previous
                                </button>
                                <button
                                    className="text-sm font-medium disabled:opacity-40"
                                    disabled={!mySessionsHasMore}
                                    onClick={() => setSessionsPage(String(Number(sessionsPage) + 1))}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Instant Sessions requested by Learners (open learner requests any volunteer can accept) */}
            <div>
                <h2 className="md:text-[20px] text-[16px] font-medium text-[#121212] mb-4">
                    Instant Sessions requested by Learners
                </h2>
                {isLearnerRequestsError && !learnerRequestsData ? (
                    <QueryErrorNotice message="Couldn't load learner requests." onRetry={() => refetchLearnerRequests()} />
                ) : learnerRequests.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {learnerRequests.map((req) => (
                                <LearnerRequestCard
                                    key={req.request_id}
                                    req={req}
                                    isActionLoading={isActionLoading}
                                    onAccept={handleAcceptRequest}
                                />
                            ))}
                        </div>
                        {(Number(requestsPage) > 1 || learnerRequestsHasMore) && (
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
                                    disabled={!learnerRequestsHasMore}
                                    onClick={() => setRequestsPage(String(Number(requestsPage) + 1))}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-6">No open learner requests right now.</p>
                )}
            </div>

            <CenterModal
                isOpen={Boolean(sessionDetail) && !isDetailLoading}
                onClose={() => setSessionDetail(null)}
                title={sessionDetail?.session_title ?? "Session Details"}
                width={520}
                footerComponent={
                    <div className="w-full flex gap-3">
                        <Button
                            title="Close"
                            btnVariant="outline"
                            customClassName="flex-1"
                            onClick={() => setSessionDetail(null)}
                        />
                        {sessionDetail && detailJoinHref && (
                            <JoinButton
                                variant="block"
                                state={joinState({ status: sessionDetail.status, meet_link: detailJoinHref }, detailBounds, now)}
                                href={detailJoinHref}
                                wrapperClassName="flex-1"
                            />
                        )}
                        {sessionDetail?.status && !["completed", "cancelled", "expired"].includes(sessionDetail.status) && (
                            <>
                                {/* Only once the scheduled end has passed (backend-enforced). */}
                                {canCompleteSession(sessionDetail, detailBounds, now) && (
                                    <Button
                                        title="Complete"
                                        btnVariant="primary"
                                        customClassName="flex-1"
                                        loading={detailAction === "complete"}
                                        disabled={isActionLoading}
                                        onClick={() => handleCompleteSession(sessionDetail.session_id)}
                                    />
                                )}
                                <Button
                                    title="Cancel"
                                    btnVariant="tertiary"
                                    customClassName="!bg-white !text-red-600 !border !border-red-200 flex-1"
                                    loading={detailAction === "cancel"}
                                    disabled={isActionLoading}
                                    onClick={() => handleCancelSession(sessionDetail.session_id)}
                                />
                            </>
                        )}
                    </div>
                }
            >
                {sessionDetail && (
                    <div className="flex flex-col gap-3 text-sm text-[#121212]">
                        {sessionDetail.session_description &&
                            !isRedundantLevelDescription(sessionDetail.session_description, sessionDetail.requested_level) && (
                                <p>{sessionDetail.session_description}</p>
                            )}
                        <p>
                            <span className="font-medium">When: </span>
                            {formatSessionWhen({
                                date: sessionDetail.volunteer_start_date,
                                start: sessionDetail.volunteer_start_time,
                                end: sessionDetail.volunteer_end_time,
                                timeZoneLabel,
                            })}
                        </p>
                        <JoinOpensNote
                            status={sessionDetail.status}
                            meetLink={detailJoinHref}
                            bounds={detailBounds}
                            now={now}
                        />
                        {sessionDetail.learner_full_name && (
                            <p>
                                <span className="font-medium">Learner: </span>
                                <ProfileNameLink
                                    role="learner"
                                    id={sessionDetail.learner_id}
                                    name={sessionDetail.learner_full_name}
                                />
                            </p>
                        )}
                    </div>
                )}
            </CenterModal>
        </div>
    );
}
