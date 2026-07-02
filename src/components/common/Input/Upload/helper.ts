import { endpoints } from "@/api/constants";
import { POST_API } from "@/api/request";

// --- File size limits (must match backend) ---
const MAX_IMAGE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 100;
const MAX_DOCUMENT_SIZE_MB = 25;

const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

// --- Allowed extensions ---
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"];
const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"];

function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot === -1) return "";
    return filename.substring(lastDot).toLowerCase();
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validates a file before upload. Throws a user-friendly error if invalid.
 */
export function validateFile(file: File): void {
    const ext = getFileExtension(file.name);

    if (file.type.startsWith("image/")) {
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
            throw new Error(
                `Unsupported image format "${ext}". Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`
            );
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            throw new Error(
                `Image is too large (${formatFileSize(file.size)}). Maximum: ${MAX_IMAGE_SIZE_MB}MB.`
            );
        }
    } else if (file.type.startsWith("video/")) {
        if (!ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
            throw new Error(
                `Unsupported video format "${ext}". Allowed: ${ALLOWED_VIDEO_EXTENSIONS.join(", ")}`
            );
        }
        if (file.size > MAX_VIDEO_SIZE_BYTES) {
            throw new Error(
                `Video is too large (${formatFileSize(file.size)}). Maximum: ${MAX_VIDEO_SIZE_MB}MB.`
            );
        }
    } else if (file.type.startsWith("application/") || file.type.startsWith("text/")) {
        if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(ext)) {
            throw new Error(
                `Unsupported document format "${ext}". Allowed: ${ALLOWED_DOCUMENT_EXTENSIONS.join(", ")}`
            );
        }
        if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
            throw new Error(
                `Document is too large (${formatFileSize(file.size)}). Maximum: ${MAX_DOCUMENT_SIZE_MB}MB.`
            );
        }
    } else {
        throw new Error("Unsupported file type. Please upload an image, video, or document.");
    }
}

export const handleConvertBasedOnContentType = (data: any, fileType: string | undefined) => {
    if (fileType?.startsWith("image/")) {
        return {
            image_url: data?.url || data?.image_url,
            image_id: data?.image_id,
        };
    } else if (fileType?.startsWith("video/")) {
        return {
            video_url: data?.url || data?.video_url,
            video_id: data?.video_id,
        };
    } else if (fileType?.startsWith("application/") || fileType?.startsWith("text/")) {
        return {
            document_url: data?.url || data?.document_url,
            document_id: data?.document_id || data?.image_id,
        };
    }
    return data;
};

/**
 * Upload a file to the server with validation and error handling.
 * @param file - The file to upload
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns The uploaded file data from the server
 */
export const getFileData = async (
    file: File,
    onProgress?: (progress: number) => void
) => {
    // Validate before uploading
    validateFile(file);

    const config = onProgress
        ? {
              onUploadProgress: (progressEvent: any) => {
                  if (progressEvent.total) {
                      const percent = Math.round(
                          (progressEvent.loaded * 100) / progressEvent.total
                      );
                      onProgress(percent);
                  }
              },
          }
        : undefined;

    try {
        if (file.type.startsWith("image/")) {
            const formData = new FormData();
            formData.append("image", file);
            const response = await POST_API(endpoints.media_uploader.image, formData);
            if (onProgress) onProgress(100);
            return response.data;
        }

        if (file.type.startsWith("video/")) {
            const formData = new FormData();
            formData.append("video", file);
            if (onProgress) onProgress(10); // Show initial progress for large files
            const response = await POST_API(endpoints.media_uploader.video, formData);
            if (onProgress) onProgress(100);
            return response.data;
        }

        if (file.type.startsWith("application/") || file.type.startsWith("text/")) {
            const formData = new FormData();
            formData.append("document", file);
            const response = await POST_API(endpoints.media_uploader.document, formData);
            if (onProgress) onProgress(100);
            return response.data;
        }

        throw new Error("Unsupported file type");
    } catch (error: any) {
        // Re-throw validation errors as-is
        if (error.message && !error.response) {
            throw error;
        }

        // Handle server errors with user-friendly messages
        const status = error.response?.status;
        const detail = error.response?.data?.detail;

        if (status === 413) {
            throw new Error(detail || "File is too large for upload.");
        } else if (status === 400) {
            throw new Error(detail || "Invalid file. Please check the format.");
        } else if (status === 401) {
            throw new Error("Session expired. Please log in again.");
        } else {
            throw new Error(
                detail || "Upload failed. Please check your connection and try again."
            );
        }
    }
};
