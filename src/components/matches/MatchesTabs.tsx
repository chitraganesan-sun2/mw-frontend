"use client";

import { HiOutlinePlus } from "react-icons/hi2";

export type ListTab = "all" | "matches";

interface MatchesTabsProps {
    active: ListTab;
    /** "All Volunteers" / "All Learners". */
    allLabel: string;
    onChange: (tab: ListTab) => void;
    /** Optional action at the far right of the row (e.g. "Add New Session"). */
    action?: { label: string; onClick: () => void };
}

/** "All … | My Matches" switch at the top of Seek Volunteer (learner) and Learners (volunteer). */
const MatchesTabs: React.FC<MatchesTabsProps> = ({ active, allLabel, onChange, action }) => {
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
            {action && (
                // One-on-one session with a specific person - the same black "Add New Session"
                // action as the Schedule page.
                <button
                    type="button"
                    onClick={action.onClick}
                    className="inline-flex items-center gap-1.5 rounded-full border border-action bg-action px-4 py-1.5 text-sm font-medium text-white hover:bg-action-hover transition-colors"
                >
                    <HiOutlinePlus size={16} aria-hidden="true" />
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default MatchesTabs;
