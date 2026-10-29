import { useState } from "react";
import ReportPersonModal from "./index";

/** "Report this person" link for the bottom of a profile, with its modal. */
const ReportProfileLink = ({
    userId,
    name,
    roleLabel,
}: {
    userId?: string | null;
    name?: string;
    /** "volunteer" or "learner", for the link text. */
    roleLabel: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!userId) return null;
    return (
        <>
            <div className="flex justify-end px-5">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="text-sm text-gray-600 underline bg-transparent border-0 p-0 cursor-pointer hover:text-black"
                >
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
