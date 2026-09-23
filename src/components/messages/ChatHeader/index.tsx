import React from "react";
import Image from "next/image";

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
        <div className="flex items-center gap-4 p-4 hover:bg-[#f4f7fb] cursor-pointer transition-all duration-300 w-full animate-fadeIn">
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
            <button
                type="button"
                aria-label="View profile"
                onClick={onSeeMoreClick}
                className="relative md:w-11 md:h-11 w-[46px] h-[46px] rounded-full overflow-hidden transition-transform duration-300 md:hover:scale-105 flex-shrink-0 appearance-none border-0 bg-transparent p-0"
            >
                <Image src={image} alt="message" fill className="object-cover" />
            </button>
            <div className="min-w-0 flex-1 flex flex-col md:gap-1 gap-[8px]">
                <div className="flex items-center gap-2 justify-between">
                    <p className="md:text-base text-[20px] font-medium transition-colors duration-300 truncate">{name}</p>
                    {action}
                </div>
                <div className="flex items-center gap-4">
                    <p className="md:text-sm text-[14px] font-normal text-gray-500 transition-colors duration-300">
                        From <span className="text-black font-medium capitalize">{location}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
