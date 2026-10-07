"use client";

export type ListTab = "all" | "matches";

interface MatchesTabsProps {
    active: ListTab;
    /** "All Volunteers" / "All Learners". */
    allLabel: string;
    onChange: (tab: ListTab) => void;
}

/** "All … | My Matches" switch at the top of Seek Volunteer (learner) and Learners (volunteer). */
const MatchesTabs: React.FC<MatchesTabsProps> = ({ active, allLabel, onChange }) => {
    const tabs: { key: ListTab; label: string }[] = [
        { key: "all", label: allLabel },
        { key: "matches", label: "My Matches" },
    ];
    return (
        <div role="tablist" aria-label="Browse or see your matches" className="flex gap-2 px-5 pt-5 lg:px-10 lg:pt-7">
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
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
};

export default MatchesTabs;
