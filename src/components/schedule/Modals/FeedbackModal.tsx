"use client";

import { FeedModalCloseIcon } from "@/assets/icons";
import Button from "@/components/common/Button";
import DetailsSection from "@/components/common/DetailsSection";
import Divider from "@/components/common/Divider";
import { Input } from "@/components/common/Input";
import CenterModal from "@/components/common/Modals/CenterModal";
import MobileSideModal from "@/components/common/Modals/MobileSideModal";
import { showToast } from "@/components/common/Toast";
import { LearnerFeedbackFormConstants } from "@/constants/schedule";
import { useAppStore } from "@/store/useAppStore";
import InnerWidth from "@/utils/innerWidth";
import { cn } from "@/utils/merge-class";
import { getCookie } from "@/utils/auth";
import { useEffect, useState } from "react";
import { FeedbackModalProps } from "./index.type.d";
import { formatDisplayDate, DISPLAY_DATE_FORMAT } from "@/utils/timeFunctions";

const FeedbackModal = ({
    isOpen,
    mode = "view",
    onClose,
    onSubmit,
    Loading,
}: FeedbackModalProps) => {
    const innerWidth = InnerWidth();
    const isMobileScreen = innerWidth < 768;
    const isTabletScreen = innerWidth < 1024;

    const [formData, setFormData] = useState<any>({});
    const { eventDetails } = useAppStore();
    const feedbackTitle = mode === "edit" ? "Edit Feedback" : "Please Fill the Feedback";
    const role = getCookie("role");

    const feedBackEventDetails = {
        Name: role === "volunteer" ? eventDetails?.learner_name : eventDetails?.volunteer_name,
        Date: formatDisplayDate(new Date()),
        Time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }),
    };

    // Only bail out when actually opened without a session to give feedback on. This ran on
    // every mount (the modal is always mounted on the schedule pages), calling the page's
    // onClose -> router.push("?current_month=<store month>") on each load, which blanked
    // current_month and dropped deep-link params like ?modal=my_availability.
    // Start every feedback form empty - the previous session's rating/notes used to stay
    // prefilled when the modal opened for the next session.
    useEffect(() => {
        if (isOpen) setFormData({});
    }, [isOpen, eventDetails?.session_id]);

    useEffect(() => {
        if (!isOpen) return;
        const userId = role === "volunteer" ? eventDetails?.learner_id : eventDetails?.volunteer_id;
        if (!userId || userId === "") {
            onClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleSubmit = () => {
        if (Loading) return; // in flight - ignore repeat clicks
        const submissionData = {
            ...formData,
            image: [
                {
                    image_url: "",
                    image_id: "",
                },
            ],
        };
        if (!submissionData?.notes || !submissionData?.rating || !submissionData?.classDuration) {
            showToast({ message: "Please fill the feedback", type: "error" });
            return;
        }

        onSubmit(submissionData);
    };

    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const buttonProps = {
        secondary: {
            onClick: onClose,
            title: mode === "view" ? "Delete" : "Cancel",
            btnVariant: "tertiary" as const,
            customClassName: cn(
                mode === "view"
                    ? "!text-error !bg-error-light !border-none"
                    : "!bg-transparent !text-black",
                "!rounded-xl"
            ),
        },
        primary: {
            onClick: handleSubmit,
            title: mode === "view" ? "Edit" : "Submit",
            btnVariant: "secondary" as const,
            customClassName: "!rounded-xl hover:!bg-black hover:!text-white",
            isPrimary: true,
        },
    };

    return isMobileScreen ? (
        <MobileSideModal placement="left" isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col justify-between h-full">
                <div className="p-4 flex items-center justify-between">
                    <Button aria-label="Close"
                        onClick={onClose}
                        customClassName="!bg-transparent !border-none !p-0 !w-fit !h-fit"
                    >
                        <FeedModalCloseIcon width="30" height="30" />
                    </Button>
                    <div className="flex gap-2">
                        {Object.values(buttonProps)?.map((button) => (
                            <Button
                                key={button?.title}
                                title={button?.title}
                                btnVariant={button?.btnVariant}
                                onClick={button?.onClick}
                                // Mobile Submit had no loading/disabled state -> double submits.
                                loading={"isPrimary" in button ? Loading : undefined}
                                disabled={Boolean(Loading)}
                            />
                        ))}
                    </div>
                </div>
                <Divider />
                <div className="h-full p-4 flex flex-col gap-4 bg-background-input">
                    <h6 className="text-xl font-medium">Please Fill the Feedback</h6>
                    {/* <DetailsSection data={feedBackEventDetails} /> */}
                    <div className="flex flex-col gap-4 mt-3">
                        {LearnerFeedbackFormConstants.map((field: any) => (
                            <Input
                                key={field.name}
                                {...field}
                                value={formData[field.name]}
                                onChange={(value: any) => handleChange(field.name, value)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </MobileSideModal>
    ) : (
        <CenterModal
            title={feedbackTitle}
            isOpen={isOpen}
            onClose={onClose}
            topContent={<DetailsSection data={feedBackEventDetails} />}
            width={isTabletScreen ? "80%" : "40%"}
            secondaryActionProps={buttonProps.secondary}
            primaryActionProps={{
                onClick: buttonProps.primary.onClick,
                title: buttonProps.primary.title,
                btnVariant: buttonProps.primary.btnVariant,
                customClassName: buttonProps.primary.customClassName,
            }}
            loading={Loading}
        >
            <div className="flex flex-col max-lg:gap-2">
                {LearnerFeedbackFormConstants.map((field: any) => (
                    <Input
                        key={field.name}
                        {...field}
                        value={formData[field.name]}
                        onChange={(value: any) => handleChange(field.name, value)}
                    />
                ))}
            </div>
        </CenterModal>
    );
};

export default FeedbackModal;
