"use client";

import { useEffect, useState } from "react";
import { IoArrowUp } from "react-icons/io5";

const SHOW_AFTER_PX = 480;

/**
 * Floating scroll-to-top control. Only mounted on long-form public pages
 * (see LandingpageLayout) - the authenticated dashboard is app-like, not a
 * scrolling document, so it has no meaningful use there.
 */
const BackToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToTop = () => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    };

    if (!visible) return null;

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="no-print focus-ring fixed bottom-24 right-4 md:right-6 z-40 w-11 h-11 rounded-full bg-white text-black border border-gray-200 shadow-lg flex-center hover:bg-gray-50 active:scale-90 transition-all duration-200"
        >
            <IoArrowUp size={20} aria-hidden="true" />
        </button>
    );
};

export default BackToTop;
