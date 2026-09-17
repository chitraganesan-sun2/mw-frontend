import TagComponent from "@/components/common/Tag";
import { HiSparkles } from "react-icons/hi2";

interface WhyMatchedPanelProps {
    matchedSkills?: string[];
    matchedLanguages?: string[];
    compatibilityScore?: number;
    className?: string;
}

const WhyMatchedPanel = ({
    matchedSkills = [],
    matchedLanguages = [],
    compatibilityScore,
    className = "",
}: WhyMatchedPanelProps) => {
    const hasSharedSkills = matchedSkills.length > 0;
    const hasSharedLanguages = matchedLanguages.length > 0;
    const hasCompatibility = typeof compatibilityScore === "number" && compatibilityScore > 0;

    if (!hasSharedSkills && !hasSharedLanguages && !hasCompatibility) return null;

    return (
        <div className={`px-5 ${className}`}>
            <div className="bg-[#FFF6EC] border border-[#FFE9D4] rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <HiSparkles className="text-primary shrink-0" size={16} />
                    <p className="text-sm font-semibold text-black">Why you matched</p>
                </div>
                {hasSharedSkills && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-light">Shared skills:</span>
                        {matchedSkills.map((skill) => (
                            <TagComponent
                                key={skill}
                                text={skill}
                                className="!bg-white text-xs py-1 font-medium px-2"
                            />
                        ))}
                    </div>
                )}
                {hasSharedLanguages && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-light">Shared language:</span>
                        {matchedLanguages.map((language) => (
                            <TagComponent
                                key={language}
                                text={language}
                                className="!bg-white text-xs py-1 font-medium px-2"
                            />
                        ))}
                    </div>
                )}
                {hasCompatibility && (
                    <p className="text-xs text-gray-light">
                        Compatibility score: {Math.round((compatibilityScore as number) * 100)}%
                    </p>
                )}
            </div>
        </div>
    );
};

export default WhyMatchedPanel;
