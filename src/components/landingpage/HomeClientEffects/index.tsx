"use client";

import { useEffect } from "react";
import { useQueryState } from "nuqs";

// Isolates the homepage's only two bits of interactivity - resetting the signup_as
// query param on mount, and wiring up ScrollReveal - so app/page.tsx itself can stay
// a server component instead of forcing the whole static marketing page into the
// client bundle for these two effects.
export default function HomeClientEffects() {
    const [, setParamMode] = useQueryState("signup_as");

    useEffect(() => {
        // Clearing signup_as rewrites the URL and drops any #hash, so read the section
        // anchor (header "For Learners" / "For Volunteers" from another page) first and
        // scroll to it once the page has laid out.
        const anchor = window.location.hash.slice(1);
        setParamMode(null);
        if (anchor) {
            window.setTimeout(() => {
                document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 150);
        }

        let sr: any;
        const setupScrollReveal = async () => {
            if (typeof window !== "undefined") {
                const ScrollReveal = (await import("scrollreveal")).default;
                sr = ScrollReveal({
                    origin: "bottom",
                    distance: "3px",
                    duration: 800,
                    delay: 100,
                    easing: "ease-out",
                    reset: true,
                    viewFactor: 0.1,
                    viewOffset: { top: 0, right: 0, bottom: -100, left: 0 },
                });

                sr.reveal(".reveal", { interval: 100 });
            }
        };

        setupScrollReveal();

        return () => {
            if (sr) sr.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
