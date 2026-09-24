"use client";

import { SideMenuIcon } from "@/assets/icons";
import Button from "@/components/common/Button";
import Logo from "@/components/common/Logo";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import SideNavBar from "@/components/landingpage/SideNavBar";
import { IoMdClose } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { useRouter, usePathname } from "next/navigation";
import { LoginModal } from "../../Modals/LoginModal";
import SignUpAsModal from "../../Modals/SignUpAsModal";
import SiteSearch from "@/components/landingpage/SiteSearch";
import { useQueryState } from "nuqs";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_WEB_CLIENT_ID } from "@/definitions";

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();

    const [paramMode, setParamMode] = useQueryState("signup_as");

    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [isSideNavBarOpen, setIsSideNavBarOpen] = useState<boolean>(false);
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // "/" opens site search, the same shortcut used by most sites (GitHub,
    // Slack, Linear...). Ignored while typing in a field so it doesn't hijack
    // a literal "/" keystroke.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "/") return;
            const target = e.target as HTMLElement;
            const isTyping =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;
            if (isTyping) return;
            e.preventDefault();
            setIsSearchOpen(true);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // Close the drawer on any route change, not just clicks routed through
    // handleLinkClick - browser back/forward or a link that bypasses that
    // handler used to leave it open. Matches the already-correct pattern in
    // the authenticated app's header (src/components/common/Header/index.tsx).
    useEffect(() => {
        setIsSideNavBarOpen(false);
    }, [pathname]);

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
            className="w-full mx-auto bg-white shadow-md sticky top-0 z-40"
        >
            <div className="w-full mx-auto flex justify-between items-center 2xl:px-[4%] px-[5%] py-5 ">
                <Link
                    href="/"
                    className="cursor-pointer focus-ring"
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
                                        className="underline font-medium hover:text-gray-600 transition-all duration-300 focus-ring"
                                        style={noTapHighlight}
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </nav>
                            <button
                                type="button"
                                aria-label="Search (press / to open)"
                                onClick={() => setIsSearchOpen(true)}
                                className="focus-ring appearance-none border-0 bg-transparent p-1 leading-none hover:text-gray-600 transition-colors duration-200"
                                style={noTapHighlight}
                            >
                                <IoSearchOutline size={22} aria-hidden="true" />
                            </button>
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
                            aria-label="Search"
                            onClick={() => setIsSearchOpen(true)}
                            className="md:hidden focus-ring appearance-none border-0 bg-transparent p-1 leading-none touch-manipulation mr-3"
                            style={noTapHighlight}
                        >
                            <IoSearchOutline size={22} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            aria-label={isSideNavBarOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={isSideNavBarOpen}
                            className="md:hidden cursor-pointer appearance-none border-0 bg-transparent p-0 leading-none touch-manipulation focus-ring"
                            onClick={handleSideNavBar}
                            style={noTapHighlight}
                        >
                            <SideMenuIcon />
                        </button>
                    </>
                )}
            </div>
            <SiteSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
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
                                className="cursor-pointer focus-ring"
                                style={noTapHighlight}
                            >
                                <Logo />
                            </Link>
                            <button
                                type="button"
                                aria-label="Close navigation menu"
                                onClick={handleSideNavBar}
                                className="cursor-pointer appearance-none border-0 bg-transparent p-0 leading-none focus-ring"
                                style={noTapHighlight}
                            >
                                <IoMdClose className="text-[28px] mt-1 font-bold" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-10 justify-center items-center mt-16">
                            {links.map((link, index) => (
                                <button
                                    type="button"
                                    onClick={() => handleLinkClick(link.link)}
                                    key={index}
                                    className="underline font-medium hover:text-gray-600 transition-all duration-300 text-base appearance-none border-0 bg-transparent p-0 leading-none focus-ring"
                                    style={noTapHighlight}
                                >
                                    {link.title}
                                </button>
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
