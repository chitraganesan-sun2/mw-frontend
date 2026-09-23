import type { Metadata } from "next";

// The join-us page itself ("use client") can't export metadata directly, so this
// layout carries it instead.
export const metadata: Metadata = {
    title: "Join Us",
    description: "Join the MelodyWings Operations Team and help us bring free, personalized tutoring to students with disabilities and special needs.",
    alternates: {
        canonical: "/join-us",
    },
    openGraph: {
        title: "Join Us | MelodyWings",
        description: "Join the MelodyWings Operations Team and help us bring free, personalized tutoring to students with disabilities and special needs.",
        url: "/join-us",
    },
};

export default function JoinUsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
