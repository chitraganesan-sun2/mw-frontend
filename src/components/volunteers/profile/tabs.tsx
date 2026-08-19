import ContactDetails from "@/components/profile/Bio/ContactDetails";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { formatString } from "@/utils/stringFormats";
import { SUPPORT_PREFERENCE_OPTIONS_REQUIRING_DETAILS } from "@/constants/volunteer";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useRef } from "react";

dayjs.extend(customParseFormat);

const InfoItem = ({ label, value }: { label: string, value: string | string[] }) => {
    if (!value) return null;

    const renderValue = (value: string | string[] | { value: string }, label: string) => {
        if (Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map((item, index) => (
                        <p key={index} className="text-xs px-2 py-1 rounded-full font-medium bg-background break-words">
                            {formatString(item)}
                        </p>
                    ))}
                </div>
            );
        }
        const stringValue = typeof value === "object" ? value?.value : value;
        const formattedValue = label === "Guardian Email" ? stringValue?.toLowerCase() : formatString(stringValue);
        return <p className="text-base font-medium break-words">{formattedValue}</p>;
    };
    
    const isFullWidth = (Array.isArray(value) && value.length > 3) || String(value).length > 40;
    return (
        <div className={`flex flex-col gap-1 ${isFullWidth ? "col-span-2" : ""}`}>
            <p className="text-sm font-normal text-gray-light">{label}</p>
            {renderValue(value, label)}
        </div>
    )
}

export const ProfileDetails = ({ data }: { data: Volunteer }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const videoContainerRef = useRef<HTMLDivElement | null>(null);

    const stopVideo = () => {
        const video = videoRef.current;
        if (!video) return;
        try {
            video.pause();
            video.currentTime = 0;
        } catch (_) {}
    };

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target as Node | null;
            const isInside = videoContainerRef.current?.contains(target as Node);
            if (!isInside) {
                stopVideo();
            }
        };
        const handleVisibility = () => {
            if (document.hidden) stopVideo();
        };

        document.addEventListener("click", handleDocumentClick, true);
        document.addEventListener("visibilitychange", handleVisibility);
        return () => {
            document.removeEventListener("click", handleDocumentClick, true);
            document.removeEventListener("visibilitychange", handleVisibility);
            stopVideo();
        };
    }, []);
    const details = [
        { label: "First Name", value: data?.volunteer_first_name },
        { label: "Last Name", value: data?.volunteer_last_name },
        { label: "Date of Birth", value: dayjs(data?.volunteer_birth_date, "DD-MM-YYYY").format("DD-MMM-YYYY") },
        { label: "Gender", value: formatString(data?.volunteer_gender) },
        { label: "Languages Spoken", value: data?.volunteer_languages?.map((language) => language.language_name) },
        { label: "Preferred Learner Age Group", value: data?.preferred_learner_age_group },
        { label: "Academic Subjects", value: data?.volunteer_subjects?.map((subject) => subject.subject_name) },
        { label: "More about your academic skills", value: data?.volunteer_academic_skills_notes },
        { label: "Arts & Life Skills", value: data?.volunteer_skills?.map((skill) => skill.skill_name) },
        { label: "More about your arts/life skills", value: data?.volunteer_arts_life_skills_notes },
        {
            label: "Support Preference",
            value: data?.support_preference,
        },
        {
            label: "Support Preference Details",
            value: SUPPORT_PREFERENCE_OPTIONS_REQUIRING_DETAILS.includes(data?.support_preference || "")
                ? data?.support_preference_details
                : "",
        },
        { label: "Teaching Traits, Preferences & Limitations", value: data?.volunteer_teaching_traits },
        { label: "Higher Education", value: data?.volunteer_higher_education },
        { label: "Education Summary", value: data?.volunteer_education },
        { label: "Volunteered Experience", value: data?.volunteer_experience },
        { label: "Work Experience", value: data?.volunteer_work_experience },
        { label: "Favorite Free Time Activities", value: data?.volunteer_favorite_activities },
        { label: "Description", value: data?.volunteer_description },
        { label: "Consented from Guardian", value: data?.consented_from_parent ? "Yes" : "No" },
        { label: "Guardian Name", value: data?.volunteer_parent_name },
        { label: "Guardian Email", value: data?.volunteer_parent_email },
        { label: "Guardian Phone", value: data?.volunteer_parent_contact_number?.number },
    ].filter(detail => detail.value && Object.keys(detail.value).length);
    
    const renderAboutMeVideo = () => {
        const anyData: any = data as any;
        const videoSrc = data?.profile_video?.video_url || anyData?.profile_video?.url || anyData?.video_url || anyData?.url;
        if (!videoSrc) return null;
        return (
            <div ref={videoContainerRef} className="mb-5">
                <p className="text-sm text-gray-light font-normal mb-2">About me</p>
                <div className="w-full flex justify-start">
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        controls
                        preload="metadata"
                        className="w-full max-w-2xl rounded-xl shadow-lg"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h5 className="text-xl font-semibold mb-3">Profile Details</h5>
            {renderAboutMeVideo()}
            <div className="grid grid-cols-2 gap-3">

                {details.map((detail) => (
                    <InfoItem key={detail.label} label={detail.label} value={detail?.value || ""} />
                ))}
            </div>
        </div>
    )
}


export const VolunteerContactDetails = ({ data }: { data: Volunteercontactdetails }) => {
    const details = [
        { label: "Country of Residence", value: data?.country },
        { label: "Zip Code", value: data?.zip_code },
        { label: "Timezone", value: data?.timezone },
        { label: "UTC Offset", value: data?.utc_offset },
    ]

    const contactDetails = [
        { title: "Email", value: data?.email, icon: <MdEmail size={13} /> },
        { title: "Phone Number", value: data?.contact_number?.number, icon: <FaPhoneAlt size={13} /> },
    ]

    return (
        <div>
            <h5 className="text-xl font-semibold mb-3">Contact Details</h5>
            <div className="grid grid-cols-2 gap-3">
                {details.map((detail) => (
                    <InfoItem key={detail.label} label={detail.label} value={detail.value} />
                ))}
                <div className="col-span-2">
                    <ContactDetails tags={contactDetails} />
                </div>
            </div>
        </div>
    )
}
