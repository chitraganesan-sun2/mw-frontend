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
import { useState } from "react";
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
            {/* <Button
                onClick={onScheduleMeeting}
                title="Schedule a meeting"
                className="text-sm !text-black !bg-primary !border-primary !border"
            /> */}
            <span onClick={onClose} className="cursor-pointer max-md:hidden">
                <ModalCloseIcon />
            </span>
        </div>
    </div>
);

interface VolunteerData {
    learner_personal_info: {
        learner_first_name: string;
        learner_last_name: string;
        learner_date_of_birth: string;
        learner_gender: string;
        learner_primary_language: string;
        learner_contact_details: {
            country: string;
            timezone: string;
        };
    };
    parent_info: {
        parent_first_name: string;
        parent_last_name: string;
    };
    learner_goals: {
        expected_goals?: string[];
        preferred_volunteer_qualities: string[];
        skill_level?: string;
        academic_skills_to_learn?: Array<{ skill_name: string }>;
        arts_life_skills_to_learn?: Array<{ skill_name: string }>;
        academic_goals_description?: string;
        arts_life_goals_description?: string;
        other_comments_or_notes?: string;
    };
    learner_special_needs: {
        type_of_developmental_disability?: string;
        level_of_support_needed: string;
        assistive_device_used: string;
        communication_style: string;
        description?: string;
        areas_of_support_needed: string[];
        learning_styles: string[];
        behavioral_concerns?: string;
        behavior_support_strategies?: string[];
    };
    education: {
        current_school?: string;
        grade_or_education_level?: string;
        program_iep_504_plan?: string;
        academic_strengths?: string[];
        cultural_religious_considerations?: string;
        extracurricular_activities?: string;
        favorite_free_time_activities?: string;
    };
    profile_picture: {
        image_url: string;
    };
    total_attended_hours: number;
    total_volunteers_connected: number;
}

const ProfileInfo = ({
    text,
    learnerData,
}: {
    text: string | null;
    learnerData: VolunteerData;
}) => {

    return (
    <div className="grid md:grid-cols-[2fr,1fr,1fr] gap-3 px-5 max-md:py-5">
        <div className="flex items-center gap-3">
            <div className="relative w-[64px] h-[64px] rounded-full shrink-0">
                <Image
                    src={learnerData?.profile_picture?.image_url}
                    alt="avatar"
                    fill
                    className="object-cover rounded-full w-full h-full"
                />
            </div>
            <div className="flex flex-col gap-1 md:gap-1.5">
                <p className="max-md:text-xl font-medium">
                    {`${learnerData?.learner_personal_info?.learner_first_name || ""} ${
                        learnerData?.learner_personal_info?.learner_last_name || ""
                    }`}
                </p>
                <TagComponent
                    text="Learner"
                    tagClassName="!bg-[#dff5ff] !border-none px-2 max-md:hidden"
                />
                <p className="text-xs font-medium text-gray-800">{learnerData?.learner_personal_info?.learner_contact_details?.timezone}</p>
                <OverViewCard
                    title="Hours Attended"
                    value={learnerData?.total_attended_hours || 0}
                    icon={""}
                    className="rounded-xl md:hidden"
                />
                <OverViewCard
                    title="Volunteers Connected"
                    value={learnerData?.total_volunteers_connected || 0}
                    icon={""}
                    className="rounded-xl md:hidden"
                />
            </div>
        </div>
        <OverViewCard
            title="Hours Attended"
            value={learnerData?.total_attended_hours || 0}
            icon={<ClockIcon />}
            className="max-md:hidden !px-3 !py-2 !gap-2"
        />
        <OverViewCard
            title="Volunteers Connected"
            value={learnerData?.total_volunteers_connected || 0}
            icon={<LearnerConnectIcon />}
            className="max-md:hidden !px-3 !py-2 !gap-2"
        />
    </div>
)};

const TabButtons = ({
    activeTab,
    handleTabChange,
    rating,
    totalReviews,
    isMobileScreen,
    learnerId,
}: {
    activeTab: string;
    handleTabChange: (tab: string) => void;
    rating: number;
    totalReviews: number;
    isMobileScreen?: boolean;
    learnerId: string;
}) => {
    const backgroundColor = learnerId ? "bg-[#ffe9d4]" : "bg-[#dff5ff] ";
    return (
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
                                    ? `${backgroundColor} border-primary border-2`
                                    : "border-2 border-transparent"
                            } transition-all duration-200 cursor-pointer`}
                        >
                            {tab === "overview"
                                ? "Overview"
                                : `Reviews - ${rating} (${totalReviews})`}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ContentRender = ({
    title,
    description,
    fullWidth,
}: {
    title: string;
    description: string;
    fullWidth?: boolean;
}) => {
    return (
        <div
            className={`flex flex-col gap-1 bg-background-input rounded-lg p-3 ${fullWidth ? "col-span-2" : ""}`}
        >
            <p className="font-normal text-gray-light text-xs">{title}</p>
            <p className="font-medium text-sm break-words">{description}</p>
        </div>
    );
};

const OverviewContent = ({ learnerData }: { learnerData: VolunteerData }) => {
    
    const personalDetails = [
        {
            title: "Name",
            description: `${learnerData?.learner_personal_info?.learner_first_name || ""} ${
                learnerData?.learner_personal_info?.learner_last_name || ""
            }`,
        },
        {
            title: "Age",
            description: learnerData?.learner_personal_info?.learner_date_of_birth
                ? (() => {
                      // Parse DD-MM-YYYY format
                      const dateStr = learnerData.learner_personal_info.learner_date_of_birth;
                      const [day, month, year] = dateStr.split('-');
                      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      const today = new Date();
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                      }
                      return String(age);
                  })()
                : "",
        },
        {
            title: "Gender",
            description: learnerData?.learner_personal_info?.learner_gender
                ? formatString(learnerData.learner_personal_info.learner_gender)
                : "",
        },
        {
            title: "Country",
            description: learnerData?.learner_personal_info?.learner_contact_details?.country
                ? formatString(learnerData.learner_personal_info.learner_contact_details.country)
                : "",
        },
        {
            title: "Primary Language",
            description: learnerData?.learner_personal_info?.learner_primary_language || "",
        },
        {
            title: "Guardian Name",
            description:
                learnerData?.parent_info?.parent_first_name &&
                learnerData?.parent_info?.parent_last_name
                    ? `${learnerData.parent_info.parent_first_name} ${learnerData.parent_info.parent_last_name}`
                    : "",
        },
    ].filter((item) => item.description !== "");

    // Expected Goals is legacy (dropped from the current onboarding form) and has no current-form
    // pair, so it's kept first/standalone - everything after it is ordered so each skills-to-learn
    // entry sits directly next to its matching goals description in the 2-column grid below.
    const learnerGoalsContent = [
        {
            title: "Expected Goals",
            description: (Array.isArray(learnerData?.learner_goals?.expected_goals) &&
            learnerData?.learner_goals?.expected_goals.length > 0
                ? learnerData.learner_goals.expected_goals.map((goal: string) => formatString(goal))
                : typeof learnerData?.learner_goals?.expected_goals === "string"
                ? [formatString(learnerData.learner_goals.expected_goals)]
                : []
            ).join(", "),
            // Legacy field with no current-form pair - full width so it can't push the
            // skills/goals pairs below it out of alignment on old records that still have it.
            fullWidth: true,
        },
        {
            title: "Academic Skills to Learn",
            description: (learnerData?.learner_goals?.academic_skills_to_learn || [])
                .map((skill) => formatString(skill?.skill_name))
                .join(", "),
        },
        {
            title: "Academic Goals",
            description: learnerData?.learner_goals?.academic_goals_description || "",
        },
        {
            title: "Arts & Life Skills to Learn",
            description: (learnerData?.learner_goals?.arts_life_skills_to_learn || [])
                .map((skill) => formatString(skill?.skill_name))
                .join(", "),
        },
        {
            title: "Arts & Life Goals",
            description: learnerData?.learner_goals?.arts_life_goals_description || "",
        },
        {
            title: "Goals & Preferred Volunteer Qualities",
            description: (Array.isArray(learnerData?.learner_goals?.preferred_volunteer_qualities) &&
            learnerData?.learner_goals?.preferred_volunteer_qualities.length > 0
                ? learnerData.learner_goals.preferred_volunteer_qualities.map((quality: string) =>
                      formatString(quality)
                  )
                : typeof learnerData?.learner_goals?.preferred_volunteer_qualities === "string"
                ? [formatString(learnerData.learner_goals.preferred_volunteer_qualities)]
                : []
            ).join(", "),
        },
        {
            title: "Other Comments or Notes",
            description: learnerData?.learner_goals?.other_comments_or_notes || "",
        },
    ].filter((item) => item.description !== "");

    const specialNeeds = [
        {
            title: "Type of Developmental Disability",
            description: learnerData?.learner_special_needs?.type_of_developmental_disability || "",
        },
        {
            title: "Level of Support Needed",
            description: learnerData?.learner_special_needs?.level_of_support_needed
                ? formatString(learnerData.learner_special_needs.level_of_support_needed)
                : "",
        },
        {
            title: "Assistive Device Used",
            description: learnerData?.learner_special_needs?.assistive_device_used || "",
        },
        {
            title: "Communication Style",
            description: learnerData?.learner_special_needs?.communication_style || "",
        },
        {
            title: "Description",
            description: learnerData?.learner_special_needs?.description || "",
        },
        {
            title: "Behavioral Concerns",
            description: learnerData?.learner_special_needs?.behavioral_concerns || "",
        },
        {
            title: "Behavior Support Strategies",
            tags: (learnerData?.learner_special_needs?.behavior_support_strategies || []).map(
                (strategy: string) => formatString(strategy)
            ),
        },
        {
            title: "Areas of Support Needed",
            tags:
                Array.isArray(learnerData?.learner_special_needs?.areas_of_support_needed) &&
                learnerData?.learner_special_needs?.areas_of_support_needed.length > 0
                    ? learnerData.learner_special_needs.areas_of_support_needed.map(
                          (area: string) => formatString(area)
                      )
                    : typeof learnerData?.learner_special_needs?.areas_of_support_needed ===
                      "string"
                    ? [formatString(learnerData.learner_special_needs.areas_of_support_needed)]
                    : [],
        },
        {
            title: "Learning Styles",
            tags:
                Array.isArray(learnerData?.learner_special_needs?.learning_styles) &&
                learnerData?.learner_special_needs?.learning_styles.length > 0
                    ? learnerData.learner_special_needs.learning_styles.map((style: string) =>
                          formatString(style)
                      )
                    : typeof learnerData?.learner_special_needs?.learning_styles === "string"
                    ? [formatString(learnerData.learner_special_needs.learning_styles)]
                    : [],
        },
    ].filter((item) => (item.tags?.length ?? 0) > 0 || item.description);

    const education = [
        {
            title: "Current School",
            description: learnerData?.education?.current_school || "",
        },
        {
            title: "Grade / Education Level",
            description: learnerData?.education?.grade_or_education_level || "",
        },
        {
            title: "IEP / 504 Plan",
            description: learnerData?.education?.program_iep_504_plan || "",
        },
        {
            title: "Academic Strengths",
            tags: (learnerData?.education?.academic_strengths || []).map((strength: string) =>
                formatString(strength)
            ),
        },
        {
            title: "Cultural / Religious Considerations",
            description: learnerData?.education?.cultural_religious_considerations || "",
        },
        {
            title: "Extracurricular Activities",
            description: learnerData?.education?.extracurricular_activities || "",
        },
        {
            title: "Favorite Free Time Activities",
            description: learnerData?.education?.favorite_free_time_activities || "",
        },
    ].filter((item) => (item.tags?.length ?? 0) > 0 || item.description);

    return (
        <div className="flex flex-col gap-5">
            <div className="px-5">
                <h3 className="font-medium mb-3 text-xl">Personal Details</h3>
                <div className="grid grid-cols-2 gap-3">
                    {personalDetails.map((item, index) => (
                        <ContentRender
                            key={index}
                            title={item?.title}
                            description={item?.description}
                        />
                    ))}
                </div>
            </div>

            <div className="px-5">
                <h3 className="font-medium mb-3 text-xl">Disability-Specific Information</h3>
                <div className="grid grid-cols-2 gap-3">
                    {specialNeeds.map((item, index) =>
                        item.tags ? (
                            <ContentRender
                                key={index}
                                title={item?.title}
                                description={item?.tags.join(", ")}
                            />
                        ) : (
                            <ContentRender
                                key={index}
                                title={item?.title}
                                description={item?.description}
                            />
                        )
                    )}
                </div>
            </div>

            <div className="px-5">
                <h3 className="font-medium mb-3 text-xl">Education and Hobbies</h3>
                <div className="grid grid-cols-2 gap-3">
                    {education.map((item, index) =>
                        item.tags ? (
                            <ContentRender
                                key={index}
                                title={item?.title}
                                description={item?.tags.join(", ")}
                            />
                        ) : (
                            <ContentRender
                                key={index}
                                title={item?.title}
                                description={item?.description}
                            />
                        )
                    )}
                </div>
            </div>

            <div className="px-5">
                <h3 className="font-medium mb-3 text-xl">Skills to Learn from Volunteers</h3>
                <div className="grid grid-cols-2 gap-3">
                    {learnerGoalsContent.map((item, index) => (
                        <ContentRender
                            key={index}
                            title={item?.title}
                            description={item?.description}
                            fullWidth={item?.fullWidth}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ReviewsContent = ({ learnerFeedback }: { learnerFeedback: any }) => {
    const ratingCardData = learnerFeedback?.feedbacks;

    return (
        <div className="flex flex-col gap-3">
            <div className="md:px-5">
                <div className="flex flex-col gap-5">
                    <RatingHeader
                        rating={learnerFeedback?.overall_rating}
                        totalReviews={learnerFeedback?.feedbacks.length}
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

const LearnerViewModal: React.FC<VolunteerViewModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const innerWidth = InnerWidth();
    const isMobileScreen = innerWidth < 768;

    const text = getLocalStorage("role");
    const [activeTab, setActiveTab] = useState("overview");
    const learnerId = searchParams.get("learnerId");

    const getIndividualLearner = async () => {
        const response: any = await GET_API(
            endpoints.learner.getIndividualLearner(learnerId as string)
        );
        return response.data;
    };

    const getLearnerFeedback = async () => {
        const response: any = await GET_API(endpoints.learnerFeedback.get(learnerId as string));
        return response.data;
    };

    const {
        data: learnerData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["learner", learnerId],
        queryFn: getIndividualLearner,
        enabled: !!learnerId,
    });

    const { data: learnerFeedback } = useQuery({
        queryKey: ["learnerFeedback", learnerId],
        queryFn: getLearnerFeedback,
        enabled: !!learnerId,
    });

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    if (isError) {
        return (
            <ViewModal modalOpen={isOpen} onClose={onClose} width={855}>
                <div className="p-5">Error loading learner data</div>
            </ViewModal>
        );
    }

    const handleScheduleMeeting = () => {
        router.push(`/learner/volunteer?volunteerId=${learnerId}&modal=add_new_meeting`);
    };
    const rating = learnerFeedback?.overall_rating;
    const totalReviews = learnerFeedback?.feedbacks?.length;

    return (
        <ViewModal
            modalOpen={isOpen}
            onClose={onClose}
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
                <div className="flex flex-col gap-0 md:gap-4 pt-4 md:py-4 h-full md:max-h-[90dvh]">
                    <ProfileHeader
                        text={text}
                        onClose={onClose}
                        onScheduleMeeting={handleScheduleMeeting}
                    />
                    <Divider className="max-md:hidden" />
                    <ProfileInfo text={text} learnerData={learnerData} />
                    <Divider className="max-md:hidden" />
                    <TabButtons
                        activeTab={activeTab}
                        handleTabChange={handleTabChange}
                        rating={rating}
                        totalReviews={totalReviews}
                        isMobileScreen={isMobileScreen}
                        learnerId={learnerId as string}
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
                                <OverviewContent learnerData={learnerData} />
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
                                    {learnerFeedback?.feedbacks.length > 0 ? (
                                        <ReviewsContent learnerFeedback={learnerFeedback} />
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

export default LearnerViewModal;
