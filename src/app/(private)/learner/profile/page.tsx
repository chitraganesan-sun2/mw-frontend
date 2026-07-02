"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import Overview from "@/components/profile/Overview";
import { useComponentStore } from "@/store/useComponenetStore";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getIndividualLearner } from "@/api/learners";
import { useAppStore } from "@/store/useAppStore";
import { endpoints } from "@/api/constants";
import LottieLoader from "@/components/common/Loader/Lottie";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import MobileProfileView from "@/components/profile/MobileProfileView";
import InnerWidth from "@/utils/innerWidth";
import EditProfileModal from "@/components/profile/EditProfile";
import { useQueryState } from "nuqs";
import LearnerProfileBio from "@/components/learners/profile";

export default function ProfilePage() {
    const { setHeaderOptions } = useComponentStore();
    const { setLearnerDetails } = useAppStore();
    const router = useRouter();
    const isMobileOrTabScreen = InnerWidth() < 1024;
    const [mode, setMode] = useQueryState("mode");

    const learnerId = Cookies.get("learner_id") || "";
    const [learnerData, setLearnerData] = useState({ bio: {}, overview: {} });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["learner", learnerId],
        queryFn: () => getIndividualLearner(learnerId),
        enabled: !!learnerId
    });
    const triggerReload = async () => await refetch();

    const handleBackButton = () => {
        router.replace("/learner/schedule");
    };

    useEffect(() => {
        setHeaderOptions({
            title: "Profile",
            titleIcon: <IoIosArrowBack className="text-lg" />,
            titleIconClick: handleBackButton,
            actionButtonTitle: "Edit Profile",
            actionButtonClassName:
                "lg:hidden !bg-black !text-white !rounded-xl hover:!bg-black hover:!text-white !h-[35px] !text-sm !py-2 px-4",
            actionButtonOnClick: () => setMode("edit"),
            actionButtonVariant: "secondary",
            actionButtonPlacement: "right",
            showButton: true,
            showTitleButton: true,
            hideSearch: true
        });
    }, []);

    useEffect(() => {
        if (!data) return;
        setLearnerDetails(data);

        const learner_first_name = data?.learner_personal_info?.learner_first_name;
        const learner_last_name = data?.learner_personal_info?.learner_last_name;
        const learner_primary_language = data?.learner_personal_info?.learner_primary_language;
        const description = data?.learner_special_needs?.description;
        const subjects = data?.learner_goals?.skills_to_learn;
        const contactDetail = data?.learner_personal_info?.learner_contact_details;

        const bioData = {
            userId: learnerId,
            full_name: `${learner_first_name} ${learner_last_name}`,
            bio_description: description,
            profile_picture: data?.profile_picture?.image_url,
            subjects: subjects,
            languages: learner_primary_language,
            phone_number: `${contactDetail?.contact_number?.country_code} ${contactDetail?.contact_number?.number}`,
            country: contactDetail?.country,
            gender: data?.learner_personal_info?.learner_gender,
            email: contactDetail?.email,
            connections: data?.total_volunteers_connected,
            total_hours: data?.total_attended_hours,
        };

        const overviewData = {
            connections: data?.total_volunteers_connected,
            total_hours: data?.total_attended_hours,
        };

        setLearnerData({ bio: bioData, overview: overviewData });
    }, [data]);

    if (isLoading) {
        return (
            <div className="h-full w-full flex gap-4 p-4">
                <div className="flex-1"><ProfileSkeleton /></div>
                <div className="w-80 hidden lg:block">
                    <div className="bg-white rounded-3xl h-[83vh] animate-pulse p-5">
                        <div className="h-5 bg-gray-200 rounded w-24 mb-4" />
                        <div className="h-20 bg-gray-200 rounded-xl mb-3" />
                        <div className="h-20 bg-gray-200 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full animate-fadeIn">
            <EditProfileModal
                data={data}
                isOpen={mode === "edit"}
                onClose={() => setMode(null)}
                triggerReload={triggerReload}
            />
            {
                isMobileOrTabScreen ?
                    <MobileProfileView
                        data={data}
                        userData={learnerData?.bio}
                        reviewEndpoint={endpoints.learnerFeedback.get(learnerId)}
                    />
                    :
                    <div className="h-full w-full grid grid-cols-[1fr,2fr] gap-10 p-5">
                        <LearnerProfileBio data={data} />
                        <Overview data={learnerData?.overview} reviewEndpoint={endpoints.learnerFeedback.get(learnerId)} />
                    </div>
            }
        </div>
    );
}
