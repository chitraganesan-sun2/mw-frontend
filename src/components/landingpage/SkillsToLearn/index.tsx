"use client";

import React, { useState } from "react";
import { useQueryState } from "nuqs";
import { FiBookOpen, FiPenTool, FiMusic, FiMonitor, FiCoffee, FiHeart, FiUsers, FiGrid, FiChevronDown } from "react-icons/fi";
import ContainerWrapper from "../components/ContainerWrapper";
import ContainerHeader from "../components/ContainerHeader";
import SkillsToLearnCard from "@/components/common/SkillsToLearnCard";

const INITIAL_VISIBLE = 4;

const SkillsToLearn = () => {
    const [showAll, setShowAll] = useState(false);
    const [, setParamMode] = useQueryState("signup_as");
    const [, setSelectedSkill] = useQueryState("skill");
    
    // When a skill chip is clicked, open learner signup AND pre-select that skill
    const handleSkillClick = (skill: string) => {
        setSelectedSkill(skill);
        setParamMode("learner");
    };
    
    const skillsData = [
        {
            title: "Academic Enrichment",
            icon: FiBookOpen,
            skills: [
                "Reading",
                "Writing",
                "Storytelling",
                "Math",
                "English",
                "Physics",
                "Chemistry",
                "Biology",
                "History",
            ],
        },
        {
            title: "Creative Arts",
            icon: FiPenTool,
            skills: [
                "Drawing",
                "Painting",
                "Sculpting",
                "Origami",
                "Sewing",
                "Beading",
                "Drama",
                "Dance",
                "Photography",
                "Scrapbooking",
                "Makeup",
                "Puppet Shows",
            ],
        },
        {
            title: "Music",
            icon: FiMusic,
            skills: [
                "Vocal Music",
                "Guitar",
                "Veena",
                "Keyboard",
                "Violin",
                "Ukulele",
                "Songs / Nursery Rhymes",
                "Drums",
            ],
        },
        {
            title: "Technology and Digital Skills",
            icon: FiMonitor,
            skills: [
                "Computer Science",
                "Basic Coding",
                "Animations",
                "Scratch Programming",
                "Microsoft Excel",
                "Microsoft Word",
                "Microsoft PowerPoint",
            ],
        },
        {
            title: "Life & Functional Skills",
            icon: FiCoffee,
            skills: ["Cooking", "Baking"],
        },
        {
            title: "Wellness & Therapy",
            icon: FiHeart,
            skills: ["Yoga", "Meditation"],
        },
        {
            title: "Cognitive & Social Development",
            icon: FiUsers,
            skills: ["Social Skills", "Communication Skills"],
        },
        {
            title: "STEM & Hands-On Exploration",
            icon: FiGrid,
            skills: [
                "Lego",
                "Abacus",
                "Chess",
                "Board Games",
                "Rubik's Cube",
                "Science Experiments",
            ],
        },
    ];

    return (
        <ContainerWrapper>
            <div className="flex flex-col gap-10 w-full">
                <ContainerHeader
                    title="Skills to Learn"
                    subTitle="Discover Your Potential Through Learning"
                    description="Click any skill below to find a volunteer tutor specializing in that subject. All sessions are 100% free."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(showAll ? skillsData : skillsData.slice(0, INITIAL_VISIBLE)).map((skillCategory) => (
                        <SkillsToLearnCard
                            key={skillCategory.title}
                            title={skillCategory.title}
                            skills={skillCategory.skills}
                            icon={skillCategory.icon}
                            onSkillClick={handleSkillClick}
                        />
                    ))}
                </div>
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => setShowAll((v) => !v)}
                        aria-expanded={showAll}
                        className="inline-flex items-center gap-2 rounded-full border border-[#E0E0E0] bg-white px-6 py-2.5 text-sm font-medium text-[#121212] transition-colors hover:bg-[#f4f7fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212] cursor-pointer"
                    >
                        {showAll ? "Show fewer" : `View all ${skillsData.length} categories`}
                        <FiChevronDown aria-hidden="true" className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
                    </button>
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default SkillsToLearn;
