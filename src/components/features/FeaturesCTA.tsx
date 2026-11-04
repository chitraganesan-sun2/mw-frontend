"use client";

import { useQueryState } from "nuqs";
import { FiArrowRight } from "react-icons/fi";

export default function FeaturesCTA() {
    const [, setParamMode] = useQueryState("signup_as");

    return (
        <section className="px-[5%] lg:px-[9%]">
            <div className="max-w-5xl mx-auto">
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 rounded-3xl p-8 lg:p-16 overflow-hidden shadow-2xl">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

                    {/* Content */}
                    <div className="relative z-10 text-center text-white">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of learners and volunteers making meaningful connections. 
                            Start your journey with MelodyWings today.
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setParamMode("learner")}
                                className="group bg-white text-blue-600 px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                Join as a Learner
                                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => setParamMode("volunteer")}
                                className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-base font-semibold transition-all hover:bg-white hover:text-orange-600 shadow-lg flex items-center justify-center gap-2"
                            >
                                Volunteer Today
                                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Additional info */}
                        <p className="mt-8 text-sm text-blue-100">
                            Free to join • No credit card required • Start learning or teaching in minutes
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
