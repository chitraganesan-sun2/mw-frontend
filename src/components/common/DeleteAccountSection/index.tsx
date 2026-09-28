"use client";

import { DELETE_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useState } from "react";
import { Modal } from "antd";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { isNativePlatform } from "@/utils/platform";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/apiError";

interface DeleteAccountSectionProps {
    userId: string;
    role: "learner" | "volunteer";
}

export default function DeleteAccountSection({ userId, role }: DeleteAccountSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const router = useRouter();

    const handleDeleteAccount = async () => {
        if (confirmText !== "DELETE") return;

        setIsDeleting(true);
        try {
            await DELETE_API(endpoints.user.deleteAccount);
            // Clear all cookies
            const allCookies = Cookies.get();
            Object.keys(allCookies).forEach((cookieName) => {
                Cookies.remove(cookieName);
            });
            toast.success("Your account has been deleted successfully.");
            // Redirect to home
            if (isNativePlatform()) {
                router.replace("/");
            } else {
                window.location.href = "/";
            }
        } catch (error: any) {
            toast.error(
                getApiErrorMessage(error, "Failed to delete account. Please try again or contact support.")
            );
        } finally {
            setIsDeleting(false);
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-4 mt-4 md:mt-8 pt-4 md:pt-8 border-t border-gray-200">
                <p className="md:text-2xl text-[16px] font-medium text-red-600">
                    Danger Zone
                </p>
                <div className="flex bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full">
                    <div className="flex flex-col gap-2">
                        <p className="md:text-base text-[14px] font-medium">
                            Delete your account
                        </p>
                        <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                            Permanently delete your account and all associated data. This action
                            cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            <Modal
                title="Delete Account"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setConfirmText("");
                }}
                footer={null}
                centered
            >
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-sm text-gray-600">
                        This will permanently delete your account, including:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Your profile and personal information</li>
                        <li>All scheduled sessions</li>
                        <li>Message history</li>
                        <li>Any uploaded content</li>
                    </ul>
                    <p className="text-sm font-medium text-red-600">
                        This action is irreversible. Please type <strong>DELETE</strong> to
                        confirm.
                    </p>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder='Type "DELETE" to confirm'
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <div className="flex gap-3 justify-end mt-2">
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                setConfirmText("");
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={confirmText !== "DELETE" || isDeleting}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? "Deleting..." : "Permanently Delete"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
