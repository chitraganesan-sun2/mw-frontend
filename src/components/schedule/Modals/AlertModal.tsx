import { Input } from "@/components/common/Input";
import CenterModal from "@/components/common/Modals/CenterModal";
import { alertModalConstants } from "@/constants/schedule";
import { AlertModalProps } from "./index.type.d";

const AlertModal = ({ isOpen, onClose, onProceed, onCancel, value, onChange }: AlertModalProps) => {

    return (
        <CenterModal
            topContent={<p className='text-sm'>{alertModalConstants.content}</p>}
            title={alertModalConstants.title}
            titleClassName='text-error'
            isOpen={isOpen}
            onClose={onClose}
            width='40%'
            customClassName="!rounded-3xl"
            // CenterModal renders secondaryActionProps first; here that slot holds the
            // action ("Proceed") and the primary slot holds "Cancel", so the variants are
            // set explicitly: Cancel = black outline, Proceed = the viewer's role fill.
            secondaryActionProps={{
                onClick: onProceed,
                title: "Proceed",
                btnVariant: "primary",
                customClassName: "!rounded-xl",
            }}
            primaryActionProps={{
                onClick: onCancel,
                title: "Cancel",
                btnVariant: "outline",
                customClassName: "!rounded-xl",
            }}
        >
            <Input
                placeholder={alertModalConstants.placeholder}
                inputType='textarea'
                name='notes'
                value={value}
                onChange={onChange}
                inputClassName='!rounded-lg'
                rows={alertModalConstants.rows}
            />
        </CenterModal>
    );
};

export default AlertModal;
