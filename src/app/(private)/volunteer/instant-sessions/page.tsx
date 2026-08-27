"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useComponentStore } from "@/store/useComponenetStore";
import { IoIosArrowBack } from "react-icons/io";
import { POST_API, GET_API, PUT_API } from "@/api/request";
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
import { useDebounce } from "use-debounce";
import dayjs from "dayjs";

// NewEventModal pulls in @mui/x-date-pickers - defer it to its own chunk.
const NewEventModal = dynamic(() => import("@/components/schedule/Modals/NewEventModal"), { ssr: false });

const REQUEST_STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    expired: "Expired",
};

const REQUEST_STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-500",
};

const MY_SESSIONS_STATUS_FILTERS = ["", "accepted", "active", "completed", "cancelled", "expired"];

function getTimeAgo(dateString?: string): string {
    if (!dateString) return "";
    const diffMins = dayjs().diff(dayjs(dateString), "minute");
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
}

function LearnerRequestCard({ req, isActionLoading, onAccept }: { req: any; isActionLoading: boolean; onAccept: (id: string) => void }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{req.learner_name}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Pending Request</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Type: {req.session_type === "academic" ? "Academic" : "Arts & Life Skills"}</p>
            <p className="text-sm text-gray-600 mb-2">Level: {req.grade_level || req.expertise_level || "N/A"}</p>
            {Array.isArray(req.skills) && req.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {req.skills.map((skill: string) => (
                        <TagComponent
                            key={skill}
                            text={skill}
                            tagClassName="!bg-blue-50 !border-none !text-blue-700 !px-2 !py-0.5 !text-[10px] capitalize"
                        />
                    ))}
                </div>
            )}
            {req.session_details && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{req.session_details}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-medium">
                    {dayjs(req.availability_date).format("MMM D")} @{" "}
                    {dayjs(req.availability_start_time, "HH:mm").format("h:mm a")}
                </span>
                <span className="text-gray-400">({req.duration} mins)</span>
            </div>
            <div className="mt-4 flex justify-end">
                <button
                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    disabled={isActionLoading}
                    onClick={() => onAccept(req.request_id)}
                >
                    Accept Request
                </button>
            </div>
        </div>
    );
}

function MySessionCard({
    session,
    isActionLoading,
    onView,
    onComplete,
    onCancel,
}: {
    session: any;
    isActionLoading: boolean;
    onView: (sessionId: string) => void;
    onComplete: (sessionId: string) => void;
    onCancel: (sessionId: string) => void;
}) {
    const statusClass = REQUEST_STATUS_STYLES[session.status] ?? "bg-gray-100 text-gray-700";
    const statusLabel = REQUEST_STATUS_LABELS[session.status] ?? session.status;
    const isLive = session.status === "accepted" || session.status === "active";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow p-5">
            <div className="flex items-center justify-between mb-3">
                <span className={`${statusClass} text-xs px-2 py-1 rounded-full font-medium`}>{statusLabel}</span>
                <span className="text-xs text-gray-400">{getTimeAgo(session.created_at)}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                    {session.learner_name?.charAt(0)?.toUpperCase() || "L"}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{session.learner_name || "Learner"}</h4>
                    <p className="text-xs text-gray-500">{session.session_title}</p>
                </div>
            </div>
            {session.session_description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{session.session_description}</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50 mb-3">
                <span className="text-xs text-gray-400">
                    {session.volunteer_start_date} {session.volunteer_start_time}
                </span>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
                <button
                    className="text-primary text-xs font-medium hover:opacity-80 disabled:opacity-50"
                    disabled={isActionLoading}
                    onClick={() => onView(session.session_id)}
                >
                    {isLive ? "Join" : "View"}
                </button>
                {isLive && (
                    <>
                        <button
                            className="text-green-700 text-xs font-medium hover:text-green-800 disabled:opacity-50"
                            disabled={isActionLoading}
                            onClick={() => onComplete(session.session_id)}
                        >
                            Complete
                        </button>
                        <button
                            className="text-red-600 text-xs font-medium hover:text-red-700 disabled:opacity-50"
                            disabled={isActionLoading}
                            onClick={() => onCancel(session.session_id)}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VolunteerInstantSessionsPage() {
    const { setHeaderOptions } = useComponentStore();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [sessionDetail, setSessionDetail] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const role = getCookie("role") || "volunteer";

    const [query] = useQueryState("query");
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
            queryClient.invalidateQueries({ queryKey: ["volunteer-learner-requests"] });
            queryClient.invalidateQueries({ queryKey: ["volunteer-my-instant-sessions"] });
        } catch (error: any) {
            showToast({ message: error?.response?.data?.detail || "Failed to accept request", type: "error" });
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
            showToast({ message: "Failed to load session details", type: "error" });
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleCompleteSession = async (sessionId: string) => {
        setIsActionLoading(true);
        try {
            await PUT_API(endpoints.session.markAsCompleted(sessionId), {});
            showToast({ message: "Session marked as completed", type: "success" });
            queryClient.invalidateQueries({ queryKey: ["volunteer-my-instant-sessions"] });
            setSessionDetail(null);
        } catch (error: any) {
            showToast({ message: error?.response?.data?.detail || "Failed to complete session", type: "error" });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelSession = async (sessionId: string) => {
        if (!confirm("Are you sure you want to cancel this session?")) return;
        setIsActionLoading(true);
        try {
            await PUT_API(endpoints.session.cancelSession(sessionId), { status: "cancelled" });
            showToast({ message: "Session cancelled", type: "success" });
            queryClient.invalidateQueries({ queryKey: ["volunteer-my-instant-sessions"] });
            setSessionDetail(null);
        } catch (error: any) {
            showToast({ message: error?.response?.data?.detail || "Failed to cancel session", type: "error" });
        } finally {
            setIsActionLoading(false);
        }
    };

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
            {(isLearnerRequestsFetching || isMySessionsFetching || isActionLoading) && (
                <div className="fixed top-4 right-4 z-20 bg-white rounded-full shadow-md p-2">
                    <Spin size="small" />
                </div>
            )}

            <div className="flex flex-col items-center text-center gap-2 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Instant Sessions</h1>
                <p className="text-sm text-gray-500 max-w-2xl">
                    Start a live session for learners to join instantly
                </p>
            </div>

            <NewEventModal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSubmit={() => {
                    setShowCreateForm(false);
                    refetchMySessions();
                    // This modal is also opened from the Schedule page - keep that page's
                    // calendar in sync too, instead of leaving it stale until its own poll.
                    queryClient.invalidateQueries({ queryKey: ["volunteer-events"] });
                }}
            />

            {/* My Sessions */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="md:text-[20px] text-[16px] font-medium text-[#121212]">My Sessions</h2>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        + Start Instant Session
                    </button>
                </div>

                <div className="flex justify-end mb-4">
                    <select
                        className="h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white"
                        value={sessionsStatus || ""}
                        onChange={(e) => {
                            setSessionsStatus(e.target.value || null);
                            setSessionsPage("1");
                        }}
                    >
                        {MY_SESSIONS_STATUS_FILTERS.map((s) => (
                            <option key={s} value={s}>
                                {s ? REQUEST_STATUS_LABELS[s] : "All statuses"}
                            </option>
                        ))}
                    </select>
                </div>

                {mySessions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div className="text-5xl mb-4">📺</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Instant Sessions</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Sessions you start or accept will show up here
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Start Instant Session
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {mySessions.map((session) => (
                                <MySessionCard
                                    key={session.session_id}
                                    session={session}
                                    isActionLoading={isActionLoading}
                                    onView={handleViewSession}
                                    onComplete={handleCompleteSession}
                                    onCancel={handleCancelSession}
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

            {/* Available Learner Requests */}
            <div>
                <h2 className="md:text-[20px] text-[16px] font-medium text-[#121212] mb-4">
                    Available Learner Requests
                </h2>
                {learnerRequests.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            btnVariant="tertiary"
                            customClassName="!bg-white !text-black !border !border-gray-300 flex-1"
                            onClick={() => setSessionDetail(null)}
                        />
                        {sessionDetail?.meet_link && (
                            <a href={sessionDetail.meet_link} target="_blank" rel="noopener noreferrer" className="flex-1">
                                <Button title="Join" btnVariant="secondary" customClassName="w-full" />
                            </a>
                        )}
                        {sessionDetail?.status && !["completed", "cancelled", "expired"].includes(sessionDetail.status) && (
                            <>
                                <Button
                                    title="Complete"
                                    btnVariant="secondary"
                                    customClassName="flex-1"
                                    onClick={() => handleCompleteSession(sessionDetail.session_id)}
                                />
                                <Button
                                    title="Cancel"
                                    btnVariant="tertiary"
                                    customClassName="!bg-white !text-red-600 !border !border-red-200 flex-1"
                                    onClick={() => handleCancelSession(sessionDetail.session_id)}
                                />
                            </>
                        )}
                    </div>
                }
            >
                {sessionDetail && (
                    <div className="flex flex-col gap-3 text-sm text-[#121212]">
                        {sessionDetail.session_description && <p>{sessionDetail.session_description}</p>}
                        <p>
                            <span className="font-medium">When: </span>
                            {sessionDetail.volunteer_start_date} {sessionDetail.volunteer_start_time} -{" "}
                            {sessionDetail.volunteer_end_time}
                        </p>
                        {sessionDetail.learner_full_name && (
                            <p>
                                <span className="font-medium">Learner: </span>
                                {sessionDetail.learner_full_name}
                            </p>
                        )}
                    </div>
                )}
            </CenterModal>
        </div>
    );
}
