"use client";

import { FiZap, FiBell, FiGlobe, FiVideo, FiSmartphone, FiDatabase } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { BsRobot } from "react-icons/bs";

const capabilities = [
    {
        icon: <BsRobot className="w-7 h-7" />,
        title: "AI-Powered Matching",
        description: "Our intelligent algorithm analyzes skills, learning needs, availability, languages, and preferences to recommend the perfect volunteer-learner pairs.",
        highlights: ["Skill-based matching", "Availability alignment", "Learning style compatibility", "Continuous optimization"],
    },
    {
        icon: <FiBell className="w-7 h-7" />,
        title: "Smart Notifications",
        description: "Stay informed with customizable notifications across email, push, and in-app channels. Control what you hear about and when.",
        highlights: ["Multi-channel alerts", "Customizable preferences", "Real-time updates", "Smart digest options"],
    },
    {
        icon: <FiGlobe className="w-7 h-7" />,
        title: "Time Zone Support",
        description: "Schedule across time zones effortlessly. All times automatically adjust to your local time zone, with clear labels to avoid confusion.",
        highlights: ["Automatic conversion", "Time zone labels", "Global coordination", "Calendar sync"],
    },
    {
        icon: <FiVideo className="w-7 h-7" />,
        title: "Built-In Video",
        description: "Seamless Google Meet integration for all sessions. One-click join with automatic meeting links—no setup required.",
        highlights: ["Instant meeting links", "One-click join", "Session recordings", "Calendar invites"],
    },
    {
        icon: <FiSmartphone className="w-7 h-7" />,
        title: "Mobile Experience",
        description: "Access MelodyWings from anywhere. Our responsive design and mobile apps ensure a seamless experience on any device.",
        highlights: ["Native mobile apps", "Responsive design", "Touch-optimized", "Offline capability"],
    },
    {
        icon: <FiDatabase className="w-7 h-7" />,
        title: "Your Data, Your Control",
        description: "Export your data anytime, manage privacy settings, and maintain full control over your information with GDPR-compliant practices.",
        highlights: ["Data export", "Privacy controls", "GDPR compliant", "Secure storage"],
    },
];

export default function PlatformCapabilities() {
    return (
        <section className="px-[5%] lg:px-[9%]">
            <div className="max-w-7xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-12 lg:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
                        <HiSparkles className="w-4 h-4" />
                        Platform Capabilities
                    </div>
                    <h2 className="text-2xl lg:text-[2rem] font-medium text-gray-900 mb-4">
                        Built with Intelligence & Care
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Helpful technology behind the scenes to make learning accessible and personal for everyone.
                    </p>
                </div>

                {/* Capabilities grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {capabilities.map((capability, index) => (
                        <div
                            key={index}
                            className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group overflow-hidden"
                        >
                            {/* Background gradient on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-lg">
                                    {capability.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-medium text-gray-900 mb-3">{capability.title}</h3>

                                {/* Description */}
                                <p className="text-gray-600 mb-4 leading-relaxed">{capability.description}</p>

                                {/* Highlights */}
                                <div className="flex flex-wrap gap-2">
                                    {capability.highlights.map((highlight, i) => (
                                        <span
                                            key={i}
                                            className="inline-block px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full"
                                        >
                                            {highlight}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional info banner */}
                <div className="mt-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 text-white text-center">
                    <div className="max-w-3xl mx-auto">
                        <FiZap className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-2xl font-medium mb-2">Constantly Evolving</h3>
                        <p className="text-purple-100">
                            We&apos;re continuously improving our platform based on user feedback. Your experience and suggestions help us build better features for the entire MelodyWings community.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
