"use client";

import CenterModal from "@/components/common/Modals/CenterModal";
import Button from "@/components/common/Button";
import { ProfileChangeDiffItem } from "@/api/profileChanges";
import ProfileChangeDiff from "./ProfileChangeDiff";

type Props = {
    isOpen: boolean;
    diff: ProfileChangeDiffItem[];
    /** Set when the member is just looking at a request already sent (no confirm step). */
    readOnly?: boolean;
    replacesPending?: boolean;
    isLoading?: boolean;
    onConfirm?: () => void;
    onCancel: () => void;
};

const ProfileChangeReviewModal = ({ isOpen, diff, readOnly = false, replacesPending = false, isLoading = false, onConfirm, onCancel }: Props) => {
    const footer = readOnly ? (
        <div className="w-full flex pb-2">
            <Button title="Close" btnVariant="outline" customClassName="flex-1 !px-2 min-w-0" onClick={onCancel} />
        </div>
    ) : (
        <div className="w-full flex gap-3 pb-2">
            <Button title="Back to editing" btnVariant="outline" customClassName="flex-1 !px-2 min-w-0" onClick={onCancel} disabled={isLoading} />
            <Button
                title="Submit for review"
                btnVariant="primary"
                customClassName="flex-1 !px-2 min-w-0"
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
            width={520}
            zIndex={1100}
            hideCloseIcon
            headerComponent={
                <h2 className="text-[20px] font-medium text-[#121212]">
                    {readOnly ? "Changes awaiting review" : "Review your changes"}
                </h2>
            }
            headerClassName="!px-6 !py-5 !border-0 !justify-start"
            bodyClassName="!px-6 !py-3 max-h-[60vh] overflow-y-auto"
            footerComponent={footer}
            footerClassName="!px-6 !py-4 !border-0"
        >
            <p className="text-sm text-[#4F4F4F] leading-relaxed mb-4">
                {readOnly
                    ? "An admin will review these changes. Your profile keeps showing the current details until they are approved."
                    : "Your profile won't change right away. An admin reviews these changes first, and you'll be notified of the decision."}
                {!readOnly && replacesPending && " This replaces the changes you sent earlier."}
            </p>
            <ProfileChangeDiff diff={diff} />
        </CenterModal>
    );
};

export default ProfileChangeReviewModal;
