import { NuqsAdapter } from "nuqs/adapters/next";
import { MainLayout } from "@/layouts";
import type { Metadata } from "next";
import React from "react";

// These are authenticated in-app pages, not public content - they inherited the
// root layout's `robots: { index: true, follow: true }` and `canonical: "/"`
// defaults, which told search engines every learner/volunteer dashboard page was
// indexable content canonically equal to the homepage. Neither is true.
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
    return (
        <NuqsAdapter>
            <MainLayout>{children}</MainLayout>
        </NuqsAdapter>
    );
}

export default Layout;
