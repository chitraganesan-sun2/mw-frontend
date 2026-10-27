import React from "react";
import { gradientTextStyle } from "@/constants/landingPage";

interface ContainerHeaderProps {
    title: string;
    subTitle?: string;
    description: string;
    titleColor?: string;
    /** Smaller headline, for a header inside a half-width column. */
    compact?: boolean;
}

const ContainerHeader = ({ title, subTitle, description, titleColor, compact }: ContainerHeaderProps) => {
    return (
        <div className="flex flex-col gap-4 items-center">
            <p
                className={`text-base lg:text-xl font-semibold ${titleColor ? titleColor : ""}`}
                style={titleColor ? {} : gradientTextStyle}
            >
                {title}
            </p>
            {subTitle && (
                <h2 className={`text-2xl px-2 font-medium text-center ${compact ? "leading-snug lg:text-[1.625rem]" : "leading-normal lg:text-[2rem]"}`}>
                    {subTitle}
                </h2>
            )}
            <p className={`text-sm px-2 text-gray-light text-center leading-normal ${compact ? "lg:text-base" : "lg:text-xl"}`}>
                {description}
            </p>
        </div>
    );
};

export default ContainerHeader;
