"use client";

import HeroBannerImg from "@/assets/images/HeroBannerImg.webp";
import HeroBannerMobileImg from "@/assets/images/HeroBannerMobileImg.webp";
import Image from "next/image";
import Button from "@/components/common/Button";
import HeroBannerLogo from "@/assets/images/landingpage/hero-banner.png";
import { useQueryState } from "nuqs";
import Header from "../components/Header";

const Hero = () => {
    const [_, setParamMode] = useQueryState("signup_as");

    return (
        <div className="w-full h-full bg-[#F4F7FB] md:bg-white">
            <Header />
            
            {/* Refactored Hero: CSS Grid with intrinsic sizing - eliminates fragile absolute positioning */}
            <div className="w-full md:min-h-[480px] lg:min-h-[600px] md:bg-white relative">
                {/* Background Image Container - Desktop */}
                <div className="hidden md:block absolute inset-0 w-full h-full">
                    <Image 
                        src={HeroBannerImg} 
                        alt="Students learning together with technology support" 
                        fill 
                        priority 
                        className="object-cover object-top"
                        sizes="100vw"
                    />
                </div>
                
                {/* Background Image Container - Mobile */}
                <div className="md:hidden relative w-full h-[300px]">
                    <Image 
                        src={HeroBannerMobileImg} 
                        alt="Students learning together with technology support" 
                        fill 
                        priority 
                        className="object-cover object-top"
                        sizes="100vw"
                    />
                </div>

                {/* Content Grid Overlay */}
                <div className="relative z-10 w-full md:min-h-[480px] lg:min-h-[600px] flex items-center">
                    <div className="container mx-auto px-5 md:px-8 lg:px-12 py-8 md:py-12">
                        <div className="flex flex-col items-center md:items-start md:max-w-2xl lg:max-w-3xl gap-6 md:gap-8">
                            {/* Logo with proper aspect ratio */}
                            <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] -mt-16 md:-mt-20">
                                <Image 
                                    src={HeroBannerLogo} 
                                    alt="MelodyWings Logo" 
                                    fill 
                                    priority
                                    className="object-contain drop-shadow-lg"
                                    sizes="(max-width: 768px) 200px, (max-width: 1024px) 280px, 320px"
                                />
                            </div>

                            {/* Headline */}
                            <h1 className="text-2xl md:text-3xl lg:text-5xl text-center md:text-left font-medium leading-tight md:leading-tight lg:leading-tight text-gray-900 md:text-shadow-sm">
                                Limitless free learning <br className="hidden md:block" />
                                opportunities for diverse <br className="hidden md:block" />
                                disabilities
                            </h1>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Button
                                    onClick={() => setParamMode("learner")}
                                    title="Enroll as Learner"
                                    btnVariant="learner"
                                    size="small"
                                    customClassName="w-full sm:w-auto min-w-[200px]"
                                />
                                <Button
                                    onClick={() => setParamMode("volunteer")}
                                    title="Become a Volunteer"
                                    btnVariant="volunteer"
                                    size="small"
                                    customClassName="w-full sm:w-auto min-w-[200px]"
                                />
                            </div>

                            {/* Trust Badges - Enhanced with better visual hierarchy */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs md:text-sm w-full">
                                {/* 501(c)(3) Nonprofit with verification badge */}
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-lg border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-semibold text-gray-800">501(c)(3) Nonprofit</span>
                                </span>

                                {/* COPPA & HIPAA Compliant with shield */}
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.75z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-gray-800">COPPA & HIPAA Compliant</span>
                                </span>

                                {/* 100% Free Tutoring with emphasis */}
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-learner-light to-volunteer-light rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-base" aria-hidden="true">🎓</span>
                                    <span className="font-bold text-gray-900">100% Free Tutoring</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
