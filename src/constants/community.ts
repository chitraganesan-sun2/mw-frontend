import { z } from "zod";

export const CommunityFormConstants: FormField[] = [
    {
        name: "description",
        label: "Post Description",
        inputType: "textarea",
        placeholder: "Write your post here",
        rows: 8,
    },
    {
        name: "images",
        inputType: "upload",
        fileType: "image/*",
        label: "Do you want to add pictures to share with the community?",
        maxFiles: 5,
    },
    {
        name: "video",
        inputType: "upload",
        variant: "file",
        fileType: "video/*",
        label: "Do you want to add a video to share with the community?",
    },
];

// Pictures and a video are optional (the prompts say "Do you want to add...?"): only the text is
// required. The API accepts an empty `images` list and a null `video` (models/v1/post.py).
export const PostFormSchema = z.object({
    description: z
        .string({ required_error: "Post Description is required" })
        .min(1, "Post Description is required")
        .max(1000, "Post Description cannot exceed 1,000 characters"),
    images: z.array(z.any()).max(5, "You can add up to 5 pictures").optional(),
    video: z
        .object({ video_url: z.string(), video_id: z.string() })
        .or(z.null())
        .optional(),
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
