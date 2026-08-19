import { z, ZodError, ZodIssue } from "zod";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ADULT_VOLUNTEER_AGE } from "@/constants/volunteer";

dayjs.extend(customParseFormat);

const contactNumberValidation = z
    .object({
        number: z
            .string({ required_error: "Phone Number is required" })
            .refine((num) => num.length === 10, {
                message: "Phone number must be exactly 10 digits",
            }),
        country_code: z.string({ required_error: "Country Code is required" }),
    })
    .or(z.undefined())
    .refine((value) => value?.country_code, {
        message: "Country Code is required",
    })
    .refine((value) => value?.number, {
        message: "Phone Number is required",
    })
    .refine((value) => value !== undefined && value?.number?.length === 10, {
        message: "Phone number must be exactly 10 digits",
    });

// Volunteer Schema & Default Data

export const volunteerFormSchema = z
    .object({
        volunteer_first_name: z
            .string({ required_error: "First Name is required" })
            .min(1, { message: "First Name cannot be empty" }),
        volunteer_last_name: z
            .string({ required_error: "Last Name is required" })
            .min(1, { message: "Last Name cannot be empty" }),
        volunteer_birth_date: z.string({ required_error: "Please select your birthday" }),
        consented_from_parent: z.boolean().or(z.null()).optional(),
        volunteer_parent_name: z.string().or(z.null()).optional(),
        volunteer_parent_email: z.string().or(z.null()).optional(),
        volunteer_gender: z.string({ required_error: "Please select your gender" }),
        volunteer_education: z
            .string({ required_error: "Please provide your education details" })
            .min(1, { message: "Education details cannot be empty" }),
        volunteer_higher_education: z.string({
            required_error: "Higher education details are required",
        }),
        volunteer_languages: z
            .array(z.any(), { required_error: "Please specify the languages you know" })
            .nonempty("Please add at least one language"),
        volunteer_experience: z
            .string({ required_error: "Experience details are required" })
            .min(1, { message: "Experience details cannot be empty" }),
        volunteer_work_experience: z
            .string({ required_error: "Work experience details are required" })
            .min(1, { message: "Work experience details cannot be empty" }),
        volunteer_skills: z
            .array(
                z.object({
                    skill_name: z.string({ required_error: "Skill name is required" }),
                    skill_id: z.string({ required_error: "Skill ID is required" }),
                }),
                { required_error: "Please add at least one skill" }
            )
            .nonempty("Please add at least one skill"),
        volunteer_description: z
            .string({ required_error: "Description is required" })
            .min(1, { message: "Description cannot be empty" }),

        // Contact Details validations
        volunteer_contact_details: z.object({
            email: z
                .string({ required_error: "Email is required" })
                .email("Please enter a valid email address"),
            contact_number: contactNumberValidation,
            zip_code: z
                .string({ required_error: "Zip code is required" })
                .min(1, { message: "Zip code cannot be empty" }),
            country: z
                .string({ required_error: "Country is required" })
                .min(1, { message: "Country cannot be empty" }),
            timezone: z
                .string({ required_error: "Time Zone is required" })
                .min(1, { message: "Time Zone cannot be empty" }),
            utc_offset: z.string().optional(),
        }),

        // Legal and Safety Info validations
        legal_and_safety_info: z.object({
            criminal_background_check_details: z
                .object({
                    convicted_of_a_felony: z.boolean({
                        required_error: "Please specify if you were convicted of a felony",
                    }),
                    involved_in_criminal_activity: z.boolean({
                        required_error: "Please specify if you were involved in criminal activity",
                    }),
                    convicted_of_a_crime: z.boolean({
                        required_error: "Please specify if you were convicted of a crime",
                    }),
                    description: z.string().or(z.null()).optional(),
                })
                .refine(
                    (fields) => {
                        const {
                            convicted_of_a_crime,
                            involved_in_criminal_activity,
                            convicted_of_a_felony,
                            description,
                        } = fields;
                        return (
                            !(
                                convicted_of_a_crime ||
                                involved_in_criminal_activity ||
                                convicted_of_a_felony
                            ) ||
                            (description && description.trim().length > 0)
                        );
                    },
                    {
                        message:
                            'Description is required if any criminal conviction or activity is marked as "yes".',
                        path: ["description"],
                    }
                ),
            sex_offender_check_details: z
                .object({
                    checked_for_sex_offender: z.boolean({
                        required_error: "Please specify if you are on any sex offender registry.",
                    }),
                    description: z.string().or(z.null()).optional(),
                })
                .refine(
                    (fields) => {
                        const { checked_for_sex_offender, description } = fields;
                        return (
                            !checked_for_sex_offender ||
                            (description && description.trim().length > 0)
                        );
                    },
                    {
                        message:
                            'Description is required if sex offender registry is marked as "yes".',
                        path: ["description"],
                    }
                ),
            disciplinary_check_details: z
                .object({
                    terminated_from_volunteer_position: z.boolean({
                        required_error: "Please specify if you were terminated from a position",
                    }),
                    involved_in_disputes: z.boolean({
                        required_error: "Please specify if you were involved in disputes",
                    }),
                    dismissed_from_institution: z.boolean({
                        required_error: "Please specify if you were dismissed from an institution",
                    }),
                    description: z.string().or(z.null()).optional(),
                })
                .refine(
                    (fields) => {
                        const {
                            terminated_from_volunteer_position,
                            involved_in_disputes,
                            dismissed_from_institution,
                            description,
                        } = fields;
                        return (
                            !(
                                terminated_from_volunteer_position ||
                                involved_in_disputes ||
                                dismissed_from_institution
                            ) ||
                            (description && description.trim().length > 0)
                        );
                    },
                    {
                        message:
                            'Description is required if terminated, involved in disputes, or dismissed is marked as "yes".',
                        path: ["description"],
                    }
                ),
            health_and_safety_check_details: z
                .object({
                    having_health_issues: z.boolean({
                        required_error: "Please specify if you have health issues",
                    }),
                    description: z.string().or(z.null()).optional(),
                })
                .refine(
                    (fields) => {
                        const { having_health_issues, description } = fields;
                        return (
                            !having_health_issues || (description && description.trim().length > 0)
                        );
                    },
                    {
                        message:
                            'Description is required if having health issues is marked as "yes".',
                        path: ["description"],
                    }
                ),
            other_consents_details: z
                .object({
                    consent_to_background_checks: z.boolean({
                        required_error: "Please confirm your consent to background checks",
                    }),
                    agree_to_follow_organization_policies: z.boolean({
                        required_error: "Please confirm that you agree to follow policies",
                    }),
                    agree_to_understand_termination_of_volunteer_agreement: z.boolean({
                        required_error: "Please confirm that you understand the agreement",
                    }),
                    description: z.string().or(z.null()).optional(),
                })
                .refine(
                    (fields) => {
                        const {
                            consent_to_background_checks,
                            agree_to_follow_organization_policies,
                            agree_to_understand_termination_of_volunteer_agreement,
                            description,
                        } = fields;
                        return (
                            (consent_to_background_checks &&
                                agree_to_follow_organization_policies &&
                                agree_to_understand_termination_of_volunteer_agreement) ||
                            (description && description.trim().length > 0)
                        );
                    },
                    {
                        message:
                            'Description is required if any consent agreement is marked as "no".',
                        path: ["description"],
                    }
                ),
            volunteer_experience_details: z
                .object({
                    invloved_in_complaints: z.boolean({
                        required_error: "Please specify if you were involved in complaints",
                    }),
                    description: z.string().or(z.null()).optional(),
                })
                .refine(
                    (fields) => {
                        const { invloved_in_complaints, description } = fields;
                        return (
                            !invloved_in_complaints ||
                            (description && description.trim().length > 0)
                        );
                    },
                    {
                        message:
                            'Description is required if involved in complaints is marked as "yes".',
                        path: ["description"],
                    }
                ),
        }),

        // Consent and Permissions
        consent_and_permissions: z.object({
            photo_or_video_consent: z.boolean({
                required_error: "Photo or video consent is required",
            }),
        }),

        // Profile Picture
        profile_picture: z
            .object({
                image_url: z.string({ required_error: "Profile picture URL is required" }).min(1, {
                    message: "Profile picture cannot be empty",
                }),
                image_id: z.string({ required_error: "Profile picture ID is required" }).min(1, {
                    message: "Profile picture cannot be empty",
                }),
            })
            .required(),

        // Profile Video
        profile_video: z
            .object({
                video_url: z.string({ required_error: "Profile video URL is required" }).min(1, {
                    message: "Profile video cannot be empty",
                }),
                video_id: z.string({ required_error: "Profile video ID is required" }).min(1, {
                    message: "Profile video cannot be empty",
                }),
            })
            .or(z.null())
            .optional(),

        terms_and_conditions_accepted: z.boolean({
            required_error: "Acceptance of terms and conditions is required",
        }),
        privacy_policy_accepted: z.boolean({
            required_error: "Acceptance of privacy policy is required",
        }),
        cookie_consent_accepted: z.boolean({
            required_error: "Acceptance of cookie consent is required",
        }),
    })
    .superRefine((data, ctx) => {
        if (!data?.privacy_policy_accepted) {
            ctx.addIssue({
                code: "custom",
                message: "Acceptance of privacy policy is required",
                path: ["privacy_policy_accepted"],
            });
        }
        if (!data?.terms_and_conditions_accepted) {
            ctx.addIssue({
                code: "custom",
                message: "Acceptance of terms and conditions is required",
                path: ["terms_and_conditions_accepted"],
            });
        }
        return true;
    });

export function validateVolunteerParentDetails(data: any) {
    const errors: { [key: string]: string } = {};
    let isSuccess = true;

    const age = dayjs().diff(dayjs(data.volunteer_birth_date, "DD-MM-YYYY"), "years");

    if (age < ADULT_VOLUNTEER_AGE) {
        const requiredFields = {
            consented_from_parent: `Parent consent is required for volunteers under ${ADULT_VOLUNTEER_AGE}`,
            volunteer_parent_name: `Parent name is required for volunteers under ${ADULT_VOLUNTEER_AGE}`,
            volunteer_parent_email: `Parent email is required for volunteers under ${ADULT_VOLUNTEER_AGE}`,
        };

        Object.entries(requiredFields).forEach(([key, errorMessage]) => {
            const value = data[key];
            if (!value || (typeof value === "string" && value.trim().length === 0)) {
                isSuccess = false;
                errors[key] = errorMessage;
            }
        });
    }

    return { success: isSuccess, errors };
}

export type VolunteerFormData = z.infer<typeof volunteerFormSchema>;
export const defaultVolunteerData: Volunteer = {
    volunteer_first_name: "Walter",
    volunteer_last_name: "White",
    volunteer_birth_date: "1970-03-15",
    volunteer_parent_email: "walterwhite@gmail.com",
    volunteer_gender: "male",
    volunteer_higher_education: "masters",
    volunteer_education: "MSc Chemistry",
    volunteer_experience: "20 years",
    volunteer_description: "I'm a Chemist.",
    volunteer_languages: [
        {
            language_name: "Tamil",
            language_id: "a695792f-0ecd-4fff-bb46-f0feaf782c2b",
        },
        {
            language_name: "English (United States)",
            language_id: "a191a4a2-7007-42c6-a8ec-adea8a1fa8ac",
        },
    ],
    consented_from_parent: true,
    volunteer_skills: [
        {
            skill_name: "Basic rhythm",
            skill_id: "3eb6efaf-fa76-4765-99c5-e160a303aa34",
        },
    ],
    volunteer_contact_details: {
        // email: "",
        contact_number: {
            number: "9876543210",
            country_code: "+91",
        },
        zip_code: "638451",
        country: "india",
        timezone: "asia/kolkata",
        utc_offset: "+05:30",
    },
    legal_and_safety_info: {
        criminal_background_check_details: {
            convicted_of_a_felony: false,
            involved_in_criminal_activity: false,
            convicted_of_a_crime: false,
            description: "",
        },
        sex_offender_check_details: {
            checked_for_sex_offender: false,
            description: "",
        },
        disciplinary_check_details: {
            terminated_from_volunteer_position: false,
            involved_in_disputes: false,
            dismissed_from_institution: false,
            description: "",
        },
        health_and_safety_check_details: {
            having_health_issues: false,
            description: "",
        },
        other_consents_details: {
            consent_to_background_checks: false,
            agree_to_follow_organization_policies: false,
            agree_to_understand_termination_of_volunteer_agreement: false,
            description: "",
        },
        volunteer_experience_details: {
            previously_volunteered: false,
            invloved_in_complaints: false,
            description: "",
        },
    },
    volunteer_subjects: [
        {
            subject_name: "Chemistry",
            subject_id: "5b363d32-1aa9-45ba-86ce-598db4739330",
        },
        {
            subject_name: "Physics",
            subject_id: "4a4cbf72-edd0-4099-aa7f-2e45ea81889d",
        },
    ],
    consent_and_permissions: {
        photo_or_video_consent: true,
    },
};

// Learner Schema & Default Data

type learnerParentSchemaType = {
    parent_first_name: string;
    parent_last_name: string;
    parent_email: string;
    parent_contact_number: number | string | any;
    parent_address: string;
    relationship_to_learner: string;
};

const learnerParentSchema = z.object({
    parent_first_name: z.string({ required_error: "Parent's First Name is required" }).or(z.null()),
    parent_last_name: z.string({ required_error: "Parent's Last Name is required" }).or(z.null()),
    parent_email: z.string({ required_error: "Parent's Email is required" }).or(z.null()),
    parent_contact_number: z.any().optional().or(z.null()),
    parent_address: z.string({ required_error: "Parent's Address is required" }).or(z.null()),
    relationship_to_learner: z
        .string({
            required_error: "Relationship to Learner is required",
        })
        .or(z.null()),
});

export const learnerFormSchema = z
    .object({
        // Learner personal info - Required section
        learner_personal_info: z.object({
            learner_first_name: z
                .string({ required_error: "Learner's First Name is required" })
                .min(1, { message: "Learner's First Name cannot be empty" }),
            learner_last_name: z
                .string({ required_error: "Learner's Last Name is required" })
                .min(1, { message: "Learner's Last Name cannot be empty" }),
            learner_date_of_birth: z.string({
                required_error: "Learner's Date of Birth is required",
            }),
            learner_gender: z.string({ required_error: "Learner's Gender is required" }),
            learner_preferred_pronoun: z.string({
                required_error: "Learner's Preferred Pronoun is required",
            }),
            learner_primary_language: z.string({
                required_error: "Learner's Primary Language is required",
            }),
            learner_contact_details: z.object({
                email: z.string().optional().or(z.null()),
                contact_number: contactNumberValidation,
                zip_code: z
                    .string({ required_error: "Zip code is required" })
                    .min(1, { message: "Zip code cannot be empty" }),
                country: z
                    .string({ required_error: "Country is required" })
                    .min(1, { message: "Country cannot be empty" }),
                timezone: z
                    .string({ required_error: "Time Zone is required" })
                    .min(1, { message: "Time Zone cannot be empty" }),
                utc_offset: z.string().optional(),
            }),
        }),

        // Parent info - Required section
        parent_info: learnerParentSchema.partial(),

        // Learner special needs - Required
        learner_special_needs: z.object({
            type_of_developmental_disability: z.string({
                required_error: "Developmental Disability is required",
            }),
            level_of_support_needed: z.string({
                required_error: "Level of Support Needed is required",
            }),
            assistive_device_used: z.string({
                required_error: "Assistive Device Used is required",
            }),
            communication_style: z.string({ required_error: "Communication Style is required" }),
            description: z
                .string({ required_error: "Description of Needs is required" })
                .min(1, { message: "Description of Needs is required" }),
            areas_of_support_needed: z.array(z.string()).optional(),
            behavioral_concerns: z.string().optional(),
            behavior_support_strategies: z.array(z.string()).optional(),
        }),

        // Education - Required
        education: z.object({
            current_school: z
                .string({ required_error: "Current School is required" })
                .min(1, { message: "Current School is required" }),
            iep_plan_key: z.string().optional(),
            program_iep_504_plan: z.string().optional(),
            grade_or_education_level: z
                .string({ required_error: "Grade or Education Level is required" })
                .min(1, { message: "Grade or Education Level is required" }),
            cultural_religious_considerations: z.string().optional(),
            extracurricular_activities: z.string().optional(),
            favorite_free_time_activities: z
                .string({ required_error: "Favorite Free-Time Activities is required" })
                .min(1, { message: "Favorite Free-Time Activities is required" }),
            academic_strengths: z.array(z.string()).optional(),
            academic_challenges: z.array(z.string()).optional(),
        }),

        // Social skills - no longer collected by this form (moved into
        // learner_special_needs/education), kept optional for backward compatibility
        social_skills: z
            .object({
                social_interaction_styles: z.array(z.string()).optional(),
                behavioral_concerns: z.array(z.string()).optional(),
                techniques_to_calm: z.array(z.string()).optional(),
            })
            .optional(),

        // Current interests - no longer collected by this form (moved into education),
        // kept optional for backward compatibility
        current_interests: z
            .object({
                extra_curricular_activities: z.string().optional(),
                favorite_activities: z.string().optional(),
            })
            .optional(),

        // Learner goals - Required
        learner_goals: z.object({
            expected_goals: z
                .array(z.string(), { required_error: "Expected Goals are required" })
                .nonempty("Expected Goals are required"),
            skills_to_learn: z
                .array(
                    z.object({
                        skill_name: z.string({ required_error: "Skill name is required" }),
                        skill_id: z.string({ required_error: "Skill ID is required" }),
                    })
                )
                .optional(),
            academic_skills_to_learn: z
                .array(
                    z.object({
                        skill_name: z.string({ required_error: "Skill name is required" }),
                        skill_id: z.string({ required_error: "Skill ID is required" }),
                    })
                )
                .optional(),
            arts_life_skills_to_learn: z
                .array(
                    z.object({
                        skill_name: z.string({ required_error: "Skill name is required" }),
                        skill_id: z.string({ required_error: "Skill ID is required" }),
                    }),
                    { required_error: "Please add at least one arts & life skill" }
                )
                .nonempty("Please add at least one arts & life skill"),
            academic_goals_description: z.string().optional(),
            arts_life_goals_description: z
                .string({ required_error: "Arts, Life Skills & Goals Description is required" })
                .min(1, { message: "Arts, Life Skills & Goals Description is required" }),
            other_comments_or_notes: z.string().optional(),
            preferred_volunteer_qualities: z
                .string({ required_error: "Preferred Volunteer Qualities are required" })
                .min(1, { message: "Preferred Volunteer Qualities are required" }),
            skill_level: z.string({ required_error: "Skill Level is required" }),
        }),

        // Additional info - no longer collected by this form (moved into
        // education/learner_goals), kept optional for backward compatibility
        additional_info: z
            .object({
                cultural_consideration: z.string().optional(),
                other_concerns_or_requests: z.string().optional(),
                what_motivates_to_learn: z.string().optional(),
            })
            .optional(),

        // Consent and permissions - Required
        consent_and_permissions: z.object({
            photo_or_video_consent: z.boolean({
                required_error: "Photo or Video Consent is required",
            }),
        }),
        profile_picture: z
            .object({
                image_url: z.string({ required_error: "Profile picture URL is required" }).min(1, {
                    message: "Profile picture cannot be empty",
                }),
                image_id: z.string({ required_error: "Profile picture ID is required" }).min(1, {
                    message: "Profile picture cannot be empty",
                }),
            })
            .required(),
        privacy_policy_accepted: z.boolean({
            required_error: "Acceptance of privacy policy is required",
        }),
        terms_and_conditions_accepted: z.boolean({
            required_error: "Acceptance of terms and conditions is required",
        }),
        cookie_consent_accepted: z.boolean({
            required_error: "Acceptance of cookie consent is required",
        }),
    })
    .superRefine((data, ctx) => {
        if (!data?.privacy_policy_accepted) {
            ctx.addIssue({
                code: "custom",
                message: "Acceptance of privacy policy is required",
                path: ["privacy_policy_accepted"],
            });
        }
        if (!data?.terms_and_conditions_accepted) {
            ctx.addIssue({
                code: "custom",
                message: "Acceptance of terms and conditions is required",
                path: ["terms_and_conditions_accepted"],
            });
        }
        return true;
    });

const emailSchema = z.string().email("Invalid email address").optional();

export function validateLearnerParentFields(data: any) {
    const errors: { [key: string]: string } = {};
    let isSuccess = true;

    const enrolled_by = data?.enrolled_by;
    if (enrolled_by !== "parent") return { success: true, errors: {} };

    // Define the fields that are actually present in the current UI form
    const validatableFields = [
        'parent_first_name',
        'parent_last_name', 
        'parent_email',
        'parent_contact_number',
        'relationship_to_learner'
    ];

    // Only validate fields that are present in the form UI
    validatableFields.forEach((key) => {
        const field = data?.parent_info?.[key];
        if (!field || (typeof field === "string" && field.trim().length === 0)) {
            errors[`parent_info.${key}`] = `${key
                .split("_")
                .join(" ")} is required for learners under 13`;
            isSuccess = false;
        }
        if (key === "parent_email") {
            try {
                emailSchema.parse(field);
            } catch (e) {
                errors[`parent_info.${key}`] = "Invalid email address";
                isSuccess = false;
            }
        }
        if (key === "parent_contact_number") {
            try {
                contactNumberValidation.parse(field);
            } catch (e) {
                errors[`parent_info.${key}`] =
                    "Parent Contact Number is required for learners under 13";
                isSuccess = false;
            }
        }
    });

    return { success: isSuccess, errors: isSuccess ? {} : errors };
}

export type LearnerFormData = z.infer<typeof learnerFormSchema>;

export const defaultLearnerData: Learner = {
    learner_personal_info: {
        learner_first_name: "Walter",
        learner_last_name: "Jr",
        learner_date_of_birth: "2010-12-12",
        learner_gender: "male",
        learner_preferred_pronoun: "he/him",
        learner_primary_language: "English",
        learner_contact_details: {
            email: "walterjr@gmail.com",
            contact_number: {
                number: "9876543210",
                country_code: "+91",
            },
            zip_code: "638451",
            country: "india",
            timezone: "asia/kolkata",
            utc_offset: "+05:30",
        },
    },
    // parent_info: {
    //     parent_first_name: "Walter",
    //     parent_last_name: "White",
    //     parent_email: "wlaterwhite@gmail.com",
    //     relationship_to_learner: "father",
    //     parent_contact_number: {
    //         number: "9876543210",
    //         country_code: "+91",
    //     },
    //     parent_address: "Address",
    // },

    learner_special_needs: {
        type_of_developmental_disability: "Physical Disability",
        level_of_support_needed: "moderate",
        assistive_device_used: "Wheelchairs",
        communication_style: "Verbal",
        description: "Description",
        behavioral_concerns: "Difficulty in social interaction",
        behavior_support_strategies: ["provide_a_quiet_space"],
    },

    education: {
        current_school: "current_school",
        grade_or_education_level: "Grade 6",
        program_iep_504_plan: "iep_plan_key",
        cultural_religious_considerations: "cultural_consideration",
        academic_strengths: ["math"],
        extracurricular_activities: "Sports",
        favorite_free_time_activities: "Drawing and coloring",
    },

    learner_goals: {
        expected_goals: ["Encourage Independence"],
        academic_skills_to_learn: [{ skill_name: "science", skill_id: "science" }],
        academic_goals_description: "academic_goals_description",
        arts_life_goals_description: "arts_life_goals_description",
        other_comments_or_notes: "other_comments_or_notes",
        preferred_volunteer_qualities: "patience",
        skill_level: "beginner",
    },
    consent_and_permissions: {
        photo_or_video_consent: true,
    },
    // profile_picture: null,
};
