"use client";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";
import Image from "next/image";
import CardChips from "./CardChips";
import Divider from "@/components/common/Divider";
import { FaStar } from "react-icons/fa";
import { formatString } from "@/utils/stringFormats";
import Button from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { formatRatingSummary } from "@/utils/formatRating";
import { safeImageSrc } from "@/utils/safeHref";
import { showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";

const LearnerCard: React.FC<LearnerCardProps> = ({
    onSeeMoreClick,
    learnerId,
    languages,
    location,
    name,
    profileImage,
    studentConnected,
    subjects,
    learnerHrs,
    totalReviews,
    overallRating,
    chatPermission,
    developementDisability,
    skillsToLearn,
}) => {
    const router = useRouter();    

    const handleChatClick = async () => {
        GET_API(endpoints.chat.createChatForLearner(learnerId))
            .then((res: any) => {
                router.push(`/volunteer/messages?chatId=${res.data.chat_id}&learnerId=${learnerId}`);
            })
            .catch((err: any) => {
                showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't open the chat. Please try again.") });
            });
    };

    const handleScheduleMeeting = () => {
        router.push(`/volunteer/learners?learnerId=${learnerId}&modal=add_new_meeting`);
    };

    return (
        <div className="bg-white rounded-xl w-full shadow-sm h-auto p-4 flex flex-col gap-4">
            {/* Profile Header */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => onSeeMoreClick(learnerId)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSeeMoreClick(learnerId);
                    }
                }}
                className="flex items-center gap-4 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
                aria-label={`View details for ${name}`}
            >
                <div className="w-[36px] h-[36px] rounded-full relative">
                    {/* Was `profileImage !== "image_url"` - comparing the actual URL against
                        the literal field-name string, which is always true for a real URL
                        (and for undefined/null), so the fallback branch below never ran and
                        every learner without a photo rendered <Image src="" .../>. */}
                    <Image
                        src={safeImageSrc(profileImage) || DummyProfileImg}
                        alt={`${name}'s avatar`}
                        fill
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-base font-semibold lg:text-normal underline text-primary lg:font-medium">
                        {name}
                    </p>
                    <p className="text-sm font-medium">
                        <span className="text-gray-light">
                            {location && `From ${formatString(location || "")}`}
                        </span>
                    </p>
                </div>
            </div>
            <div className="border-stroke border w-fit px-3 py-1.5 rounded-full">
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                        {overallRating ? (
                            <>
                                <span className="text-[#FFC107] pb-0.5">
                                    <FaStar />
                                </span>
                                <p className="text-sm font-medium flex items-center">
                                    <span>
                                        {formatRatingSummary(overallRating, totalReviews)}
                                    </span>
                                </p>
                            </>
                        ) : (
                            <p className="text-sm font-medium ">No Reviews</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
                <CardChips label="Hours Attended" value={learnerHrs || "0"} />
            </div>
            <div className="flex max-lg:flex-col gap-2.5">
                <CardChips label="Disability" value={developementDisability} />
                <CardChips label="Subject" value={subjects?.join(", ")} />
            </div>
            {languages && (
                <div>
                    <CardChips label="Language" value={languages} />
                </div>
            )}
            {skillsToLearn && skillsToLearn.length > 0 && (
                <div>
                    <CardChips 
                        label="Skills to Learn" 
                        value={skillsToLearn.map(skill => skill.skill_name).join(", ")} 
                    />
                </div>
            )}
            <Divider />
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <Button
                        onClick={handleScheduleMeeting}
                        title="Schedule a session"
                        className="!rounded-xl !text-sm !w-full btn-primary-fill"
                    />
                </div>
                <div className="flex-1">
                    <Button
                        disabled={!chatPermission}
                        onClick={handleChatClick}
                        title="Start Chat"
                        btnVariant="secondary"
                        className="!rounded-xl !text-sm !w-full !bg-white hover:!bg-black hover:!text-white !text-black !border-stroke"
                    />
                </div>
            </div>
        </div>
    );
};

export default LearnerCard;
