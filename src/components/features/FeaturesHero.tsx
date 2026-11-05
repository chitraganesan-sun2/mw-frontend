"use client";

import { useQueryState } from "nuqs";
import { FiZap, FiCalendar, FiMessageCircle, FiUsers } from "react-icons/fi";

export default function FeaturesHero() {
    const [, setParamMode] = useQueryState("signup_as");

    return (
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50 px-[5%] lg:px-[9%] pt-24 pb-16 lg:pt-32 lg:pb-20">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 left-10 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative max-w-5xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6 animate-fadeIn">
                    <FiZap className="w-4 h-4" />
                    Everything You Need to Succeed
                </div>

                {/* Main heading */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 mb-6 animate-fadeIn animation-delay-200">
                    Powerful Features for
                    <span className="block mt-2 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                        Meaningful Learning
                    </span>
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fadeIn animation-delay-400">
                    MelodyWings connects learners with disabilities to caring volunteer tutors through an intelligent platform 
                    designed for accessibility, safety, and personalized education.
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fadeIn animation-delay-600">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <FiCalendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-medium text-gray-900">3+</div>
                        <div className="text-sm text-gray-600">Session Types</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <FiMessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-medium text-gray-900">Real-Time</div>
                        <div className="text-sm text-gray-600">Messaging</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <FiUsers className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-medium text-gray-900">AI-Powered</div>
                        <div className="text-sm text-gray-600">Matching</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <FiZap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-medium text-gray-900">Instant</div>
                        <div className="text-sm text-gray-600">Sessions</div>
                    </div>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn animation-delay-800">
                    <button
                        onClick={() => setParamMode("learner")}
                        className="btn-learner-fill px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 shadow-md"
                    >
                        Start Learning
                    </button>
                    <button
                        onClick={() => setParamMode("volunteer")}
                        className="btn-volunteer-fill px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 shadow-md"
                    >
                        Become a Volunteer
                    </button>
                </div>
            </div>
        </section>
    );
}
