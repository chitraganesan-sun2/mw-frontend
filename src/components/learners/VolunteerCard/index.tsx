"use client";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";
import Image from "next/image";
import CardChips from "./CardChips";
import Divider from "@/components/common/Divider";
import { FaStar } from "react-icons/fa";
import { formatString } from "@/utils/stringFormats";
import Button from "@/components/common/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { formatRatingSummary } from "@/utils/formatRating";
import { safeImageSrc } from "@/utils/safeHref";
import { showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";

/** Subjects then skills, de-duplicated (case-insensitive), without the "None" placeholder an empty picker can leave behind. */
const combineSkillNames = (subjects?: string[], skills?: Array<{ skill_name: string }>): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of [...(Array.isArray(subjects) ? subjects : []), ...(skills ?? []).map((s) => s?.skill_name)]) {
        const name = typeof raw === "string" ? raw.trim() : "";
        const key = name.toLowerCase();
        if (!name || key === "none" || seen.has(key)) continue;
        seen.add(key);
        out.push(name);
    }
    return out;
};

const VolunteerCard: React.FC<VolunteerCardProps> = ({
    onSeeMoreClick,
    volunteerId,
    languages,
    location,
    name,
    profileImage,
    subjects,
    totalReviews,
    overallRating,
    chatPermission,
    hasTimeSlots,
    acceptingRequests,
    skillsToLearn,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const allSkills = combineSkillNames(subjects, skillsToLearn);

    const handleChatClick = async () => {
        GET_API(endpoints.chat.createChatForVolunteer(volunteerId))
            .then((res: any) => {
                router.push(`/learner/messages?chatId=${res.data.chat_id}&volunteerId=${volunteerId}`);
            })
            .catch((err: any) => {
                showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't open the chat. Please try again.") });
            });
    };

    const handleScheduleMeeting = () => {
        // Keep the tab: opening Book for Later from "My Matches" used to flip the page to "All Volunteers"
        // behind the drawer (and load that whole list), and closing it left the person on the wrong tab.
        const tabParam = searchParams.get("tab");
        router.push(
            `/learner/volunteer?volunteerId=${volunteerId}&modal=add_new_meeting${tabParam ? `&tab=${encodeURIComponent(tabParam)}` : ""}`
        );
    };

    return (
        <div className="bg-white rounded-xl w-full shadow-sm h-auto p-4 flex flex-col gap-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    aria-label={`View ${name}'s profile`}
                    onClick={() => onSeeMoreClick(volunteerId)}
                    className="w-[36px] h-[36px] rounded-full relative cursor-pointer appearance-none border-0 bg-transparent p-0 shrink-0"
                >
                    <Image
                        src={safeImageSrc(profileImage) || DummyProfileImg}
                        alt="avatar"
                        fill
                        className="w-full h-full object-cover rounded-full"
                    />
                </button>
                <div className="flex flex-col">
                    <button
                        type="button"
                        onClick={() => onSeeMoreClick(volunteerId)}
                        className="text-base font-semibold lg:text-normal underline text-primary cursor-pointer lg:font-medium appearance-none border-0 bg-transparent p-0 text-left"
                    >
                        {name}
                    </button>
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
                            <p className="text-sm font-medium ">No reviews yet</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2.5">
                {Array.isArray(languages) && languages.length > 0 && (
                    <CardChips label="I speak" value={languages.join(", ")} />
                )}
                {/* One combined line (academic subjects first, then other skills) so the card shows more
                    at a glance; the Academic / Arts & Life split lives in the profile view. */}
                {allSkills.length > 0 && <CardChips label="Skills" value={allSkills.join(", ")} wrap />}
            </div>
            <Divider />
            {/* "Book for Later" only when the volunteer has recurring availability slots
                (hasTimeSlots). An explicit false replaces it with a note saying why there is no
                button; undefined callers keep both buttons. */}
            <div className="flex items-center gap-2">
                {acceptingRequests === false ? (
                    <p className="flex-1 text-center text-xs text-gray-600" title="This volunteer isn't taking new requests right now. You can still message them.">
                        Not taking new requests right now
                    </p>
                ) : hasTimeSlots !== false ? (
                    <div className="flex-1">
                        <Button
                            onClick={handleScheduleMeeting}
                            title="Book for Later"
                            className="!rounded-xl !text-sm !w-full btn-primary-fill"
                        />
                    </div>
                ) : (
                    <p className="flex-1 text-center text-xs text-gray-600" title="This volunteer has no open times to book right now. You can still message them.">
                        No open times right now
                    </p>
                )}
                <div className="flex-1">
                    <Button
                        disabled={!chatPermission}
                        onClick={handleChatClick}
                        title="Message"
                        btnVariant="secondary"
                        className="!rounded-xl !text-sm !w-full !bg-white hover:!bg-action-hover hover:!text-white !text-black !border-stroke"
                    />
                </div>
            </div>
        </div>
    );
};

export default VolunteerCard;
