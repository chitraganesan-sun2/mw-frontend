"use client";

import Link from "next/link";
import { FaLinkedin, FaInstagram, FaWhatsapp, FaFacebook, FaGoogle } from "react-icons/fa";
import { IconType } from "react-icons";
import Logo from "@/components/common/Logo";
// import { FaSquareXTwitter } from "react-icons/fa6";

type Props = {};

type PolicyLink = {
    href?: string;
    label: string;
    target?: string;
};

type SocialLink = {
    href: string;
    icon: IconType;
    label: string;
};

const Footer = (props: Props) => {
    const policyLinks: PolicyLink[] = [
        { href: "/privacy-policy", target: "_blank", label: "Privacy Policy" },
        { href: "/terms-and-conditions", target: "_blank", label: "Terms & Conditions" },
        { href: "/join-us", label: "Join Us" },
        {
            href: "mailto:support@melodywings.org",
            target: "_blank",
            label: "Contact Us - support@melodywings.org",
        },
    ];

    const socialLinks: SocialLink[] = [
        {
            label: "LinkedIn",
            icon: FaLinkedin,
            href: "https://www.linkedin.com/company/melodywings",
        },
        { label: "Instagram", icon: FaInstagram, href: "https://www.instagram.com/melodywings_" },
        {
            label: "Facebook",
            icon: FaFacebook,
            href: "https://www.facebook.com/profile.php?id=61575239913366",
        },
        {
            label: "Google Reviews",
            icon: FaGoogle,
            href: "https://share.google/gfwJSERksSJ5bpTib",
        },
        // { label: "X", icon: FaSquareXTwitter, href: "https://x.com" },
        // { label: "WhatsApp", icon: FaWhatsapp, href: "https://wa.me/1234567890" },
    ];
    const renderSocialLinks = () => (
        <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    title={link.label}
                    target="_blank"
                    className="hover:text-gray-600 transition-all duration-300"
                    aria-label={link.label}
                >
                    <link.icon size={22} />
                </Link>
            ))}
        </div>
    );

    return (
        <footer className="w-full bg-white lg:min-h-[40vh] px-[9%] flex items-center justify-center">
            <div className="max-w-[1400px] w-full mx-auto py-6">
                <div className="flex w-full flex-col lg:flex-row justify-between items-center lg:items-start gap-4 py-8 lg:py-0">
                    {/* Left side - Policy and Terms links */}
                    <div className="flex flex-col max-lg:items-center mb-5 lg:mb-0 gap-6">
                        {policyLinks.map((link, index) => (
                            <Link
                                key={link?.href || index}
                                href={link?.href || "#"}
                                rel="noopener noreferrer"
                                target={link?.target}
                                className="text-sm text-gray-600 underline hover:text-gray-900 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex-center flex-col gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <Logo className="flex !flex-col" />
                            <p className="text-gray-500 text-center text-sm">
                                501c.3 | EIN:33-3734582
                            </p>
                        </div>

                        <div className="lg:hidden">{renderSocialLinks()}</div>
                        {/* Center - Terms of Use and Privacy Policy text */}
                        <p className="text-gray-500 text-center text-sm">
                            Be sure to take a look at our Terms of Use
                            <br />
                            and Privacy Policy
                        </p>
                    </div>

                    {/* Social media icons */}
                    <div className="hidden lg:block">{renderSocialLinks()}</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
