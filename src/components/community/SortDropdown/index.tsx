import { useState } from "react";
import DropDown from "@/assets/icons/DropDown";
interface SortOption {
    label: string;
    value: string;
}

interface SortDropdownProps {
    selectedSort: string;
    onSort: (value: string) => void;
    isManagePost?: boolean;
}

const ChevronIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const sortOptions: SortOption[] = [
    { label: "Most Recent", value: "recent" },
    { label: "Most Likes", value: "likes" },
    { label: "Most Comments", value: "comments" },
];

const SortDropdown = ({ selectedSort, onSort }: SortDropdownProps) => {
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    const handleSort = (value: string) => {
        onSort(value);
        setShowSortDropdown(false);
    };

    return (
        <div className="md:hidden w-full p-4 relative">
            <div className="flex flex-row items-center justify-center w-full gap-3">
                <p className="text-sm font-medium text-[#4F4F4F]">Sort by:</p>
                <button
                    type="button"
                    aria-expanded={showSortDropdown}
                    aria-haspopup="listbox"
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white gap-4 w-[270px] cursor-pointer hover:border-gray-300 transition-colors appearance-none"
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                    <span className="text-base font-medium text-gray-700">
                        {sortOptions.find((opt) => opt.value === selectedSort)?.label}
                    </span>
                    <DropDown
                        className={`transition-transform duration-200 ${
                            showSortDropdown ? "rotate-180" : ""
                        } w-6 h-6`}
                    />
                </button>
            </div>

            {showSortDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[350px] bg-white border border-gray-200 rounded-lg shadow-lg z-10" role="listbox">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={option.value === selectedSort}
                            className={`w-full text-left p-4 text-base cursor-pointer transition-colors appearance-none
                                ${
                                    option.value === selectedSort
                                        ? "bg-gray-50 text-gray-900 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            onClick={() => handleSort(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortDropdown;
