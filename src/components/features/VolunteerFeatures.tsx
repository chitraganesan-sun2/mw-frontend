"use client";

import { FiCalendar, FiClock, FiUsers, FiMessageCircle, FiUpload, FiAward, FiTrendingUp } from "react-icons/fi";
import { MdOutlineGroups } from "react-icons/md";
import { FeatureCard, SectionHeader } from "./shared";

const volunteerFeatures = [
    {
        icon: <FiClock className="h-5 w-5" />,
        title: "Flexible Availability",
        description: "Set your weekly recurring schedule or add one-time slots. Your availability automatically syncs with your calendar.",
        benefits: ["Recurring time slots", "One-time availability", "Easy slot management", "Booking notifications"],
    },
    {
        icon: <FiCalendar className="h-5 w-5" />,
        title: "Session Management",
        description: "Manage all your sessions in one place. Accept requests, track upcoming sessions, and review past interactions.",
        benefits: ["Visual dashboard", "Accept/decline requests", "Session history", "Calendar integration"],
    },
    {
        icon: <FiUsers className="h-5 w-5" />,
        title: "Instant Sessions",
        description: "Post instant sessions when you're available right now, or accept learner requests. Make an immediate impact on someone's learning.",
        benefits: ["Create instant sessions", "Accept learner requests", "Real-time matching", "Quick setup"],
    },
    {
        icon: <MdOutlineGroups className="h-5 w-5" />,
        title: "Host a WingTime",
        description: "Lead group sessions on topics you're passionate about. Teach several learners at once in a friendly, collaborative setting.",
        benefits: ["Group teaching", "Set participant limits", "Topic-based sessions", "Manage registrations"],
    },
    {
        icon: <FiTrendingUp className="h-5 w-5" />,
        title: "Smart Matching",
        description: "Our AI recommends learners who match your skills and availability. Focus on teaching and let us handle the matching.",
        benefits: ["AI-powered recommendations", "Skill-based matching", "Learning needs alignment", "Match history"],
    },
    {
        icon: <FiMessageCircle className="h-5 w-5" />,
        title: "Learner Communication",
        description: "Stay connected with your learners. Message them directly, answer questions, and provide ongoing support between sessions.",
        benefits: ["Real-time messaging", "Chat history", "Notification controls", "Privacy settings"],
    },
    {
        icon: <FiUpload className="h-5 w-5" />,
        title: "Resource Sharing",
        description: "Upload educational materials, videos, documents, and guides. Build a library of resources for your learners to access anytime.",
        benefits: ["Upload multiple formats", "Categorize content", "Track engagement", "Edit & manage"],
    },
    {
        icon: <FiAward className="h-5 w-5" />,
        title: "Hours & Certificates",
        description: "Automatically track your volunteer hours. Download certificates for school credit, programs, or personal records.",
        benefits: ["Automatic hour tracking", "Downloadable certificates", "Session completion records", "Total hours display"],
    },
];

export default function VolunteerFeatures() {
    return (
        <section className="bg-background-input px-[5%] py-14 lg:px-[9%] lg:py-20">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    tone="volunteer"
                    eyebrow="For Volunteers"
                    title="Powerful tools for meaningful impact"
                    description="Manage your availability, connect with learners, track your hours, and make a real difference in learners' lives, all in one place."
                />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {volunteerFeatures.map((feature) => (
                        <FeatureCard
                            key={feature.title}
                            tone="volunteer"
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
