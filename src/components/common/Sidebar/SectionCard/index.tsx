"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
interface SectionCardProps {
    href: string;
    /** Signed-in role. The Sidebar only renders cards once it is known, so links are
     *  never emitted as "/schedule" (404) before the role cookie has been read. */
    role: string;
    text: string;
    icon: React.ReactNode;
    textColor?: string;
    onClick?: () => void;
    /** Unread count; renders nothing when 0/undefined. */
    badge?: number;
}

const SectionCard = ({ href, role, text, icon, textColor, onClick, badge }: SectionCardProps) => {
    const hasBadge = typeof badge === "number" && badge > 0;
    const pathname = usePathname();
    const isActive = pathname.includes(href);
    // Normalize: strip any leading slash from href so we never produce
    // a double slash like "/learner//community" (which 404s in static export).
    const cleanHref = href.replace(/^\/+/, "");
    const finalHref = `/${role}/${cleanHref}`;

    return (
        <div className="w-full flex items-center justify-center">
            <Link
                href={finalHref}
                onClick={onClick}
                aria-label={hasBadge ? `${text}, ${badge} unread` : undefined}
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
                {hasBadge && (
                    <span
                        aria-hidden="true"
                        className="ml-1 mt-0.5 min-w-[18px] rounded-full bg-red-600 px-1.5 text-center text-[11px] font-semibold leading-[18px] text-white animate-pulse"
                    >
                        {badge > 99 ? "99+" : badge}
                    </span>
                )}
            </Link>
        </div>
    );
};

export default SectionCard;
