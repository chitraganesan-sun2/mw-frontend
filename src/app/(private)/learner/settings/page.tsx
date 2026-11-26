"use client";
import { endpoints } from "@/api/constants";
import { GET_API, PUT_API } from "@/api/request";
import { getHeaderIcon } from "@/layouts/helper";
import { useComponentStore } from "@/store/useComponenetStore";
import { Select, Switch } from "antd";
import { getCookie } from "@/utils/auth";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import DropDown from "@/assets/icons/DropDown";
import DeleteAccountSection from "@/components/common/DeleteAccountSection";
import ExportDataSection from "@/components/common/ExportDataSection";
import DonationHistorySection from "@/components/common/DonationHistorySection";
import BlockedMembersSection from "@/components/common/BlockedMembersSection";
import RecordingConsentSection from "@/components/common/RecordingConsentSection";
import { getApiErrorMessage } from "@/utils/apiError";
import { WINGTIME_ENABLED } from "@/config/wingtime";
import { showToast } from "@/components/common/Toast";

const SESSION_MATCH_OPTIONS = [
    {
        value: "all_sessions",
        label: "All Sessions",
        description:
            "Get an alert (push and email) every time a volunteer posts an instant session, so you can look over the topic and decide whether to join.",
    },
    {
        value: "skills_to_learn",
        label: "Sessions Matching What I Want to Learn",
        description:
            "Get an alert only when a volunteer's session matches what you want to learn — exact matches plus closely related ones we detect automatically.",
    },
    {
        value: "none",
        label: "No Instant Session Alerts",
        description: "Don't notify me (by push or email) when volunteers post instant sessions.",
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
    // Anonymous "Learner stories" on the public website - on by default, off once opted out.
    const [showcaseEnabled, setShowcaseEnabled] = useState(true);
    // On by default (like the learning goals above); the learner/guardian can turn it off.
    const [showcaseDisability, setShowcaseDisability] = useState(true);
    const [sessionMatchPreference, setSessionMatchPreference] =
        useState<SessionMatchValue>("all_sessions");
    const [pushEnabled, setPushEnabled] = useState(true);
    // Optional emails (reminders, WingTime updates). On unless turned off; sign-in codes and approval/safety emails always send.
    const [emailEnabled, setEmailEnabled] = useState(true);
    // WingTime announcements are opt-in: off until the learner (or their guardian) turns them on.
    const [wingTimeEnabled, setWingTimeEnabled] = useState(false);
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();
    const learnerId = getCookie("learner_id");
    // true until the saved settings have loaded: the switches show a spinner and cannot be
    // flipped meanwhile, instead of flashing their defaults (chat OFF) for a second.
    const [isLoading, setIsLoading] = useState(true);

    const handlePermission = (value: any) => {
        const previous = isEnabled;
        setIsEnabled(value);
        PUT_API(endpoints.chat.learnerPermission(learnerId as string), {
            chat_permission: value,
        }).then(() => {
            showToast({ type: "success", message: "Setting saved." });
        }).catch((err) => {
            // Roll back the switch and say so - it previously stayed flipped even when the
            // save failed, which is misleading for a privacy-relevant control.
            setIsEnabled(previous);
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't save that setting. Please try again.") });
        });
    };

    const handleShowcaseChange = (value: boolean) => {
        const previous = showcaseEnabled;
        setShowcaseEnabled(value);
        PUT_API(`${endpoints.learner.getIndividualLearner(learnerId as string)}/showcase_consent`, {
            consent: value,
        }).then(() => {
            showToast({ type: "success", message: "Setting saved." });
        }).catch((err) => {
            setShowcaseEnabled(previous);
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't save that setting. Please try again.") });
        });
    };

    const handleShowcaseDisabilityChange = (value: boolean) => {
        const previous = showcaseDisability;
        setShowcaseDisability(value);
        PUT_API(`${endpoints.learner.getIndividualLearner(learnerId as string)}/showcase_disability`, {
            share: value,
        }).then(() => {
            showToast({ type: "success", message: "Setting saved." });
        }).catch((err) => {
            setShowcaseDisability(previous);
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't save that setting. Please try again.") });
        });
    };

    const handleEmailPreferenceChange = (value: SessionMatchValue) => {
        const previous = sessionMatchPreference;
        setSessionMatchPreference(value);
        const apiValue = UI_TO_API_PREFERENCE[value];
        PUT_API(`${endpoints.learner.getIndividualLearner(learnerId as string)}/email_preference`, {
            instant_session_email_preference: apiValue,
        }).then(() => {
            showToast({ type: "success", message: "Setting saved." });
        }).catch((err) => {
            setSessionMatchPreference(previous);
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't save that setting. Please try again.") });
        });
    };

    const handlePushPreferenceChange = (value: boolean) => {
        const previous = pushEnabled;
        setPushEnabled(value);
        PUT_API(`${endpoints.learner.getIndividualLearner(learnerId as string)}/email_preference`, {
            push_notifications_enabled: value,
        }).then(() => {
            showToast({ type: "success", message: "Setting saved." });
        }).catch((err) => {
            setPushEnabled(previous);
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't save that setting. Please try again.") });
        });
    };

    const handleEmailEnabledChange = (value: boolean) => {
        const previous = emailEnabled;
        setEmailEnabled(value);
        PUT_API(`${endpoints.learner.getIndividualLearner(learnerId as string)}/email_preference`, {
            email_notifications_enabled: value,
        }).then(() => {
            showToast({ type: "success", message: "Setting saved." });
        }).catch((err) => {
            setEmailEnabled(previous);
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't save that setting. Please try again.") });
        });
    };

    const handleWingTimePreferenceChange = (value: boolean) => {
        const previous = wingTimeEnabled;
        setWingTimeEnabled(value);
        PUT_API(`${endpoints.learner.getIndividualLearner(learnerId as string)}/email_preference`, {
            wingtime_notifications_enabled: value,
        }).then(() => {
            showToast({ type: "success", message: "Setting saved." });
        }).catch((err) => {
            setWingTimeEnabled(previous);
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't save that setting. Please try again.") });
        });
    };

    useEffect(() => {
        setHeaderOptions({
            title: "Settings",
            titleIcon: getHeaderIcon(pathname),
            hideSearch: true,
        });
    }, [setHeaderOptions, pathname]);

    useEffect(() => {
        setIsLoading(true);
        GET_API(endpoints.learner.getIndividualLearner(learnerId as string))
            .then((res: any) => {
                // The backend treats a missing chat_permission as allowed (`is not False`),
                // so only an explicit false means messages are blocked.
                setIsEnabled(res.data?.chat_permission !== false);
                setShowcaseEnabled(res.data?.consent_and_permissions?.showcase_consent !== false);
                setShowcaseDisability(res.data?.consent_and_permissions?.showcase_disability !== false);
                const apiPref = res.data?.instant_session_email_preference;
                if (apiPref && API_TO_UI_PREFERENCE[apiPref] !== undefined) {
                    setSessionMatchPreference(API_TO_UI_PREFERENCE[apiPref]);
                }
                if (typeof res.data?.push_notifications_enabled === "boolean") {
                    setPushEnabled(res.data.push_notifications_enabled);
                }
                setEmailEnabled(res.data?.email_notifications_enabled !== false);
                setWingTimeEnabled(res.data?.wingtime_notifications_enabled === true);
            })
            .catch((err) => {
                showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't load your settings. Please try again.") });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [learnerId]);
    return (
        <div className="w-full h-full bg-white flex border border-gray-200 md:rounded-tl-[3rem] animate-fadeIn">
            <div className="p-4 bg-[#f4f7fb] md:bg-transparent md:p-10 flex flex-col md:gap-8 gap-4 w-full">
                <p className="md:text-2xl text-[16px] font-medium">Message Permission Settings</p>
                <div className="flex bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full">
                    <div className="flex flex-col gap-2">
                        <p id="chat-permission-label" className="md:text-base text-[14px] font-medium">
                            Let volunteers message you.
                        </p>
                        <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                            By enabling this, you agree to receive communication from volunteers.
                        </p>
                    </div>
                    <Switch
                        aria-labelledby="chat-permission-label"
                        checked={isEnabled}
                        loading={isLoading}
                        onChange={(value) => {
                            handlePermission(value);
                        }}
                        className="w-fit [&.ant-switch-checked]:bg-action"
                    />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
                    <div className="flex flex-col gap-2">
                        <p id="showcase-label" className="md:text-base text-[14px] font-medium">
                            Share my learning goals anonymously.
                        </p>
                        <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                            By default, MelodyWings may show the learner&apos;s age and the skills they want to learn on
                            our public website. No name, photo or contact details are ever shown. For a learner under
                            18, a parent or guardian decides. Turn this off at any time and it disappears right away.
                        </p>
                    </div>
                    <Switch
                        aria-labelledby="showcase-label"
                        checked={showcaseEnabled}
                        loading={isLoading}
                        onChange={handleShowcaseChange}
                        className="w-fit [&.ant-switch-checked]:bg-action"
                    />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
                    <div className="flex flex-col gap-2">
                        <p id="showcase-disability-label" className="md:text-base text-[14px] font-medium">
                            Also show the type of disability.
                        </p>
                        <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                            By default, the learner&apos;s story card on our public website also shows the type of
                            developmental disability entered in the profile, so others know they aren&apos;t alone. No
                            name, photo or contact details are ever shown. Only applies while sharing learning goals
                            above is on. For a learner under 18, a parent or guardian decides. Turn it off at any time
                            and it disappears right away.
                        </p>
                    </div>
                    <Switch
                        aria-labelledby="showcase-disability-label"
                        checked={showcaseDisability}
                        disabled={!showcaseEnabled}
                        loading={isLoading}
                        onChange={handleShowcaseDisabilityChange}
                        className="w-fit [&.ant-switch-checked]:bg-action"
                    />
                </div>

                {/* One card for every way we get in touch: push + email. */}
                <section
                    aria-labelledby="notifications-heading"
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-6"
                >
                    <div className="flex flex-col gap-1">
                        <h2 id="notifications-heading" className="md:text-2xl text-[16px] font-medium">
                            Notifications
                        </h2>
                        <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                            Choose how we let you know about sessions, messages, and instant sessions.
                        </p>
                    </div>

                <div className="flex bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full">
                    <div className="flex flex-col gap-2">
                        <p id="push-notifications-label" className="md:text-base text-[14px] font-medium">Push Notifications</p>
                        <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                            Get push notifications on your device for sessions, messages, and matches.
                        </p>
                    </div>
                    <Switch
                        aria-labelledby="push-notifications-label"
                        checked={pushEnabled}
                        loading={isLoading}
                        onChange={(value) => handlePushPreferenceChange(value)}
                        className="w-fit [&.ant-switch-checked]:bg-action"
                    />
                </div>

                <div className="flex bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full md:border-t md:border-gray-100 md:pt-5">
                    <div className="flex flex-col gap-2">
                        <p id="email-notifications-label" className="md:text-base text-[14px] font-medium">Email Notifications</p>
                        <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                            Get emails with reminders and updates about your sessions and WingTimes. Sign-in codes, approval decisions and safety notices are always sent.
                        </p>
                    </div>
                    <Switch
                        aria-labelledby="email-notifications-label"
                        checked={emailEnabled}
                        loading={isLoading}
                        onChange={(value) => handleEmailEnabledChange(value)}
                        className="w-fit [&.ant-switch-checked]:bg-action"
                    />
                </div>

                {WINGTIME_ENABLED && (
                    <div className="flex bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full md:border-t md:border-gray-100 md:pt-5">
                        <div className="flex flex-col gap-2">
                            <p id="wingtime-notifications-label" className="md:text-base text-[14px] font-medium">
                                WingTime Announcements
                            </p>
                            <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                                Get a notification when a volunteer opens a new WingTime group session in your country. Off unless you turn it on.
                            </p>
                        </div>
                        <Switch
                            aria-labelledby="wingtime-notifications-label"
                            checked={wingTimeEnabled}
                            loading={isLoading}
                            onChange={(value) => handleWingTimePreferenceChange(value)}
                            className="w-fit [&.ant-switch-checked]:bg-action"
                        />
                    </div>
                )}

                <div className="flex flex-col md:flex-row bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full md:border-t md:border-gray-100 md:pt-5">
                    <div className="flex flex-col gap-2">
                        {/* A real <label htmlFor> - AntD Select drops aria-label before it
                            reaches the combobox input, but forwards id. */}
                        <label htmlFor="instant-session-email-preference" className="md:text-base text-[14px] font-medium">
                            Instant Session Alerts
                        </label>
                        <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                            Choose which instant sessions posted by volunteers we alert you about, by push and email.
                        </p>
                    </div>
                    <Select
                        id="instant-session-email-preference"
                        disabled={isLoading}
                        loading={isLoading}
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
                            const isSelected = option.value === sessionMatchPreference;
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
                        classNames={{ popup: { root: "session-match-dropdown" } }}
                        popupAlign={{ points: ["tc", "bc"] }}
                        className="session-match-select w-full md:w-[400px] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-gray-300 [&_.ant-select-selector]:!h-auto [&_.ant-select-selector]:!min-h-10"
                    />
                </div>

                </section>

                <BlockedMembersSection />

                <RecordingConsentSection />

                <DonationHistorySection />
                <ExportDataSection role="learner" />
                <DeleteAccountSection userId={learnerId as string} role="learner" />
            </div>
        </div>
    );
};

export default Settings;
