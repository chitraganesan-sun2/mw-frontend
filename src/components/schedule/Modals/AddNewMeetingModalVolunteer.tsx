"use client";
import { endpoints } from "@/api/constants";
import { GET_API, POST_API } from "@/api/request";
import { Input } from "@/components/common/Input";
import SideModal from "@/components/common/Modals/SideModal";
import {
    VolunteerScheduleModalConstants,
    VolunteerScheduleModalDescriptionConstants,
} from "@/constants/schedule";
import { useQuery } from "@tanstack/react-query";
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
    select_learner: z.string().min(1, "Please select a learner"),
    select_date: z
        .union([z.string(), z.date(), z.null()])
        .refine((val) => val !== null && val !== "", {
            message: "Please select a date",
        }),
    start_time: z.string(),
    end_time: z.string(),
    description: z.string().min(1, "Description is required"),
    selected_slot: z.string().min(1, "Please select a time slot"),
});

// Infer TypeScript type from schema
type FormData = z.infer<typeof meetingFormSchema>;

interface AddNewMeetingModalVolunteerProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Volunteer-side counterpart to AddNewMeetingModal: instead of the caller browsing a
 * selected volunteer's calendar, the caller (a volunteer) picks a learner and proposes one
 * of their own already-declared slots. See routes/v1/session.py's
 * create_volunteer_initiated_session on the backend. */
export default function AddNewMeetingModalVolunteer({
    isOpen,
    onClose,
}: AddNewMeetingModalVolunteerProps) {
    const [formData, setFormData] = useState<FormData>({
        title_of_the_meeting: "",
        select_learner: "",
        select_date: "",
        start_time: "",
        end_time: "",
        description: "",
        selected_slot: "",
    });
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);

    const [fetchingLearners, setFetchingLearners] = useState<boolean>(false);
    const [learners, setLearners] = useState<Array<{ label: string; value: string }>>([]);
    const searchParams = useSearchParams();
    const learnerId = searchParams.get("learnerId");
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [slotError, setSlotError] = useState<string>("");
    const [fetchingSlots, setFetchingSlots] = useState<boolean>(false);
    const [ownAvailableDays, setOwnAvailableDays] = useState<string[]>([]);
    const [ownAvailableDates, setOwnAvailableDates] = useState<string[]>([]);
    const [ownUnavailableDates, setOwnUnavailableDates] = useState<string[]>([]);
    const [isLoadingAvailableDays, setIsLoadingAvailableDays] = useState(false);
    const [currentMonth, setCurrentMonth] = useState<string>(dayjs().format("YYYY-MM"));
    const volunteerId = getCookie("volunteer_id") as string;

    const getLearners = async () => {
        setFetchingLearners(true);
        const response = await GET_API(endpoints.learner.getAllLearners);
        const learnerOptions = response.data.items.map((learner: any) => ({
            label:
                learner.learner_personal_info?.learner_first_name +
                " " +
                learner.learner_personal_info?.learner_last_name,
            value: learner.learner_id,
        }));
        if (learnerId) {
            const learner = learnerOptions.find((l: any) => l.value === learnerId);
            if (learner) {
                setFormData((prev) => ({ ...prev, select_learner: learner.value }));
            }
        }
        setLearners(learnerOptions);
        setFetchingLearners(false);
    };

    const getIndividualLearner = async () => {
        const { data } = await GET_API(endpoints.learner.getIndividualLearner(learnerId || ""));
        setFormData((prev) => ({ ...prev, select_learner: data?.learner_id }));
        setLearners([
            {
                label:
                    data?.learner_personal_info?.learner_first_name +
                    " " +
                    data?.learner_personal_info?.learner_last_name,
                value: data?.learner_id,
            },
        ]);
    };

    const { data } = useQuery({
        queryKey: ["learners"],
        queryFn: () => (learnerId ? getIndividualLearner() : getLearners()),
        enabled: isOpen,
    });

    const getOwnAvailableDays = async () => {
        try {
            if (!currentMonth) return [];
            setIsLoadingAvailableDays(true);
            const response = await GET_API(
                endpoints.volunteer_slot.availableDays(volunteerId, currentMonth)
            );

            const availableDays = Array.isArray(response.data)
                ? response.data
                : response.data.available_days;
            const availableDates = response.data.available_dates || [];
            const unavailableDates = response.data.unavailable_dates || [];

            setOwnAvailableDays(availableDays);
            setOwnAvailableDates(availableDates);
            setOwnUnavailableDates(unavailableDates);
            setIsLoadingAvailableDays(false);
            return availableDays;
        } catch (error) {
            console.error("Error fetching available days:", error);
            setIsLoadingAvailableDays(false);
            return [];
        }
    };

    const handleChange = async (name: string, value: any) => {
        const processedValue = name === "select_date" && !value ? null : value;

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));

        if (name === "select_date") {
            setFormData((prev) => ({
                ...prev,
                selected_slot: "",
                start_time: "",
                end_time: "",
            }));

            if (!value) {
                setAvailableSlots([]);
                setSlotError("Please select a date first");
                return;
            }
        }

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

        if (name === "select_date" && value) {
            const formattedDate = dayjs(value).format("YYYY-MM-DD");
            setAvailableSlots([]);
            setSlotError("");
            setFetchingSlots(true);
            try {
                const response = await GET_API(
                    endpoints.volunteer_slot.availableSlots(volunteerId, formattedDate)
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
        if (field?.name === "select_learner") {
            return {
                ...field,
                options: learners,
                isLoading: fetchingLearners,
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
            learner_id: formData.select_learner,
            volunteer_slot_id: formData.selected_slot,
            session_date: dayjs(formData.select_date).format("YYYY-MM-DD"),
            session_start_time: formData.start_time,
            session_end_time: formData.end_time,
            session_title: formData.title_of_the_meeting,
            session_description: formData.description,
        };
        return await POST_API(endpoints.session.bookVolunteerInitiatedSession, payload);
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: () => handleSave(),
        invalidateKey: ["volunteer-events"],
        success: () => {
            setFormData({
                title_of_the_meeting: "",
                select_learner: "",
                select_date: "",
                start_time: "",
                end_time: "",
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

    const [ownTimezone, setOwnTimezone] = useState<string>("");

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            select_date: "",
        }));

        const fetchOwnTz = async () => {
            try {
                const { data } = await GET_API(
                    endpoints.volunteer.getIndividualVolunteer(volunteerId)
                );
                const tzCode = data?.volunteer_contact_details?.timezone;
                setOwnTimezone(timezoneMapping[tzCode] || "UTC");
            } catch (error) {
                console.error("Error fetching own timezone:", error);
                setOwnTimezone("UTC");
            }
        };
        fetchOwnTz();

        setAvailableSlots([]);
        setCurrentMonth(dayjs().format("YYYY-MM"));
        setOwnAvailableDays([]);
        setOwnAvailableDates([]);
        setOwnUnavailableDates([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAvailableDaysForMonth = async (monthToFetch: string) => {
        try {
            setIsLoadingAvailableDays(true);
            const response = await GET_API(
                endpoints.volunteer_slot.availableDays(volunteerId, monthToFetch)
            );

            const availableDays = Array.isArray(response.data)
                ? response.data
                : response.data.available_days;
            const availableDates = response.data.available_dates || [];
            const unavailableDates = response.data.unavailable_dates || [];

            setOwnAvailableDays(availableDays);
            setOwnAvailableDates(availableDates);
            setOwnUnavailableDates(unavailableDates);
            setIsLoadingAvailableDays(false);
        } catch (error) {
            console.error("Error fetching available days:", error);
            setIsLoadingAvailableDays(false);
        }
    };

    // Handle calendar open/close
    const handleDatePickerOpenChange = async (open: boolean) => {
        if (open) {
            let monthToFetch = currentMonth;
            if (formData.select_date) {
                monthToFetch = dayjs(formData.select_date).format("YYYY-MM");
            } else {
                monthToFetch = dayjs().format("YYYY-MM");
            }

            if (monthToFetch !== currentMonth) {
                setCurrentMonth(monthToFetch);
            }

            await fetchAvailableDaysForMonth(monthToFetch);
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
            loading={fetchingLearners}
        >
            <div className="flex flex-col max-lg:gap-3 px-5 mt-7">
                {VolunteerScheduleModalConstants.map((field: any) => {
                    const availableDaysForField =
                        field.name === "select_date" ? ownAvailableDays : undefined;
                    const availableDatesForField =
                        field.name === "select_date" ? ownAvailableDates : undefined;
                    const unavailableDatesForField =
                        field.name === "select_date" ? ownUnavailableDates : undefined;

                    return (
                        <Input
                            key={field.name}
                            {...getFieldProps(field)}
                            onChange={(value: any) => handleChange(field.name, value)}
                            value={formData[field.name as keyof FormData]}
                            required={field.required}
                            disabled={field.name === "select_learner" && !!learnerId}
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
                                    ? async (value: any) => {
                                        if (isLoadingAvailableDays) return;
                                        if (!value) return;
                                        const newMonth = dayjs.isDayjs(value)
                                            ? value.format("YYYY-MM")
                                            : dayjs(value).format("YYYY-MM");
                                        if (newMonth === currentMonth) return;
                                        setCurrentMonth(newMonth);
                                        await fetchAvailableDaysForMonth(newMonth);
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
                    volunteerTimezone={ownTimezone}
                />

                {VolunteerScheduleModalDescriptionConstants.map((field: any) => (
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
