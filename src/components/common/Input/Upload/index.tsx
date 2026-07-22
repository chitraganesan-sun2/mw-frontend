"use client";
import { ChangeEvent, useRef, useState } from "react";
import ImageUpload from "./ImageUpload";
import FileUpload from "./FileUpload";
import SingleImageUpload from "./SingleUpload";
import { useSendData } from "@/hooks/useReactQuery";
import { getFileData, handleConvertBasedOnContentType, validateFile } from "./helper";
import { useAppStore } from "@/store/useAppStore";
import { DELETE_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { showToast } from "../../Toast";
import ConfirmModal from "../../Modals/ConfirmModal";

const Uploader = ({ maxFiles = 1, ...props }: UploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [pendingRemoval, setPendingRemoval] = useState<{ index: number; type?: string; image_id?: string } | null>(null);
    const { imageId, setImageId, videoId, setVideoId, documentId, setDocumentId } = useAppStore();

    const handleSuccess = (data: any) => {
        setUploadProgress(0);
        setUploadError(null);
        const convertedData = handleConvertBasedOnContentType(data, props.fileType);
        if (maxFiles === 1) {
            if (props.fileType === "image/*") {
                setImageId(convertedData?.image_id);
            } else if (props.fileType === "video/*") {
                setVideoId(convertedData?.video_id);
            } else if (props.fileType === "application/*,image/*") {
                setDocumentId(convertedData?.document_id);
            }
            props.onChange(convertedData);
        } else {
            const currentValue = Array.isArray(props.value) ? props.value : [];
            const updatedValue = [...currentValue, convertedData];
            props.onChange(updatedValue);
        }
    };

    const { mutate: handleUpload, isPending } = useSendData({
        fn: (file: any) => getFileData(file, (progress) => setUploadProgress(progress)),
        success: handleSuccess,
        error: (err: any) => {
            setUploadProgress(0);
            const message = err?.message || "Upload failed. Please try again.";
            setUploadError(message);
            showToast({ message, type: "error" });
        },
    });

    const handleClick = () => {
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (!files?.length) return;

        // Check if adding new files would exceed maxFiles
        const currentFileCount = Array.isArray(props.value) ? props.value.length : 0;
        const remainingSlots = maxFiles - currentFileCount;

        if (remainingSlots <= 0) {
            showToast({ message: `Maximum ${maxFiles} files allowed`, type: "error" });
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        // Validate files before upload
        for (const file of filesToUpload) {
            try {
                validateFile(file);
            } catch (err: any) {
                setUploadError(err.message);
                showToast({ message: err.message, type: "error" });
                return;
            }
        }

        setUploadError(null);
        setUploadProgress(0);

        await Promise.all(
            filesToUpload.map(async (file) => {
                return Promise.all([handleUpload(file)]);
            })
        );
    };

    const handleRemove = (index: number, type?: string, image_id?: string) => {
        setPendingRemoval({ index, type, image_id });
    };

    const confirmRemove = () => {
        if (!pendingRemoval) return;
        const { index, type, image_id } = pendingRemoval;
        setPendingRemoval(null);

        if (type === "image/*") {
            const idToDelete = (imageId as string) || (image_id as string) || props.value?.image_id;
            if (idToDelete) {
                DELETE_API(endpoints.media_uploader.deleteImage(idToDelete)).then(() => {
                    setImageId(null);
                });
            }
        } else if (type === "video/*") {
            const idToDelete = (videoId as string) || props.value?.video_id;
            if (idToDelete) {
                DELETE_API(endpoints.media_uploader.deleteVideo(idToDelete)).then(() => {
                    setVideoId(null);
                });
            }
        } else if (type === "application/*,image/*") {
            const idToDelete = (documentId as string) || props.value?.document_id;
            if (idToDelete) {
                DELETE_API(endpoints.media_uploader.deleteDocument(idToDelete)).then(() => {
                    setDocumentId(null);
                });
            }
        }
        if (maxFiles === 1) {
            // Set to null instead of undefined so the API receives null and can remove the video
            props.onChange(null);
        } else {
            const updatedFiles = [...props.value];
            updatedFiles.splice(index, 1);
            props.onChange(updatedFiles);
        }
    };

    const renderUploader = () => {
        switch (props.variant) {
            case "file":
                return (
                    <FileUpload
                        {...props}
                        handleRemove={handleRemove}
                        handleClick={handleClick}
                        isLoading={isPending}
                        uploadProgress={uploadProgress}
                        errorMessage={uploadError || undefined}
                    />
                );
            case "profile-image":
                return (
                    <SingleImageUpload
                        {...props}
                        handleRemove={handleRemove}
                        handleClick={handleClick}
                        isLoading={isPending}
                    />
                );
            case "cover-image":
            default:
                return (
                    <ImageUpload
                        maxFiles={maxFiles}
                        {...props}
                        handleRemove={handleRemove}
                        handleClick={handleClick}
                        isLoading={isPending}
                    />
                );
        }
    };

    return (
        <div className="w-full h-fit">
            {renderUploader()}
            <input
                name={props.name}
                title={props.name}
                ref={fileInputRef}
                type="file"
                accept={props.fileType}
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={props.disabled || isPending}
                aria-hidden="true"
                tabIndex={-1}
            />
            <ConfirmModal
                isOpen={!!pendingRemoval}
                title="Remove file"
                description="Are you sure you want to remove this file?"
                confirmText="Remove"
                danger
                onConfirm={confirmRemove}
                onCancel={() => setPendingRemoval(null)}
            />
        </div>
    );
};

export default Uploader;
