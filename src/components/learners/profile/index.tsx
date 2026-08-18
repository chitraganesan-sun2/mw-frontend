"use client";

import BioHeader from "@/components/profile/Bio/BioHeader";
import Divider from "@/components/common/Divider";
import TagComponent from "@/components/common/Tag";
import ProfileCompletionBar, { calculateLearnerCompletion } from "@/components/profile/ProfileCompletionBar";
import { useState, useRef, useEffect, useMemo } from "react";
import { ParentGuardianInformation, ProfileDetails, LearnerInformation } from "./tabs";

const tabs = [
    { id: "profile-details", title: "Profile Details" },
    { id: "parent-guardian-information", title: "Guardian Info" },
    { id: "learner-information", title: "Personal Info" },
];

const LearnerProfileBio = ({ data }: any) => {
    const tabContentRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    const learner_first_name = data?.learner_personal_info?.learner_first_name;
    const learner_last_name = data?.learner_personal_info?.learner_last_name;
    const contactDetail = data?.learner_personal_info?.learner_contact_details;
    const timezone = contactDetail?.timezone;

    const profileHeader = {
        full_name: `${learner_first_name} ${learner_last_name}`,
        profile_picture: data?.profile_picture?.image_url,
        country: contactDetail?.country,
        gender: data?.learner_personal_info?.learner_gender,
        timezone: timezone,
        profile_video: data?.profile_video,
    };

    const completion = useMemo(() => calculateLearnerCompletion(data), [data]);

    useEffect(() => {
        if (tabContentRef.current) {
            tabContentRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeTab]);

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile-details":
                return <ProfileDetails data={data?.learner_personal_info} />;
            case "parent-guardian-information":
                return <ParentGuardianInformation data={data?.parent_info} />;
            case "learner-information":
                return <LearnerInformation data={data} />;
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
                    <span className="text-lg font-bold text-blue-700">{data?.total_volunteers_connected || 0}</span>
                    <span className="text-xs text-blue-600">Volunteers</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-lg font-bold text-green-700">{data?.total_attended_hours || 0}</span>
                    <span className="text-xs text-green-600">Hours</span>
                </div>
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

export default LearnerProfileBio;
