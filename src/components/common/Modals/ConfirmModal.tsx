"use client";

import CenterModal from "./CenterModal";
import Button from "@/components/common/Button";

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({
    isOpen,
    title = "Are you sure?",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    const footerContent = (
        <div className="w-full flex gap-3 pb-2">
            <Button
                title={cancelText}
                btnVariant="secondary"
                customClassName="!bg-white !text-black !border !border-gray-300 flex-1"
                onClick={onCancel}
                disabled={isLoading}
            />
            <Button
                title={confirmText}
                btnVariant={danger ? "error" : "primary"}
                customClassName="flex-1"
                onClick={onConfirm}
                disabled={isLoading}
                loading={isLoading}
            />
        </div>
    );

    return (
        <CenterModal
            isOpen={isOpen}
            onClose={onCancel}
            width={420}
            hideCloseIcon
            headerComponent={<h2 className="text-[20px] font-medium text-[#121212]">{title}</h2>}
            headerClassName="!px-6 !py-5 !border-0 !justify-start"
            bodyClassName="!px-6 !py-3"
            footerComponent={footerContent}
            footerClassName="!px-6 !py-4 !border-0"
        >
            <p className="text-sm text-[#4F4F4F] leading-relaxed">{description}</p>
        </CenterModal>
    );
};

export default ConfirmModal;
