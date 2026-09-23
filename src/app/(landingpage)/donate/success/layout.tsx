import type { Metadata } from "next";

// A personalized post-checkout confirmation, not content - overrides the parent
// donate/layout.tsx's indexable default rather than letting a transactional page
// get indexed or treated as a canonical destination for "/donate".
export const metadata: Metadata = {
    title: "Thank You",
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: undefined,
    },
};

export default function DonateSuccessLayout({ children }: { children: React.ReactNode }) {
    return children;
}
