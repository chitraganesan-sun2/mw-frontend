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

const VolunteerCard: React.FC<VolunteerCardProps> = ({
    onSeeMoreClick,
    volunteerId,
    languages,
    location,
    name,
    profileImage,
    studentConnected,
    subjects,
    volunteerHrs,
    totalReviews,
    overallRating,
    chatPermission,
    skillsToLearn,
}) => {
    const router = useRouter();

    const handleChatClick = async () => {
        GET_API(endpoints.chat.createChatForVolunteer(volunteerId)).then((res: any) => {
            console.log(res, "chat response");
            router.push(`/learner/messages?chatId=${res.data.chat_id}&volunteerId=${volunteerId}`);
        });
    };

    const handleScheduleMeeting = () => {
        router.push(`/learner/volunteer?volunteerId=${volunteerId}&modal=add_new_meeting`);
    };

    return (
        <div className="bg-white rounded-xl w-full shadow-sm h-auto p-4 flex flex-col gap-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
                <div
                    onClick={() => onSeeMoreClick(volunteerId)}
                    className="w-[36px] h-[36px] rounded-full relative cursor-pointer"
                >
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
                        onClick={() => onSeeMoreClick(volunteerId)}
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
                <CardChips label="Volunteer Hrs" value={volunteerHrs || "0"} />
            </div>
            <div className="flex max-lg:flex-col gap-2.5">
                <CardChips label="Student connected" value={studentConnected} />
                <CardChips label="Subject" value={subjects?.join(", ")} />
            </div>
            {Array.isArray(languages) && languages?.length > 0 && (
                <div>
                    <CardChips label="Language" value={languages.join(", ")} />
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
                        title="Schedule a meeting"
                        className="!rounded-xl !text-sm !w-full !text-black !bg-primary !border-primary !border"
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

export default VolunteerCard;
