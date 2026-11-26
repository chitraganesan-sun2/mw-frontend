import React from "react";

/**
 * A grey summary chip. By default it is a single truncated line; `wrap` lets a long value (the combined
 * skills list) spill onto further lines so more of it is visible, and rounds the chip as a card instead of a pill.
 */
const CardChips = ({ label, value, wrap = false }: { label: string; value: string; wrap?: boolean }) => {
    if (!value) return null;
    if (wrap) {
        return (
            <div
                className="bg-[#E0E0E0] w-fit max-w-full px-3 py-[3px] text-sm text-gray-light font-medium rounded-2xl break-words"
                title={`${label}: ${value}`}
            >
                {label}: <span className="text-black">{value}</span>
            </div>
        );
    }
    return (
        <div
            className="bg-[#E0E0E0] w-fit max-w-[90%] lg:max-w-[200px] 2xl:max-w-[250px] px-2 py-[3px] text-sm text-gray-light font-medium rounded-full overflow-hidden whitespace-nowrap"
            title={`${label}: ${value}`}
        >
            <span className="truncate block">
                {label}: <span className="text-black">{value}</span>
            </span>
        </div>
    );
};

export default CardChips;
