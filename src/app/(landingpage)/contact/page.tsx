import React from "react";
import type { Metadata } from "next";
import { SHARE_IMAGES } from "@/constants/seo";
import { FiMail, FiPhone } from "react-icons/fi";
import { SUPPORT_EMAIL, SUPPORT_PHONE, hasSupportPhone, phoneToTelHref } from "@/constants/contact";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with MelodyWings by phone or email.",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        title: "Contact Us | MelodyWings",
        description: "Get in touch with MelodyWings by phone or email.",
        url: "/contact",
        images: SHARE_IMAGES,
    },
};

const cardClass =
    "group flex items-start gap-3 sm:gap-4 rounded-[20px] border border-gray-200 bg-white p-4 sm:p-5 md:p-6 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900";

const ContactCard = ({
    href,
    icon,
    label,
    value,
    hint,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    value: string;
    hint: string;
}) => (
    <a href={href} className={cardClass} aria-label={`${hint} ${value}`}>
        <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#EDEDED] text-[#121212]" aria-hidden="true">
            {icon}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="break-words text-[15px] min-[400px]:text-base sm:text-lg md:text-xl font-medium text-gray-900 underline-offset-4 group-hover:underline">
                {value}
            </span>
        </span>
    </a>
);

const ContactPage = () => {
    const showPhone = hasSupportPhone(SUPPORT_PHONE);

    return (
        <div className="w-full bg-background-input min-h-[60vh]">
            <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 md:px-8 py-10 md:py-16">
                <h1 className="text-[24px] lg:text-[32px] font-semibold text-gray-900">Contact Us</h1>
                <p className="mt-3 max-w-2xl text-[14px] md:text-lg text-gray-800">
                    We&apos;d love to hear from you. Reach the MelodyWings team directly using the details below.
                </p>

                <div className={`mt-8 grid grid-cols-1 gap-4 md:gap-6 ${showPhone ? "md:grid-cols-2" : "md:max-w-md"}`}>
                    {showPhone && (
                        <ContactCard
                            href={phoneToTelHref(SUPPORT_PHONE)}
                            icon={<FiPhone size={22} />}
                            label="Phone"
                            value={SUPPORT_PHONE}
                            hint="Call us at"
                        />
                    )}
                    <ContactCard
                        href={`mailto:${SUPPORT_EMAIL}`}
                        icon={<FiMail size={22} />}
                        label="Support email"
                        value={SUPPORT_EMAIL}
                        hint="Email us at"
                    />
                </div>

                {!showPhone && process.env.NODE_ENV !== "production" && (
                    <p className="mt-6 rounded-xl border border-dashed border-gray-400 p-3 text-sm text-gray-700">
                        Dev note: set <code>NEXT_PUBLIC_SUPPORT_PHONE</code> to show the official phone number here. It is a
                        required configuration value and is deliberately not hardcoded.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ContactPage;
