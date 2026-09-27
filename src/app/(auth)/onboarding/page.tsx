"use client";

import { useEffect, useState } from "react";
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
    // getCookie reads document.cookie, which isn't available during SSR - reading it
    // directly in render made the server (role unknown) show the wrong role's title
    // and form vs. the client's first render (real role), a hydration mismatch on
    // every onboarding page load. Deferring to an effect keeps the first client
    // render identical to the server's.
    const [role, setRole] = useState<string | undefined>(undefined);
    useEffect(() => {
        setRole(getCookie("role"));
    }, []);
    const isVolunteer = role === "volunteer";

    const titleSectionConstants = isVolunteer ? VolunteerOnboardingConstants : LearnerOnboardingConstants;
    const formData = isVolunteer ? VolunteerFormSections : LearnerFormSections;
    const schema = isVolunteer ? volunteerFormSchema : learnerFormSchema;

    if (!role) return null;

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
