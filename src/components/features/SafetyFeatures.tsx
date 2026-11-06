"use client";

import { FiShield, FiLock, FiEyeOff, FiAlertTriangle, FiUserCheck, FiCheckCircle } from "react-icons/fi";
import { SectionHeader } from "./shared";

const safetyFeatures = [
    {
        icon: <FiShield className="h-5 w-5" />,
        title: "Volunteer Verification",
        description: "All volunteers answer safety disclosure questions and are reviewed and approved by our team before they work with learners.",
    },
    {
        icon: <FiLock className="h-5 w-5" />,
        title: "Privacy Controls",
        description: "Control who can message you, block users, and manage your visibility with granular privacy settings.",
    },
    {
        icon: <FiEyeOff className="h-5 w-5" />,
        title: "Block & Report",
        description: "Instantly block users and report inappropriate behavior. Our team reviews all reports promptly.",
    },
    {
        icon: <FiUserCheck className="h-5 w-5" />,
        title: "Chat Permissions",
        description: "Learners and volunteers can enable or disable messaging. Guardians maintain full control over accounts for learners under 18.",
    },
    {
        icon: <FiAlertTriangle className="h-5 w-5" />,
        title: "Safety Monitoring",
        description: "Automated safety checks and human moderators work together to maintain a secure learning environment.",
    },
    {
        icon: <FiCheckCircle className="h-5 w-5" />,
        title: "Guardian Oversight",
        description: "For learners under 18, guardians have full visibility and control over account settings and interactions.",
    },
];

export default function SafetyFeatures() {
    return (
        <section className="bg-background-input px-[5%] py-14 lg:px-[9%] lg:py-20">
            <div className="mx-auto max-w-7xl">
                <SectionHeader
                    tone="neutral"
                    eyebrow="Safety & Trust"
                    title="Your safety is our priority"
                    description="Multiple layers of protection ensure a safe, respectful environment for learners, volunteers, and families."
                />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {safetyFeatures.map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-2xl border border-stroke bg-white p-6 transition-shadow duration-200 hover:shadow-md"
                        >
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-background-input text-action">
                                {feature.icon}
                            </div>
                            <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
                            <p className="text-sm leading-relaxed text-gray-light">{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mx-auto mt-12 max-w-3xl text-center">
                    <h3 className="mb-3 text-xl font-medium lg:text-2xl">Built on trust, powered by care</h3>
                    <p className="text-sm leading-relaxed text-gray-light lg:text-base">
                        MelodyWings was created to provide a safe, supportive space where learners with disabilities can
                        thrive. Every feature, from volunteer verification to privacy controls, is designed with the
                        safety and well-being of our community at its core.
                    </p>
                </div>
            </div>
        </section>
    );
}
