import { formatTime } from "@/utils/calender";
import { Radio, Skeleton } from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getCookie } from "@/utils/auth";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { shortTimeZone } from "@/utils/sessionDisplay";
dayjs.extend(utc);
dayjs.extend(timezone);

const AvailableSlotsRadioGroup: React.FC<AvailableSlotsRadioGroupProps> = ({
    availableSlots,
    selectedSlot,
    onSlotSelect,
    errors,
    slotError,
    fetchingSlots,
    selectedDate,
    volunteerTimezone,
}) => {
    const [isSlotsAvailable, setIsSlotsAvailable] = useState(false);


    const role = getCookie("role");
    const volunteerId = getCookie("volunteer_id");
    const learnerId = getCookie("learner_id");
    const isVolunteer = role === "volunteer";



    const getUserDetails = async () => {
        const endpoint = isVolunteer
            ? endpoints.volunteer.getIndividualVolunteer(volunteerId as string)
            : endpoints.learner.getIndividualLearner(learnerId as string);
        const { status, data } = await GET_API(endpoint);

        if (status !== 200 || !data) return null;


        return data;
    };

    const queryKey = isVolunteer
        ? ["volunteerDetails", volunteerId]
        : ["learnerDetails", learnerId];
    const { data } = useQuery({
        queryKey: queryKey,
        queryFn: async () => await getUserDetails(),
    });
    const userProfileTimezone = isVolunteer
        ? data?.volunteer_contact_details?.timezone
        : data?.learner_personal_info?.learner_contact_details?.timezone;

    // Slot times are in the viewer's profile timezone. `volunteerTimezone` (a profile label or
    // an IANA name) overrides it; shortTimeZone gives the DST-correct abbreviation for the
    // date, and "IST"/"NDT" instead of Intl's "GMT+5:30"/"GMT-2:30".
    const tzSource = volunteerTimezone || userProfileTimezone || dayjs.tz.guess();

    // No filtering needed - showing all slots from API as requested.
    const displaySlots = availableSlots;

    useEffect(() => {
        setIsSlotsAvailable(displaySlots.length > 0);
    }, [displaySlots.length]);

    if (!isSlotsAvailable) {
        return (
            <div>
                {slotError ? (
                    <p className="text-xs font-normal -mt-2 mb-2 text-red-500">{slotError}</p>
                ) : errors && selectedDate ? (
                    <p role="alert" className="text-xs font-normal -mt-2 mb-2 text-red-700">{errors}</p>
                ) : (
                    <p className="text-xs font-normal mb-2 -mt-2 text-gray-400">
                        {fetchingSlots ? (
                            <span>Loading slots...</span>
                        ) : selectedDate ? (
                            <span>No slots available for this date.</span>
                        ) : (
                            <span>To see available slots, select a date.</span>
                        )}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="mb-4">
            <p className="text-sm font-medium mb-2">Available Slots:</p>
            <Radio.Group
                size="small"
                onChange={(e) => {
                    const selectedSlot = displaySlots.find(
                        (slot) => slot.volunteer_slot_id === e.target.value
                    );
                    if (selectedSlot) {
                        onSlotSelect(
                            e.target.value,
                            selectedSlot.start_time,
                            selectedSlot.end_time
                        );
                    }
                }}
                value={selectedSlot}
            >
                <div className="flex gap-3 flex-wrap">
                    {displaySlots.map((slot) => {
                        const abbr = shortTimeZone(tzSource, selectedDate);

                        return (
                            <Radio
                                key={slot.volunteer_slot_id}
                                value={slot.volunteer_slot_id}
                                className="text-sm !text-[#16A34A] font-medium underline whitespace-nowrap"
                            >
                                {`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)} ${abbr}`}
                            </Radio>
                        );
                    })}
                </div>
            </Radio.Group>
            {isSlotsAvailable && errors && (
                <p role="alert" className="text-xs text-red-700 mt-1">
                    {errors}
                </p>
            )}
        </div>
    );
};

export default AvailableSlotsRadioGroup;
