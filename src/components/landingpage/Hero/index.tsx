"use client";

import HeroBannerImg from "@/assets/images/HeroBannerImg.png";
import HeroBannerMobileImg from "@/assets/images/HeroBannerMobileImg.png";
import Image from "next/image";
import { useState } from "react";
import Button from "@/components/common/Button";
import HeroBannerLogo from "@/assets/images/landingpage/hero-banner.png";
import { useQueryState } from "nuqs";
import Header from "../components/Header";


const Hero = () => {
    const [_, setParamMode] = useQueryState("signup_as");

    return (
        <div className="w-full h-full bg-[#F4F7FB] md:bg-white">
            <Header />
            <div className={`w-full md:h-[80vh] md:bg-white relative`}>
                <div className="w-full !h-[300px] md:!h-full md:!relative">
                    <Image src={HeroBannerImg} alt="Students learning together with technology support" fill className="h-full object-cover object-top hidden md:block" />
                    <Image src={HeroBannerMobileImg} alt="Students learning together with technology support" fill className="!h-[300px] md:hidden object-cover object-top" />
                </div>
                <div className="relative md:!w-[40%] md:!h-[30%] md:!absolute md:!top-[35%] md:!left-[10%] z-10 flex-center flex-col md:items-start md:justify-start gap-6">
                    <div className="absolute top-[-20%] md:top-[-50%] lg:top-[-70%] left-0 w-full h-[150px] md:h-[250px] md:w-[250px] lg:w-[350px] lg:h-[350px] z-5 max-md:flex-center">
                        <Image src={HeroBannerLogo} alt="MelodyWings Logo" fill className="object-contain" />
                    </div>
                    <h1 className="px-5 md:px-0 text-2xl lg:text-4xl text-center md:!text-start font-medium !leading-normal">
                        Limitless free learning <br /> opportunities for diverse <br />
                        disabilities
                    </h1>
                    <div className="flex flex-col md:flex-row gap-3">
                        <Button
                            onClick={() => setParamMode("learner")}
                            title="Enroll as Learner"
                            btnVariant="learner"
                            size="small"
                            customClassName="w-full md:w-auto"
                        />
                        <Button
                            onClick={() => setParamMode("volunteer")}
                            title="Become a Volunteer"
                            btnVariant="volunteer"
                            size="small"
                            customClassName="w-full md:w-auto"
                        />
                    </div>
                    <p className="text-base font-bold text-gray-600">COPPA & HIPAA Compliant</p>
                </div>
            </div>
        </div>
    );
};

export default Hero;
