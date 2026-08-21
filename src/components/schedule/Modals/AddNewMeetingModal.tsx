"use client";
import { endpoints } from "@/api/constants";
import { GET_API, POST_API } from "@/api/request";
import { Input } from "@/components/common/Input";
import SideModal from "@/components/common/Modals/SideModal";
import {
    LearnerScheduleModalConstants,
    LearnerScheduleModalDescriptionConstants,
} from "@/constants/schedule";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useEffect, useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

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
import AvailableSlots from "../AvailableSlots/AvailableSlots";
import { useSearchParams } from "next/navigation";
import { useSendData } from "@/hooks/useReactQuery";
import { z } from "zod";
import InnerWidth from "@/utils/innerWidth";
import { showToast } from "@/components/common/Toast";
import { getCookie } from "@/utils/auth";

// Define Zod schema for form validation
const meetingFormSchema = z.object({
    title_of_the_meeting: z.string().min(1, "Meeting title is required"),
    select_volunteer: z.string().min(1, "Please select a volunteer"),
    select_date: z
        .union([z.string(), z.date(), z.null()])
        .refine((val) => val !== null && val !== "", {
            message: "Please select a date",
        }),
    start_time: z.string(),
    end_time: z.string(),
    google_meet_link: z.string(),
    description: z.string().min(1, "Description is required"),
    selected_slot: z.string().min(1, "Please select a time slot"),
});

// Infer TypeScript type from schema
type FormData = z.infer<typeof meetingFormSchema>;

interface AddNewMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddNewMeetingModal({ isOpen, onClose }: AddNewMeetingModalProps) {
    const [formData, setFormData] = useState<FormData>({
        title_of_the_meeting: "",
        select_volunteer: "",
        select_date: "",
        start_time: "",
        end_time: "",
        google_meet_link: "",
        description: "",
        selected_slot: "",
    });
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);

    const [fetchingVolunteers, setFetchingVolunteers] = useState<boolean>(false);
    const [volunteers, setVolunteers] = useState<Array<{ label: string; value: string }>>([]);
    const searchParams = useSearchParams();
    const volunteerId = searchParams.get("volunteerId");
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [slotError, setSlotError] = useState<string>("");
    const [fetchingSlots, setFetchingSlots] = useState<boolean>(false);
    const [volunteerAvailableDays, setVolunteerAvailableDays] = useState<string[]>([]);
    const [volunteerAvailableDates, setVolunteerAvailableDates] = useState<string[]>([]);
    const [volunteerUnavailableDates, setVolunteerUnavailableDates] = useState<string[]>([]);
    const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>("");
    const [isLoadingAvailableDays, setIsLoadingAvailableDays] = useState(false);
    const [currentMonth, setCurrentMonth] = useState<string>(dayjs().format("YYYY-MM"));
    const learnerId = getCookie("learner_id");

    const getVolunteers = async () => {
        setFetchingVolunteers(true);
        const response = await GET_API(endpoints.volunteer.getAllVolunteers);
        const volunteerOptions = response.data.items.map((volunteer: any) => ({
            label: volunteer.volunteer_first_name + " " + volunteer.volunteer_last_name,
            value: volunteer.volunteer_id,
        }));
        if (volunteerId) {
            const volunteer = volunteerOptions.find(
                (volunteer: any) => volunteer.value === volunteerId
            );
            if (volunteer) {
                setFormData((prev) => ({ ...prev, select_volunteer: volunteer.value }));
            }
        }
        setVolunteers(volunteerOptions);
        setFetchingVolunteers(false);
    };

    const getIndividualVolunteer = async () => {
        const { data } = await GET_API(
            endpoints.volunteer.getIndividualVolunteer(volunteerId || "")
        );
        setFormData((prev) => ({ ...prev, select_volunteer: data?.volunteer_id }));
        setVolunteers([
            {
                label: data?.volunteer_first_name + " " + data?.volunteer_last_name,
                value: data?.volunteer_id,
            },
        ]);
    };

    const { data } = useQuery({
        queryKey: ["volunteers"],
        queryFn: () => (volunteerId ? getIndividualVolunteer() : getVolunteers()),
        enabled: isOpen,
    });

    const getAvailableDays = async () => {
        try {
            if (!selectedVolunteerId || !currentMonth) return [];
            setIsLoadingAvailableDays(true);
            const response = await GET_API(
                endpoints.volunteer_slot.availableDays(selectedVolunteerId, currentMonth)
            );
            console.log("Raw API Response:", response.data);

            // Make sure we're getting the array directly
            const availableDays = Array.isArray(response.data)
                ? response.data
                : response.data.available_days;

            // Handle available and unavailable dates
            const availableDates = response.data.available_dates || [];
            const unavailableDates = response.data.unavailable_dates || [];

            console.log("Processed Available Days:", availableDays);
            console.log("Available Dates:", availableDates);
            console.log("Unavailable Dates:", unavailableDates);

            setVolunteerAvailableDays(availableDays);
            setVolunteerAvailableDates(availableDates);
            setVolunteerUnavailableDates(unavailableDates);
            setIsLoadingAvailableDays(false);
            return availableDays;
        } catch (error) {
            console.error("Error fetching available days:", error);
            setIsLoadingAvailableDays(false);
            return [];
        }
    };

    const { refetch: refetchAvailableDays } = useQuery({
        queryKey: ["availableDays", selectedVolunteerId, currentMonth],
        queryFn: getAvailableDays,
        enabled: false, // Don't auto-fetch, only fetch when calendar opens
    });

    const handleChange = async (name: string, value: any) => {
        const processedValue = name === "select_date" && !value ? null : value;

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));

        // Clear error for the field being changed
        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));

        // If changing date or volunteer, reset slot selection and its error
        if (name === "select_date" || name === "select_volunteer") {
            setFormData((prev) => ({
                ...prev,
                selected_slot: "",
                start_time: "",
                end_time: "",
            }));

            // Clear available slots and set error when date is cleared
            if (name === "select_date" && !value) {
                setAvailableSlots([]);
                setSlotError("Please select a date first");
                return;
            }
        }

        // Validate single field
        try {
            const fieldSchema = meetingFormSchema.pick({ [name]: true } as any);
            fieldSchema.parse({ [name]: processedValue });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldError = error.errors[0];
                setErrors((prev) => ({
                    ...prev,
                    [name]: fieldError.message,
                }));
            }
        }

        // Check for date selection and if we have a selected volunteer
        if (name === "select_date" && value && formData.select_volunteer) {
            const formattedDate = dayjs(value).format("YYYY-MM-DD");
            setAvailableSlots([]);
            setSlotError("");
            setFetchingSlots(true);
            try {
                const response = await GET_API(
                    endpoints.volunteer_slot.availableSlots(
                        formData.select_volunteer,
                        formattedDate
                    )
                );
                if (response.data.slots.length === 0) {
                    setSlotError("No slots available for this date");
                    setAvailableSlots([]);
                    setFetchingSlots(false);
                } else {
                    setAvailableSlots(response.data.slots);
                    setSlotError("");
                    setFetchingSlots(false);
                }
            } catch (error) {
                setAvailableSlots([]);
                setSlotError("No slots available for this date");
                setFetchingSlots(false);
                console.error("Error fetching available slots:", error);
            }
        }
    };

    const getFieldProps = (field: any) => {
        if (field?.name === "select_volunteer") {
            return {
                ...field,
                options: volunteers,
                isLoading: fetchingVolunteers,
            };
        }
        return field;
    };

    const handleSlotSelection = (slotId: string, startTime: string, endTime: string) => {
        setFormData((prev) => ({
            ...prev,
            selected_slot: slotId,
            start_time: startTime,
            end_time: endTime,
        }));
        setSlotError("");
        setErrors((prev) => ({
            ...prev,
            selected_slot: undefined,
        }));
    };

    const validateForm = (): boolean => {
        try {
            meetingFormSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Partial<Record<keyof FormData, string>> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as keyof FormData] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSave = async () => {
        const payload = {
            volunteer_id: formData.select_volunteer,
            volunteer_slot_id: formData.selected_slot,
            session_date: dayjs(formData.select_date).format("YYYY-MM-DD"),
            session_start_time: formData.start_time,
            session_end_time: formData.end_time,
            session_title: formData.title_of_the_meeting,
            session_description: formData.description,
            learner_id: learnerId,
        };
        return await POST_API(endpoints.session.bookSession, payload);
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: () => handleSave(),
        invalidateKey: ["learner-events"],
        success: () => {
            setFormData({
                title_of_the_meeting: "",
                select_volunteer: "",
                select_date: "",
                start_time: "",
                end_time: "",
                google_meet_link: "",
                description: "",
                selected_slot: "",
            });
            setAvailableSlots([]);
            onClose();
            showToast({
                message: "Meeting scheduled successfully",
                type: "success",
            });
        },
        error: (err) => {
            console.log("Error: ", err);
        },
    });

    const handleSubmit = () => {
        const isValid = validateForm();
        if (!isValid) {
            return;
        }
        onSave(formData);
    };

    const [volunteerTimezone, setVolunteerTimezone] = useState<string>("");

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            select_date: "",
        }));
        if (formData.select_volunteer) {
            setSelectedVolunteerId(formData.select_volunteer);

            // Fetch volunteer timezone
            const fetchVolunteerTz = async () => {
                try {
                    const { data } = await GET_API(
                        endpoints.volunteer.getIndividualVolunteer(formData.select_volunteer)
                    );
                    const tzCode = data?.volunteer_contact_details?.timezone;
                    setVolunteerTimezone(timezoneMapping[tzCode] || "UTC");
                } catch (error) {
                    console.error("Error fetching volunteer timezone:", error);
                    setVolunteerTimezone("UTC");
                }
            };
            fetchVolunteerTz();

            setFormData((prev) => ({
                ...prev,
                select_date: "",
            }));
            setAvailableSlots([]);
            // Reset to current month when volunteer changes
            setCurrentMonth(dayjs().format("YYYY-MM"));
            // Clear available days when volunteer changes (will be fetched when calendar opens)
            setVolunteerAvailableDays([]);
            setVolunteerAvailableDates([]);
            setVolunteerUnavailableDates([]);
        } else {
            setVolunteerTimezone("");
        }
    }, [formData.select_volunteer]);

    // Handle calendar open/close
    const handleDatePickerOpenChange = async (open: boolean) => {
        if (open && selectedVolunteerId) {
            // When calendar opens, determine the month to fetch
            let monthToFetch = currentMonth;
            if (formData.select_date) {
                monthToFetch = dayjs(formData.select_date).format("YYYY-MM");
            } else {
                monthToFetch = dayjs().format("YYYY-MM");
            }

            // Update currentMonth if needed
            if (monthToFetch !== currentMonth) {
                setCurrentMonth(monthToFetch);
            }

            // Fetch available days for the displayed month
            // Use setTimeout to ensure state is updated, or fetch directly with the month
            try {
                setIsLoadingAvailableDays(true);
                const response = await GET_API(
                    endpoints.volunteer_slot.availableDays(selectedVolunteerId, monthToFetch)
                );
                console.log("Raw API Response:", response.data);

                const availableDays = Array.isArray(response.data)
                    ? response.data
                    : response.data.available_days;

                const availableDates = response.data.available_dates || [];
                const unavailableDates = response.data.unavailable_dates || [];

                setVolunteerAvailableDays(availableDays);
                setVolunteerAvailableDates(availableDates);
                setVolunteerUnavailableDates(unavailableDates);
                setIsLoadingAvailableDays(false);
            } catch (error) {
                console.error("Error fetching available days:", error);
                setIsLoadingAvailableDays(false);
            }
        }
    };

    const isMobileScreen = InnerWidth() < 768;

    if (!isOpen) return null;
    return (
        <SideModal
            title="Add New Meeting"
            onClose={onClose}
            isOpen={isOpen}
            onSave={handleSubmit}
            isLoading={isPending}
            onCancel={onClose}
            modalWidth={isMobileScreen ? 600 : 400}
            loading={fetchingVolunteers}
        >
            <div className="flex flex-col max-lg:gap-3 px-5 mt-7">
                {LearnerScheduleModalConstants.map((field: any) => {
                    const availableDaysForField =
                        field.name === "select_date" ? volunteerAvailableDays : undefined;
                    const availableDatesForField =
                        field.name === "select_date" ? volunteerAvailableDates : undefined;
                    const unavailableDatesForField =
                        field.name === "select_date" ? volunteerUnavailableDates : undefined;

                    console.log(`Field ${field.name} availableDays:`, availableDaysForField);
                    console.log(`Field ${field.name} availableDates:`, availableDatesForField);
                    console.log(`Field ${field.name} unavailableDates:`, unavailableDatesForField);

                    if (field.name === "select_date" && selectedVolunteerId === "") return null;

                    return (
                        <Input
                            key={field.name}
                            {...getFieldProps(field)}
                            onChange={(value: any) => handleChange(field.name, value)}
                            value={formData[field.name as keyof FormData]}
                            required={field.required}
                            disabled={field.name === "select_volunteer" && volunteerId}
                            error={errors[field.name as keyof FormData]}
                            availableDays={availableDaysForField}
                            availableDates={availableDatesForField}
                            unavailableDates={unavailableDatesForField}
                            isLoading={
                                field.name === "select_date" ? isLoadingAvailableDays : false
                            }
                            onOpenChange={
                                field.name === "select_date"
                                    ? handleDatePickerOpenChange
                                    : undefined
                            }
                            onPanelChange={
                                field.name === "select_date"
                                    ? async (value: any, mode: any) => {
                                        // Prevent multiple requests when user clicks month/year arrows rapidly
                                        if (isLoadingAvailableDays) return;
                                        // When panel changes (month navigation), fetch available days for the new month
                                        // value is a dayjs object representing the displayed month/year
                                        if (value && selectedVolunteerId) {
                                            // Extract month from the value - value is a dayjs object from Ant Design
                                            let newMonth: string;

                                            // Handle dayjs object (from Ant Design DatePicker)
                                            if (dayjs.isDayjs(value)) {
                                                newMonth = value.format("YYYY-MM");
                                            } else if (
                                                value &&
                                                typeof value.format === "function"
                                            ) {
                                                // If it has format method, it's likely dayjs
                                                newMonth = value.format("YYYY-MM");
                                            } else if (
                                                value &&
                                                typeof value.toDate === "function"
                                            ) {
                                                // If it's a dayjs object with toDate method
                                                newMonth = dayjs(value.toDate()).format(
                                                    "YYYY-MM"
                                                );
                                            } else {
                                                // Fallback - try to parse as dayjs or moment
                                                const parsed = dayjs(value);
                                                newMonth = parsed.isValid()
                                                    ? parsed.format("YYYY-MM")
                                                    : dayjs(value).format("YYYY-MM");
                                            }

                                            console.log(
                                                "Panel changed - new month:",
                                                newMonth,
                                                "mode:",
                                                mode,
                                                "value type:",
                                                typeof value,
                                                "isDayjs:",
                                                dayjs.isDayjs(value)
                                            );

                                            // Always update and fetch, even if month appears the same (to handle edge cases)
                                            setCurrentMonth(newMonth);

                                            // Directly fetch available days for the new month
                                            try {
                                                setIsLoadingAvailableDays(true);
                                                console.log(
                                                    "Fetching available days for month:",
                                                    newMonth,
                                                    "volunteer:",
                                                    selectedVolunteerId
                                                );
                                                const apiUrl =
                                                    endpoints.volunteer_slot.availableDays(
                                                        selectedVolunteerId,
                                                        newMonth
                                                    );
                                                console.log("API URL:", apiUrl);

                                                const response = await GET_API(apiUrl);
                                                console.log(
                                                    "API Response for month",
                                                    newMonth,
                                                    ":",
                                                    response.data
                                                );

                                                const availableDays = Array.isArray(response.data)
                                                    ? response.data
                                                    : response.data.available_days;

                                                const availableDates =
                                                    response.data.available_dates || [];
                                                const unavailableDates =
                                                    response.data.unavailable_dates || [];

                                                setVolunteerAvailableDays(availableDays);
                                                setVolunteerAvailableDates(availableDates);
                                                setVolunteerUnavailableDates(unavailableDates);
                                                setIsLoadingAvailableDays(false);
                                            } catch (error) {
                                                console.error(
                                                    "Error fetching available days for month",
                                                    newMonth,
                                                    ":",
                                                    error
                                                );
                                                setIsLoadingAvailableDays(false);
                                            }
                                        }
                                    }
                                    : undefined
                            }
                        />
                    );
                })}
                <AvailableSlots
                    availableSlots={availableSlots}
                    selectedSlot={formData.selected_slot || ""}
                    onSlotSelect={handleSlotSelection}
                    errors={errors.selected_slot || ""}
                    slotError={slotError}
                    fetchingSlots={fetchingSlots}
                    selectedDate={
                        formData.select_date
                            ? dayjs(formData.select_date).format("YYYY-MM-DD")
                            : undefined
                    }
                    volunteerTimezone={volunteerTimezone}
                />

                {LearnerScheduleModalDescriptionConstants.map((field: any) => (
                    <Input
                        key={field.name}
                        {...getFieldProps(field)}
                        onChange={(value: any) => handleChange(field.name, value)}
                        value={formData[field.name as keyof FormData]}
                        required={field.required}
                        error={errors[field.name as keyof FormData]}
                    />
                ))}
            </div>
        </SideModal>
    );
}
