import { z } from "zod";

// Add Resource Fields
export const ResourceFormConstants: FormField[] = [
    {
        name: "resource_image",
        variant: "cover-image",
        label: "Add Cover Image",
        inputType: "upload",
        maxFiles: 1,
        fileType: "image/*",
        required: true,
    },
    {
        name: "resource_title",
        label: "Resource Title",
        inputType: "text",
        placeholder: "Enter title",
        required: true,
    },
    {
        name: "created_by",
        label: "Created By",
        inputType: "text",
        placeholder: "Name",
        disabled: true,
        required: true,
    },
    {
        name: "difficulty_level",
        label: "Select Difficulty Level",
        inputType: "radio",
        options: [
            { label: "Beginner", value: "beginner" },
            { label: "Intermediate", value: "intermediate" },
            { label: "Expert", value: "expert" },
        ],
        required: true,
    },
    {
        name: "resource_description",
        label: "Resource Description",
        inputType: "textarea",
        placeholder: "Enter description",
        required: true,
    },
    {
        name: "resource_skills",
        label: "Skills You Gain",
        inputType: "async-select",
        placeholder: "Select the skills",
        endpoint: "skills",
        variant: "multi",
        responseAsLabel: "skill_name",
        responseAsValue: ["skill_id", "skill_name"],
        required: true,
    },
    {
        name: "resource_category",
        label: "Select Category",
        inputType: "async-select",
        placeholder: "Select category",
        endpoint: "categories",
        variant: "single",
        responseAsLabel: "category_name",
        responseAsValue: ["category_id", "category_name"],
        required: true,
    },
    {
        name: "resource_notes",
        label: "Add Notes",
        inputType: "textarea",
        placeholder: "Enter notes here",
        required: true,
    },
];

// Zod schema validation
export const ResourceFormSchema = z.object({
    resource_image: z
        .object({
            image_url: z.string(),
            image_id: z.string()
        })
        .or(z.undefined())
        .refine((value) => value, {
            message: "Please upload a single cover image.",
        }),
    resource_title: z
        .string({ required_error: "Resource Title is required" })
        .min(3, "Title is required")
        .max(100, "Title cannot exceed 100 characters"),
    created_by: z
        .string({ required_error: "Description is required" })
        .min(3, "Created By field must have a name")
        .max(50, "Name cannot exceed 50 characters"),
    difficulty_level: z.string({ required_error: "Difficulty level selection is required" }),
    resource_description: z
        .string({ required_error: "Description is required" })
        .min(10, "Description must be at least 10 characters long")
        .max(500, "Description cannot exceed 500 characters"),
    resource_skills: z
        .array(
            z.object({
                skill_id: z.string(),
                skill_name: z.string(),
            })
        )
        .or(z.undefined())
        .refine((skills) => skills?.length, {
            message: "Category selection is required",
        }),
    resource_category: z
        .object({
            category_id: z.string(),
            category_name: z.string(),
        })
        .or(z.undefined())
        .refine((category) => category?.category_id && category?.category_name, {
            message: "Category selection is required",
        }),
    resource_notes: z
        .string({ required_error: "Notes are required" })
        .min(1, "Notes are required")
        .max(200, "Notes cannot exceed 200 characters"),

    curated_links: z.array(
        z.object({
            title: z.string().min(4, "Title must be at least 4 characters"),
            url: z.string()
                .transform(url => url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`)
                .refine(url => /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}([\/?#].*)?$/.test(url), {
                    message: "Enter a valid URL",
                }),
        }))
});

export const ResourceFormDefaultValues = {
    resource_image: {},
    resource_title: "",
    created_by: "",
    difficulty_level: "",
    resource_description: "",
    resource_skills: [],
    resource_category: {},
    resource_notes: "",
    curated_links: [],
};