"use client";
import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import ClockIcon from "@/assets/icons/ClockIcon";
import ModalCloseIcon from "@/assets/icons/FeedModalCloseIcon";
import LearnerConnectIcon from "@/assets/icons/LearnerConnectIcon";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";
import Button from "@/components/common/Button";
import Divider from "@/components/common/Divider";
import LottieLoader from "@/components/common/Loader/Lottie";
import ViewModal from "@/components/common/Modals/ViewModal";
import TagComponent from "@/components/common/Tag";
import OverViewCard from "@/components/leaner/LeanerOverViewCard";
import DetailCard from "@/components/profile/Bio/DetailCard";
import DetailChipCard from "@/components/profile/Bio/DetailChipCard";
import RatingCard from "@/components/profile/Overview/RatingCard";
import RatingHeader from "@/components/profile/Overview/RatingHeader";
import InnerWidth from "@/utils/innerWidth";
import { getLocalStorage } from "@/utils/localStorage";
import { formatString } from "@/utils/stringFormats";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";

const ProfileHeader = ({
    text,
    onClose,
    onScheduleMeeting,
}: {
    text: string | null;
    onClose: () => void;
    onScheduleMeeting: () => void;
}) => (
    <div className="flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
            <span
                onClick={onClose}
                className="cursor-pointer md:hidden border border-black rounded-full p-2"
            >
                <IoIosArrowBack className="text-lg" />
            </span>
            <p className="font-medium text-xl">Profile</p>
        </div>
        <div className="flex items-center gap-2">
            <Button
                onClick={onScheduleMeeting}
                title="Schedule a meeting"
                className="text-sm !text-black !bg-primary !border-primary !border"
            />
            <span onClick={onClose} className="cursor-pointer max-md:hidden">
                <ModalCloseIcon />
            </span>
        </div>
    </div>
);

interface VolunteerData {
    volunteer_first_name: string;
    volunteer_last_name: string;
    volunteer_description: string;
    volunteer_education: string;
    volunteer_experience: string;
    volunteer_work_experience: string;
    volunteer_contact_details?: {
        country?: string;
        timezone?: string;
    };
    volunteer_languages: Array<{ language_name: string; language_id: string }>;
    volunteer_subjects: Array<{ subject_name: string; subject_id: string }>;
    volunteer_skills: Array<{ skill_name: string; skill_id: string }>;
    profile_picture: { image_url: string };
    total_volunteered_hours: number;
    students_connected: number;
    volunteer_gender?: string;
}

const ProfileInfo = ({
    text,
    volunteerData,
}: {
    text: string | null;
    volunteerData: VolunteerData;
}) => (
    <div className="grid md:grid-cols-[1.7fr,2fr,2fr] gap-4 px-5 max-md:py-5">
        <div className="flex items-center gap-3">
            <div className="relative w-[80px] h-[80px] rounded-full shrink-0">
                <Image
                    src={volunteerData?.profile_picture?.image_url}
                    alt="avatar"
                    fill
                    className="object-cover rounded-full w-full h-full"
                />
            </div>
            <div className="flex flex-col gap-1 md:gap-2">
                <p className="max-md:text-xl font-medium">
                    {`${volunteerData?.volunteer_first_name} ${volunteerData?.volunteer_last_name}`}
                </p>
                <TagComponent
                    text="Volunteer"
                    tagClassName="!bg-[#FFE9D4] !border-none px-2 max-md:hidden"
                />
                <p className="text-xs font-medium text-gray-800">
                    {volunteerData?.volunteer_contact_details?.timezone}
                </p>

                <OverViewCard
                    title="Hours Volunteered"
                    value={volunteerData?.total_volunteered_hours || 0}
                    icon={""}
                    className="rounded-xl md:hidden"
                />
                <OverViewCard
                    title="Students Connected"
                    value={volunteerData?.students_connected}
                    icon={""}
                    className="rounded-xl md:hidden"
                />
            </div>
        </div>
        <OverViewCard
            title="Hours Volunteered"
            value={volunteerData?.total_volunteered_hours || 0}
            icon={<ClockIcon />}
            className="max-md:hidden"
        />
        <OverViewCard
            title="Students Connected"
            value={volunteerData?.students_connected}
            icon={<LearnerConnectIcon />}
            className="max-md:hidden"
        />
    </div>
);

const TabButtons = ({
    activeTab,
    handleTabChange,
    rating,
    totalReviews,
    isMobileScreen,
}: {
    activeTab: string;
    handleTabChange: (tab: string) => void;
    rating: number;
    totalReviews: number;
    isMobileScreen?: boolean;
}) => (
    <div className="px-5">
        {isMobileScreen ? (
            <div className="flex gap-2 px-2">
                {["overview", "reviews"].map((tab: any, index) => (
                    <button
                        key={tab || index}
                        type="button"
                        onClick={() => handleTabChange(tab)}
                        className="w-full"
                    >
                        <p
                            className={`text-base font-medium capitalize ${
                                activeTab === tab ? "text-black" : "text-[#808080]"
                            }`}
                        >
                            {tab}
                        </p>
                        <div
                            className={`!h-[4px] !w-full mt-1 rounded-t-xl ${
                                activeTab === tab ? "bg-[#FF9053]" : ""
                            }`}
                        ></div>
                    </button>
                ))}
            </div>
        ) : (
            <div className="flex items-center justify-between border-stroke border-2 rounded-full">
                {["overview", "reviews"].map((tab) => (
                    <div
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`font-medium text-center w-[50%] rounded-full py-2.5 px-5 ${
                            activeTab === tab
                                ? "bg-[#dff5ff] border-primary border-2"
                                : "border-2 border-transparent"
                        } transition-all duration-200 cursor-pointer`}
                    >
                        {tab === "overview" ? "Overview" : `Reviews - ${rating} (${totalReviews})`}
                    </div>
                ))}
            </div>
        )}
    </div>
);

const OverviewContent = ({ volunteerData }: { volunteerData: VolunteerData }) => {
    const details = [
        {
            title: "Subjects I Teach",
            tags: volunteerData?.volunteer_subjects?.map((subject) => subject?.subject_name),
        },
        {
            title: "Languages I Speak",
            tags: volunteerData?.volunteer_languages?.map((lang) => lang?.language_name),
        },
        {
            title: "Skills You Can Share with Learners",
            tags: volunteerData?.volunteer_skills?.map((skill) => skill?.skill_name),
        },
    ];

    const bio = [
        {
            title: "Gender",
            description: formatString(volunteerData?.volunteer_gender || ""),
        },
        {
            title: "Volunteer Experience",
            description: volunteerData?.volunteer_experience,
        },
        {
            title: "Work Experience",
            description: volunteerData?.volunteer_work_experience,
        },
        {
            title: "Education",
            description: volunteerData?.volunteer_education,
        },
    ];

    const renderAboutMeVideo = () => {
        const anyData: any = volunteerData as any;
        const videoSrc = anyData?.profile_video?.video_url || anyData?.profile_video?.url || anyData?.video_url || anyData?.url;
        if (!videoSrc) return null;
        return (
            <div className="mt-3">
                <p className="text-sm text-gray-light font-normal mb-2">About me</p>
                <div className="w-full flex justify-start">
                    <video
                        src={videoSrc}
                        controls
                        preload="metadata"
                        className="w-full rounded-xl shadow-lg h-[220px] md:h-[380px] object-cover"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="px-5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-light font-normal">Bio</p>
                    {volunteerData?.volunteer_contact_details?.country && (
                        <TagComponent
                            text={formatString(volunteerData?.volunteer_contact_details?.country)}
                            className="max-md:hidden text-xs py-1 font-medium px-2"
                            icon={<FaLocationDot />}
                        />
                    )}
                </div>
                <p className="font-medium">{volunteerData?.volunteer_description}</p>
                {renderAboutMeVideo()}
                <div
                    className={`md:hidden flex items-center justify-between my-3 ${
                        volunteerData?.volunteer_contact_details?.country ? "" : "hidden"
                    }`}
                >
                    <p className="font-medium">Location</p>
                    <TagComponent
                        text={volunteerData?.volunteer_contact_details?.country || ""}
                        className="text-xs py-1 font-medium px-2"
                    />
                </div>
            </div>
            {bio.map((item, index) => (
                <DetailCard
                    key={index}
                    className="!gap-2"
                    title={item?.title}
                    description={item?.description}
                />
            ))}
            {details.map((detail, index) => (
                <DetailChipCard
                    key={index}
                    className="!gap-2"
                    tags={detail?.tags}
                    title={detail?.title}
                />
            ))}
        </div>
    );
};

const ReviewsContent = ({ volunteerFeedback }: { volunteerFeedback: any }) => {
    const ratingCardData = volunteerFeedback?.feedbacks;

    return (
        <div className="flex flex-col gap-3">
            <div className="md:px-5">
                <div className="flex flex-col gap-5">
                    <RatingHeader
                        rating={volunteerFeedback?.overall_rating}
                        totalReviews={volunteerFeedback?.feedbacks.length}
                    />
                    <div className="max-md:bg-white max-md:rounded-xl max-md:p-3">
                        <div className="flex justify-between">
                            <p className="text-base font-semibold md:hidden">Reviews</p>
                            <p className="text-gray text-sm">
                                Sort By: <span className="text-black">Recently added</span>
                            </p>
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

const VolunteerViewModal: React.FC<VolunteerViewModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const innerWidth = InnerWidth();
    const isMobileScreen = innerWidth < 768;

    const containerRef = useRef<HTMLDivElement | null>(null);

    const text = getLocalStorage("role");
    const [activeTab, setActiveTab] = useState("overview");
    const volunteerId = searchParams.get("volunteerId");

    const getIndividualVolunteer = async () => {
        const response: any = await GET_API(
            endpoints.volunteer.getIndividualVolunteer(volunteerId as string)
        );
        return response.data;
    };

    const getVolunterFeedback = async () => {
        const response: any = await GET_API(endpoints.volunterFeedback.get(volunteerId as string));
        return response.data;
    };

    const {
        data: volunteerData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["volunteer", volunteerId],
        queryFn: getIndividualVolunteer,
        enabled: !!volunteerId,
    });

    const { data: volunteerFeedback } = useQuery({
        queryKey: ["volunteerFeedback", volunteerId],
        queryFn: getVolunterFeedback,
        enabled: !!volunteerId,
    });

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const stopAllVideos = () => {
        const videos = containerRef.current?.querySelectorAll("video");
        videos?.forEach((video) => {
            try {
                video.pause();
                video.currentTime = 0;
                video.removeAttribute("src");
                video.load();
            } catch (_) {}
        });
    };

    const handleClose = () => {
        stopAllVideos();
        onClose();
    };

    useEffect(() => {
        return () => {
            // Ensure videos are stopped on unmount
            stopAllVideos();
        };
    }, []);

    if (isError) {
        return (
            <ViewModal modalOpen={isOpen} onClose={handleClose} width={855}>
                <div className="p-5">Error loading volunteer data</div>
            </ViewModal>
        );
    }

    const handleScheduleMeeting = () => {
        router.push(`/learner/volunteer?volunteerId=${volunteerId}&modal=add_new_meeting`);
    };
    const rating = volunteerFeedback?.overall_rating;
    const totalReviews = volunteerFeedback?.feedbacks?.length;

    return (
        <ViewModal
            modalOpen={isOpen}
            onClose={handleClose}
            width={855}
            height={isMobileScreen ? "100dvh" : ""}
            borderRadius={isMobileScreen ? "0px" : "12px"}
            className="max-md:!w-full max-md:!max-w-full max-md:!m-0"
        >
            {isLoading ? (
                <div className="h-full w-full flex-center min-h-[70vh]">
                    <LottieLoader isLoading={true} />
                </div>
            ) : (
                <div ref={containerRef} className="flex flex-col gap-0 md:gap-4 pt-4 md:py-4 h-full md:max-h-[90dvh]">
                    <ProfileHeader
                        text={text}
                        onClose={handleClose}
                        onScheduleMeeting={handleScheduleMeeting}
                    />
                    <Divider className="max-md:hidden" />
                    <ProfileInfo text={text} volunteerData={volunteerData} />
                    <Divider className="max-md:hidden" />
                    <TabButtons
                        activeTab={activeTab}
                        handleTabChange={handleTabChange}
                        rating={rating}
                        totalReviews={totalReviews}
                        isMobileScreen={isMobileScreen}
                    />
                    <div className="relative max-md:h-full max-md:bg-background-input max-md:p-5 overflow-y-auto max-md:border-t">
                        <div
                            className={`transform transition-all duration-300 max-md:bg-white max-md:py-3 max-md:rounded-xl ${
                                activeTab === "overview"
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 -translate-x-8 absolute top-0 left-0 right-0"
                            }`}
                        >
                            {activeTab === "overview" && (
                                <OverviewContent volunteerData={volunteerData} />
                            )}
                        </div>
                        <div
                            className={`transform transition-all duration-300 ${
                                activeTab === "reviews"
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 translate-x-8 absolute top-0 left-0 right-0"
                            }`}
                        >
                            {activeTab === "reviews" && (
                                <div>
                                    {volunteerFeedback?.feedbacks.length > 0 ? (
                                        <ReviewsContent volunteerFeedback={volunteerFeedback} />
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
            )}
        </ViewModal>
    );
};

export default VolunteerViewModal;