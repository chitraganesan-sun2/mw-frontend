import MeetOurTeam from "@/components/landingpage/AboutUs/MeetOurTeam";
import TitleSection from "@/components/onboarding/TitleSection";
import AboutSectionCard from "@/components/landingpage/AboutUs/AboutSectionCard";
import Link from "next/link";

const AboutUs = () => {
    return (
        <div className="flex flex-col gap-7 py-[4rem] w-[90%] max-w-[1200px] mx-auto">
            <TitleSection 
                rootClassName="!pt-0"
                titleStyle="!text-2xl lg:!text-[40px] max-md:!mb-3 !font-medium"
                descriptionStyle="!text-sm md:!text-sm lg:!text-xl !font-normal !text-black !text-center !text-justify"
                title="About Us"
                description="MelodyWings is a heartfelt initiative created to provide free tutoring for students with disabilities and special needs. It is a platform where these students can receive personalized lessons in subjects they are passionate about or need help with, all while volunteers gain valuable experience and earn community service hours."
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
    );
};

export default AboutUs;