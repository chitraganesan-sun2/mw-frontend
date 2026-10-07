"use client";

import { endpoints } from "@/api/constants";
import { GET_API, POST_API } from "@/api/request";
import LottieLoader from "@/components/common/Loader/Lottie";
import { callbackToast, showToast } from "@/components/common/Toast";
import LearnerCard from "@/components/learners/LearnerCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useRef } from "react";
import { formatUtcTimestamp } from "@/utils/timeFunctions";
import { joinNames } from "@/utils/joinNames";

interface MatchRecord {
    match_id: string;
    learner_id: string | null;
    status: "notified" | "no_match_found";
    analytical_score: number;
    compatibility_score: number;
    combined_score: number;
    created_at: string;
}

/**
 * The volunteer's match dashboard: latest learner match, "Find My Learner", history.
 * Rendered as the "My Matches" tab of Learners (/volunteer/learners) (?tab=matches); that page owns
 * the profile modal (opened through the same ?learnerId query param).
 */
export default function VolunteerMatchesPanel() {
    const queryClient = useQueryClient();
    const [, setLearnerId] = useQueryState("learnerId");

    const { data: historyData, isLoading: isHistoryLoading } = useQuery({
        queryKey: ["volunteerMatchHistory"],
        queryFn: async () => {
            const response: any = await GET_API(endpoints.volunteer.matchHistory);
            return response.data;
        },
    });

    const matches: MatchRecord[] = historyData?.items ?? [];
    const latestMatch = matches[0];

    const { data: matchedLearner, isLoading: isLearnerLoading } = useQuery({
        queryKey: ["matchedLearner", latestMatch?.learner_id],
        queryFn: async () => {
            const response: any = await GET_API(
                endpoints.learner.getIndividualLearner(latestMatch!.learner_id as string)
            );
            return response.data;
        },
        enabled: !!latestMatch?.learner_id && latestMatch?.status === "notified",
    });

    // The header action button config has no disabled state and is registered once, so
    // guard against concurrent triggers here - a match run is an expensive server scan.
    const isTriggeringRef = useRef(false);

    const triggerMutation = useMutation({
        mutationFn: async () => {
            const response: any = await POST_API(endpoints.volunteer.matchTrigger);
            return response.data as MatchRecord;
        },
        onMutate: () => {
            isTriggeringRef.current = true;
        },
        onSettled: () => {
            isTriggeringRef.current = false;
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["volunteerMatchHistory"] });
            if (result.status === "no_match_found") {
                showToast({
                    type: "info",
                    message: "No eligible learner match found right now — check back later!",
                });
            }
        },
    });

    const handleFindMatch = () => {
        if (isTriggeringRef.current) return;
        callbackToast({
            apiCall: triggerMutation.mutateAsync(),
            loadingMsg: "Finding your best learner match...",
            successMsg: "Match complete!",
            errorMsg: "Couldn't find a match right now.",
        });
    };

    const handleSeeMoreClick = (id: string) => {
        setLearnerId(id);
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
                    Find My Learner
                </button>
            </div>

            {isHistoryLoading ? (
                <LottieLoader isLoading={true} />
            ) : !latestMatch ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-light">
                    You haven&apos;t requested a match yet. Click &quot;Find My Learner&quot; above to get started!
                </div>
            ) : latestMatch.status === "no_match_found" ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-light">
                    No eligible learner match was found on your last request. Try again later as more learners join!
                </div>
            ) : isLearnerLoading || !matchedLearner ? (
                <LottieLoader isLoading={true} />
            ) : (
                <div className="max-w-md">
                    <LearnerCard
                        onSeeMoreClick={handleSeeMoreClick}
                        learnerId={matchedLearner.learner_id}
                        profileImage={matchedLearner.profile_picture?.image_url}
                        name={joinNames(matchedLearner.learner_personal_info?.learner_first_name, matchedLearner.learner_personal_info?.learner_last_name)}
                        location={matchedLearner.country}
                        learnerHrs={matchedLearner.total_attended_hours?.toString()}
                        studentConnected={matchedLearner.total_volunteers_connected?.toString()}
                        subjects={matchedLearner.learner_subjects?.map((s: any) => s.subject_name)}
                        languages={matchedLearner.learner_personal_info?.learner_primary_language}
                        totalReviews={matchedLearner.total_reviews}
                        overallRating={matchedLearner.overall_rating}
                        chatPermission={matchedLearner.chat_permission}
                        developementDisability={
                            matchedLearner.learner_special_needs?.type_of_developmental_disability
                        }
                    />
                </div>
            )}

            {matches.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-base font-semibold mb-3">Match History</h3>
                    <div className="bg-white rounded-xl divide-y divide-stroke">
                        {matches.map((m) => (
                            <div key={m.match_id} className="flex items-center justify-between p-4 text-sm">
                                <span>{formatUtcTimestamp(m.created_at)}</span>
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
