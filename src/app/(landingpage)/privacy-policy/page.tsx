import React from "react";
import PrivacyPolicyHeader from "@/components/consents/privacy-policy/header";
import PrivacyPolicySections from "@/components/consents/privacy-policy/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "How MelodyWings collects, uses, and protects the personal information of learners, volunteers, and donors on our platform.",
    alternates: {
        canonical: "/privacy-policy",
    },
};

const PrivacyPolicy = () => {
    return (
        <div className="w-full bg-background-input px-4 py-6 lg:px-6 lg:py-10">
            <div className="max-w-4xl mx-auto rounded-3xl bg-white px-5 py-8 lg:p-10 flex flex-col gap-5">
                <PrivacyPolicyHeader />
                <PrivacyPolicySections />
            </div>
        </div>
    ) 
};

export default PrivacyPolicy;