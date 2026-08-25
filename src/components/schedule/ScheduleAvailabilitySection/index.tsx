"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useAppStore } from "@/store/useAppStore";
import ChevronRightIcon from "@/assets/icons/ChevronRightIcon";
import Button from "@/components/common/Button";
import { useScheduleSlots } from "@/hooks/schedule/useScheduleSlots";
import ScheduleSlotEditor from "@/components/schedule/ScheduleSlotEditor";
import { summarizeAvailability } from "@/utils/scheduleAvailability";

interface ScheduleAvailabilitySectionProps {
    role: "volunteer" | "learner";
}

// New always-visible entry point to the same availability editor MyScheduleModal opens as a
// side panel - collapsed by default with a bullet-point summary, expands inline to the same
// day-by-day editor (via useScheduleSlots/ScheduleSlotEditor, shared with MyScheduleModal).
const ScheduleAvailabilitySection: React.FC<ScheduleAvailabilitySectionProps> = ({ role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const { volunteerUtcOffset, volunteerTimeZone, learnerUtcOffset, learnerTimeZone } = useAppStore();

    const utcOffset = role === "volunteer" ? volunteerUtcOffset : learnerUtcOffset;
    const timeZoneLabel = role === "volunteer" ? volunteerTimeZone : learnerTimeZone;
    const getEndpoint = role === "volunteer" ? endpoints.volunteer_slot.get : endpoints.learner_slot.get;
    const updateEndpoint = role === "volunteer" ? endpoints.volunteer_slot.update : endpoints.learner_slot.update;
    const eventsQueryKey = role === "volunteer" ? "volunteer-events" : "learner-events";

    // Drives the closed-state summary independently of the editor's own fetch (which only
    // runs while isOpen, matching MyScheduleModal's existing semantics) - one extra cheap
    // GET while collapsed, in exchange for reusing useScheduleSlots completely unmodified.
    const { data: summaryBullets = [] } = useQuery({
        queryKey: [`${role}-slot-summary`],
        queryFn: async () => {
            const res: any = await GET_API(getEndpoint);
            const slotsData = Array.isArray(res?.data) ? res.data : [];
            return summarizeAvailability(slotsData, timeZoneLabel);
        },
        enabled: !isOpen,
    });

    const slotState = useScheduleSlots({
        role,
        isActive: isOpen,
        getEndpoint,
        updateEndpoint,
        utcOffset,
        invalidateKey: [role === "volunteer" ? "volunteer_slot" : "learner_slot"],
        onSaveSuccess: () => {
            setIsOpen(false);
            queryClient.invalidateQueries({ queryKey: [eventsQueryKey] });
            queryClient.invalidateQueries({ queryKey: [`${role}-slot-summary`] });
        },
    });

    return (
        <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <p className="font-medium">Schedule my Availability</p>
                <ChevronRightIcon className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </div>
            {!isOpen && (
                <div className="flex flex-col gap-1 mt-3">
                    {summaryBullets.length > 0 ? (
                        summaryBullets.map((bullet, index) => (
                            <p key={index} className="text-sm text-gray-light">
                                {bullet}
                            </p>
                        ))
                    ) : (
                        <p className="text-sm text-gray-light">No availability set yet.</p>
                    )}
                </div>
            )}
            {isOpen && (
                <>
                    <ScheduleSlotEditor {...slotState} />
                    <div className="flex items-center gap-2 px-5 pb-4">
                        <Button
                            onClick={() => setIsOpen(false)}
                            title="Cancel"
                            customClassName="!bg-white !border !border-gray-200 !text-black"
                        />
                        <Button
                            onClick={() => slotState.onSave({})}
                            title="Save Schedule"
                            disabled={slotState.hasErrors()}
                            loading={slotState.isPending}
                            customClassName="!bg-black !text-white"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ScheduleAvailabilitySection;
