"use client";

import { getHeaderIcon } from "@/layouts/helper";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import VolunteerCard from "@/components/learners/VolunteerCard";
import VolunteerViewModal from "@/components/learners/VolunteerViewModal";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useComponentStore } from "@/store/useComponenetStore";
import AddNewMeetingModal from "@/components/schedule/Modals/AddNewMeetingModal";
import { useQueryState } from "nuqs";
import VolunteerFilterModal from "@/components/learners/Modals/VolunteerFilter";
import { RiFilter3Line } from "react-icons/ri";
import LottieLoader from "@/components/common/Loader/Lottie";
import InnerWidth from "@/utils/innerWidth";
import { useDebounce } from "use-debounce";
import Pagination from "@/components/common/Pagination";
import { PAGINATION } from "@/definitions";

interface VolunteerCardData {
    volunteerId: string;
    profileImage: string;
    name: string;
    location: string;
    volunteerHrs: string;
    studentConnected: string;
    subjects: string[];
    languages: string[];
    totalReviews: string;
    overallRating: string;
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

    const [volunteerCardData, setVolunteerCardData] = useState<VolunteerCardData[]>([]);
    const [isOpenSchedule, setIsOpenSchedule] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [size] = useQueryState("size", { defaultValue: PAGINATION as string });
    const [page] = useQueryState("page", { defaultValue: "1" });
    const [searchQuery, setSearchQuery] = useQueryState("query");
    const [language_ids] = useQueryState("language_ids");
    const [subject_ids] = useQueryState("subject_ids");
    const [country] = useQueryState("country");
    const [skill_ids] = useQueryState("skill_ids");
    const [start_date] = useQueryState("start_date");
    const [end_date] = useQueryState("end_date");
    const [start_time] = useQueryState("start_time");
    const [end_time] = useQueryState("end_time");
    const [volunteerId, setVolunteerId] = useQueryState("volunteerId");
    const [modalQuery, setModalQuery] = useQueryState("modal");

    const isMobileScreen = InnerWidth() < 768;

    const [query] = useDebounce(searchQuery, 500);
    const { data, isLoading, isError } = useQuery({
        queryKey: [
            "volunteer",
            query,
            page,
            size,
            country,
            language_ids,
            subject_ids,
            skill_ids,
            start_date,
            end_date,
            start_time,
            end_time,
        ],
        queryFn: async () => {
            const endpoint = `${endpoints.volunteer.getAllVolunteers}?${new URLSearchParams({
                query: query || "",
                page: page,
                size: size,
                language_ids: language_ids || "",
                subject_ids: subject_ids || "",
                country: country || "",
                skill_ids: skill_ids || "",
                start_date: start_date || "",
                end_date: end_date || "",
                start_time: start_time || "",
                end_time: end_time || "",
            })}`;
            const response: any = await GET_API(endpoint);
            return response.data;
        },
        enabled: true,
    });

    const appliedFiltersCount = useMemo(() => {
        const filters = [language_ids, subject_ids, country, skill_ids, start_date, start_time];
        return filters.filter((filter) => filter).length;
    }, [language_ids, subject_ids, country, skill_ids, start_date, start_time]);
    useEffect(() => {
        if (data?.items) {
            const formattedData: VolunteerCardData[] = data.items.map((volunteer: any) => ({
                volunteerId: volunteer?.volunteer_id,
                profileImage: volunteer?.profile_picture?.image_url,
                name: `${volunteer?.volunteer_first_name} ${volunteer?.volunteer_last_name}`,
                location: volunteer?.country,
                volunteerHrs: volunteer?.total_volunteered_hours?.toString(),
                studentConnected: volunteer?.students_connected?.toString(),
                subjects: volunteer?.volunteer_subjects?.map(
                    (subject: any) => subject?.subject_name
                ),
                languages: volunteer?.volunteer_languages?.map(
                    (language: any) => language?.language_name
                ),
                totalReviews: volunteer?.total_reviews,
                overallRating: volunteer?.overall_rating,
                chatPermission: volunteer?.chat_permission,
                skillsToLearn: volunteer?.volunteer_skills,
            }));
            setVolunteerCardData(formattedData);
        }
    }, [data]);

    const handleModal = () => {
        setVolunteerId(null);
        setModalQuery(null);
    };

    const handleSeeMoreClick = (volunteerId: string) => {
        setVolunteerId(volunteerId);
    };

    useEffect(() => {
        const modal = searchParams.get("modal");

        if (modal === "add_new_meeting") {
            setIsOpenSchedule(true);
            setIsOpen(false);
        } else if (volunteerId) {
            setIsOpen(true);
            setIsOpenSchedule(false);
        } else {
            setIsOpen(false);
            setIsOpenSchedule(false);
        }
    }, [searchParams, volunteerId]);

    useEffect(() => {
        setHeaderOptions({
            searchPlaceholder: "Find your tutor",
            actionButtonPlacement: "right",
            title: "Volunteers",
            titleIcon: getHeaderIcon(pathname),
            actionButtons: [
                {
                    buttonTitle: isMobileScreen
                        ? "Volunteer History"
                        : "Volunteers I have worked with",
                    buttonOnClick: () => router.push("/learner/my-volunteers"),
                    buttonClassName:
                        "!bg-black !text-white hover:!bg-black hover:!text-white !h-[35px] !text-sm !py-2 px-4 !rounded-full",
                    buttonPlacement: "right",
                    showButton: true,
                },
                {
                    buttonTitle: `Filters (${appliedFiltersCount})`,
                    buttonOnClick: () => setIsFilterOpen(true),
                    buttonIcon: <RiFilter3Line className="text-lg" />,
                    buttonClassName:
                        "!bg-black !text-white hover:!bg-black hover:!text-white !h-[35px] !text-sm !py-2 px-4 !rounded-full",
                    buttonPlacement: "right",
                    showButton: true,
                },
            ],
        });
    }, [pathname, setHeaderOptions, appliedFiltersCount]);

    return (
        <div className="h-full animate-fadeIn">
            <AddNewMeetingModal isOpen={isOpenSchedule} onClose={handleModal} />
            <VolunteerViewModal isOpen={isOpen} onClose={handleModal} />
            <VolunteerFilterModal
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
                    {volunteerCardData.length === 0 ? (
                        <div className="flex-center h-full w-full flex-col gap-1">
                            <p>No Volunteer Found</p>
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
                                    onClick={() => router.push("/learner/volunteer")}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col w-full justify-between min-h-[calc(100vh-100px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full h-auto p-5 py-7 lg:p-10">
                                {volunteerCardData.map((volunteer) => (
                                    <VolunteerCard
                                        key={volunteer.volunteerId}
                                        onSeeMoreClick={handleSeeMoreClick}
                                        {...volunteer}
                                    />
                                ))}
                            </div>
                            {data && data.total > 0 && (
                                <div className="px-5 lg:px-10 pb-5 pagination-container">
                                    <Pagination
                                        currentPage={parseInt(page)}
                                        totalPages={Math.ceil(data.total / parseInt(size))}
                                        totalItems={data.total}
                                        itemsPerPage={parseInt(size)}
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
