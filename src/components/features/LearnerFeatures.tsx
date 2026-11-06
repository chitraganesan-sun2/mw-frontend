"use client";

import { FiCalendar, FiZap, FiMessageCircle, FiBookOpen, FiHeart, FiSearch, FiSettings } from "react-icons/fi";
import { MdOutlineGroups } from "react-icons/md";
import { FeatureCard, SectionHeader } from "./shared";

const learnerFeatures = [
    {
        icon: <FiCalendar className="h-5 w-5" />,
        title: "Smart Scheduling",
        description: "Book sessions with your favorite volunteers, manage your learning calendar, and never miss a session with automatic reminders.",
        benefits: ["Visual calendar interface", "Time zone-aware scheduling", "Download calendar invites", "Session history tracking"],
    },
    {
        icon: <FiZap className="h-5 w-5" />,
        title: "Instant Sessions",
        description: "Need help right now? Browse and join live sessions posted by volunteers or request instant help from specific volunteers.",
        benefits: ["Join sessions immediately", "Request from specific volunteers", "Real-time availability", "No scheduling needed"],
    },
    {
        icon: <MdOutlineGroups className="h-5 w-5" />,
        title: "WingTime Groups",
        description: "Join scheduled group learning sessions on various topics. Learn together with other learners in a supportive environment.",
        benefits: ["Topic-based learning", "Group interaction", "Expert-led sessions", "Small groups for better support"],
    },
    {
        icon: <FiSearch className="h-5 w-5" />,
        title: "Volunteer Discovery",
        description: "Find the right volunteer by filtering on skills, subjects, languages, availability, and learning needs.",
        benefits: ["Advanced search filters", "AI-powered recommendations", "Profile ratings & reviews", "Availability preview"],
    },
    {
        icon: <FiMessageCircle className="h-5 w-5" />,
        title: "Direct Messaging",
        description: "Chat directly with your connected volunteers. Ask questions, share progress, and build lasting mentorship relationships.",
        benefits: ["Real-time chat", "Message history", "Unread notifications", "Privacy controls"],
    },
    {
        icon: <FiBookOpen className="h-5 w-5" />,
        title: "Learning Resources",
        description: "Access a library of educational materials shared by volunteers. Videos, documents, and interactive content tailored to your needs.",
        benefits: ["Categorized resources", "Search & filter", "Save favorites", "Like and rate content"],
    },
    {
        icon: <FiHeart className="h-5 w-5" />,
        title: "Community Hub",
        description: "Connect with other learners and volunteers. Share experiences, celebrate wins, and support each other's learning journeys.",
        benefits: ["Create posts", "Comment & engage", "Like & save posts", "Share achievements"],
    },
    {
        icon: <FiSettings className="h-5 w-5" />,
        title: "Personalized Profile",
        description: "Your profile helps volunteers understand your learning style, strengths, goals, and the support that works best for you.",
        benefits: ["Skills to learn", "Strengths & goals", "Support preferences", "Progress tracking"],
    },
];

export default function LearnerFeatures() {
    return (
        <section className="bg-white px-[5%] lg:px-[9%]">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    tone="learner"
                    eyebrow="For Learners"
                    title="Everything to support your learning journey"
                    description="Designed with accessibility and personalized learning in mind. Find volunteers, schedule sessions, access resources, and grow at your own pace."
                />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {learnerFeatures.map((feature) => (
                        <FeatureCard
                            key={feature.title}
                            tone="learner"
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            points={feature.benefits}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
