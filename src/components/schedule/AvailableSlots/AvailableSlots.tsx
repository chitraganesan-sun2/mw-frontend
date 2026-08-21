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
import { useAppStore } from "@/store/useAppStore";
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
    console.log("availableSlots", availableSlots);


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
    const timezoneMapping: Record<string, string> = {
        AKST: "America/Anchorage",
        AKDT: "America/Anchorage",
        AST: "America/Halifax",
        ADT: "America/Halifax",
        CST: "America/Chicago",
        CDT: "America/Chicago",
        EST: "America/New_York",
        EDT: "America/New_York",
        HST: "Pacific/Honolulu",
        HDT: "Pacific/Honolulu",
        MST: "America/Denver",
        MDT: "America/Denver",
        MT: "America/Denver",
        NST: "America/St_Johns",
        NDT: "America/St_Johns",
        PST: "America/Los_Angeles",
        PDT: "America/Los_Angeles",
        PT: "America/Los_Angeles",
        CT: "America/Chicago",
        ET: "America/New_York",
        IST: "Asia/Kolkata",
    };

    const userProfileTimezone = isVolunteer
        ? data?.volunteer_contact_details?.timezone
        : data?.learner_personal_info?.learner_contact_details?.timezone;

    // Handle full timezone strings like "MST - Mountain Standard Time (UTC-07:00)"
    const tzKey = userProfileTimezone?.split(" - ")[0] || "";
    const userIANA = (tzKey && timezoneMapping[tzKey]) || (userProfileTimezone && !userProfileTimezone.includes(" ") ? userProfileTimezone : dayjs.tz.guess());

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
                ) : (
                    <p className="text-xs font-normal mb-2 -mt-2 text-gray-400">
                        {fetchingSlots ? (
                            <span>Fetching slots...</span>
                        ) : selectedDate ? (
                            <span>No slots available for this date.</span>
                        ) : (
                            <span>To see available slots, select a volunteer and date.</span>
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
                        const tz = volunteerTimezone || userIANA;
                        const abbr = dayjs.tz(`${selectedDate} ${slot.start_time}`, tz).format("z");

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
            {isSlotsAvailable && <p className="text-xs text-red-500 mt-1">{errors}</p>}
        </div>
    );
};

export default AvailableSlotsRadioGroup;
