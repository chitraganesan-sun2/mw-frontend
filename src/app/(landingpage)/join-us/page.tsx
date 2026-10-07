"use client";

import React from "react";
import Image from "next/image";
import Button from "@/components/common/Button";
import image1 from "@/assets/images/image1.jpg";
import { useRouter } from "next/navigation";
    
const JoinUsPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    return (
        <div className="w-full bg-background-input min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 py-5 md:py-16 lg:py-20">
                {/* Main Heading - Outside white background on mobile, inside on desktop */}
                <div className="mb-5 md:hidden">
                    <h1 className="text-[24px]  text-gray-900 font-medium">
                        Join the MelodyWings Operations Team
                    </h1>
                </div>

                {/* White Background Container */}
                <div
                    className="bg-white rounded-[24px] lg:py-10 py-6"
                    style={{ borderRadius: "24px" }}
                >
                    {/* Main Heading - Inside white background on desktop only */}
                    <div className="hidden md:block mb-8 px-10">
                        <h1 className="text-[24px] lg:text-[32px] font-semibold text-gray-900">
                            Join the MelodyWings Operations Team
                        </h1>
                    </div>

                    {/* Image Section */}
                    <div className="w-full mb-5 md:mb-10 lg:mb-12 overflow-hidden px-4 md:px-10">
                        <div
                            className="relative w-full h-[160px] lg:h-[400px] bg-gray-200 rounded-[24px] overflow-hidden mx-auto md:mx-0"
                            style={{ borderRadius: "24px" }}
                        >
                            <Image
                                src={image1}
                                alt="MelodyWings Operations Team working together"
                                fill
                                className="object-cover rounded-[24px]"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                            />
                        </div>
                    </div>

                    {/* Content Section with White Background */}
                    <div className="w-full rounded-lg px-4 md:px-7">
                        <div className="w-full max-w-none space-y-6 md:space-y-7 lg:space-y-8 italic">
                            {/* First Paragraph */}
                            <p className="text-[14px] md:text-lg lg:text-xl text-[#000000] leading-relaxed text-left">
                                At MelodyWings, we don&apos;t just run programs — we create spaces where
                                every challenged child and learner is seen, heard, and valued.
                            </p>

                            {/* Second Paragraph */}
                            <p className="text-[14px] md:text-lg lg:text-xl text-[#000000] leading-relaxed text-left">
                                Behind every volunteer who shows up, every session that runs
                                smoothly, and every small breakthrough moment is an Operations Team
                                quietly making it all possible.
                            </p>

                            {/* Third Paragraph */}
                            <p className="text-[14px] md:text-lg lg:text-xl text-[#000000] leading-relaxed text-left">
                                When you join MelodyWings, you help build the bridge between
                                volunteers and learners, creating a space where every learner is
                                supported, empowered, and encouraged to grow. Whether you&apos;re
                                interested in nonprofit leadership, education, technology, or social
                                impact, MelodyWings offers hands-on experience in operations,
                                teamwork, communication, and problem-solving—experience that goes
                                far beyond a resume line.
                            </p>
                        </div>

                        {/* CTA Button */}
                        <div className="flex justify-center md:justify-start mt-8">
                            <Button
                                title={isLoading ? "Loading..." : "Apply here to Get Involved"}
                                btnVariant="secondary"
                                loading={isLoading}
                                customClassName="!w-full md:!w-auto !px-4 !py-[10px] !h-10 md:!h-12 lg:!text-[18px] !text-[14px] !font-medium !rounded-[10px] !text-white !bg-black hover:!bg-black"
                                // onClick={() => {
                                //     // Add your application link or modal handler here
                                //     window.open(
                                //         "mailto:support@melodywings.org?subject=Operations Team Application",
                                //         "_blank"
                                //     );
                                // }}
                                onClick={() => {
                                    setIsLoading(true);
                                    router.push("/join-us/step-1");
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinUsPage;
