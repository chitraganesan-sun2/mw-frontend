"use client";

import { endpoints } from "@/api/constants";
import { GET_API, POST_API } from "@/api/request";
import LottieLoader from "@/components/common/Loader/Lottie";
import { callbackToast, showToast } from "@/components/common/Toast";
import VolunteerCard from "@/components/learners/VolunteerCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useRef } from "react";
import { formatProfileTimestamp } from "@/utils/sessionDisplay";
import { useProfileTimeZone } from "@/hooks/schedule/useProfileTimeZone";
import { joinNames } from "@/utils/joinNames";

interface MatchRecord {
    match_id: string;
    volunteer_id: string | null;
    status: "notified" | "no_match_found";
    analytical_score: number;
    compatibility_score: number;
    combined_score: number;
    created_at: string;
}

/**
 * The learner's match dashboard: latest volunteer match, "Find My Volunteer", history.
 * Rendered as the "My Matches" tab of Seek Volunteer (/learner/volunteer) (?tab=matches); that page owns
 * the profile modal (opened through the same ?volunteerId query param).
 */
export default function LearnerMatchesPanel() {
    const queryClient = useQueryClient();
    // History dates in the PROFILE timezone (with its abbreviation), not the browser's.
    const timeZoneLabel = useProfileTimeZone("learner");
    const [, setVolunteerId] = useQueryState("volunteerId");

    const { data: historyData, isLoading: isHistoryLoading } = useQuery({
        queryKey: ["learnerMatchHistory"],
        queryFn: async () => {
            const response: any = await GET_API(endpoints.learner.matchHistory);
            return response.data;
        },
    });

    const matches: MatchRecord[] = historyData?.items ?? [];
    const latestMatch = matches[0];

    const { data: matchedVolunteer, isLoading: isVolunteerLoading } = useQuery({
        queryKey: ["matchedVolunteer", latestMatch?.volunteer_id],
        queryFn: async () => {
            const response: any = await GET_API(
                endpoints.volunteer.getIndividualVolunteer(latestMatch!.volunteer_id as string)
            );
            return response.data;
        },
        enabled: !!latestMatch?.volunteer_id && latestMatch?.status === "notified",
    });

    // The header action button config has no disabled state and is registered once, so
    // guard against concurrent triggers here - a match run is an expensive server scan.
    const isTriggeringRef = useRef(false);

    const triggerMutation = useMutation({
        mutationFn: async () => {
            const response: any = await POST_API(endpoints.learner.matchTrigger);
            return response.data as MatchRecord;
        },
        onMutate: () => {
            isTriggeringRef.current = true;
        },
        onSettled: () => {
            isTriggeringRef.current = false;
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["learnerMatchHistory"] });
            if (result.status === "no_match_found") {
                showToast({
                    type: "info",
                    message: "No eligible volunteer match found right now — check back later!",
                });
            }
        },
    });

    const handleFindMatch = () => {
        if (isTriggeringRef.current) return;
        callbackToast({
            apiCall: triggerMutation.mutateAsync(),
            loadingMsg: "Finding your best volunteer match...",
            successMsg: "Match complete!",
            errorMsg: "Couldn't find a match right now.",
        });
    };

    const handleSeeMoreClick = (id: string) => {
        setVolunteerId(id);
    };



    return (
        <div className="animate-fadeIn p-5 lg:p-10">

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold">Your Match</h2>
                <button
                    type="button"
                    onClick={handleFindMatch}
                    disabled={triggerMutation.isPending}
                    className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                    Find My Volunteer
                </button>
            </div>

            {isHistoryLoading ? (
                <LottieLoader isLoading={true} />
            ) : !latestMatch ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-light">
                    You haven&apos;t requested a match yet. Click &quot;Find My Volunteer&quot; above to get started!
                </div>
            ) : latestMatch.status === "no_match_found" ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-light">
                    No eligible volunteer match was found on your last request. Try again later as more volunteers join!
                </div>
            ) : isVolunteerLoading || !matchedVolunteer ? (
                <LottieLoader isLoading={true} />
            ) : (
                <div className="max-w-md">
                    <VolunteerCard
                        onSeeMoreClick={handleSeeMoreClick}
                        volunteerId={matchedVolunteer.volunteer_id}
                        profileImage={matchedVolunteer.profile_picture?.image_url}
                        name={joinNames(matchedVolunteer.volunteer_first_name, matchedVolunteer.volunteer_last_name)}
                        location={matchedVolunteer.country}
                        volunteerHrs={matchedVolunteer.total_volunteered_hours?.toString()}
                        studentConnected={matchedVolunteer.students_connected?.toString()}
                        subjects={matchedVolunteer.volunteer_subjects?.map((s: any) => s.subject_name)}
                        languages={matchedVolunteer.volunteer_languages?.map((l: any) => l.language_name)}
                        totalReviews={matchedVolunteer.total_reviews}
                        overallRating={matchedVolunteer.overall_rating}
                        chatPermission={matchedVolunteer.chat_permission}
                    />
                </div>
            )}

            {matches.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-base font-semibold mb-3">Match History</h3>
                    <div className="bg-white rounded-xl divide-y divide-stroke">
                        {matches.map((m) => (
                            <div key={m.match_id} className="flex items-center justify-between p-4 text-sm">
                                <span>{formatProfileTimestamp(m.created_at, timeZoneLabel)}</span>
                                <span className={m.status === "notified" ? "text-success" : "text-gray-light"}>
                                    {m.status === "notified" ? "Matched" : "No match found"}
                                </span>
                                {m.status === "notified" && (
                                    <span className="text-gray-light">Score: {m.combined_score.toFixed(1)}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
