"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useJoinUsStore } from "@/store/useJoinUsStore";
import { submitStep2, updateStep2 } from "@/api/join-us";
import { showToast } from "@/components/common/Toast";
import Button from "@/components/common/Button";
import PositionCard from "../PositionCard";

const POSITION_OPTIONS = [
    {
        value: "social_media_intern",
        label: "Social Media Intern",
        description:
            "Help grow MelodyWings' online presence by creating engaging content and sharing stories from our community.",
        responsibilities: [
            "Creating posts for Instagram, TikTok, and other platforms",
            "Designing simple graphics or short videos",
            "Highlighting volunteer stories and learner experiences",
            "Assisting with campaigns that promote MelodyWings sessions and events",
        ],
    },
    {
        value: "volunteer_outreach_intern",
        label: "Volunteer Outreach Intern",
        description:
            "Support the growth of our volunteer community by helping recruit and communicate with new mentors.",
        responsibilities: [
            "Reaching out to potential volunteers through schools, clubs, and organizations",
            "Helping onboard new volunteers to the platform",
            "Assisting with volunteer communication and engagement",
        ],
    },
    {
        value: "learner_outreach_intern",
        label: "Learner Outreach Intern",
        description:
            "Help connect more learners and families to MelodyWings so they can benefit from our sessions.",
        responsibilities: [
            "Supporting outreach to schools, NGOs, and support communities",
            "Helping parents and learners sign up and stay engaged with sessions",
            "Assisting with communication for new program launches and community programs",
        ],
    },
    {
        value: "operations_intern",
        label: "Operations Intern",
        description:
            "Help support the behind the scenes systems that keep MelodyWings running smoothly.",
        responsibilities: [
            "Assisting with organizational processes",
            "Helping track sessions, volunteers, and program metrics",
            "Supporting administrative tasks",
            "Helping ensure programs and testing the platform when new updates are pushed out",
        ],
    },
    {
        value: "partnerships_intern",
        label: "Partnerships & Community Relations Intern",
        description:
            "Help MelodyWings build relationships with organizations that share our mission.",
        responsibilities: [
            "Reaching out to potential nonprofit and community partners",
            "Helping coordinate collaborative events or initiatives",
            "Supporting communication with partner organizations",
            "Researching new partnership opportunities",
        ],
    },
];

const JoinUsStep2Page = () => {
    const router = useRouter();
    const { applicationId, step1Submitted, step2Submitted, setStep2Submitted, step2Data, setStep2Data } = useJoinUsStore();
    const [loading, setLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<string>(step2Data?.selected_position || "");
    const [customRole, setCustomRole] = useState(step2Data?.custom_role_description || "");
    const OTHER_VALUE = "other_custom_role";

    React.useEffect(() => {
        if (!step1Submitted || !applicationId) {
            setIsRedirecting(true);
            router.replace('/join-us/step-1');
        }
    }, [step1Submitted, applicationId, router]);


    const isNextEnabled =
        !loading &&
        !!selectedPosition &&
        (selectedPosition !== OTHER_VALUE || !!customRole.trim());

    const handleNext = async () => {
        if (!applicationId) {
            showToast({ type: 'error', message: 'Application ID missing. Please start from Step 1.' });
            router.push('/join-us/step-1');
            return;
        }
        if (!selectedPosition) {
            showToast({ type: 'error', message: 'Please select a position.' });
            return;
        }

        const selectedOpt = POSITION_OPTIONS.find(opt => opt.value === selectedPosition);

        const payload = {
            application_id: applicationId,
            selected_position: selectedPosition,
            custom_role_description: selectedPosition === OTHER_VALUE ? customRole : null,
            position: selectedOpt ? {
                title: selectedOpt.label,
                description: selectedOpt.description,
                responsibilities: selectedOpt.responsibilities
            } : (selectedPosition === OTHER_VALUE ? {
                title: "Other (Custom Role)",
                description: customRole,
                responsibilities: []
            } : null)
        };

        setLoading(true);
        let navigated = false;
        try {
            if (!step2Submitted) {
                await submitStep2(payload);
                setStep2Submitted(true);
            } else {
                await updateStep2(applicationId, payload);
            }
            setStep2Data(payload);
            router.push('/join-us/step-3');
            navigated = true;
        } catch (err: any) {
            showToast({ type: 'error', message: err?.message || 'Something went wrong!' });
        } finally {
            if (!navigated) setLoading(false);
        }
    };

    if (isRedirecting) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background-input flex flex-col items-center">
            {/* Title section (consistent with step 1) */}
            <section className="w-full px-4 flex flex-col items-center justify-center pt-10 md:pt-16">
                <div className="max-w-5xl md:mx-auto md:px-8 text-center">
                    <h1 className="text-[24px] md:text-[32px] font-medium tracking-tight text-gray-900 mb-3">
                        We&apos;re excited that you want to join us! 😊
                    </h1>
                    <p className="text-[14px] md:text-[20px]  italic">
                        Fill in the details below so we can get to know you better. Once submitted,
                        our team will review your information and get in touch with you soon.
                    </p>
                </div>
            </section>

            {/* Form card */}
            <main className="w-full flex-1 flex justify-center py-8 md:py-12 lg:py-16">
                <div className="w-full md:max-w-5xl md:mx-auto md:px-8">
                    <div className="bg-white md:rounded-[24px] md:shadow-sm px-4 md:px-10 py-6 md:py-8 lg:py-10">
                        {/* Question heading */}
                        <div className="mb-6 md:mb-8">
                            <h2 className="text-lg md:text-[24px] font-medium text-gray-900">
                                Which position are you most interested in?<span className="text-red-500"> *</span>
                            </h2>
                        </div>

                        <form
                            className="w-full min-w-0"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleNext();
                            }}
                        >
                            {/* Position radio cards */}
                            <div className="space-y-4 md:space-y-5 w-full min-w-0">
                                {POSITION_OPTIONS.map((option) => (
                                    <PositionCard
                                        key={option.value}
                                        title={option.label}
                                        description={option.description}
                                        responsibilities={option.responsibilities}
                                        selected={selectedPosition === option.value}
                                        onSelect={() => setSelectedPosition(option.value)}
                                    />
                                ))}

                                {/* Other / custom role */}
                                <PositionCard
                                    title="Other (Custom Role)"
                                    description="If none of these roles exactly match your interests but you believe you can contribute in another way, please describe the skills or ideas you would like to bring to MelodyWings."
                                    selected={selectedPosition === OTHER_VALUE}
                                    onSelect={() => setSelectedPosition(OTHER_VALUE)}
                                >
                                    <textarea
                                        className="w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0  box-border"
                                        rows={4}
                                        placeholder="Describe here"
                                        value={customRole}
                                        onFocus={() => setSelectedPosition(OTHER_VALUE)}
                                        onChange={(e) => {
                                            setCustomRole(e.target.value);
                                            setSelectedPosition(OTHER_VALUE);
                                        }}
                                        onKeyDown={(e) => {
                                            // Stop propagation so the spacebar doesn't trigger PositionCard selection
                                            e.stopPropagation();
                                        }}
                                    />
                                </PositionCard>
                            </div>

                            {/* Navigation buttons */}
                            <div className="mt-8 flex w-full  gap-3 md:flex-row md:justify-between md:items-center">
                                <Button
                                    title="Previous"
                                    btnVariant="outline"
                                    customClassName="!px-6 !py-2 !w-full md:!w-auto !rounded-[10px] !h-10 md:!h-11"
                                    onClick={() => router.push("/join-us/step-1")}
                                />
                                <Button
                                    htmlType="submit"
                                    title={loading ? "Loading..." : "Next Step"}
                                    loading={loading}
                                    disabled={!isNextEnabled}
                                    btnVariant="secondary"
                                    customClassName="!px-6 !w-full md:!w-auto !rounded-[10px] !py-2 !h-10 md:!h-11 disabled:opacity-50"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JoinUsStep2Page;
