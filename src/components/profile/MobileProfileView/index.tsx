"use client";

import { GET_API } from "@/api/request";
import TagComponent from "@/components/common/Tag";
import OverViewCard from "@/components/learners/LearnerOverViewCard";
import { ParentGuardianInformation, ProfileDetails } from "@/components/learners/profile/tabs";
import { LearnerInformation } from "@/components/learners/profile/tabs";
import DetailCard from "@/components/profile/Bio/DetailCard";
import DetailChipCard from "@/components/profile/Bio/DetailChipCard";
import RatingCard from "@/components/profile/Overview/RatingCard";
import RatingHeader from "@/components/profile/Overview/RatingHeader";
import { VolunteerContactDetails, ProfileDetails as VolunteerProfileDetails } from "@/components/volunteers/profile/tabs";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "@/utils/auth";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface UserBioDataProps {
    full_name: string;
    bio_description: string;
    profile_picture: string
    subjects: string[];
    languages: string[];
    phone_number: string | number;
    email: string;
    connections: number;
    total_hours: number;
}

const ProfileInfo = ({
    bioData,
}: {
    bioData: UserBioDataProps;
}) => (
    <div className="gap-4 px-5 max-md:py-5 max-lg:py-10 sm:mx-auto">
        <div className="flex items-center gap-3">
            <div className="relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full shrink-0">
                <Image
                    src={bioData?.profile_picture}
                    alt="avatar"
                    fill
                    className="object-cover rounded-full w-full h-full"
                />
            </div>
            <div className="flex flex-col gap-1 md:gap-2">
                <p className="max-lg:text-xl font-medium">
                    {bioData?.full_name}
                </p>
                <OverViewCard
                    title="Hours Volunteered"
                    value={bioData?.total_hours || 0}
                    icon={""}
                    className="rounded-xl"
                />
                <OverViewCard
                    title="Students Connected"
                    value={bioData?.connections}
                    icon={""}
                    className="rounded-xl"
                />
            </div>
        </div>
    </div>
);

const TabButtons = ({
    activeTab,
    handleTabChange,
    rating,
    totalReviews
}: {
    activeTab: string;
    handleTabChange: (tab: string) => void;
    rating: number;
    totalReviews: number;
}) => (
    <div className="px-5">
        <div className="flex gap-2 px-2">
            {["overview", "reviews"].map((tab: any, index) => (
                <button
                    key={tab || index}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className="w-full"
                >
                    <p className={`text-base font-medium capitalize ${activeTab === tab ? "text-black" : "text-[#808080]"}`}>{tab}</p>
                    <div className={`!h-[4px] !w-full mt-1 rounded-t-xl ${activeTab === tab ? 'bg-primary' : ''}`}></div>
                </button>
            ))}
        </div>
    </div>
);

const OverviewContent = ({ userData }: { userData: any }) => {
    const role = getCookie("role");
    const isLearner = role === "learner";

    const details = isLearner ?
        [
            {
                title: "Subjects to learn",
                tags: userData?.subjects?.map((subject: any) => subject?.subject_name || subject),
            },
            {
                title: "Primary Language",
                tags: userData?.languages,
            }
        ]
        : [
            {
                title: "Subjects I Teach",
                tags: userData?.subjects?.map((subject: any) => subject?.subject_name || subject),
            },
            {
                title: "Languages I Speak",
                tags: userData?.languages?.map((lang: any) => lang?.language_name || lang),
            },
            {
                title: "Skills",
                tags: userData?.skills?.map((skill: any) => skill?.skill_name || skill),
            },
        ];

    const bio = [
        {
            title: "Experience",
            description: userData?.experience,
        },
        {
            title: "Education",
            description: userData?.education,
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="px-5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <p className="font-medium">Bio</p>
                </div>
                <p className="text-sm text-gray-light font-normal">
                    {userData?.bio_description}
                </p>
                <div className={`flex items-center justify-between my-3 ${userData?.country ? '' : 'hidden'}`}>
                    <p className="font-medium">Location</p>
                    <TagComponent
                        text={userData?.country || ""}
                        className="text-xs py-1 font-medium px-2"
                    />
                </div>
                <div className={`flex items-center justify-between ${userData?.gender ? '' : 'hidden'}`}>
                    <p className="font-medium">Gender</p>
                    <TagComponent
                        text={userData?.gender || ""}
                        className="text-xs py-1 font-medium px-2"
                    />
                </div>
            </div>
            {details?.map((detail, index) => (
                <DetailChipCard
                    key={index}
                    className="!gap-2"
                    tags={detail?.tags}
                    title={detail?.title}
                />
            ))}
            {isLearner || bio?.map((item, index) => (
                <DetailCard
                    key={index}
                    className="!gap-2"
                    title={item?.title}
                    description={item?.description}
                />
            ))}
        </div>
    );
};

const ReviewsContent = ({ userFeedback }: { userFeedback: any }) => {
    const ratingCardData = userFeedback?.feedbacks;

    return (
        <div className="flex flex-col gap-3">
            <div className="lg:px-5">
                <div className="flex flex-col gap-5">
                    <RatingHeader
                        rating={userFeedback?.overall_rating}
                        totalReviews={userFeedback?.feedbacks.length}
                    />
                    <div className="bg-white rounded-xl p-3">
                        <div className="flex justify-between">
                            <p className="text-base font-semibold md:hidden">Reviews</p>
                            {/* <p className="text-gray text-sm">Sort By: <span className="text-black">Recently added</span></p> */}
                        </div>
                        <div className="flex flex-col gap-5 divide-y">
                            {ratingCardData?.map((item: any, index: number) => (
                                <RatingCard
                                    key={index}
                                    name={item?.author_name}
                                    profileImg={item?.author_profile_picture?.image_url}
                                    rating={item?.volunteer_commitment_level}
                                    day={item?.created_at}
                                    review={item?.comment}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const learnerTabs = [
    { id: "profile-details", title: "Profile Details" },
    { id: "parent-guardian-information", title: "Guardian Information" },
    { id: "learner-information", title: "Personal Info" },
]

const volunteerTabs = [
    { id: "profile-details", title: "Profile Details" },
    { id: "contact-details", title: "Contact Details" },
]

const FullProfileDetails = ({ data }: { data: any }) => {
    const tabContentRef = useRef<HTMLDivElement>(null);
    const role = getCookie("role");

    const tabs = role === "learner" ? learnerTabs : volunteerTabs;
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    useEffect(() => {
        if (tabContentRef.current) {
            tabContentRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeTab]);

    const renderTabContent = () => {
        if (role === "learner") {
            switch (activeTab) {
                case "profile-details":
                    return <ProfileDetails data={data?.learner_personal_info} />
                case "parent-guardian-information":
                    return <ParentGuardianInformation data={data?.parent_info} />
                case "learner-information":
                    return <LearnerInformation data={data} />
            }
        } else {
            switch (activeTab) {
                case "profile-details":
                    return <VolunteerProfileDetails data={data} />
                case "contact-details":
                    return <VolunteerContactDetails data={data?.volunteer_contact_details} />
            }
        }
    }

    return (
        <div className="flex flex-col gap-6 pb-5 h-full">
            <div className="flex md:flex-wrap max-md:overflow-x-auto no-scrollbar py-3 gap-2 sticky top-0 bg-background-input lg:bg-white z-10 border-b border-gray-500 md:border-stroke">
                {tabs.map((tab: any, index) => (
                    <button
                        key={tab.title || index}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <TagComponent
                            text={tab.title}
                            className={`!text-sm py-1 px-3 border ${activeTab === tab.id ? "bg-background border-primary" : "bg-white md:bg-background-input text-gray-dark border-gray-500 md:border-gray-dark"}`}
                        />
                    </button>
                ))}
            </div>
            <div className="bg-white rounded-3xl w-full p-5 h-full">
                {renderTabContent()}
            </div>
        </div>
    );
};


const MobileProfileView = ({ data, userData, reviewEndpoint }: { data: any, userData: any, reviewEndpoint: string }) => {
    const [activeTab, setActiveTab] = useState("overview");

    const getUserFeedback = async () => {
        const response: any = await GET_API(reviewEndpoint);
        return response.data;
    };

    const { data: userFeedback } = useQuery({
        queryKey: ["profileFeedback", userData?.userId],
        queryFn: getUserFeedback,
        enabled: !!userData?.userId,
    });

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const rating = userFeedback?.overall_rating;
    const totalReviews = userFeedback?.feedbacks.length;

    return (
        <div className="flex flex-col gap-0 lg:gap-4 lg:py-4 h-full">
            <ProfileInfo bioData={userData} />
            <TabButtons
                activeTab={activeTab}
                handleTabChange={handleTabChange}
                rating={rating}
                totalReviews={totalReviews}
            />
            <div className="relative h-full bg-background-input px-5 overflow-y-auto border-t">
                <div
                    className={`transform transition-all duration-300 ${activeTab === "overview"
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-8 absolute top-0 left-0 right-0"
                        }`}
                >
                    {activeTab === "overview" && (
                        <FullProfileDetails data={data} />
                    )}
                </div>
                <div
                    className={`transform transition-all duration-300 ${activeTab === "reviews"
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-8 absolute top-0 left-0 right-0"
                        }`}
                >
                    {activeTab === "reviews" && (
                        <div>
                            {userFeedback?.feedbacks.length > 0 ? (
                                <ReviewsContent userFeedback={userFeedback} />
                            ) : (
                                <div className="flex items-center justify-center h-full min-h-[300px]">
                                    <p className="text-sm text-gray-light font-normal">
                                        No reviews yet
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileProfileView;