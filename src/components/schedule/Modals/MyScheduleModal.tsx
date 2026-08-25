"use client";
import { endpoints } from "@/api/constants";
import SideModal from "@/components/common/Modals/SideModal";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import InnerWidth from "@/utils/innerWidth";
import { useScheduleSlots } from "@/hooks/schedule/useScheduleSlots";
import ScheduleSlotEditor from "@/components/schedule/ScheduleSlotEditor";
import type { MyScheduleModalProps } from "./index.type";

const MyScheduleModal: React.FC<MyScheduleModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const { volunteerUtcOffset } = useAppStore();
    const isMobileScreen = InnerWidth() < 768;

    const slotState = useScheduleSlots({
        role: "volunteer",
        isActive: isOpen,
        getEndpoint: endpoints.volunteer_slot.get,
        updateEndpoint: endpoints.volunteer_slot.update,
        utcOffset: volunteerUtcOffset,
        invalidateKey: ["volunteer_slot"],
        onSaveSuccess: () => {
            onClose();
            queryClient.invalidateQueries({ queryKey: ["volunteer-events"] });
        },
    });

    return (
        <SideModal
            title={isMobileScreen ? "" : "My Schedule"}
            onClose={onClose}
            saveButtonText="Save Schedule"
            cancelButtonText="Cancel"
            isOpen={isOpen}
            onSave={() => slotState.onSave({})}
            onCancel={onClose}
            isDisabled={slotState.hasErrors()}
            isLoading={slotState.isPending}
            modalWidth={430}
            hideHeaderDividerOnMobile
            mobileBgGray
        >
            <ScheduleSlotEditor {...slotState} />
        </SideModal>
    );
};

export default MyScheduleModal;
