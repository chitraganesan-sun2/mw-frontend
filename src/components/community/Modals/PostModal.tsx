"use client";
import { endpoints } from "@/api/constants";
import { POST_API } from "@/api/request";
import { Input } from "@/components/common/Input";
import CenterModal from "@/components/common/Modals/CenterModal";
import { CommunityFormConstants } from "@/constants/community";
import { useSendData } from "@/hooks/useReactQuery";
import { cn } from "@/utils/merge-class";
import { useState } from "react";
import { getCookie } from "@/utils/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useWindowSize } from "@/hooks/useWindowSize";
import FeedHeader from "../FeedHeader";
import { showToast } from "@/components/common/Toast";
type PostModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const PostModal = ({ isOpen, onClose }: PostModalProps) => {
    const [notes, setNotes] = useState("");
    const [uploadPictures, setUploadPictures] = useState<any[]>([]);
    const role = getCookie("role");
    const queryClient = useQueryClient();

    const handleChange = (key: string, value: any) => {
        if (key === "uploadPictures") {
            setUploadPictures(Array.isArray(value) ? value : [value].filter(Boolean));
        } else if (key === "notes") {
            setNotes(value);
        }
    };

    const handleSubmit = async () => {
        console.log("Form Data to submit:", { notes, uploadPictures });
        if (notes === "" || uploadPictures?.length <= 0) {
            showToast({ message: "Please add a note and upload at least one picture", type: "error" });
            return;
        }
        const payload = {
            description: notes,
            images: uploadPictures.map((image) => ({
                image_url: image.url,
                image_id: image.image_id,
            })),
            created_by: role,
        };
        return await POST_API(endpoints.post.createPost, payload);
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: () => handleSubmit(),
        invalidateKey: ["learner-events"],
        success: () => {
            setNotes("");
            setUploadPictures([]);
            onClose();
            showToast({ message: "Post created successfully", type: "success" });
            queryClient.invalidateQueries({ queryKey: ["get-posts", "manage_your_posts"] });
        },
        error: (err) => {
            console.log("Error: ", err);
            showToast({ message: "Failed to create post", type: "error" });
        },
    });

    const { width } = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    return (
        <CenterModal
            title={!isMobile ? "Add New Post" : ""}
            isOpen={isOpen}
            loading={isPending}
            onClose={onClose}
            width={isMobile ? "100vw" : isTablet ? "60%" : "40%"}
            height={isMobile ? "100dvh" : "auto"}
            customClassName={cn(
                "max-h-[80vh] !rounded-2xl overflow-hidden [&_.ant-modal-footer]:!mt-0 [&_.modal-body]:!border-b [&_.modal-body]:!max-h-[80vh]",
                isMobile &&
                    "[&_.ant-modal-content]:!p-0 !p-0 !m-0 !h-[100dvh] !max-h-none !w-screen !max-w-none !max-h-[100dvh] !rounded-none"
            )}
            headerComponent={
                isMobile && (
                    <FeedHeader
                        title="Add New Post"
                        onClose={onClose}
                        onSave={() => onSave(undefined)}
                    />
                )
            }
            hideFooter={isMobile}
            secondaryActionProps={{
                onClick: onClose,
                disabled: isPending,
                title: "Cancel",
                btnVariant: "secondary",
                customClassName: cn("bg-transparent !text-black", "!rounded-xl"),
            }}
            primaryActionProps={{
                onClick: onSave,
                disabled: isPending,
                title: "Share now",
                customClassName: "!rounded-xl hover:!bg-black hover:!text-white",
            }}
        >
            <div className="flex flex-col gap-4 md:gap-2 p-4 md:p-0">
                {CommunityFormConstants.map((field: any) => (
                    <Input
                        key={field.name}
                        {...field}
                        error={
                            field.name === "uploadPictures"
                                ? uploadPictures.length > 0 || "Please upload at least one picture"
                                : !!notes || "Please add your comment"
                        }
                        value={field.name === "uploadPictures" ? uploadPictures : notes}
                        onChange={(value: any) => handleChange(field.name, value)}
                        rootClassName="bg-white p-2 rounded-xl !mb-0"
                    />
                ))}
            </div>
        </CenterModal>
    );
};

export default PostModal;
