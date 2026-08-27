"use client";
import { endpoints } from "@/api/constants";
import { GET_API, PUT_API } from "@/api/request";
import { getHeaderIcon } from "@/layouts/helper";
import { useComponentStore } from "@/store/useComponenetStore";
import { Select, Switch } from "antd";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getCookie } from "@/utils/auth";
import DropDown from "@/assets/icons/DropDown";
import DeleteAccountSection from "@/components/common/DeleteAccountSection";

const SESSION_MATCH_OPTIONS = [
    {
        value: "all_sessions",
        label: "All Sessions",
        description:
            "Get an email every time a learner requests an instant session, so you can look over the topic and decide whether to accept.",
    },
    {
        value: "skills_to_learn",
        label: "Sessions matched for exact skills / match by Sentiment Analysis",
        description:
            "Get an email only when a learner's request matches the skills you offer — exact matches plus closely related ones we detect automatically.",
    },
    {
        value: "none",
        label: "No Email Notifications",
        description: "Don't email me when learners request instant sessions.",
    },
] as const;

type SessionMatchValue = (typeof SESSION_MATCH_OPTIONS)[number]["value"];

/** API expects: all_sessions | only_matches_for_skills | no_email_notifications */
const UI_TO_API_PREFERENCE: Record<SessionMatchValue, string> = {
    all_sessions: "all_sessions",
    skills_to_learn: "only_matches_for_skills",
    none: "no_email_notifications",
};

const API_TO_UI_PREFERENCE: Record<string, SessionMatchValue> = {
    all_sessions: "all_sessions",
    only_matches_for_skills: "skills_to_learn",
    no_email_notifications: "none",
};

const Settings = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [sessionMatchPreference, setSessionMatchPreference] =
        useState<SessionMatchValue>("all_sessions");
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();
    const volunteerId = getCookie("volunteer_id");
    const [isLoading, setIsLoading] = useState(false);

    const handlePermission = (value: any) => {
        setIsEnabled(value);
        PUT_API(endpoints.chat.volunteerPermission(volunteerId as string), {
            chat_permission: value,
        }).then((res) => {
            console.log(res, "PERMISSION VOLUNTEER");
        });
    };

    const handleEmailPreferenceChange = (value: SessionMatchValue) => {
        setSessionMatchPreference(value);
        const apiValue = UI_TO_API_PREFERENCE[value];
        PUT_API(endpoints.volunteer.emailPreference(volunteerId as string), {
            instant_session_email_preference: apiValue,
        }).catch((err) => {
            console.error(err, "EMAIL PREFERENCE");
        });
    };

    useEffect(() => {
        setHeaderOptions({
            title: "Settings",
            titleIcon: getHeaderIcon(pathname),
            hideSearch: true,
        });
    }, [setHeaderOptions]);

    useEffect(() => {
        setIsLoading(true);
        GET_API(endpoints.volunteer.getIndividualVolunteer(volunteerId as string))
            .then((res: any) => {
                setIsEnabled(res.data.chat_permission);
                const apiPref = res.data?.instant_session_email_preference;
                if (apiPref && API_TO_UI_PREFERENCE[apiPref] !== undefined) {
                    setSessionMatchPreference(API_TO_UI_PREFERENCE[apiPref]);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="w-full h-full bg-white flex border border-gray-200 md:rounded-tl-[3rem] animate-fadeIn">
            <div className="md:p-10 p-4 flex bg-[#f4f7fb] md:bg-transparent flex-col md:gap-8 gap-4 w-full">
                <p className="md:text-2xl text-[16px] font-medium">Message Permission Settings</p>
                <div className="flex bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full">
                    <div className="flex flex-col gap-2">
                        <p className="md:text-base text-[14px] font-medium">
                            Allow messages from volunteers to reach you.
                        </p>
                        <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                            By enabling this, you agree to receive communication from volunteers.
                        </p>
                    </div>
                    <Switch
                        checked={isEnabled}
                        loading={isLoading}
                        onChange={(value) => {
                            handlePermission(value);
                        }}
                        className="w-fit [&.ant-switch-checked]:bg-black"
                    />
                </div>

                <div className="flex flex-col md:flex-row bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full">
                    <div className="flex flex-col gap-2">
                        <p className="md:text-base text-[14px] font-medium">
                            Instant Session Email Notification Preferences
                        </p>
                        <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                            Manage email notifications for instant session requests posted by learners.
                        </p>
                    </div>
                    <Select
                        value={sessionMatchPreference}
                        onChange={(value) => handleEmailPreferenceChange(value)}
                        virtual={false}
                        suffixIcon={
                            <span className="flex items-center justify-center w-full h-full min-h-[0.5em]">
                                <DropDown />
                            </span>
                        }
                        options={SESSION_MATCH_OPTIONS.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                        }))}
                        optionRender={(option) => {
                            const item = SESSION_MATCH_OPTIONS.find(
                                (o) => o.value === option.value
                            );
                            return (
                                <div className="session-match-option py-3 px-3">
                                    <div className="text-sm font-medium text-[#121212]">
                                        {item?.label ?? option.label}
                                    </div>
                                    {item?.description && (
                                        <div className="text-[11px] font-normal mt-1 leading-snug text-[#121212]">
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                        popupClassName="session-match-dropdown"
                        dropdownAlign={{ points: ["tc", "bc"] }}
                        className="session-match-select w-full md:w-[400px] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-gray-300 [&_.ant-select-selector]:!h-auto [&_.ant-select-selector]:!min-h-10"
                    />
                </div>

                <DeleteAccountSection userId={volunteerId as string} role="volunteer" />
            </div>
        </div>
    );
};

export default Settings;
