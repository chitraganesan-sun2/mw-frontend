"use client";
import React from "react";

const OverViewCard: React.FC<OverViewCardProps> = ({ title, value, icon, className = "" }) => {
    const gradient =
        "linear-gradient(to right, #d5e2f6, #d4e4f6, #d4e6f6, #d4e7f5, #d5e9f5, #d5ebf5, #d5ecf5, #d5eef4, #d4f0f4, #d4f2f3, #d5f3f2, #d6f5f0)";

    return (
        <div
            className={`flex rounded-xl px-2 py-1 lg:px-5 lg:py-4 w-fit lg:w-full lg:gap-3 items-center ${className}`}
            style={{ background: gradient }}
        >
            {icon}
            <p className="lg:hidden text-xs">{title}: <span className="font-semibold">{value}</span></p>
            <div className="max-lg:hidden flex flex-col gap-2 justify-center">
                <p className="text-[1.5rem] font-semibold">{value}</p>
                <p className="font-medium text-xs">{title}</p>
            </div>
        </div>
    );
};

export default OverViewCard;
