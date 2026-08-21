"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { getLocalStorage } from "@/utils/localStorage";
import { getCookie } from "@/utils/auth";
interface SectionCardProps {
    href: string;
    text: string;
    icon: React.ReactNode;
    textColor?: string;
    onClick?: () => void;
}

const SectionCard = ({ href, text, icon, textColor, onClick }: SectionCardProps) => {
    const pathname = usePathname();
    const isActive = pathname.includes(href);
    const role = getCookie("role");

    // Normalize: strip any leading slash from href so we never produce
    // a double slash like "/learner//community" (which 404s in static export).
    const cleanHref = href.replace(/^\/+/, "");
    const finalHref = role ? `/${role}/${cleanHref}` : `/${cleanHref}`;

    return (
        <div className="w-full flex items-center justify-center">
            <Link
                href={finalHref}
                onClick={onClick}
                className="flex items-start gap-2 lg:max-w-[150px] lg:w-full ml-[-1rem]"
            >
                <span
                    className={`text-[1.25rem] transition-all duration-300 ${
                        isActive ? "text-primary" : "text-black"
                    }   `}
                >
                    {icon}
                </span>
                <p
                    style={textColor ? { color: textColor } : undefined}
                    className={`!text-[${textColor}] transition-all duration-300 font-medium whitespace-nowrap ${
                        isActive && !textColor ? "text-primary" : ""
                    }`}
                >
                    {text}
                </p>
            </Link>
        </div>
    );
};

export default SectionCard;
