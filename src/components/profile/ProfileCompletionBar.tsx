/**
 * Profile completion progress bar.
 * Shows how complete a user's profile is and encourages them to fill in missing fields.
 */

interface ProfileCompletionBarProps {
    /** Completion percentage (0-100) */
    percentage: number;
    /** Optional: list of missing fields to show as hints */
    missingFields?: string[];
}

const ProfileCompletionBar = ({ percentage, missingFields = [] }: ProfileCompletionBarProps) => {
    const getColor = () => {
        if (percentage >= 80) return "from-green-400 to-green-600";
        if (percentage >= 50) return "from-yellow-400 to-orange-500";
        return "from-red-400 to-red-500";
    };

    const getLabel = () => {
        if (percentage >= 100) return "Profile complete!";
        if (percentage >= 80) return "Almost there!";
        if (percentage >= 50) return "Good progress";
        return "Complete your profile";
    };

    return (
        <div className="px-5 py-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600">{getLabel()}</span>
                    <span className="text-xs font-semibold text-gray-900">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getColor()} transition-all duration-700 ease-out`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
                {missingFields.length > 0 && percentage < 100 && (
                    <p className="text-[10px] text-gray-400 mt-1.5">
                        Missing: {missingFields.slice(0, 3).join(", ")}
                        {missingFields.length > 3 && ` +${missingFields.length - 3} more`}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProfileCompletionBar;

/**
 * Calculate profile completion for a volunteer.
 */
export function calculateVolunteerCompletion(data: any): { percentage: number; missingFields: string[] } {
    if (!data) return { percentage: 0, missingFields: [] };

    const fields = [
        { key: "volunteer_first_name", label: "First Name" },
        { key: "volunteer_last_name", label: "Last Name" },
        { key: "volunteer_gender", label: "Gender" },
        { key: "volunteer_birth_date", label: "Date of Birth" },
        { key: "volunteer_description", label: "Description" },
        { key: "volunteer_education", label: "Education" },
        { key: "volunteer_experience", label: "Experience" },
        { key: "volunteer_languages", label: "Languages" },
        { key: "volunteer_skills", label: "Skills" },
        { key: "profile_picture", label: "Profile Photo" },
        { key: "profile_video", label: "Profile Video" },
        { key: "volunteer_higher_education", label: "Higher Education" },
    ];

    const missing: string[] = [];
    let completed = 0;

    for (const field of fields) {
        const value = data[field.key];
        const hasValue = Array.isArray(value) ? value.length > 0 : !!value;
        if (hasValue) {
            completed++;
        } else {
            missing.push(field.label);
        }
    }

    return {
        percentage: Math.round((completed / fields.length) * 100),
        missingFields: missing,
    };
}

/**
 * Calculate profile completion for a learner.
 */
export function calculateLearnerCompletion(data: any): { percentage: number; missingFields: string[] } {
    if (!data) return { percentage: 0, missingFields: [] };

    const personalInfo = data?.learner_personal_info;
    const fields = [
        { value: personalInfo?.learner_first_name, label: "First Name" },
        { value: personalInfo?.learner_last_name, label: "Last Name" },
        { value: personalInfo?.learner_gender, label: "Gender" },
        { value: personalInfo?.learner_date_of_birth, label: "Date of Birth" },
        { value: personalInfo?.learner_primary_language, label: "Primary Language" },
        { value: personalInfo?.learner_contact_details?.country, label: "Country" },
        { value: personalInfo?.learner_contact_details?.timezone, label: "Timezone" },
        { value: data?.profile_picture, label: "Profile Photo" },
        { value: data?.parent_info?.parent_first_name, label: "Guardian Info" },
        { value: data?.learner_goals?.skills_to_learn, label: "Learning Goals" },
        { value: data?.learner_special_needs, label: "Special Needs Info" },
    ];

    const missing: string[] = [];
    let completed = 0;

    for (const field of fields) {
        let hasValue = false;
        if (Array.isArray(field.value)) {
            hasValue = field.value.length > 0;
        } else if (typeof field.value === "string") {
            hasValue = field.value.length > 0;
        } else if (field.value && typeof field.value === "object") {
            hasValue = Object.keys(field.value).length > 0;
        } else {
            hasValue = !!field.value;
        }
        if (hasValue) {
            completed++;
        } else {
            missing.push(field.label);
        }
    }

    return {
        percentage: Math.round((completed / fields.length) * 100),
        missingFields: missing,
    };
}
