"use client";

import HeroBannerImg from "@/assets/images/HeroBannerImg.png";
import HeroBannerMobileImg from "@/assets/images/HeroBannerMobileImg.png";
import Image from "next/image";
import Button from "@/components/common/Button";
import HeroLogo from "@/assets/images/landingpage/hero-logo.png";
import { useUrlParam } from "@/hooks/useUrlParam";


const Hero = () => {
    const [_, setParamMode] = useUrlParam("signup_as");

    return (
        <div className="w-full h-full bg-[#F4F7FB] md:bg-white">
            <div className={`w-full md:h-[80vh] md:min-h-[640px] md:max-h-[760px] md:bg-white relative`}>
                <div className="w-full !h-[300px] md:!h-full md:!relative">
                    <Image src={HeroBannerImg} alt="Learners studying together with the help of technology" fill className="h-full object-cover object-top hidden md:block" />
                    <Image src={HeroBannerMobileImg} alt="Learners studying together with the help of technology" fill className="!h-[300px] md:hidden object-cover object-top" />
                </div>
                {/* Left panel: one shrink-wrapped block, centred in the free space left of the photo collage */}
                <div className="relative md:absolute md:inset-y-0 md:left-0 md:w-[46%] z-10 flex items-center justify-center px-5 md:px-0 py-8 md:py-0">
                    <div className="flex flex-col items-center text-center gap-2 w-full md:w-fit">
                        {/* Title + tagline share one left edge on desktop (offsets cancel each glyph's side bearing so M and W start at the same point) */}
                        <h1 className="md:self-start md:-ml-[0.0625em] text-4xl lg:text-5xl font-semibold !leading-tight">MelodyWings</h1>
                        <p className="md:self-start md:text-left md:-ml-[0.0156em] text-lg lg:text-xl font-medium">Where Every Ability Finds Its Wings.</p>
                        <div className="relative w-[240px] h-[220px] md:w-[250px] md:h-[225px] lg:w-[300px] lg:h-[270px] my-2">
                            <Image src={HeroLogo} alt="MelodyWings Logo" fill priority className="object-contain" />
                        </div>
                        <p className="text-base lg:text-lg font-medium">
                            A <strong className="font-semibold">FREE</strong> Online Platform Connecting<br className="hidden md:block" />{" "}
                            Individuals with Disabilities &amp;<br className="hidden md:block" />{" "}
                            Caring Volunteers
                        </p>
                        <div className="flex flex-col md:flex-row gap-3 mt-2 w-full md:w-auto max-w-[360px] md:max-w-none">
                            <Button
                                onClick={() => setParamMode("learner")}
                                title="Join as a Learner"
                                btnVariant="learner"
                                size="small"
                                customClassName="w-full md:w-auto"
                            />
                            <Button
                                onClick={() => setParamMode("volunteer")}
                                title="Join as a Volunteer"
                                btnVariant="volunteer"
                                size="small"
                                customClassName="w-full md:w-auto"
                            />
                        </div>
                        <p className="text-base font-bold text-gray-600">COPPA & HIPAA Compliant</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
