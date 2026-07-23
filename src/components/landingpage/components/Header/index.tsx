"use client";

import { SideMenuIcon } from "@/assets/icons";
import Button from "@/components/common/Button";
import Logo from "@/components/common/Logo";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import SideNavBar from "@/components/landingpage/SideNavBar";
import { IoMdClose } from "react-icons/io";
import { useRouter, usePathname } from "next/navigation";
import { LoginModal } from "../../Modals/LoginModal";
import SignUpAsModal from "../../Modals/SignUpAsModal";
import { useQueryState } from "nuqs";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_WEB_CLIENT_ID } from "@/definitions";

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();

    const [paramMode, setParamMode] = useQueryState("signup_as");

    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [isSideNavBarOpen, setIsSideNavBarOpen] = useState<boolean>(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSideNavBar = () => {
        setIsSideNavBarOpen(!isSideNavBarOpen);
    };

    const handleLoginModal = () => {
        setIsLoginModalOpen(!isLoginModalOpen);
    };

    const handleCloseSideNavBar = () => {
        setIsLoginModalOpen(false);
        setIsSideNavBarOpen(!isSideNavBarOpen);
    };

    const links = [
        // { title: "Donate", link: "/donate" },
        { title: "Donate", link: "/donate" },
        { title: "About Us", link: "/about-us" },
        // { title: "Blogs", link: "/blogs" },
        // { title: "Team Up", link: "/" },
    ];

    const handleLinkClick = (link: string) => {
        handleSideNavBar();
        router.push(link);
    };

    const hideNavigation = ["/privacy-policy", "/terms-and-conditions"].includes(pathname);
    const noTapHighlight = {
        WebkitTapHighlightColor: "transparent",
        WebkitTouchCallout: "none",
    } as const;

    return (
        <div
            className="w-full mx-auto bg-white shadow-md "
        >
            <div className="w-full mx-auto flex justify-between items-center 2xl:px-[4%] px-[5%] py-5 ">
                <Link
                    href="/"
                    className="cursor-pointer focus:outline-none focus-visible:outline-none"
                    style={noTapHighlight}
                >
                    <Logo />
                </Link>
                {!hideNavigation && (
                    <>
                        <div className="hidden md:flex 2xl:gap-6 gap-4 items-center">
                            <nav className="flex 2xl:gap-6 gap-4">
                                {links.map((link, index) => (
                                    <Link
                                        href={link.link}
                                        key={index}
                                        className="underline font-medium hover:text-gray-600 transition-all duration-300 focus:outline-none focus-visible:outline-none active:outline-none"
                                        style={noTapHighlight}
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </nav>
                            <div className="relative">
                                <Button
                                    title="Log In"
                                    className="!bg-black !px-3 !py-1 text-white hover:!bg-black hover:!text-white text-sm !rounded-lg"
                                    onClick={handleLoginModal}
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            aria-label="Open navigation menu"
                            className="md:hidden cursor-pointer appearance-none border-0 bg-transparent p-0 leading-none touch-manipulation focus:outline-none focus-visible:outline-none active:outline-none"
                            onClick={handleSideNavBar}
                            style={noTapHighlight}
                        >
                            <SideMenuIcon />
                        </button>
                    </>
                )}
            </div>
            {mounted && (
                // Google OAuth is only ever needed here - Header is only rendered on
                // logged-out landing pages (this file, via Hero on the homepage, and via
                // LandingpageLayout elsewhere), never on authenticated routes. Scoping the
                // provider to this subtree keeps its script/context out of every route
                // that never uses it again once a user is logged in.
                <GoogleOAuthProvider clientId={GOOGLE_WEB_CLIENT_ID || ""}>
                    <SideNavBar isOpen={isSideNavBarOpen} onClose={handleCloseSideNavBar}>
                        <div className="flex justify-between items-center px-4">
                            <Link
                                href="/"
                                className="cursor-pointer focus:outline-none focus-visible:outline-none"
                                style={noTapHighlight}
                            >
                                <Logo />
                            </Link>
                            <div
                                onClick={handleSideNavBar}
                                className="cursor-pointer focus:outline-none focus-visible:outline-none"
                                style={noTapHighlight}
                            >
                                <IoMdClose className="text-[28px] mt-1 font-bold" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-10 justify-center items-center mt-16">
                            {links.map((link, index) => (
                                <div
                                    onClick={() => handleLinkClick(link.link)}
                                    key={index}
                                    className="underline font-medium hover:text-gray-600 transition-all duration-300 text-base focus:outline-none focus-visible:outline-none active:outline-none"
                                    style={noTapHighlight}
                                >
                                    {link.title}
                                </div>
                            ))}
                            <div className="relative w-full flex-center">
                                <Button
                                    title="Log In"
                                    className="!bg-black !px-3 !py-1 text-white hover:!bg-black hover:!text-white text-sm !rounded-lg min-w-[150px]"
                                    onClick={handleLoginModal}
                                />
                            </div>
                        </div>
                    </SideNavBar>
                    <LoginModal
                        isOpen={isLoginModalOpen}
                        onClose={() => setIsLoginModalOpen(false)}
                    />
                    <SignUpAsModal
                        isOpen={paramMode === "learner" || paramMode === "volunteer"}
                        onClose={() => setParamMode(null)}
                    />
                </GoogleOAuthProvider>
            )}
        </div>
    );
};

export default Header;
