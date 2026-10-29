import { useEffect, useState } from "react";
import { Radio } from "antd";
import { Input } from "@/components/common/Input";
import CenterModal from "@/components/common/Modals/CenterModal";
import { showToast } from "@/components/common/Toast";
import { POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useWindowSize } from "@/hooks/useWindowSize";
import { getApiErrorMessage } from "@/utils/apiError";
import {
    buildReportDescription,
    reasonsFor,
    validateReport,
    type PersonReportType,
} from "@/utils/personReport";

type ReportPersonModalProps = {
    isOpen: boolean;
    onClose: () => void;
    reportType: PersonReportType;
    /** The reported user's id, the chat message's message_id, or the session's session_id. */
    targetId: string;
    /** Who/what is being reported, e.g. "Val Completed" - used in the title. */
    subjectName?: string;
};

const TITLES: Record<PersonReportType, (name?: string) => string> = {
    user: (name) => (name ? `Report ${name}` : "Report this person"),
    message: () => "Report this message",
    session: () => "Report a problem with this session",
};

const WHO_SEES: Record<PersonReportType, string> = {
    user: "Moderators will see this report and the person's name.",
    message: "Moderators will see this report and this one message, not the rest of your conversation.",
    session: "Moderators will see this report and the session's title and date.",
};

const ReportPersonModal = ({ isOpen, onClose, reportType, targetId, subjectName }: ReportPersonModalProps) => {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { width } = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    useEffect(() => {
        if (!isOpen) {
            setReason("");
            setDetails("");
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        const problem = validateReport(reportType, reason, details) ?? (targetId ? null : "Something went wrong. Please try again.");
        if (problem) {
            showToast({ type: "error", message: problem });
            return;
        }
        setIsSubmitting(true);
        try {
            await POST_API(endpoints.report.create, {
                report_type: reportType,
                report_type_id: targetId,
                report_description: buildReportDescription(reportType, reason, details),
            });
            showToast({ type: "success", message: "Report submitted. Thank you for letting us know." });
            onClose();
        } catch (error) {
            showToast({ type: "error", message: getApiErrorMessage(error, "Couldn't submit your report. Please try again.") });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CenterModal
            title={TITLES[reportType](subjectName)}
            zIndex={2000}
            isOpen={isOpen}
            onClose={onClose}
            width={isMobile ? "95%" : isTablet ? "60%" : "40%"}
            loading={isSubmitting}
            customClassName="max-h-[85vh] !rounded-2xl overflow-y-auto max-md:!max-w-[95vw]"
            headerClassName="max-md:!p-3"
            bodyClassName="max-md:!p-3"
            footerClassName="max-md:!p-3"
            secondaryActionProps={{ onClick: onClose, title: "Cancel", btnVariant: "outline", customClassName: "!rounded-xl" }}
            primaryActionProps={{
                onClick: handleSubmit,
                title: isSubmitting ? "Submitting report" : "Submit report",
                btnVariant: "primary",
                customClassName: "!rounded-xl",
                disabled: isSubmitting,
            }}
        >
            <p className="text-base mb-1">What happened? Your report helps keep MelodyWings safe.</p>
            <p className="text-sm text-gray-600 mb-4">
                {WHO_SEES[reportType]} The other person isn&apos;t told that you reported them.
            </p>
            <Radio.Group
                name="person_report_reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full"
                aria-label="Reason for your report"
            >
                <div className="flex flex-col gap-2 w-full">
                    {reasonsFor(reportType).map((option) => (
                        <div
                            key={option.value}
                            className={`flex w-full items-center bg-background-input p-2 rounded-lg border ${
                                reason === option.value ? "border-black" : "border-transparent"
                            }`}
                        >
                            <Radio className="w-full" value={option.value}>
                                {option.label}
                            </Radio>
                        </div>
                    ))}
                </div>
            </Radio.Group>
            <Input
                name="person_report_details"
                inputType="textarea"
                value={details}
                inputClassName="mt-4"
                placeholder={reason === "other" ? "Please tell us what happened" : "Add details (optional)"}
                onChange={(value: string) => setDetails(value)}
            />
            <p className="text-xs text-gray-600 mt-4">
                Reports aren&apos;t reviewed in real time. If someone is in immediate danger, contact your local emergency
                services.
            </p>
        </CenterModal>
    );
};

export default ReportPersonModal;
