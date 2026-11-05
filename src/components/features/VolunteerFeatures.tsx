"use client";

import { FiCalendar, FiClock, FiUsers, FiMessageCircle, FiUpload, FiAward, FiTrendingUp, FiShield } from "react-icons/fi";
import { MdOutlineGroups } from "react-icons/md";

const volunteerFeatures = [
    {
        icon: <FiClock className="w-6 h-6" />,
        title: "Flexible Availability",
        description: "Set your weekly recurring schedule or add one-time slots. Your availability automatically syncs with your calendar.",
        benefits: ["Recurring time slots", "One-time availability", "Easy slot management", "Booking notifications"],
        color: "orange",
    },
    {
        icon: <FiCalendar className="w-6 h-6" />,
        title: "Session Management",
        description: "Manage all your sessions in one place. Accept requests, track upcoming sessions, and review past interactions.",
        benefits: ["Visual dashboard", "Accept/decline requests", "Session history", "Calendar integration"],
        color: "blue",
    },
    {
        icon: <FiUsers className="w-6 h-6" />,
        title: "Instant Sessions",
        description: "Post instant sessions when you're available right now, or accept learner requests. Make an immediate impact on someone's learning.",
        benefits: ["Create instant sessions", "Accept learner requests", "Real-time matching", "Quick setup"],
        color: "green",
    },
    {
        icon: <MdOutlineGroups className="w-6 h-6" />,
        title: "Host a WingTime",
        description: "Lead group sessions on topics you're passionate about. Teach multiple learners simultaneously in a collaborative environment.",
        benefits: ["Group teaching", "Set participant limits", "Topic-based sessions", "Manage registrations"],
        color: "purple",
    },
    {
        icon: <FiTrendingUp className="w-6 h-6" />,
        title: "Smart Matching",
        description: "Our AI recommends learners who match your skills and availability. Focus on teaching and let us handle the matching.",
        benefits: ["AI-powered recommendations", "Skill-based matching", "Learning needs alignment", "Match history"],
        color: "indigo",
    },
    {
        icon: <FiMessageCircle className="w-6 h-6" />,
        title: "Learner Communication",
        description: "Stay connected with your learners. Message them directly, answer questions, and provide ongoing support between sessions.",
        benefits: ["Real-time messaging", "Chat history", "Notification controls", "Privacy settings"],
        color: "blue",
    },
    {
        icon: <FiUpload className="w-6 h-6" />,
        title: "Resource Sharing",
        description: "Upload educational materials, videos, documents, and guides. Build a library of resources for your learners to access anytime.",
        benefits: ["Upload multiple formats", "Categorize content", "Track engagement", "Edit & manage"],
        color: "teal",
    },
    {
        icon: <FiAward className="w-6 h-6" />,
        title: "Hours & Certificates",
        description: "Automatically track your volunteer hours. Download certificates for school credit, programs, or personal records.",
        benefits: ["Automatic hour tracking", "Downloadable certificates", "Session completion records", "Total hours display"],
        color: "yellow",
    },
];

const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", icon: "text-orange-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "text-purple-600" },
    green: { bg: "bg-green-50", text: "text-green-600", icon: "text-green-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", icon: "text-indigo-600" },
    teal: { bg: "bg-teal-50", text: "text-teal-600", icon: "text-teal-600" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600", icon: "text-yellow-600" },
};

export default function VolunteerFeatures() {
    return (
        <section className="px-[5%] lg:px-[9%] bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-16 lg:py-20">
            <div className="max-w-7xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-12 lg:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
                        For Volunteers
                    </div>
                    <h2 className="text-2xl lg:text-[2rem] font-medium text-gray-900 mb-4">
                        Powerful Tools for Meaningful Impact
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Manage your availability, connect with learners, track your hours, and make a real difference in learners&apos; lives—all in one place.
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {volunteerFeatures.map((feature, index) => {
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
                                <h3 className="text-xl font-medium text-gray-900 mb-2">{feature.title}</h3>

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
