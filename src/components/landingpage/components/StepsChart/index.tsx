"use client";
import React from "react";
import Image from "next/image";
import LineImage from "@/assets/images/LineImg.png";
import LineImageVertical from "@/assets/images/LineImgVertical.png";
import useInnerWidth from "@/hooks/useInnerWidth";

interface StepsChartProps {
    title: string;
    icon: React.ReactNode;
    iconMobile: React.ReactNode;
    index: number;
    /** Always use the stacked (vertical) layout, for steps shown inside a narrow column. */
    vertical?: boolean;
}

const StepsChart = ({ title, icon, iconMobile, index, vertical = false }: StepsChartProps) => {
    const innerWidth = useInnerWidth();
    const wide = !vertical;
    return (
        <div
            key={index}
            className={`flex flex-col relative gap-4 w-full h-[100px] ${wide ? "lg:items-center lg:max-w-[17rem] lg:h-[170px]" : ""}`}
        >
            <div className={`flex flex-row items-center w-full ${wide ? "lg:ml-[70%]" : ""}`}>
                <div className={`rounded-full z-10 mr-2 md:mr-3 ${wide ? "lg:mr-0" : ""}`}>
                    {wide && innerWidth > 768 ? icon : iconMobile}
                </div>
                {wide && index !== 3 && (
                    <div className="relative hidden lg:block w-full h-0.5">
                        <Image src={LineImage} alt="Line" className="w-full" fill />
                    </div>
                )}
                <p className={`text-sm font-semibold text-gray-light max-w-[15rem] ${wide ? "lg:hidden" : ""}`}>
                    {" "}
                    {title}
                </p>
            </div>
            {index !== 3 && (
                <div className={`w-0.5 absolute left-5 md:left-8 top-8 z-1 ${wide ? "lg:hidden" : ""}`}>
                    <Image src={LineImageVertical} alt="Line" className="h-[100px]" />
                </div>
            )}
            {wide && (
                <p className="hidden lg:block lg:text-center font-semibold text-gray-light ml-[-5%] w-full max-w-[15rem]">
                    {" "}
                    {title}
                </p>
            )}
        </div>
    );
};

export default StepsChart;
