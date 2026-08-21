"use client";

import { endpoints } from "@/api/constants";
import { POST_API, PUT_API } from "@/api/request";
import { Input } from "@/components/common/Input";
import CenterModal from "@/components/common/Modals/CenterModal";
import { CommunityFormConstants } from "@/constants/community";
import { cn } from "@/utils/merge-class";
import { useEffect, useState } from "react";
import { getCookie } from "@/utils/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWindowSize } from "@/hooks/useWindowSize";
import FeedHeader from "../FeedHeader";
import { callbackToast, showToast } from "@/components/common/Toast";
import { useQueryState } from "nuqs";
import { getSinglePost } from "@/api/community";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostFormSchema } from "@/constants/community";
import { z } from "zod";
import LottieLoader from "@/components/common/Loader/Lottie";

type CommunityPostModalProps = {
    isOpen: boolean;
    onClose: () => void;
    triggerReload?: () => void;
};

type FormData = z.infer<typeof PostFormSchema>;

const CommunityPostModal = ({ isOpen, onClose }: CommunityPostModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const role = getCookie("role");
    const queryClient = useQueryClient();

    const [postId] = useQueryState("id");
    const [activeTab] = useQueryState("tab");
    const [currentMode] = useQueryState("mode");
    const isEditMode = currentMode === "edit";

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(PostFormSchema),
        defaultValues: { description: "", images: [], video: null },
    });

    useEffect(() => {
        if (currentMode === "add") {
            reset({ description: "", images: [], video: null });
        }
    }, [currentMode, reset]);

    // Fetch post details when in edit mode
    const { isFetching } = useQuery({
        queryKey: ["get-single-post", postId],
        queryFn: async () => {
            if (!postId) return null;
            const post = await getSinglePost(postId);
            if (post && isEditMode) {
                reset({ description: post.description || "", images: post.images || [], video: post.video || null });
            }
            return post;
        },
        enabled: isEditMode && !!postId,
    });

    const handlePostAction = async (
        actionFn: () => Promise<any>,
        successMessage: string,
        errorMessage: string
    ) => {
        setIsSubmitting(true);
        try {
            await callbackToast({
                apiCall: actionFn(),
                loadingMsg: isEditMode ? "Updating Post..." : "Creating Post...",
                successMsg: successMessage,
                errorMsg: errorMessage,
            });

            queryClient.invalidateQueries({ queryKey: ["get-posts", activeTab] });
            onClose();
            reset({ description: "", images: [], video: null });
        } catch (error) {
            showToast({ message: "Something went wrong!", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = (data: FormData) => {
        const payload = {
            description: data.description,
            images: data?.images?.map((image) => ({
                image_url: image.image_url,
                image_id: image.image_id,
            })),
            video: data.video
                ? { video_url: data.video.video_url, video_id: data.video.video_id }
                : null,
            created_by: role,
        };

        handlePostAction(
            () =>
                isEditMode
                    ? PUT_API(endpoints.post.updatePost(postId || ""), payload)
                    : POST_API(endpoints.post.createPost, payload),
            isEditMode ? "Post updated successfully" : "Post created successfully",
            isEditMode ? "Failed to update post" : "Failed to create post"
        );
    };

    const onError = () => {
        showToast({ message: "Please, fill all the required fields!", type: "error" });
    };

    const { width } = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    return (
        <CenterModal
            title={!isMobile ? (isEditMode ? "Edit Post" : "Add New Post") : ""}
            isOpen={isOpen}
            loading={isSubmitting}
            onClose={onClose}
            width={isMobile ? "100%" : isTablet ? "70%" : "40%"}
            height={isMobile ? "100dvh" : "auto"}
            customClassName="lg:min-w-[700px]"
            rootClassName="md:!h-auto"
            bodyClassName="max-md:!max-h-none max-md:!p-0 max-md:!m-0 max-md:!bg-background-input"
            headerRootClassName="md:mb-0 md:pb-2"
            headerComponent={
                isMobile && (
                    <FeedHeader
                        title={isEditMode ? "Edit Post" : "Add New Post"}
                        mode={currentMode || ""}
                        rootClassName="!w-full !p-1"
                        onClose={onClose}
                        onSave={handleSubmit(onSubmit, onError)}
                        isSubmitting={isSubmitting}
                    />
                )
            }
            hideCloseIcon={isMobile}
            hideFooter={isMobile}
            secondaryActionProps={{
                onClick: onClose,
                disabled: isSubmitting,
                title: "Cancel",
                btnVariant: "secondary",
                customClassName: cn("bg-transparent !text-black", "!rounded-xl"),
            }}
            primaryActionProps={{
                onClick: handleSubmit(onSubmit, onError),
                disabled: isSubmitting,
                title: isSubmitting
                    ? isEditMode
                        ? "Saving..."
                        : "Creating..."
                    : isEditMode
                    ? "Save"
                    : "Create",
                customClassName: "!rounded-xl hover:!bg-black hover:!text-white",
            }}
        >
            {isFetching ? (
                <div className="flex-center min-h-[45vh]">
                    <LottieLoader isLoading={true} customClassName="!w-[6rem] !h-[6rem]" />
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit(onSubmit, onError)}
                    className="flex flex-col gap-4 md:gap-2 lg:gap-0 p-4 md:p-0 md:py-2"
                >
                    {CommunityFormConstants.map((field: any) => (
                        <Controller
                            key={field.name}
                            name={field.name as keyof FormData}
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <Input
                                    {...field}
                                    error={errors[field.name as keyof FormData]?.message}
                                    value={value}
                                    onChange={onChange}
                                    rootClassName="bg-white p-4 md:p-2 rounded-xl !mb-0"
                                />
                            )}
                        />
                    ))}
                </form>
            )}
        </CenterModal>
    );
};

export default CommunityPostModal;
