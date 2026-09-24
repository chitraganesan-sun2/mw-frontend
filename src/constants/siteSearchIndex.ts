export type SiteSearchEntry = {
    title: string;
    description: string;
    href: string;
    keywords?: string[];
};

/**
 * Static index for the public site's search. There's no CMS/content API to
 * index dynamically, so this is a small hand-maintained list of the public
 * marketing pages (and a couple of in-page sections that already have
 * anchor ids - see src/app/page.tsx). Update this alongside adding/removing
 * a public route.
 */
export const SITE_SEARCH_INDEX: SiteSearchEntry[] = [
    {
        title: "Home",
        description: "MelodyWings - limitless free learning",
        href: "/",
        keywords: ["home", "landing"],
    },
    {
        title: "Why We Built MelodyWings",
        description: "Our story and mission",
        href: "/#about-us",
        keywords: ["mission", "story", "about"],
    },
    {
        title: "Our Impact",
        description: "See the impact MelodyWings has made so far",
        href: "/#our-impact",
        keywords: ["impact", "results", "stats"],
    },
    {
        title: "About Us",
        description: "Learn more about the MelodyWings initiative",
        href: "/about-us",
        keywords: ["mission", "team", "story"],
    },
    {
        title: "Donate",
        description: "Support free tutoring for learners with disabilities and special needs",
        href: "/donate",
        keywords: ["donation", "give", "support", "contribute"],
    },
    {
        title: "Join Us",
        description: "Sign up as a learner or a volunteer",
        href: "/join-us",
        keywords: ["signup", "sign up", "register", "learner", "volunteer", "onboarding"],
    },
    {
        title: "Blogs",
        description: "Read the latest from the MelodyWings community",
        href: "/blogs",
        keywords: ["blog", "articles", "news"],
    },
    {
        title: "Privacy Policy",
        description: "How MelodyWings collects, uses, and protects your information",
        href: "/privacy-policy",
        keywords: ["privacy", "data", "legal"],
    },
    {
        title: "Terms and Conditions",
        description: "The terms governing use of the MelodyWings platform",
        href: "/terms-and-conditions",
        keywords: ["terms", "legal", "agreement"],
    },
    {
        title: "Contact Us",
        description: "Email the MelodyWings team directly",
        href: "mailto:support@melodywings.org",
        keywords: ["contact", "support", "email", "help"],
    },
];
