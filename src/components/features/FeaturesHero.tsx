"use client";

import { useUrlParam } from "@/hooks/useUrlParam";
import { gradientTextStyle } from "@/constants/landingPage";

const highlights = [
    { value: "3+", label: "Session types" },
    { value: "Real-time", label: "Messaging" },
    { value: "Smart", label: "Matching" },
    { value: "Instant", label: "Sessions" },
];

export default function FeaturesHero() {
    const [, setParamMode] = useUrlParam("signup_as");

    return (
        <section className="px-[5%] pb-6 pt-24 lg:px-[9%] lg:pb-8 lg:pt-32">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
                <p className="text-base font-semibold lg:text-xl" style={gradientTextStyle}>
                    Features
                </p>
                <h1 className="text-3xl font-medium leading-tight md:text-4xl lg:text-5xl">
                    Everything you need for meaningful learning
                </h1>
                <p className="max-w-2xl text-sm leading-normal text-gray-light lg:text-xl">
                    MelodyWings connects learners with disabilities to caring volunteers through a platform designed for
                    accessibility, safety, and personal learning.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => setParamMode("learner")} className="btn-learner-fill rounded-full px-8 py-3 text-base font-medium">
                        Join as a Learner
                    </button>
                    <button onClick={() => setParamMode("volunteer")} className="btn-volunteer-fill rounded-full px-8 py-3 text-base font-medium">
                        Join as a Volunteer
                    </button>
                </div>

                <dl className="mt-10 grid w-full grid-cols-2 divide-stroke border-t border-stroke pt-8 lg:grid-cols-4 lg:divide-x">
                    {highlights.map((item) => (
                        <div key={item.label} className="flex flex-col items-center gap-1 py-3">
                            <dt className="order-2 text-sm text-gray-light">{item.label}</dt>
                            <dd className="order-1 text-xl font-medium lg:text-2xl">{item.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
