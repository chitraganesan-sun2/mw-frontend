import React from "react";
import type { IconType } from "react-icons";

interface SkillsToLearnCardProps {
    title: string;
    skills: string[];
    icon?: IconType;
    onSkillClick?: (skill: string) => void;
}

const SkillsToLearnCard: React.FC<SkillsToLearnCardProps> = ({ title, skills, icon: Icon, onSkillClick }) => {
    return (
        <div className="bg-white lg:bg-[#f4f7fb] shadow-inner rounded-3xl p-6 md:p-8 w-full flex flex-col gap-4">
            <div className="flex items-center gap-3">
                {Icon && <Icon size={22} aria-hidden="true" className="shrink-0 text-[#121212]" />}
                <p className="font-semibold text-[18px] md:text-[24px] font-poppins text-[#121212] leading-normal">{title}</p>
            </div>
            <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                    <button
                        type="button"
                        key={index}
                        onClick={() => onSkillClick?.(skill)}
                        className="py-[10px] px-[16px] border border-[#E0E0E0] bg-[#FFFFFF] rounded-[12px] w-fit text-[14px] font-medium text-[#121212] hover:border-learner-dark hover:bg-learner-light hover:text-learner-dark active:scale-95 transition-all cursor-pointer select-none text-left"
                    >
                        {skill}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SkillsToLearnCard;
