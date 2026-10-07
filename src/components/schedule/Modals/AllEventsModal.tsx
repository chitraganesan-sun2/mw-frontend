import CenterModal from "@/components/common/Modals/CenterModal";
import EventCard from "../Calender/EventCard";
import { AllEventsModalProps } from "./index.type.d";

const AllEventsModal = ({ isOpen, onClose, data, onEventClick }: AllEventsModalProps) => {
    return (
        <CenterModal
            title={`Schedule - ${data.date}`}
            isOpen={isOpen}
            onClose={onClose}
            width="40%"
            customClassName="!rounded-3xl"
            rootClassName="!rounded-3xl overflow-hidden"
            hideFooter={true}
        >
            <div className="flex flex-col gap-2 py-5 ">
                {[...data.events]
                    .sort((a, b) => (a?.start?.getTime?.() ?? 0) - (b?.start?.getTime?.() ?? 0))
                    .map((event, index) => {
                    return (
                        <EventCard
                            key={event?._def?.id || index}
                            title={event?._def?.title}
                            style={event?._def?.ui}
                            status={event?._def?.extendedProps?.status}
                            time=""
                            start={event?.start}
                            end={event?.end}
                            className="!p-2 rounded-md border !cursor-pointer"
                            onEventClick={(e) => onEventClick(e?.currentTarget, event)}
                        />
                    );
                    })}
            </div>
        </CenterModal>
    );
};

export default AllEventsModal;
