"use client";

import { FiCalendar, FiZap, FiUsers, FiMessageCircle, FiBookOpen, FiHeart, FiSearch, FiSettings } from "react-icons/fi";
import { MdOutlineGroups } from "react-icons/md";

const learnerFeatures = [
    {
        icon: <FiCalendar className="w-6 h-6" />,
        title: "Smart Scheduling",
        description: "Book sessions with your favorite volunteers, manage your learning calendar, and never miss a session with automatic reminders.",
        benefits: ["Visual calendar interface", "Timezone-aware scheduling", "Download calendar invites", "Session history tracking"],
        color: "blue",
    },
    {
        icon: <FiZap className="w-6 h-6" />,
        title: "Instant Sessions",
        description: "Need help right now? Browse and join live sessions posted by volunteers or request instant help from specific tutors.",
        benefits: ["Join sessions immediately", "Request from specific volunteers", "Real-time availability", "No scheduling needed"],
        color: "orange",
    },
    {
        icon: <MdOutlineGroups className="w-6 h-6" />,
        title: "Wing Time Groups",
        description: "Join scheduled group learning sessions on various topics. Learn together with other students in a supportive environment.",
        benefits: ["Topic-based learning", "Group interaction", "Expert-led sessions", "Capacity-limited for quality"],
        color: "purple",
    },
    {
        icon: <FiSearch className="w-6 h-6" />,
        title: "Volunteer Discovery",
        description: "Find the perfect tutor with advanced filtering by skills, subjects, languages, availability, and learning needs.",
        benefits: ["Advanced search filters", "AI-powered recommendations", "Profile ratings & reviews", "Availability preview"],
        color: "green",
    },
    {
        icon: <FiMessageCircle className="w-6 h-6" />,
        title: "Direct Messaging",
        description: "Chat directly with your connected volunteers. Ask questions, share progress, and build lasting mentorship relationships.",
        benefits: ["Real-time chat", "Message history", "Unread notifications", "Privacy controls"],
        color: "blue",
    },
    {
        icon: <FiBookOpen className="w-6 h-6" />,
        title: "Learning Resources",
        description: "Access a library of educational materials shared by volunteers. Videos, documents, and interactive content tailored to your needs.",
        benefits: ["Categorized resources", "Search & filter", "Save favorites", "Like/rate content"],
        color: "indigo",
    },
    {
        icon: <FiHeart className="w-6 h-6" />,
        title: "Community Hub",
        description: "Connect with other learners and volunteers. Share experiences, celebrate wins, and support each other's learning journeys.",
        benefits: ["Create posts", "Comment & engage", "Like & save posts", "Share achievements"],
        color: "pink",
    },
    {
        icon: <FiSettings className="w-6 h-6" />,
        title: "Personalized Profile",
        description: "Your profile helps volunteers understand your learning style, strengths, goals, and the support that works best for you.",
        benefits: ["Skills to learn", "Strengths & goals", "Support preferences", "Progress tracking"],
        color: "gray",
    },
];

const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", icon: "text-orange-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "text-purple-600" },
    green: { bg: "bg-green-50", text: "text-green-600", icon: "text-green-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", icon: "text-indigo-600" },
    pink: { bg: "bg-pink-50", text: "text-pink-600", icon: "text-pink-600" },
    gray: { bg: "bg-gray-50", text: "text-gray-600", icon: "text-gray-600" },
};

export default function LearnerFeatures() {
    return (
        <section className="px-[5%] lg:px-[9%]">
            <div className="max-w-7xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-12 lg:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                        For Learners
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Everything to Support Your Learning Journey
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Designed with accessibility and personalized learning in mind. Find tutors, schedule sessions, access resources, and grow at your own pace.
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {learnerFeatures.map((feature, index) => {
                        const colors = colorClasses[feature.color];
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                            >
                                {/* Icon */}
                                <div className={`${colors.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <div className={colors.icon}>{feature.icon}</div>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>

                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>

                                {/* Benefits */}
                                <ul className="space-y-2">
                                    {feature.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
