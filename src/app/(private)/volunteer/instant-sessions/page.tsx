"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useComponentStore } from "@/store/useComponenetStore";
import { IoIosArrowBack } from "react-icons/io";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import Cookies from "js-cookie";
import LottieLoader from "@/components/common/Loader/Lottie";

// NewEventModal pulls in @mui/x-date-pickers - defer it to its own chunk.
const NewEventModal = dynamic(() => import("@/components/schedule/Modals/NewEventModal"), { ssr: false });

interface InstantSession {
    session_id: string;
    volunteer_id: string;
    volunteer_name: string;
    volunteer_photo?: string;
    subject: string;
    skills: string[];
    description: string;
    duration_minutes: number;
    status: string;
    created_at: string;
    learners_joined?: number;
}

export default function VolunteerInstantSessionsPage() {
    const { setHeaderOptions } = useComponentStore();
    const router = useRouter();
    const [sessions, setSessions] = useState<InstantSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const role = Cookies.get("role") || "volunteer";

    useEffect(() => {
        setHeaderOptions({
            title: "Instant Sessions",
            titleIcon: <IoIosArrowBack className="text-lg" />,
            titleIconClick: () => router.push(`/${role}/schedule`),
            showButton: false,
            showTitleButton: true,
            hideSearch: true,
        });
    }, []);

    const loadSessions = useCallback(async () => {
        try {
            const response = await GET_API(endpoints.session.getInstantSessions);
            setSessions(response?.data || []);
        } catch (error) {
            console.error("Failed to load instant sessions:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSessions();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadSessions, 30000);
        return () => clearInterval(interval);
    }, [loadSessions]);

    if (isLoading) {
        return (
            <div className="h-full w-full flex-center">
                <LottieLoader isLoading={isLoading} />
            </div>
        );
    }

    return (
        <div className="h-full animate-fadeIn p-4 lg:p-6 overflow-y-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Instant Sessions</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Start a live session for learners to join instantly
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    + Start Instant Session
                </button>
            </div>

            <NewEventModal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSubmit={loadSessions}
            />

            {/* Live Indicator */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-gray-900">LIVE</span>
                    </div>
                    <span className="text-sm text-gray-500">
                        {sessions.filter(s => s.status === "live").length} active session{sessions.filter(s => s.status === "live").length !== 1 ? "s" : ""}
                    </span>
                </div>
                <button
                    onClick={loadSessions}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                    Refresh
                </button>
            </div>

            {/* Sessions Grid */}
            {sessions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="text-5xl mb-4">📺</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Active Instant Sessions
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Start an instant session to connect with learners right away
                    </p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        Start Instant Session
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sessions.map((session) => (
                        <SessionCard key={session.session_id} session={session} />
                    ))}
                </div>
            )}
        </div>
    );
}

function SessionCard({ session }: { session: InstantSession }) {
    const timeAgo = getTimeAgo(session.created_at);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow p-5">
            {/* Status */}
            <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    LIVE NOW
                </span>
                <span className="text-xs text-gray-400">{timeAgo}</span>
            </div>

            {/* Volunteer Info */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                    {session.volunteer_name?.charAt(0)?.toUpperCase() || "V"}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{session.volunteer_name}</h4>
                    <p className="text-xs text-gray-500">{session.subject}</p>
                </div>
            </div>

            {/* Skills */}
            {session.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {session.skills.slice(0, 3).map((skill) => (
                        <span
                            key={skill}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded-full font-medium"
                        >
                            {skill}
                        </span>
                    ))}
                    {session.skills.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{session.skills.length - 3} more</span>
                    )}
                </div>
            )}

            {/* Description */}
            {session.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{session.description}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">{session.duration_minutes} min</span>
                <span className="text-xs text-gray-400">{session.learners_joined || 0} joined</span>
            </div>
        </div>
    );
}

function getTimeAgo(dateString: string): string {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
}
