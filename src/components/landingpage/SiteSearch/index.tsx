"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IoSearchOutline } from "react-icons/io5";
import CenterModal from "@/components/common/Modals/CenterModal";
import { SITE_SEARCH_INDEX, SiteSearchEntry } from "@/constants/siteSearchIndex";

type SiteSearchProps = {
    isOpen: boolean;
    onClose: () => void;
};

const search = (query: string): SiteSearchEntry[] => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return SITE_SEARCH_INDEX;
    return SITE_SEARCH_INDEX.filter((entry) => {
        const haystack = [entry.title, entry.description, ...(entry.keywords || [])]
            .join(" ")
            .toLowerCase();
        return haystack.includes(trimmed);
    });
};

const SiteSearch = ({ isOpen, onClose }: SiteSearchProps) => {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const results = useMemo(() => search(query), [query]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        if (isOpen) {
            setQuery("");
            // Wait for the modal's open transition to mount the input.
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const goTo = (entry: SiteSearchEntry) => {
        onClose();
        if (entry.href.startsWith("mailto:") || entry.href.startsWith("http")) {
            window.location.href = entry.href;
        } else {
            router.push(entry.href);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const entry = results[activeIndex];
            if (entry) goTo(entry);
        }
    };

    return (
        <CenterModal
            isOpen={isOpen}
            onClose={onClose}
            width={560}
            hideFooter
            headerComponent={
                <div className="flex items-center gap-2 w-full">
                    <IoSearchOutline className="text-xl text-gray-500 flex-shrink-0" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        role="combobox"
                        aria-expanded={results.length > 0}
                        aria-controls="site-search-results"
                        aria-activedescendant={
                            results[activeIndex] ? `site-search-result-${activeIndex}` : undefined
                        }
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search MelodyWings..."
                        aria-label="Search MelodyWings"
                        className="w-full text-base outline-none placeholder:text-gray-400"
                    />
                </div>
            }
            headerClassName="!px-4 !py-3 !justify-start"
            bodyClassName="!px-2 !py-2"
        >
            {results.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                    No results for &ldquo;{query}&rdquo;. Try Donate, Join Us, or About Us.
                </div>
            ) : (
                <ul id="site-search-results" role="listbox" aria-label="Search results" className="flex flex-col">
                    {results.map((entry, index) => (
                        <li key={entry.href} role="presentation">
                            <button
                                id={`site-search-result-${index}`}
                                role="option"
                                aria-selected={index === activeIndex}
                                type="button"
                                onClick={() => goTo(entry)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`focus-ring w-full text-left px-3 py-2.5 rounded-xl transition-colors duration-150 ${
                                    index === activeIndex ? "bg-background-input" : "hover:bg-background-input"
                                }`}
                            >
                                <p className="text-sm font-medium">{entry.title}</p>
                                <p className="text-xs text-gray-500">{entry.description}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </CenterModal>
    );
};

export default SiteSearch;
