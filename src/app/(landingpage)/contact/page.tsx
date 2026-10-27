import React from "react";
import type { Metadata } from "next";
import { SHARE_IMAGES } from "@/constants/seo";
import { FiMail } from "react-icons/fi";
import { SUPPORT_EMAIL } from "@/constants/contact";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with MelodyWings by email.",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        title: "Contact Us | MelodyWings",
        description: "Get in touch with MelodyWings by email.",
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
    return (
        <div className="w-full bg-background-input min-h-[60vh]">
            <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 md:px-8 py-8 md:py-12">
                <h1 className="text-[24px] lg:text-[32px] font-semibold text-gray-900">Contact Us</h1>
                <p className="mt-3 max-w-2xl text-[14px] md:text-lg text-gray-800">
                    We&apos;d love to hear from you. Reach the MelodyWings team directly using the details below.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:max-w-md">
                    <ContactCard
                        href={`mailto:${SUPPORT_EMAIL}`}
                        icon={<FiMail size={22} />}
                        label="Support email"
                        value={SUPPORT_EMAIL}
                        hint="Email us at"
                    />
                </div>

            </div>
        </div>
    );
};

export default ContactPage;
