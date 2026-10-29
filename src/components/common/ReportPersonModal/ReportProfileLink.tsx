import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/api/constants";
import { POST_API } from "@/api/request";
import { showToast } from "@/components/common/Toast";
import { useConfirm } from "@/hooks/useConfirm";
import { getApiErrorMessage } from "@/utils/apiError";
import ReportPersonModal from "./index";

const linkClass = "text-sm text-gray-600 underline bg-transparent border-0 p-0 cursor-pointer hover:text-black";

/** "Report" and "Block" for the bottom of a profile, with their dialogs. */
const ReportProfileLink = ({
    userId,
    name,
    roleLabel,
    onBlocked,
}: {
    userId?: string | null;
    name?: string;
    /** "volunteer" or "learner", for the link text. */
    roleLabel: string;
    /** Called after a successful block (the profile usually closes). */
    onBlocked?: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isBlocking, setIsBlocking] = useState(false);
    const { confirm, confirmModal } = useConfirm();
    const queryClient = useQueryClient();
    if (!userId) return null;

    const handleBlock = async () => {
        if (isBlocking) return;
        const ok = await confirm({
            title: `Block ${name || `this ${roleLabel}`}?`,
            description:
                "You won't be able to message each other, and you won't see each other in lists or suggestions. " +
                "Sessions you already have stay as they are, and they won't be told you blocked them. " +
                "You can unblock anytime in Settings.",
            confirmText: "Block",
            danger: true,
        });
        if (!ok) return;
        setIsBlocking(true);
        try {
            await POST_API(endpoints.blocks.create, { user_id: userId });
            showToast({ type: "success", message: "Blocked. You can unblock in Settings." });
            // Lists, matches and chats were built before the block.
            queryClient.invalidateQueries();
            onBlocked?.();
        } catch (err) {
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't block. Please try again.") });
        } finally {
            setIsBlocking(false);
        }
    };

    return (
        <>
            {confirmModal}
            <div className="flex justify-end gap-4 px-5">
                <button type="button" onClick={handleBlock} disabled={isBlocking} className={linkClass}>
                    Block this {roleLabel}
                </button>
                <button type="button" onClick={() => setIsOpen(true)} className={linkClass}>
                    Report this {roleLabel}
                </button>
            </div>
            <ReportPersonModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                reportType="user"
                targetId={userId}
                subjectName={name}
            />
        </>
    );
};

export default ReportProfileLink;
