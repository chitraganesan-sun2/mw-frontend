import MeetOurTeam from "@/components/landingpage/AboutUs/MeetOurTeam";
import TitleSection from "@/components/onboarding/TitleSection";
import AboutSectionCard from "@/components/landingpage/AboutUs/AboutSectionCard";
import Link from "next/link";
import type { Metadata } from "next";
import { SHARE_IMAGES } from "@/constants/seo";

export const metadata: Metadata = {
    title: "About Us",
    description: "MelodyWings provides free, personalized learning opportunities for learners with disabilities and special needs, taught by volunteers who share their knowledge and earn community service hours.",
    alternates: {
        canonical: "/about-us",
    },
    openGraph: {
        title: "About Us | MelodyWings",
        description: "MelodyWings provides free, personalized learning opportunities for learners with disabilities and special needs, taught by volunteers who share their knowledge and earn community service hours.",
        url: "/about-us",
        images: SHARE_IMAGES,
    },
};

const AboutUs = () => {
    return (
        <div className="w-full bg-background-input px-4 py-6 lg:px-6 lg:py-10">
        <div className="flex flex-col gap-7 py-10 px-5 lg:p-10 w-full max-w-[1200px] mx-auto rounded-3xl bg-white">
            <TitleSection
                rootClassName="!pt-0"
                titleStyle="!text-2xl lg:!text-[40px] max-md:!mb-3 !font-medium"
                descriptionStyle="!text-sm md:!text-sm lg:!text-xl !font-normal !text-black !text-center"
                as="h1"
                title="About Us"
                description="MelodyWings is an initiative dedicated to providing free learning opportunities for learners with disabilities and special needs. Through personalized lessons, learners can explore subjects they are passionate about or receive support in areas where they need it. At the same time, volunteers have the opportunity to share their knowledge, gain valuable experience, and earn community service hours."
            />
            <AboutSectionCard />
            <MeetOurTeam />
            <div className="text-center">
                <p className="text-[#808080] max-md:text-xs">
                    Designed and Developed by {" "}
                    <Link href="https://www.greyfeathers.io/" target="_blank" className="text-base md:text-xl text-black underline">Greyfeathers</Link>
                </p>
            </div>
        </div>
        </div>
    );
};

export default AboutUs;