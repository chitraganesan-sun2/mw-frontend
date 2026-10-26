"use client";

import PageIntro from "@/components/common/PageIntro";

export type ListTab = "all" | "matches";

interface MatchesTabsProps {
    active: ListTab;
    /** "All Volunteers" / "All Learners". */
    allLabel: string;
    onChange: (tab: ListTab) => void;
    /** One line under the tabs saying what this page is for. */
    description?: string;
}

/** "All … | My Matches" switch at the top of Seek Volunteer (learner) and Learners (volunteer). */
const MatchesTabs: React.FC<MatchesTabsProps> = ({ active, allLabel, onChange, description }) => {
    const tabs: { key: ListTab; label: string }[] = [
        { key: "all", label: allLabel },
        { key: "matches", label: "My Matches" },
    ];
    return (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 pt-5 lg:px-10 lg:pt-7">
            <div role="tablist" aria-label="Browse or see your matches" className="flex gap-2">
            {tabs.map((t) => {
                const selected = t.key === active;
                return (
                    <button
                        key={t.key}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(t.key)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                            selected
                                ? "bg-action text-white border-action"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                    >
                        {t.label}
                    </button>
                );
            })}
            </div>
            {description && <PageIntro className="basis-full">{description}</PageIntro>}
        </div>
    );
};

export default MatchesTabs;
