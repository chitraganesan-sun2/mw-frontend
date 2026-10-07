import React from "react";
import Image from "next/image";
import { safeImageSrc } from "@/utils/safeHref";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";

interface ChatHeaderProps {
    name: string;
    location: string;
    image: string;
    onSeeMoreClick?: () => void;
    showBackButton?: boolean;
    onBack?: () => void;
    /** Rendered next to the name (e.g. Schedule Meeting button on mobile) */
    action?: React.ReactNode;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    name,
    location,
    image,
    onSeeMoreClick,
    showBackButton = false,
    onBack,
    action,
}) => {
    return (
        <div className="flex items-center gap-4 p-4 w-full animate-fadeIn">
            {showBackButton && onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-shrink-0 p-1 -ml-1 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors"
                    aria-label="Back to messages"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
            )}
            {/* The whole avatar + name group opens the profile (it looked clickable
                end-to-end, but only the avatar used to be). */}
            <button
                type="button"
                aria-label={`View ${name}'s profile`}
                onClick={onSeeMoreClick}
                disabled={!onSeeMoreClick}
                className="group min-w-0 flex-1 flex items-center gap-4 text-left rounded-lg -m-2 p-2 hover:bg-[#f4f7fb] enabled:cursor-pointer transition-all duration-300 appearance-none border-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
                <span className="relative block md:w-11 md:h-11 w-[46px] h-[46px] rounded-full overflow-hidden transition-transform duration-300 md:group-hover:scale-105 flex-shrink-0">
                    <Image src={safeImageSrc(image) || DummyProfileImg} alt="" fill className="object-cover" />
                </span>
                <span className="min-w-0 flex-1 flex flex-col md:gap-1 gap-[8px]">
                    <span className="block md:text-base text-[20px] font-medium transition-colors duration-300 truncate">{name}</span>
                    <span className="block md:text-sm text-[14px] font-normal text-gray-500 transition-colors duration-300">
                        From <span className="text-black font-medium capitalize">{location}</span>
                    </span>
                </span>
            </button>
            {/* Kept outside the profile button - interactive content can't nest in a button. */}
            {action}
        </div>
    );
};

export default ChatHeader;
