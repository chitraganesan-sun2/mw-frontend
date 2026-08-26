"use client";

import { endpoints } from "@/api/constants";
import { GET_API, POST_API } from "@/api/request";
import LottieLoader from "@/components/common/Loader/Lottie";
import { callbackToast, showToast } from "@/components/common/Toast";
import LearnerCard from "@/components/learners/LearnerCard";
import LearnerViewModal from "@/components/volunteers/Modals/LearnerViewModal";
import { getHeaderIcon } from "@/layouts/helper";
import { useComponentStore } from "@/store/useComponenetStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

interface MatchRecord {
    match_id: string;
    learner_id: string | null;
    status: "notified" | "no_match_found";
    analytical_score: number;
    compatibility_score: number;
    combined_score: number;
    created_at: string;
}

export default function VolunteerDashboardPage() {
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const [learnerId, setLearnerId] = useQueryState("learnerId");
    const [modalQuery, setModalQuery] = useQueryState("modal");

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

    const triggerMutation = useMutation({
        mutationFn: async () => {
            const response: any = await POST_API(endpoints.volunteer.matchTrigger);
            return response.data as MatchRecord;
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

    const handleCloseModal = () => {
        setLearnerId(null);
        setModalQuery(null);
    };

    useEffect(() => {
        setHeaderOptions({
            title: "My Dashboard",
            titleIcon: getHeaderIcon(pathname),
            hideSearch: true,
            actionButtons: [
                {
                    buttonTitle: "Find My Learner",
                    buttonOnClick: handleFindMatch,
                    buttonPlacement: "right",
                    showButton: true,
                },
            ],
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, setHeaderOptions]);

    return (
        <div className="h-full animate-fadeIn p-5 lg:p-10">
            <LearnerViewModal isOpen={!!learnerId && modalQuery !== "add_new_meeting"} onClose={handleCloseModal} />

            <h2 className="text-lg font-semibold mb-4">Your Match</h2>

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
                        name={`${matchedLearner.learner_personal_info?.learner_first_name} ${matchedLearner.learner_personal_info?.learner_last_name}`}
                        location={matchedLearner.country}
                        learnerHrs={matchedLearner.total_attended_hours?.toString()}
                        studentConnected={matchedLearner.total_volunteers_connected?.toString()}
                        subjects={[]}
                        languages={matchedLearner.learner_personal_info?.learner_primary_language}
                        totalReviews=""
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
                                <span>{new Date(m.created_at).toLocaleString()}</span>
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
