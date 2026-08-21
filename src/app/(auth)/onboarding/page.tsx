"use client";

import FormSection from "@/components/onboarding/FormSection";
import { learnerFormSchema, volunteerFormSchema } from "@/components/onboarding/FormSection/config";
import InfoSection from "@/components/onboarding/InfoSection";
import { VolunteerOnboardingConstants } from "@/constants/volunteer";
import TitleSection from "@/components/onboarding/TitleSection";
import { LearnerFormSections, LearnerOnboardingConstants } from "@/constants/learner";
import { VolunteerFormSections } from "@/constants/volunteer";
import { getCookie } from "@/utils/auth";
import CookieConsent from "@/components/landingpage/Cookie";

export default function OnboardingPage () {
    const role = getCookie("role");
    const isVolunteer = role === "volunteer";

    const titleSectionConstants = isVolunteer ? VolunteerOnboardingConstants : LearnerOnboardingConstants;
    const formData = isVolunteer ? VolunteerFormSections : LearnerFormSections;
    const schema = isVolunteer ? volunteerFormSchema : learnerFormSchema;

    return (
        <div className='flex bg-background-input flex-col gap-5'>
            <TitleSection
                title={titleSectionConstants.title}
                description={titleSectionConstants.description}
            />
            {isVolunteer && <InfoSection />}
            <FormSection schema={schema} formData={formData} />
            <CookieConsent />
        </div>
    );
}
