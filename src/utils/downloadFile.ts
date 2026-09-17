import { request } from "@/api/api-client";
import { showToast } from "@/components/common/Toast";

/**
 * Downloads a file from an authenticated endpoint and triggers a browser save.
 * Uses the shared axios instance (via request()) so the Authorization header is
 * attached the same way every other API call gets it - a raw <a href> or
 * window.open(url) can't set headers, so it can't reach an authenticated route.
 */
export async function downloadFile(endpoint: string, filename: string, mimeType: string) {
    try {
        const response: any = await request({
            method: "GET",
            url: endpoint,
            responseType: "blob",
        });
        const blob = new Blob([response.data], { type: mimeType });
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
        showToast({ message: "Failed to download file", type: "error" });
    }
}
