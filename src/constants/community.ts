import { z } from "zod";

export const CommunityFormConstants: FormField[] = [
    {
        name: "description",
        label: "Post Description",
        inputType: "textarea",
        placeholder: "Enter description here",
        rows: 8,
    },
    {
        name: "images",
        inputType: "upload",
        fileType: "image/*",
        label: "Do you want to upload any pictures to share in the community/forum?",
        maxFiles: 5,
    },
    {
        name: "video",
        inputType: "upload",
        variant: "file",
        fileType: "video/*",
        label: "Do you want to upload a video to share in the community/forum?",
    },
];

export const PostFormSchema = z
    .object({
        description: z
            .string({ required_error: "Post Description is required" })
            .min(1, "Post Description is required")
            .max(1000, "Post Description cannot exceed 1,000 characters"),
        images: z.array(z.any()).max(5, "You can add up to 5 pictures").optional(),
        video: z
            .object({ video_url: z.string(), video_id: z.string() })
            .or(z.null())
            .optional(),
    })
    .refine((data) => (data.images && data.images.length > 0) || !!data.video, {
        message: "Please upload at least one picture or a video.",
        path: ["images"],
    });

export const CommunityTabs = [
    {
        name: "All Posts",
        route: null,
    },
    // {
    //     name: "Suggested for You",
    //     route: "suggested_for_you",
    // },
    {
        name: "Your Notifications",
        route: "your_notifications",
    },
    {
        name: "Saved Posts",
        route: "saved_posts",
    },
    {
        name: "Manage Your Posts",
        route: "manage_your_posts",
    },
];

export const getCurrentTab = (currentTab: string | null) => {
    return CommunityTabs.find((tab) => tab.route === currentTab);
};
