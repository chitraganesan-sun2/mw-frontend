import React from "react";

const CardChips = ({ label, value }: { label: string; value: string }) => {
    if (!value) return null;
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
