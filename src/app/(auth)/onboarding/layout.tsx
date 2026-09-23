import OnboardingLayout from "@/layouts/OnboardingLayout";
import type { Metadata } from "next";
import React from "react";

// Authenticated onboarding flow - not public content. See the (private) layout
// for why the root layout's index/canonical defaults are wrong here too.
export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: undefined,
    },
};

function Layout ({ children }: { children: React.ReactNode }) {
    return <OnboardingLayout>{children}</OnboardingLayout>;
}

export default Layout;
