"use client";

import { FiShield, FiLock, FiEyeOff, FiAlertTriangle, FiUserCheck, FiCheckCircle } from "react-icons/fi";

const safetyFeatures = [
    {
        icon: <FiShield className="w-8 h-8" />,
        title: "Volunteer Verification",
        description: "All volunteers complete background checks and safety disclosures before joining the platform.",
        color: "from-blue-500 to-blue-600",
    },
    {
        icon: <FiLock className="w-8 h-8" />,
        title: "Privacy Controls",
        description: "Control who can message you, block users, and manage your visibility with granular privacy settings.",
        color: "from-green-500 to-green-600",
    },
    {
        icon: <FiEyeOff className="w-8 h-8" />,
        title: "Block & Report",
        description: "Instantly block users and report inappropriate behavior. Our team reviews all reports promptly.",
        color: "from-red-500 to-red-600",
    },
    {
        icon: <FiUserCheck className="w-8 h-8" />,
        title: "Chat Permissions",
        description: "Learners and volunteers can enable or disable messaging. Guardians maintain full control over accounts for learners under 18.",
        color: "from-purple-500 to-purple-600",
    },
    {
        icon: <FiAlertTriangle className="w-8 h-8" />,
        title: "Safety Monitoring",
        description: "Automated safety checks and human moderators work together to maintain a secure learning environment.",
        color: "from-orange-500 to-orange-600",
    },
    {
        icon: <FiCheckCircle className="w-8 h-8" />,
        title: "Guardian Oversight",
        description: "For learners under 18, guardians have full visibility and control over account settings and interactions.",
        color: "from-indigo-500 to-indigo-600",
    },
];

export default function SafetyFeatures() {
    return (
        <section className="px-[5%] lg:px-[9%] bg-gradient-to-br from-gray-50 to-blue-50 py-16 lg:py-20">
            <div className="max-w-7xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-12 lg:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
                        <FiShield className="w-4 h-4" />
                        Safety & Trust
                    </div>
                    <h2 className="text-2xl lg:text-[2rem] font-medium text-gray-900 mb-4">
                        Your Safety is Our Priority
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Multiple layers of protection ensure a safe, respectful environment for learners, volunteers, and families.
                    </p>
                </div>

                {/* Safety features grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {safetyFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Icon with gradient */}
                            <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white shadow-md`}>
                                {feature.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-medium text-gray-900 mb-2">{feature.title}</h3>

                            {/* Description */}
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Trust statement */}
                <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-md border border-gray-200">
                    <div className="max-w-4xl mx-auto text-center">
                        <FiShield className="w-16 h-16 mx-auto mb-6 text-green-600" />
                        <h3 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-4">
                            Built on Trust, Powered by Care
                        </h3>
                        <p className="text-lg text-gray-600 mb-6">
                            MelodyWings was created to provide a safe, supportive space where learners with disabilities can thrive. 
                            Every feature, from volunteer verification to privacy controls, is designed with the safety and well-being 
                            of our community at its core.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="flex flex-col items-center">
                                <div className="text-3xl font-medium text-green-600 mb-2">100%</div>
                                <div className="text-sm text-gray-600">Volunteer Screening</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-3xl font-medium text-green-600 mb-2">24/7</div>
                                <div className="text-sm text-gray-600">Safety Monitoring</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-3xl font-medium text-green-600 mb-2">GDPR</div>
                                <div className="text-sm text-gray-600">Compliant Platform</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
