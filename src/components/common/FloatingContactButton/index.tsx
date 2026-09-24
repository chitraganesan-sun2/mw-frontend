"use client";

import { useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import ContactUsModal from "@/components/landingpage/Modals/ContactUsModal";

/**
 * Persistent contact entry point for the public site. Reuses the existing
 * ContactUsModal (already wired to POST /contact) rather than duplicating
 * the contact flow - this is the only new trigger for it besides the
 * Footer's text link.
 */
const FloatingContactButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Contact us"
                className="no-print focus-ring fixed bottom-4 right-4 md:right-6 z-40 w-12 h-12 rounded-full bg-black text-white shadow-lg flex-center hover:bg-gray-800 active:scale-90 transition-all duration-200"
            >
                <IoChatbubbleEllipsesOutline size={22} aria-hidden="true" />
            </button>
            <ContactUsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default FloatingContactButton;
