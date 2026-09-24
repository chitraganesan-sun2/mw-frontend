"use client";

import CookieConsent from "@/components/landingpage/Cookie";
import BackToTop from "@/components/common/BackToTop";
import FloatingContactButton from "@/components/common/FloatingContactButton";

/**
 * Global floating chrome for the public marketing site (cookie banner,
 * back-to-top, floating contact trigger). Mounted once per public page tree
 * - LandingpageLayout covers about-us/donate/join-us/privacy-policy/
 * terms-and-conditions/blogs, and the homepage (src/app/page.tsx) mounts it
 * directly since it renders its own Header/Footer outside that layout.
 */
const PublicPageChrome = () => {
    return (
        <>
            <CookieConsent />
            <BackToTop />
            <FloatingContactButton />
        </>
    );
};

export default PublicPageChrome;
