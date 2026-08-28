import DetailsSection from "@/components/common/DetailsSection";
import { Input } from "@/components/common/Input";
import CenterModal from "@/components/common/Modals/CenterModal";
import { TestimonialFormConstants } from "@/constants/volunteer";
import { cn } from "@/utils/merge-class";

type TestmonialModalProps = {
    isOpen: boolean;
    mode: "edit" | "create" | "view";
    onClose: () => void;
};

const TestmonialModal = ({ isOpen, mode = "view", onClose }: TestmonialModalProps) => {
    const feedbackTitle = mode === "edit" ? "Edit Testimonial" : "Upload Testimonial";
    const details = {
        Name: "John Doe",
        Subject: "Music",
    };

    const handleSubmit = () => {
    };

    return (
        <CenterModal
            title={feedbackTitle}
            isOpen={isOpen}
            onClose={onClose}
            topContent={<DetailsSection data={details} />}
            width='40%'
            customClassName='max-h-[80vh] !rounded-2xl overflow-hidden'
            secondaryActionProps={{
                onClick: handleSubmit,
                title: mode === "view" ? "Edit" : "Submit",
                customClassName: "!rounded-xl hover:!bg-black hover:!text-white",
            }}
            primaryActionProps={{
                onClick: onClose,
                title: mode === "view" ? "Delete" : "Cancel",
                btnVariant: "secondary",
                customClassName: cn(
                    mode === "view"
                        ? "!text-error !bg-error-light !border-none"
                        : "!bg-transparent !text-black",
                    "!rounded-xl"
                ),
            }}
        >
            {mode !== "view" ? (
                TestimonialFormConstants.map((field: any) => (
                    <Input key={field.name} {...field} onChange={() => {}} />
                ))
            ) : (
                <div>View</div>
            )}
        </CenterModal>
    );
};

export default TestmonialModal;
