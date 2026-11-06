"use client";

import { FiBell, FiGlobe, FiVideo, FiSmartphone, FiDatabase } from "react-icons/fi";
import { BsRobot } from "react-icons/bs";
import { FeatureCard, SectionHeader } from "./shared";

const capabilities = [
    {
        icon: <BsRobot className="h-5 w-5" />,
        title: "AI-Powered Matching",
        description: "Our intelligent algorithm analyzes skills, learning needs, availability, languages, and preferences to recommend the perfect volunteer-learner pairs.",
        highlights: ["Skill-based matching", "Availability alignment", "Learning style compatibility", "Continuous optimization"],
    },
    {
        icon: <FiBell className="h-5 w-5" />,
        title: "Smart Notifications",
        description: "Stay informed with customizable notifications across email, push, and in-app channels. Control what you hear about and when.",
        highlights: ["Multi-channel alerts", "Customizable preferences", "Real-time updates", "Smart digest options"],
    },
    {
        icon: <FiGlobe className="h-5 w-5" />,
        title: "Time Zone Support",
        description: "Schedule across time zones effortlessly. All times automatically adjust to your local time zone, with clear labels to avoid confusion.",
        highlights: ["Automatic conversion", "Time zone labels", "Global coordination", "Calendar sync"],
    },
    {
        icon: <FiVideo className="h-5 w-5" />,
        title: "Built-In Video",
        description: "Seamless Google Meet integration for all sessions. One-click join with automatic meeting links—no setup required.",
        highlights: ["Instant meeting links", "One-click join", "Session recordings", "Calendar invites"],
    },
    {
        icon: <FiSmartphone className="h-5 w-5" />,
        title: "Mobile Experience",
        description: "Access MelodyWings from anywhere. Our responsive design and mobile apps ensure a seamless experience on any device.",
        highlights: ["Native mobile apps", "Responsive design", "Touch-optimized", "Offline capability"],
    },
    {
        icon: <FiDatabase className="h-5 w-5" />,
        title: "Your Data, Your Control",
        description: "Export your data anytime, manage privacy settings, and maintain full control over your information with GDPR-compliant practices.",
        highlights: ["Data export", "Privacy controls", "GDPR compliant", "Secure storage"],
    },
];

export default function PlatformCapabilities() {
    return (
        <section className="bg-white px-[5%] py-14 lg:px-[9%] lg:py-20">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    tone="neutral"
                    eyebrow="Platform Capabilities"
                    title="Built with intelligence and care"
                    description="Helpful technology behind the scenes to make learning accessible and personal for everyone."
                />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {capabilities.map((item) => (
                        <FeatureCard
                            key={item.title}
                            tone="neutral"
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                            points={item.highlights}
                        />
                    ))}
                </div>
                <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-gray-light lg:text-base">
                    We&apos;re continuously improving the platform based on your feedback. Your suggestions help us build
                    better features for the whole MelodyWings community.
                </p>
            </div>
        </section>
    );
}
