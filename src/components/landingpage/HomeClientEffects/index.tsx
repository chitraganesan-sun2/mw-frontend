"use client";

import { useEffect } from "react";
import { useUrlParam } from "@/hooks/useUrlParam";

// Isolates the homepage's only two bits of interactivity - resetting the signup_as
// query param on mount, and wiring up ScrollReveal - so app/page.tsx itself can stay
// a server component instead of forcing the whole static marketing page into the
// client bundle for these two effects.
export default function HomeClientEffects() {
    const [, setParamMode] = useUrlParam("signup_as");

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
        let resizeObserver: ResizeObserver | undefined;
        const setupScrollReveal = async () => {
            if (typeof window !== "undefined") {
                const ScrollReveal = (await import("scrollreveal")).default;
                sr = ScrollReveal({
                    origin: "bottom",
                    distance: "3px",
                    duration: 800,
                    delay: 100,
                    easing: "ease-out",
                    // Reveal once and leave it: with `reset: true` every section was hidden again as it
                    // left the screen, and whenever the stored positions went stale (content that loads
                    // later pushes things down) sections stayed blank - the page "vanished" on scroll.
                    reset: false,
                    viewFactor: 0.1,
                    viewOffset: { top: 0, right: 0, bottom: -100, left: 0 },
                });

                sr.reveal(".reveal", { interval: 100 });

                // ScrollReveal measures every section once, when it starts. Content that arrives later
                // (the Learner Stories strip, community posts, images) pushes the sections below it
                // down, so their stored positions go stale and they stay invisible when scrolled to.
                // Re-measure (ScrollReveal re-reads every position on a window "resize") whenever the
                // page height changes.
                if (typeof ResizeObserver !== "undefined") {
                    let timer: number | undefined;
                    resizeObserver = new ResizeObserver(() => {
                        window.clearTimeout(timer);
                        timer = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 150);
                    });
                    resizeObserver.observe(document.body);
                }
            }
        };

        setupScrollReveal();

        return () => {
            resizeObserver?.disconnect();
            if (sr) sr.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
