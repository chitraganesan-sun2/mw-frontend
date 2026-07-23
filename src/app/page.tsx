import Celebrate from "@/components/landingpage/Celebrate";
import Community from "@/components/landingpage/Community";
import Testimonials from "@/components/landingpage/testimonials";
import ForLearner from "@/components/landingpage/ForLearner";
import ForVolunteer from "@/components/landingpage/ForVolunteer";
import Hero from "@/components/landingpage/Hero";
import Impact from "@/components/landingpage/Impact";
import WhyWeBuild from "@/components/landingpage/WhyWeBuild";
import Footer from "@/components/onboarding/Footer";
import SkillsToLearn from "@/components/landingpage/SkillsToLearn";
import InstantSessions from "@/components/landingpage/InstantSessions";
import HomeClientEffects from "@/components/landingpage/HomeClientEffects";

export default function Page() {
    return (
        <div className="w-full overflow-x-hidden bg-background-input relative">
            <HomeClientEffects />
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
                        <ForLearner />
                    </div>
                    <div className="reveal lg:px-[9%]">
                        <ForVolunteer />
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
                <div className="reveal px-[4%] lg:px-[9%]">
                    <Celebrate />
                </div>
            </div>
            <Footer />
        </div>
    );
}
