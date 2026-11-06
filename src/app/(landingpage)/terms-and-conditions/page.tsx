import React from "react";
import TermsAndConditionsHeader from "@/components/consents/terms-and-conditions/header";
import TermsAndConditionsSections from "@/components/consents/terms-and-conditions/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms and Conditions",
    description: "The terms and conditions governing use of the MelodyWings platform for learners, volunteers, and donors.",
    alternates: {
        canonical: "/terms-and-conditions",
    },
};

const TermsAndConditions = () => {
    return (
        <div className="w-full bg-background-input px-4 py-6 lg:px-6 lg:py-10">
            <div className="max-w-4xl mx-auto rounded-3xl bg-white px-5 py-8 lg:p-10 flex flex-col gap-5">
                <TermsAndConditionsHeader />
                <TermsAndConditionsSections />
            </div>
        </div>
    ) 
};

export default TermsAndConditions;