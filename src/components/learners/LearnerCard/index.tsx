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
        GET_API(endpoints.chat.createChatForLearner(learnerId)).then((res: any) => {
            console.log(res, "chat response");
            router.push(`/volunteer/messages?chatId=${res.data.chat_id}&learnerId=${learnerId}`);
        });
    };

    return (
        <div className="bg-white rounded-xl w-full shadow-sm h-auto p-4 flex flex-col gap-4">
            {/* Profile Header */}
            <div onClick={() => onSeeMoreClick(learnerId)} className="flex items-center gap-4">
                <div className="w-[36px] h-[36px] rounded-full relative cursor-pointer">
                    {profileImage !== "image_url" ? (
                        <Image
                            src={profileImage}
                            alt="avatar"
                            fill
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <Image
                            src={DummyProfileImg}
                            alt="avatar"
                            fill
                            className="w-full h-full object-cover rounded-full"
                        />
                    )}
                </div>
                <div className="flex flex-col">
                    <p
                        onClick={() => onSeeMoreClick(learnerId)}
                        className="text-base font-semibold lg:text-normal underline text-primary cursor-pointer lg:font-medium"
                    >
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
                                        {overallRating} - {totalReviews} Reviews
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
            <div className="flex items-center justify-between">
                <Button
                    disabled={!chatPermission}
                    onClick={handleChatClick}
                    title="Start Chat"
                    btnVariant="secondary"
                    className="!rounded-xl !text-sm !w-full !bg-white hover:!bg-black hover:!text-white !text-black !border-stroke"
                />
            </div>
        </div>
    );
};

export default LearnerCard;
