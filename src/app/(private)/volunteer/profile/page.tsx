"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import Overview from "@/components/profile/Overview";
import { useComponentStore } from "@/store/useComponenetStore";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "@/utils/auth";
import { getIndividualVolunteer } from "@/api/volunteers";
import { useAppStore } from "@/store/useAppStore";
import { endpoints } from "@/api/constants";
import LottieLoader from "@/components/common/Loader/Lottie";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import MobileProfileView from "@/components/profile/MobileProfileView";
import InnerWidth from "@/utils/innerWidth";
import { useQueryState } from "nuqs";
import EditProfileModal from "@/components/profile/EditProfile";
import VolunteerProfileBio from "@/components/volunteers/profile";

export default function ProfilePage() {
    const { setHeaderOptions } = useComponentStore();
    const { setVolunteerDetails } = useAppStore();
    const router = useRouter();
    const isMobileOrTabScreen = InnerWidth() < 1024;
    const [mode, setMode] = useQueryState("mode");
    const [editProfileData, setEditProfileData] = useState({});

    const volunteerId = getCookie("volunteer_id") || "";
    const [volunteerData, setVolunteerData] = useState({ bio: {}, overview: {} });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["volunteer-profile", volunteerId],
        queryFn: () => getIndividualVolunteer(volunteerId),
        enabled: !!volunteerId
    });
    const triggerReload = async () => await refetch();

    const handleBackButton = () => {
        router.push("/volunteer/schedule");
    }

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
        setVolunteerDetails(data);
        
        const volunteer_first_name = data?.volunteer_first_name;
        const volunteer_last_name = data?.volunteer_last_name;
        const description = data?.volunteer_description;

        setEditProfileData({
            userId: volunteerId,
            volunteer_first_name: volunteer_first_name,
            volunteer_last_name: volunteer_last_name,
            volunteer_description: description,
            profile_picture: data?.profile_picture,
            volunteer_subjects: data?.volunteer_subjects,
            volunteer_languages: data?.volunteer_languages,
            volunteer_skills: data?.volunteer_skills,
            volunteer_experience: data?.volunteer_experience,
            volunteer_education: data?.volunteer_education,
            country: data?.volunteer_contact_details?.country,
            volunteer_gender: data?.volunteer_gender,
        })

        const bioData = {
            userId: volunteerId,
            full_name: `${volunteer_first_name} ${volunteer_last_name}`,
            bio_description: description,
            profile_picture: data?.profile_picture?.image_url,
            subjects: data?.volunteer_subjects?.map((subject: any) => subject?.subject_name),
            languages: data?.volunteer_languages?.map((language: any) => language?.language_name),
            skills: data?.volunteer_skills?.map((skill: any) => skill?.skill_name),
            experience: data?.volunteer_experience,
            education: data?.volunteer_education,
            country: data?.volunteer_contact_details?.country,
            gender: data?.volunteer_gender,
            connections: data?.students_connected,
            total_hours: data?.total_volunteered_hours,
        };

        const overviewData = {
            connections: data?.students_connected,
            total_hours: data?.total_volunteered_hours,
        };

        setVolunteerData({ bio: bioData, overview: overviewData });
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
        <div className="h-full animate-fadeIn ">
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
                        userData={volunteerData?.bio}
                        reviewEndpoint={endpoints.learnerFeedback.get(volunteerId)}
                    />
                    :
                    <div className="h-full w-full grid grid-cols-[1fr,2fr] gap-10 p-5">
                        <VolunteerProfileBio data={data} />
                        <Overview data={volunteerData.overview} reviewEndpoint={endpoints.volunterFeedback.get(volunteerId)} />
                    </div>
            }
        </div>
    );
}