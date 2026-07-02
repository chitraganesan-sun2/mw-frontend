"use client";

import BioHeader from "@/components/profile/Bio/BioHeader";
import Divider from "@/components/common/Divider";
import TagComponent from "@/components/common/Tag";
import ProfileCompletionBar, { calculateVolunteerCompletion } from "@/components/profile/ProfileCompletionBar";
import { useState, useRef, useEffect, useMemo } from "react";
import { ProfileDetails, VolunteerContactDetails } from "./tabs";

const tabs = [
    { id: "profile-details", title: "Profile Details" },
    { id: "contact-details", title: "Contact Details" },
];

const VolunteerProfileBio = ({ data }: any) => {
    const tabContentRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    const volunteer_first_name = data?.volunteer_first_name;
    const volunteer_last_name = data?.volunteer_last_name;
    const contactDetail = data?.volunteer_contact_details;

    const profileHeader = {
        full_name: `${volunteer_first_name} ${volunteer_last_name}`,
        profile_picture: data?.profile_picture?.image_url,
        country: contactDetail?.country,
        gender: data?.volunteer_gender,
        timezone: contactDetail?.timezone,
        profile_video: data?.profile_video,
    };

    const completion = useMemo(() => calculateVolunteerCompletion(data), [data]);

    useEffect(() => {
        if (tabContentRef.current) {
            tabContentRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeTab]);

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile-details":
                return <ProfileDetails data={data} />;
            case "contact-details":
                return <VolunteerContactDetails data={data?.volunteer_contact_details} />;
        }
    };

    return (
        <div className="bg-white rounded-3xl w-full flex flex-col gap-4 py-5 h-[83vh]">
            <BioHeader data={profileHeader} />

            {/* Profile Completion */}
            {completion.percentage < 100 && (
                <ProfileCompletionBar
                    percentage={completion.percentage}
                    missingFields={completion.missingFields}
                />
            )}

            {/* Stats Overview */}
            <div className="flex items-center gap-4 px-5">
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                    <span className="text-lg font-bold text-blue-700">{data?.students_connected || 0}</span>
                    <span className="text-xs text-blue-600">Learners</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-lg font-bold text-green-700">{data?.total_volunteered_hours || 0}</span>
                    <span className="text-xs text-green-600">Hours</span>
                </div>
                {data?.volunteer_skills?.length > 0 && (
                    <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-2">
                        <span className="text-lg font-bold text-purple-700">{data.volunteer_skills.length}</span>
                        <span className="text-xs text-purple-600">Skills</span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 px-4">
                {tabs.map((tab) => (
                    <div key={tab.id} className="cursor-pointer">
                        <TagComponent
                            text={tab.title}
                            className={`!text-sm py-1.5 px-4 border rounded-lg transition-colors ${
                                activeTab === tab.id
                                    ? "bg-background border-primary font-medium"
                                    : "bg-background-input text-gray-dark border-gray-dark hover:border-primary/50"
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    </div>
                ))}
            </div>

            <Divider />

            {/* Tab Content */}
            <div className="px-5 h-full overflow-y-auto no-scrollbar">
                <div ref={tabContentRef} />
                {renderTabContent()}
            </div>
        </div>
    );
};

export default VolunteerProfileBio;
