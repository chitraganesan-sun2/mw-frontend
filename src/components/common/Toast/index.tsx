import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/apiError";

interface ToastParams {
    type?: "success" | "error" | "info";
    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
    message: string;
    duration?: number;
}

export const showToast = ({
    type = "success",
    message = "Done",
    position = "top-center",
    duration = 4000,
}: ToastParams) => {
    toast.dismiss();

    switch (type) {
        case "success":
            toast.success(message, { duration, position });
            break;

        case "error":
            toast.error(message, { duration, position });
            break;

        case "info":
            toast(message, { duration, position });
            break;

        default:
            toast("Done", {
                duration,
                position: "top-right",
                style: {
                    background: "#333",
                    color: "#fff",
                },
            });
            break;
    }
};

export const callbackToast = (
    { apiCall, loadingMsg = "Processing...", successMsg = "Success!", errorMsg = "Something went wrong." }:
    { apiCall: Promise<any>, loadingMsg?: string, successMsg?: string, errorMsg?: string }
) => {
    toast.dismiss();
    
    return toast.promise(apiCall, {
        loading: loadingMsg,
        success: () => successMsg,
        // Prefer the backend's specific reason (e.g. "overlaps another session") over
        // the caller's generic fallback whenever the server sent one.
        error: (err: any) => getApiErrorMessage(err, errorMsg),
    });
};

const HotToaster: React.FC = () => {
    return (
        <>
            <Toaster
                toastOptions={{
                    duration: 3000,
                    style: {
                        fontSize: "16px",
                    },
                }}
            />
        </>
    );
};

export default HotToaster;