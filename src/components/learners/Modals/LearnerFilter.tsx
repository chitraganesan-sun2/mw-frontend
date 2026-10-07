"use client";

import { Input } from "@/components/common/Input";
import SideModal from "@/components/common/Modals/SideModal";
import { useState, useEffect } from "react";
import { z } from "zod";
import { LearnerFilterModalConstants } from "@/constants/modals";
import { useQueryState } from "nuqs";
import InnerWidth from "@/utils/innerWidth";

// Filters only for fields today's onboarding still collects. Areas of Support, Academic
// Challenges, Behavioral Concerns and Parent Goals only matched pre-2026-08 profiles and were
// removed (user decision, 2026-10-07).
const meetingFormSchema = z.object({
    learner_primary_language: z.any().optional(),
    type_of_developmental_disability: z.any().optional(),
    academic_strengths: z.any().optional(),
    techniques_to_calm: z.any().optional(),
    skill_ids: z.any().optional(),
});

type FilterData = z.infer<typeof meetingFormSchema>;

interface LearnerFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    isFilterApplying: boolean;
}

export default function LearnerFilterModal({
    isOpen,
    isFilterApplying,
    onClose,
}: LearnerFilterModalProps) {
    const [learner_primary_language, setLanguages] = useQueryState("learner_primary_language");
    const [type_of_developmental_disability, setDevelopmentalDisability] = useQueryState(
        "type_of_developmental_disability"
    );
    const [academic_strengths, setAcademicStrengths] = useQueryState("academic_strengths");
    const [techniques_to_calm, setTechniquesThatWork] = useQueryState("techniques_to_calm");
    const [skill_ids, setSkillsExpertiseToLearn] = useQueryState("skill_ids");

    const [filterData, setFilterData] = useState<FilterData>({});

    // Update form data when query state changes
    useEffect(() => {
        setFilterData({
            learner_primary_language: learner_primary_language?.split(",") || [],
            // Multi-select like the rest: a plain string here made the picker drop the
            // applied value(s) when the modal was reopened.
            type_of_developmental_disability: type_of_developmental_disability?.split(",") || [],
            academic_strengths: academic_strengths?.split(",") || [],
            techniques_to_calm: techniques_to_calm?.split(",") || [],
            skill_ids: skill_ids?.split(",") || [],
        });
    }, [
        learner_primary_language,
        type_of_developmental_disability,
        academic_strengths,
        techniques_to_calm,
        skill_ids,
    ]);

    const handleChange = (name: keyof FilterData, value: any) => {
        setFilterData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        setLanguages(
            filterData?.learner_primary_language?.length
                ? filterData.learner_primary_language.join(",")
                : null
        );
        setDevelopmentalDisability(
            filterData?.type_of_developmental_disability?.length
                ? filterData.type_of_developmental_disability.join(",")
                : null
        );
        setAcademicStrengths(
            filterData?.academic_strengths?.length ? filterData.academic_strengths.join(",") : null
        );
        setTechniquesThatWork(
            filterData?.techniques_to_calm?.length ? filterData.techniques_to_calm.join(",") : null
        );
        setSkillsExpertiseToLearn(
            filterData?.skill_ids?.length ? filterData.skill_ids.join(",") : null
        );

        onClose();
    };

    const handleClear = () => {
        setFilterData({});
        setLanguages(null);
        setDevelopmentalDisability(null);
        setAcademicStrengths(null);
        setTechniquesThatWork(null);
        setSkillsExpertiseToLearn(null);
        onClose();
    };

    const isMobileScreen = InnerWidth() < 768;

    return (
        <SideModal
            title="Learner Filters"
            onClose={onClose}
            isOpen={isOpen}
            saveButtonText="Apply Filters"
            cancelButtonText="Clear All"
            onSave={handleSave}
            isLoading={isFilterApplying}
            onCancel={handleClear}
            modalWidth={isMobileScreen ? 600 : 400}
        >
            <div className="flex flex-col max-lg:gap-2 px-5 mt-7">
                {LearnerFilterModalConstants.map((field: any) => (
                    <Input
                        key={field.name}
                        {...field}
                        onChange={(value: any) =>
                            handleChange(field.name as keyof FilterData, value)
                        }
                        value={filterData[field.name as keyof FilterData]}
                    />
                ))}
            </div>
        </SideModal>
    );
}
