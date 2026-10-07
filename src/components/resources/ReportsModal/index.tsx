import { Input } from "@/components/common/Input";
import CenterModal from "@/components/common/Modals/CenterModal";

import { useEffect, useState } from "react";

import { reportResource } from "@/api/resources";
import { showToast } from "@/components/common/Toast";
import { Radio } from "antd";
import { useWindowSize } from "@/hooks/useWindowSize";

type ResourceReportModalProps = {
    isOpen: boolean;
    resourceId: string;
    onClose: () => void;
};

const options = [
    { label: "Inappropriate Content", value: "inappropriate_content" },
    { label: "Spam or Advertising", value: "spam_or_advertising" },
    { label: "Misinformation", value: "misinformation" },
    { label: "Other", value: "others" },
];

const ResourceReportModal = ({ resourceId, isOpen, onClose }: ResourceReportModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [reportType, setReportType] = useState<string>("");
    const [reportDescription, setReportDescription] = useState<string>("");

    useEffect(() => {
        setReportDescription("");
        setReportType("");
    }, [isOpen]);

    const handleSubmit = async () => {
        let message = "";

        if (!reportType) message = "Please select a reason for your report.";
        if (reportType === "others" && !reportDescription) message = "Description is required";
        if (!resourceId) message = "Resource ID is missing";

        if (message) {
            showToast({ type: "error", message: message });
            return;
        }

        setIsSubmitting(true);
        const payload = {
            report_type_id: resourceId,
            report_status: "pending",
            report_type: "resource",
            report_description:
                reportType === "others" ? `Others - ${reportDescription}` : reportType,
        };

        try {
            const isSuccess = await reportResource(payload);
            showToast({
                type: isSuccess ? "success" : "error",
                message: isSuccess ? "Report Submitted!" : "Report Not Submitted!",
            });

            if (isSuccess) onClose();
        } catch (error) {
            showToast({ type: "error", message: "Something went wrong!" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const buttonProps = {
        secondary: {
            onClick: onClose,
            title: "Cancel",
            btnVariant: "outline",
            customClassName: "!rounded-xl",
        },
        primary: {
            onClick: handleSubmit,
            title: isSubmitting ? "Submiting Report" : "Submit Report",
            btnVariant: "primary",
            customClassName: "!rounded-xl",
            disabled: isSubmitting,
        },
    };
    const { width } = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    return (
        <CenterModal
            title={"Why do you want to report this resource?"}
            zIndex={2000}
            isOpen={isOpen}
            onClose={onClose}
            width={isMobile ? "95%" : isTablet ? "60%" : "40%"}
            loading={isSubmitting}
            customClassName="max-h-[80vh] !rounded-2xl overflow-hidden max-md:!max-w-[95vw]"
            headerClassName="max-md:!p-3"
            bodyClassName="max-md:!p-3"
            footerClassName="max-md:!p-3"
            secondaryActionProps={buttonProps.secondary}
            primaryActionProps={buttonProps.primary}
        >
            <p className="text-base mb-4">
                Help us keep MelodyWings resources accurate and safe. Please select a reason for reporting this resource.
            </p>
            <div>
                <Radio.Group
                    name="report_type"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full"
                >
                    <div className="flex flex-col items-center gap-2 w-full h-full">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`flex w-full items-center hover:bg-background-input bg-background-input p-2 rounded-lg border ${
                                    reportType === option.value && "border-black"
                                }`}
                            >
                                <Radio className="w-full" value={option.value}>
                                    <div>
                                        <span>{option.label}</span>
                                    </div>
                                </Radio>
                            </div>
                        ))}
                    </div>
                </Radio.Group>
                {reportType === "others" && (
                    <Input
                        name="description"
                        inputType="textarea"
                        value={reportDescription}
                        inputClassName="mt-5"
                        placeholder="Please tell us the details"
                        onChange={(event) => setReportDescription(event)}
                    />
                )}
            </div>
        </CenterModal>
    );
};

export default ResourceReportModal;
