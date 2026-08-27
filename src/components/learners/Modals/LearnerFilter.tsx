"use client";

import { Input } from "@/components/common/Input";
import SideModal from "@/components/common/Modals/SideModal";
import { useState, useEffect } from "react";
import { z } from "zod";
import { LearnerFilterModalConstants } from "@/constants/modals";
import { useQueryState } from "nuqs";
import InnerWidth from "@/utils/innerWidth";

const meetingFormSchema = z.object({
    learner_primary_language: z.any().optional(),
    type_of_developmental_disability: z.any().optional(),
    areas_of_support_needed: z.any().optional(),
    academic_strengths: z.any().optional(),
    academic_challenges: z.any().optional(),
    behavioral_concerns: z.any().optional(),
    techniques_to_calm: z.any().optional(),
    skill_ids: z.any().optional(),
    expected_goals: z.any().optional(),
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
    const [areas_of_support_needed, setAreasOfSupport] = useQueryState("areas_of_support_needed");
    const [academic_strengths, setAcademicStrengths] = useQueryState("academic_strengths");
    const [academic_challenges, setAcademicChallenges] = useQueryState("academic_challenges");
    const [behavioral_concerns, setBehavioralConcerns] = useQueryState("behavioral_concerns");
    const [techniques_to_calm, setTechniquesThatWork] = useQueryState("techniques_to_calm");
    const [skill_ids, setSkillsExpertiseToLearn] = useQueryState("skill_ids");
    const [expected_goals, setParentGoals] = useQueryState("expected_goals");

    const [filterData, setFilterData] = useState<FilterData>({});
    console.log(filterData, "filterData");

    // Update form data when query state changes
    useEffect(() => {
        setFilterData({
            learner_primary_language: learner_primary_language?.split(",") || [],
            type_of_developmental_disability: type_of_developmental_disability || null,
            areas_of_support_needed: areas_of_support_needed?.split(",") || [],
            academic_strengths: academic_strengths?.split(",") || [],
            academic_challenges: academic_challenges?.split(",") || [],
            behavioral_concerns: behavioral_concerns?.split(",") || [],
            techniques_to_calm: techniques_to_calm?.split(",") || [],
            skill_ids: skill_ids?.split(",") || [],
            expected_goals: expected_goals?.split(",") || [],
        });
    }, [
        learner_primary_language,
        type_of_developmental_disability,
        areas_of_support_needed,
        academic_strengths,
        academic_challenges,
        behavioral_concerns,
        techniques_to_calm,
        skill_ids,
        expected_goals,
    ]);

    const handleChange = (name: keyof FilterData, value: any) => {
        console.log(name, value, "name, value");
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
        setDevelopmentalDisability(filterData?.type_of_developmental_disability || null);
        setAreasOfSupport(
            filterData?.areas_of_support_needed?.length
                ? filterData.areas_of_support_needed.join(",")
                : null
        );
        setAcademicStrengths(
            filterData?.academic_strengths?.length ? filterData.academic_strengths.join(",") : null
        );
        setAcademicChallenges(
            filterData?.academic_challenges?.length
                ? filterData.academic_challenges.join(",")
                : null
        );
        setBehavioralConcerns(
            filterData?.behavioral_concerns?.length
                ? filterData.behavioral_concerns.join(",")
                : null
        );
        setTechniquesThatWork(
            filterData?.techniques_to_calm?.length ? filterData.techniques_to_calm.join(",") : null
        );
        setSkillsExpertiseToLearn(
            filterData?.skill_ids?.length ? filterData.skill_ids.join(",") : null
        );
        setParentGoals(
            filterData?.expected_goals?.length ? filterData.expected_goals.join(",") : null
        );

        onClose();
    };

    const handleClear = () => {
        setFilterData({});
        setLanguages(null);
        setDevelopmentalDisability(null);
        setAreasOfSupport(null);
        setAcademicStrengths(null);
        setAcademicChallenges(null);
        setBehavioralConcerns(null);
        setTechniquesThatWork(null);
        setSkillsExpertiseToLearn(null);
        setParentGoals(null);
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
