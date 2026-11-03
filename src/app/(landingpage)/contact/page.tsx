import React from "react";
import type { Metadata } from "next";
import { SHARE_IMAGES } from "@/constants/seo";
import { FiMail, FiClock, FiHelpCircle, FiCheckCircle } from "react-icons/fi";
import { SUPPORT_EMAIL } from "@/constants/contact";
import Link from "next/link";

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

const faqs = [
    {
        q: "Is MelodyWings tutoring completely free?",
        a: "Yes, 100% free! MelodyWings is a 501(c)(3) nonprofit dedicated to supporting individuals with disabilities and special needs without any cost to families.",
    },
    {
        q: "Who are the volunteer tutors?",
        a: "Our volunteers include dedicated high school, college students, and professionals passionate about special education, music, art, and academic mentorship. All volunteers undergo onboarding verification.",
    },
    {
        q: "What subjects and activities are offered?",
        a: "We offer academic enrichment (Math, Reading, English, Science), creative arts (Drawing, Dance, Origami), music (Vocals, Keyboard, Guitar, Drums), and life skills.",
    },
];

const ContactPage = () => {
    return (
        <div className="w-full bg-background-input min-h-[60vh] py-8 md:py-14">
            <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 md:px-8 space-y-10">
                <div>
                    <h1 className="text-[24px] lg:text-[36px] font-semibold text-gray-900">Contact Us</h1>
                    <p className="mt-3 max-w-2xl text-[14px] md:text-lg text-gray-700 leading-relaxed">
                        We&apos;d love to hear from you. Whether you have questions about enrolling a learner, volunteering, or donating, our team is here to help.
                    </p>
                </div>

                {/* Primary Contact Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ContactCard
                        href={`mailto:${SUPPORT_EMAIL}`}
                        icon={<FiMail size={22} />}
                        label="Support Email"
                        value={SUPPORT_EMAIL}
                        hint="Email us at"
                    />
                    <div className="flex items-start gap-3 sm:gap-4 rounded-[20px] border border-gray-200 bg-white p-4 sm:p-5 md:p-6">
                        <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600" aria-hidden="true">
                            <FiClock size={22} />
                        </span>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">Response Time</span>
                            <span className="text-[15px] sm:text-lg font-medium text-gray-900">Within 24 Hours</span>
                            <span className="text-xs text-gray-500">We respond to all parent and volunteer inquiries promptly.</span>
                        </div>
                    </div>
                </div>

                {/* Quick Topic Inquiries */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-5">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FiHelpCircle className="text-primary" />
                        Common Inquiries
                    </h2>
                    <p className="text-sm text-gray-600">
                        Select a topic below to compose an email with the appropriate subject line:
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=Learner%20Enrollment%20Inquiry`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-learner-light hover:border-learner-dark hover:text-learner-dark text-sm font-medium transition-all"
                        >
                            <FiCheckCircle className="text-learner-dark" />
                            Enroll a Learner
                        </a>
                        <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=Volunteer%20Application%20Inquiry`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-volunteer-light hover:border-volunteer-dark hover:text-volunteer-dark text-sm font-medium transition-all"
                        >
                            <FiCheckCircle className="text-volunteer-dark" />
                            Volunteer Questions
                        </a>
                        <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=Donation%20or%20Sponsorship%20Inquiry`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm font-medium transition-all"
                        >
                            <FiCheckCircle className="text-gray-700" />
                            Donations & Partnerships
                        </a>
                    </div>
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-2">
                                <h3 className="text-base font-medium text-gray-900">{faq.q}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
