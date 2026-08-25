"use client";
import { endpoints } from "@/api/constants";
import SideModal from "@/components/common/Modals/SideModal";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import InnerWidth from "@/utils/innerWidth";
import { useScheduleSlots } from "@/hooks/schedule/useScheduleSlots";
import ScheduleSlotEditor from "@/components/schedule/ScheduleSlotEditor";
import type { MyScheduleModalProps } from "./index.type";

// Learner-side mirror of MyScheduleModal (volunteer). Same header entry point pattern
// ("Schedule my Availability" next to View Demo, opens this side panel) - previously the
// learner side only had an inline collapsed-by-default card in the page body, which
// didn't match the volunteer side's always-visible header button.
const LearnerScheduleModal: React.FC<MyScheduleModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const { learnerUtcOffset } = useAppStore();
    const isMobileScreen = InnerWidth() < 768;

    const slotState = useScheduleSlots({
        role: "learner",
        isActive: isOpen,
        getEndpoint: endpoints.learner_slot.get,
        updateEndpoint: endpoints.learner_slot.update,
        utcOffset: learnerUtcOffset,
        invalidateKey: ["learner_slot"],
        onSaveSuccess: () => {
            onClose();
            queryClient.invalidateQueries({ queryKey: ["learner-events"] });
        },
    });

    return (
        <SideModal
            title={isMobileScreen ? "" : "Schedule my Availability"}
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

export default LearnerScheduleModal;
