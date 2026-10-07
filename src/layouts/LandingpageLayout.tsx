import React from "react";
import Header from "@/components/landingpage/components/Header";
import { FC, PropsWithChildren } from "react";
import Footer from "@/components/onboarding/Footer";
import RoleNeutralScope from "@/components/common/RoleNeutralScope";

const LandingpageLayout: FC<PropsWithChildren> = ({ children }) => {
    // about-us / blogs / donate / join-us / privacy / terms are role-neutral: pin the theme
    // accents to black/grey so a stale role cookie can't tint them blue or orange.
    return (
        <RoleNeutralScope>
            <Header />
            <div className="w-full h-full bg-[#F4F7FB] md:bg-background-input">{children}</div>
            <Footer />
        </RoleNeutralScope>
    );
};

export default LandingpageLayout;
