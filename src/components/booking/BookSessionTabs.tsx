"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "@/utils/auth";
import { TERMS } from "@/constants/copy";

/** The two ways to get a session, in the order they are shown everywhere in the booking section. */
export const BOOKING_OPTIONS = [
    { slug: "instant-sessions", label: TERMS.instantSessions, tagline: "Start now" },
    { slug: "book-for-later", label: TERMS.bookForLater, tagline: "Pick a date and time" },
] as const;

/**
 * The switch between the booking section's two options (Instant Sessions / Book for Later), shown at
 * the top of both pages so it is always clear which one you are in and one tap reaches the other.
 * Links, not local state: each option is its own page, so refresh, back and shared links all work.
 */
export default function BookSessionTabs({ className = "" }: { className?: string }) {
    const pathname = usePathname() ?? "";
    // The role cookie isn't readable during SSR; read it after mount (see Sidebar for the reason).
    const [role, setRole] = useState<string | undefined>(undefined);
    useEffect(() => {
        setRole(getCookie("role"));
    }, []);
    if (!role) return <div aria-hidden="true" className={`h-10 ${className}`} />;

    return (
        <nav aria-label={TERMS.bookSession} className={`flex justify-center ${className}`}>
            <ul className="m-0 inline-flex list-none gap-1 rounded-full border border-gray-200 bg-white p-1">
                {BOOKING_OPTIONS.map((option) => {
                    const active = pathname.includes(`/${option.slug}`);
                    return (
                        <li key={option.slug}>
                            <Link
                                href={`/${role}/${option.slug}`}
                                aria-current={active ? "page" : undefined}
                                className={`flex min-h-9 items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                                    active ? "bg-action text-white" : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {option.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
