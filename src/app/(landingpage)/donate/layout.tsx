import type { Metadata } from "next";

// The donate page itself ("use client") can't export metadata directly - App Router
// requires a Server Component for that, so this layout carries it instead.
export const metadata: Metadata = {
    title: "Donate",
    description: "Support free 1:1 tutoring for students with disabilities and special needs. Every donation to MelodyWings, a registered 501(c)(3) nonprofit, helps fund our volunteer-powered learning platform.",
    alternates: {
        canonical: "/donate",
    },
    openGraph: {
        title: "Donate | MelodyWings",
        description: "Support free 1:1 tutoring for students with disabilities and special needs.",
        url: "/donate",
    },
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
    return children;
}
