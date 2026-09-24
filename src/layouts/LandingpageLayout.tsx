import React from "react";
import Header from "@/components/landingpage/components/Header";
import { FC, PropsWithChildren } from "react";
import Footer from "@/components/onboarding/Footer";
import PublicPageChrome from "@/components/landingpage/PublicPageChrome";

const LandingpageLayout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <div>
            <Header />
			<div className="w-full h-full bg-[#F4F7FB] md:bg-background-input">{children}</div>
            <Footer />
            <PublicPageChrome />
        </div>
    );
};

export default LandingpageLayout;
