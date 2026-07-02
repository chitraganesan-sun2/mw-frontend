"use client";

import Celebrate from "@/components/landingpage/Celebrate";
import Community from "@/components/landingpage/Community";
import Testimonials from "@/components/landingpage/testimonials";
import ForLearner from "@/components/landingpage/ForLearner";
import ForVolunteer from "@/components/landingpage/ForVolunteer";
import Hero from "@/components/landingpage/Hero";
import Impact from "@/components/landingpage/Impact";
import WhyWeBuild from "@/components/landingpage/WhyWeBuild";
import Footer from "@/components/onboarding/Footer";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import SkillsToLearn from "@/components/landingpage/SkillsToLearn";
import InstantSessions from "@/components/landingpage/InstantSessions";
import GoogleReviews from "@/components/landingpage/GoogleReviews";

export default function Page() {
    const [_, setParamMode] = useQueryState("signup_as");

    useEffect(() => {
        setParamMode(null);

        let sr: any;
        const setupScrollReveal = async () => {
            if (typeof window !== "undefined") {
                const ScrollReveal = (await import("scrollreveal")).default;
                sr = ScrollReveal({
                    origin: "bottom",
                    distance: "3px",
                    duration: 800,
                    delay: 100,
                    easing: "ease-out",
                    reset: true,
                    viewFactor: 0.1,
                    viewOffset: { top: 0, right: 0, bottom: -100, left: 0 },
                });

                sr.reveal(".reveal", { interval: 100 });
            }
        };

        setupScrollReveal();

        return () => {
            if (sr) sr.destroy();
        };
    }, []);

    return (
        <div className="w-full overflow-x-hidden bg-background-input relative">
            <Hero />
            <div className="flex flex-col gap-20 lg:gap-[7rem] py-[7rem]">
                <div className="reveal px-[9%]" id="about-us">
                    <WhyWeBuild />
                </div>
                <div className="reveal px-[9%]" id="our-impact">
                    <Impact />
                </div>
                <div className="flex flex-col lg:gap-20">
                    <div className="reveal lg:px-[9%]">
                        <ForLearner handleSignUp={() => setParamMode("learner")} />
                    </div>
                    <div className="reveal lg:px-[9%]">
                        <ForVolunteer handleSignUp={() => setParamMode("volunteer")} />
                    </div>
                </div>
                <div className="reveal px-[9%]">
                    <SkillsToLearn />
                </div>
                <div className="reveal px-[9%]">
                    <InstantSessions />
                </div>
                <div className="reveal px-[7%]">
                    <Community />
                </div>
                <div className="reveal">
                    <Testimonials />
                </div>
                <div className="reveal">
                    <GoogleReviews />
                </div>
                <div className="reveal px-[4%] lg:px-[9%]">
                    <Celebrate />
                </div>
            </div>
            <Footer />
        </div>
    );
}
