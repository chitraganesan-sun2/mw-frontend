"use client";

import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import LottieLoader from "@/components/common/Loader/Lottie";
import Pagination from "@/components/common/Pagination";
import LearnerCard from "@/components/learners/LearnerCard";
import LearnerFilterModal from "@/components/learners/Modals/LearnerFilter";
import AddNewMeetingModalVolunteer from "@/components/schedule/Modals/AddNewMeetingModalVolunteer";
import LearnerViewModal from "@/components/volunteers/Modals/LearnerViewModal";
import { getHeaderIcon } from "@/layouts/helper";
import { useComponentStore } from "@/store/useComponenetStore";
import InnerWidth from "@/utils/innerWidth";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { RiFilter3Line } from "react-icons/ri";
import { useDebounce } from "use-debounce";
import { PAGINATION } from "@/definitions";
import { cn } from "@/utils/merge-class";

interface LearnerCardData {
    learnerId: string;
    profileImage: string;
    name: string;
    location: string;
    learnerHrs: string;
    studentConnected: string;
    subjects: string[];
    languages: string;
    totalReviews: string;
    overallRating: string;
    developementDisability: string;
    expected_goals: string;
    skill_ids: string;
    skillsToLearn?: Array<{
        skill_name: string;
        skill_id: string;
    }>;
}

export default function LearnersPage() {
    const { setHeaderOptions } = useComponentStore();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [learnerCardData, setLearnerCardData] = useState<LearnerCardData[]>([]);
    const [isOpenSchedule, setIsOpenSchedule] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [size] = useQueryState("size", { defaultValue: PAGINATION as string });
    const [page] = useQueryState("page", { defaultValue: "1" });
    const [searchQuery, setSearchQuery] = useQueryState("query");
    const [learner_primary_language] = useQueryState("learner_primary_language");
    const [type_of_developmental_disability] = useQueryState("type_of_developmental_disability");
    const [areas_of_support_needed] = useQueryState("areas_of_support_needed");
    const [academic_strengths] = useQueryState("academic_strengths");
    const [academic_challenges] = useQueryState("academic_challenges");
    const [behavioral_concerns] = useQueryState("behavioral_concerns");
    const [techniques_to_calm] = useQueryState("techniques_to_calm");
    const [skill_ids] = useQueryState("skill_ids");
    const [expected_goals] = useQueryState("expected_goals");
    const [learnerId, setLearnerId] = useQueryState("learnerId");
    const [modalQuery, setModalQuery] = useQueryState("modal");

    const isMobileScreen = InnerWidth() < 768;

    const [query] = useDebounce(searchQuery, 500);
    const { data, isLoading, isError } = useQuery({
        queryKey: [
            "volunteer",
            query,
            page,
            size,
            learner_primary_language,
            type_of_developmental_disability,
            areas_of_support_needed,
            academic_strengths,
            academic_challenges,
            behavioral_concerns,
            techniques_to_calm,
            skill_ids,
            expected_goals,
        ],
        queryFn: async () => {
            const params: Record<string, string> = {
                query: query ?? "",
                page: page ?? "1",
                size: size ?? String(PAGINATION ?? 10),
            };

            // Only add parameters if they have values
            if (learner_primary_language)
                params.learner_primary_language = learner_primary_language;
            if (type_of_developmental_disability)
                params.type_of_developmental_disability = type_of_developmental_disability;
            if (areas_of_support_needed) params.areas_of_support_needed = areas_of_support_needed;
            if (academic_strengths) params.academic_strengths = academic_strengths;
            if (academic_challenges) params.academic_challenges = academic_challenges;
            if (behavioral_concerns) params.behavioral_concerns = behavioral_concerns;
            if (techniques_to_calm) params.techniques_to_calm = techniques_to_calm;
            if (skill_ids) params.skill_ids = skill_ids;
            if (expected_goals) params.expected_goals = expected_goals;

            const endpoint = `${endpoints.learner.getAllLearners}?${new URLSearchParams(params)}`;
            const response: any = await GET_API(endpoint);
            return response.data;
        },
        enabled: true,
    });

    const appliedFiltersCount = useMemo(() => {
        const filters = [
            learner_primary_language,
            type_of_developmental_disability,
            areas_of_support_needed,
            academic_strengths,
            academic_challenges,
            behavioral_concerns,
            techniques_to_calm,
            skill_ids,
            expected_goals,
        ];
        return filters.filter((filter) => filter).length;
    }, [
        learner_primary_language,
        type_of_developmental_disability,
        areas_of_support_needed,
        academic_strengths,
        academic_challenges,
        behavioral_concerns,
        techniques_to_calm,
        skill_ids,
        expected_goals,
    ]);

    useEffect(() => {
        if (data) {
            const formattedData: LearnerCardData[] = data?.items?.map((learner: any) => ({
                learnerId: learner?.learner_id,
                profileImage: learner?.profile_picture?.image_url,
                name: `${learner?.learner_personal_info?.learner_first_name} ${learner?.learner_personal_info?.learner_last_name}`,
                location: learner?.learner_personal_info?.learner_contact_details?.country,
                learnerHrs: learner?.total_classes_attended?.toString(),
                studentConnected: learner?.students_connected?.toString(),
                subjects: learner?.learner_subjects?.map((subject: any) => subject?.subject_name),
                languages: learner?.learner_personal_info?.learner_primary_language,
                totalReviews: learner?.total_reviews,
                overallRating: learner?.overall_rating,
                chatPermission: learner?.chat_permission,
                developementDisability:
                    learner?.learner_special_needs?.type_of_developmental_disability,
                skill_ids: learner?.learner_special_needs?.skill_ids,
                expected_goals: learner?.learner_special_needs?.expected_goals,
                skillsToLearn: learner?.skills,
            }));
            setLearnerCardData(formattedData);
        }
    }, [data]);

    const handleModal = () => {
        setLearnerId(null);
        setModalQuery(null);
    };

    const handleSeeMoreClick = (learnerId: string) => {
        setLearnerId(learnerId);
    };

    useEffect(() => {
        const modal = searchParams.get("modal");

        if (modal === "add_new_meeting") {
            setIsOpenSchedule(true);
            setIsOpen(false);
        } else if (learnerId) {
            setIsOpen(true);
            setIsOpenSchedule(false);
        } else {
            setIsOpen(false);
            setIsOpenSchedule(false);
        }
    }, [searchParams, learnerId]);

    const learnersActionButtonClassName =
        "!text-white !text-sm !justify-center !h-10 !min-h-[40px] !px-3 !py-0 !rounded-[12px] !bg-[#1E1E1E] hover:!bg-[#1E1E1E] hover:!text-white md:!h-[35px] md:!min-h-0 md:!rounded-full md:!px-4 md:!py-2 md:!bg-black md:hover:!bg-black";

    useEffect(() => {
        setHeaderOptions({
            searchPlaceholder: "Find your learner",
            actionButtonPlacement: "right",
            title: "Learners",
            titleIcon: getHeaderIcon(pathname),

            actionButtons: [
                {
                    buttonTitle: isMobileScreen
                        ? "Learners History"
                        : "Learners I have worked with",
                    buttonOnClick: () => router.push("/volunteer/my-learners"),
                    buttonClassName: learnersActionButtonClassName,
                    buttonPlacement: "right",
                    showButton: true,
                },
                {
                    buttonTitle: `Filters (${appliedFiltersCount})`,
                    buttonOnClick: () => setIsFilterOpen(true),
                    buttonIcon: <RiFilter3Line className="text-lg" />,
                    buttonClassName: learnersActionButtonClassName,
                    buttonPlacement: "right",
                    showButton: true,
                },
            ],
        });
    }, [pathname, setHeaderOptions, appliedFiltersCount, isMobileScreen]);

    return (
        <div className="h-full animate-fadeIn">
            <AddNewMeetingModalVolunteer isOpen={isOpenSchedule} onClose={handleModal} />
            <LearnerViewModal isOpen={isOpen} onClose={handleModal} />
            <LearnerFilterModal
                isFilterApplying={false}
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            />
            {isLoading ? (
                <LottieLoader isLoading={true} />
            ) : isError ? (
                <div className="flex-center h-full w-full">Something went wrong</div>
            ) : (
                <>
                    {learnerCardData.length === 0 ? (
                        <div className="flex-center h-full w-full flex-col gap-1">
                            <p>No Learners Found</p>
                            {query && (
                                <button
                                    className="text-primary underline"
                                    onClick={() => setSearchQuery(null)}
                                >
                                    Clear Search
                                </button>
                            )}
                            {appliedFiltersCount > 0 && (
                                <button
                                    className="text-primary underline"
                                    onClick={() => router.push("/volunteer/learners")}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col w-full justify-between min-h-[calc(100vh-100px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full h-auto p-5 py-7 lg:p-10">
                                {learnerCardData.map((learner) => (
                                    <LearnerCard
                                        key={learner.learnerId}
                                        onSeeMoreClick={handleSeeMoreClick}
                                        {...learner}
                                    />
                                ))}
                            </div>
                            {data && data.total > 0 && (
                                <div className="px-5 lg:px-10 pb-5">
                                    <Pagination
                                        currentPage={parseInt(page ?? "1", 10)}
                                        totalPages={Math.ceil(
                                            data.total /
                                                parseInt(size ?? String(PAGINATION ?? 10), 10)
                                        )}
                                        totalItems={data.total}
                                        itemsPerPage={parseInt(
                                            size ?? String(PAGINATION ?? 10),
                                            10
                                        )}
                                        className="mt-4"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
