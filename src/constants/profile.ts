import { z } from "zod";
import nationalities from "@/data/nationalities.json";

export const contactNumberValidation = z
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

// Volunteer:
export const VolunteerProfileFormSchema = z.object({
    volunteer_first_name: z
        .string({ required_error: "First Name is required" })
        .min(1, "First Name  is required"),
    volunteer_last_name: z
        .string({ required_error: "Last Name is required" })
        .min(1, "Last Name  is required"),
    profile_picture: z
        .object({
            image_url: z.string(),
            image_id: z.string(),
        })
        .or(z.undefined())
        .refine((value) => value, {
            message: "Please upload a single cover image.",
        }),
    volunteer_description: z
        .string({ required_error: "Bio is required" })
        .min(1, "Bio is required"),
    country: z
        .string({ required_error: "Country selection is required" })
        .min(1, "Country selection is required"),
    volunteer_subjects: z
        .array(z.any(), { required_error: "At least one subject is required" })
        .min(1, "At least one subject is required"),
    volunteer_languages: z
        .array(z.any(), { required_error: "At least one language is required" })
        .min(1, "At least one language is required"),
    volunteer_skills: z
        .array(z.any(), { required_error: "At least one skill is required" })
        .min(1, "At least one skill is required"),
});

export const VolunteerProfileFormConstants: FormField[] = [
    {
        name: "volunteer_first_name",
        label: "First Name",
        inputType: "text",
        placeholder: "Eg. Walter",
        required: true,
    },
    {
        name: "volunteer_last_name",
        label: "Last Name",
        inputType: "text",
        placeholder: "Eg. White",
        required: true,
    },
    {
        name: "profile_picture",
        fileType: "image/*",
        label: "ProfileImage",
        required: true,
        inputType: "upload",
        variant: "profile-image",
    },
    {
        name: "volunteer_description",
        label: "Bio",
        inputType: "textarea",
        placeholder: "Tell us about yourself...",
        required: true,
    },
    {
        name: "volunteer_languages",
        label: "Languages Spoken",
        inputType: "async-select",
        variant: "multi",
        placeholder: "Select Languages",
        endpoint: "languages",
        responseAsLabel: "language_name",
        responseAsValue: ["language_id", "language_name"],
        required: true,
    },
    {
        name: "volunteer_subjects",
        label: "Subjects I Teach",
        inputType: "async-select",
        placeholder: "Select Subjects",
        creatable: true,
        variant: "multi",
        required: true,
        endpoint: "subjects",
        responseAsLabel: "subject_name",
        responseAsValue: ["subject_name", "subject_id"],
    },
    {
        name: "volunteer_skills",
        label: "Skills You Can Share with Learners",
        inputType: "async-select",
        placeholder: "Select skills",
        creatable: true,
        endpoint: "skills",
        responseAsLabel: "skill_name",
        responseAsValue: ["skill_name", "skill_id"],
        variant: "multi",
        required: true,
    },
    {
        name: "country",
        label: "Country of Residence",
        inputType: "select",
        placeholder: "Select Country of Residence",
        options: nationalities,
        showSearch: true,
        required: true,
    },
    {
        name: "volunteer_birth_date",
        label: "Date of Birth",
        inputType: "birthdatepicker",
        placeholder: "DD/MM/YYYY",
        format: "DD-MM-YYYY",
        required: false,
    },
    {
        name: "volunteer_higher_education",
        label: "Highest Education",
        inputType: "select",
        placeholder: "Select education level",
        options: [
            { label: "Bachelor's Degree", value: "bachelors" },
            { label: "High School", value: "high_school" },
            { label: "Middle School", value: "middle_school" },
            { label: "Elementary School", value: "elementary_school" },
            { label: "Master's Degree", value: "masters" },
            { label: "PhD", value: "phd" },
            { label: "Others", value: "others" },
            { label: "N/A", value: "N/A" },
        ],
        showSearch: true,
        required: false,
    },
];

// Learner:
export const LearnerProfileFormSchema = z.object({
    learner_first_name: z
        .string({ required_error: "First Name is required" })
        .min(1, "First Name is required"),
    learner_last_name: z
        .string({ required_error: "Last Name is required" })
        .min(1, "Last Name is required"),
    profile_picture: z
        .object({
            image_url: z.string(),
            image_id: z.string(),
        })
        .or(z.undefined())
        .refine((value) => value, {
            message: "Please upload a single profile image.",
        }),
    learner_description: z.string({ required_error: "Bio is required" }).min(1, "Bio is required"),
    learner_language: z.string({ required_error: "Language selection is required" }),
    learner_subjects: z
        .array(z.any(), { required_error: "At least one subject is required" })
        .min(1, "At least one subject is required"),
    contact_number: contactNumberValidation,
    email: z.string({ required_error: "Email address is required" }).email("Invalid email format"),
    country: z
        .string({ required_error: "Country selection is required" })
        .min(1, "Country selection is required"),
});

export const LearnerProfileFormConstants: FormField[] = [
    {
        name: "learner_first_name",
        label: "First Name",
        inputType: "text",
        placeholder: "Eg. Walter",
        required: true,
    },
    {
        name: "learner_last_name",
        label: "Last Name",
        inputType: "text",
        placeholder: "Eg. White",
        required: true,
    },
    {
        name: "profile_picture",
        fileType: "image/*",
        label: "ProfileImage",
        required: true,
        inputType: "upload",
        variant: "profile-image",
    },
    {
        name: "learner_description",
        label: "Bio",
        inputType: "textarea",
        placeholder: "Tell us about yourself...",
        required: true,
    },
    {
        name: "learner_language",
        label: "Primary Language",
        inputType: "async-select",
        variant: "single",
        placeholder: "Tamil...",
        endpoint: "languages",
        responseAsLabel: "language_name",
        responseAsValue: "language_name",
        required: true,
    },
    {
        name: "learner_subjects",
        label: "Subjects to Learn",
        inputType: "async-select",
        placeholder: "Select Subjects",
        creatable: true,
        variant: "multi",
        required: true,
        endpoint: "subjects",
        responseAsLabel: "subject_name",
        responseAsValue: "subject_name",
    },
    {
        name: "contact_number",
        label: "Your contact number",
        inputType: "contact-input",
        placeholder: "Enter contact number",
        disabled: false,
        required: true,
    },
    {
        name: "email",
        label: "Email address",
        inputType: "text",
        placeholder: "Enter Email ID",
        disabled: true,
        required: true,
    },
    {
        name: "country",
        label: "Country of Residence",
        inputType: "select",
        placeholder: "Select Country of Residence",
        options: nationalities,
        showSearch: true,
        required: true,
    },
];
