import type { Metadata } from "next";
import { SHARE_IMAGES } from "@/constants/seo";

// Without this the Features page inherited the home page's title and canonical URL, which
// tells search engines it is a duplicate of "/".
export const metadata: Metadata = {
    title: "Features",
    description:
        "See how MelodyWings works: free one-on-one and group sessions, instant sessions, WingTime, smart matching, safety tools and privacy controls for learners, guardians and volunteers.",
    alternates: {
        canonical: "/features",
    },
    openGraph: {
        title: "Features | MelodyWings",
        description: "Free sessions, smart matching and safety tools for learners with disabilities, guardians and volunteers.",
        url: "/features",
        images: SHARE_IMAGES,
    },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
