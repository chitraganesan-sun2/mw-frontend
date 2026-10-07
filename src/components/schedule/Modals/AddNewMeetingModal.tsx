"use client";
import { Fragment } from "react";
import { endpoints } from "@/api/constants";
import { GET_API, POST_API } from "@/api/request";
import { Input } from "@/components/common/Input";
import SideModal from "@/components/common/Modals/SideModal";
import {
    LearnerScheduleModalConstants,
} from "@/constants/schedule";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useEffect, useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

import AvailableSlots from "../AvailableSlots/AvailableSlots";
import { useSearchParams } from "next/navigation";
import { useSendData } from "@/hooks/useReactQuery";
import { z } from "zod";
import InnerWidth from "@/utils/innerWidth";
import { showToast } from "@/components/common/Toast";
import { getCookie } from "@/utils/auth";
import { getApiErrorMessage } from "@/utils/apiError";
import { joinNames } from "@/utils/joinNames";
import {
    CategoryField,
    SessionDetailsField,
    SkillField,
    type PickedSkill,
    type SessionCategory,
} from "@/components/schedule/forms/SessionFormFields";
import CounterpartSelect, { type CounterpartOption } from "@/components/schedule/forms/CounterpartSelect";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import { useProfileTimeZone, useProfileToday } from "@/hooks/schedule/useProfileTimeZone";

const EMPTY_FORM = {
    title_of_the_meeting: "",
    select_volunteer: "",
    select_date: "",
    start_time: "",
    end_time: "",
    google_meet_link: "",
    description: "",
    selected_slot: "",
    academic_skills: [] as string[],
    non_academic_skills: [] as string[],
};

/** Split a volunteer's profile into the Skill options per Category. Skills carry the LOV
 * `category`, so an academic skill (e.g. "Mathematics") offered under volunteer_skills is
 * listed under Academic, not Arts & Life Skills. Skills without a category stay under
 * Arts & Life Skills (the old behaviour). */
export function skillOptionsByCategory(profile: any): { academic: string[]; nonAcademic: string[] } {
    const skills: any[] = profile?.volunteer_skills || [];
    const academic = [
        ...(profile?.volunteer_subjects || []).map((s: any) => s?.subject_name),
        ...skills.filter((s) => s?.category === "academic").map((s) => s?.skill_name),
    ].filter(Boolean) as string[];
    const nonAcademic = skills.filter((s) => s?.category !== "academic").map((s) => s?.skill_name).filter(Boolean) as string[];
    return { academic: Array.from(new Set(academic)), nonAcademic: Array.from(new Set(nonAcademic)) };
}

// Define Zod schema for form validation
const meetingFormSchema = z.object({
    title_of_the_meeting: z.string().trim().min(1, "Please enter a session title."),
    select_volunteer: z.string().min(1, "Please choose a volunteer."),
    select_date: z
        .union([z.string(), z.date(), z.null()])
        .refine((val) => val !== null && val !== "", {
            message: "Please choose a date.",
        }),
    start_time: z.string(),
    end_time: z.string(),
    google_meet_link: z.string(),
    description: z.string().trim().min(1, "Please describe the session details and expectations."),
    selected_slot: z.string().min(1, "Please choose a time slot."),
    // Optional - picked from the selected volunteer's own declared subjects/skills.
    academic_skills: z.array(z.string()).optional().default([]),
    non_academic_skills: z.array(z.string()).optional().default([]),
});

// Infer TypeScript type from schema
type FormData = z.infer<typeof meetingFormSchema>;

interface AddNewMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** "YYYY-MM-DD" - the date clicked on the calendar. The date field only appears once a
     *  volunteer is picked (and picking one resets it), so it's applied at that point. */
    initialDate?: string | null;
}

export default function AddNewMeetingModal({ isOpen, onClose, initialDate }: AddNewMeetingModalProps) {
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    // Options for the two skill pickers, sourced from the selected volunteer's own
    // declared subjects (academic) / skills (non-academic).
    const [volunteerAcademicOptions, setVolunteerAcademicOptions] = useState<
        Array<{ label: string; value: string }>
    >([]);
    const [volunteerNonAcademicOptions, setVolunteerNonAcademicOptions] = useState<
        Array<{ label: string; value: string }>
    >([]);

    // One category, then exactly one skill from the volunteer's own subjects / skills.
    const [category, setCategory] = useState<SessionCategory | "">("");
    const [skillErrors, setSkillErrors] = useState<{ category?: string; skill?: string }>({});
    // The picked volunteer (id + display name) for the searchable picker.
    const [volunteerOption, setVolunteerOption] = useState<CounterpartOption | null>(null);
    const queryClient = useQueryClient();
    // Profile timezone label + "today" in it (date gates must not use the browser's date).
    const profileTimeZone = useProfileTimeZone("learner");
    const today = useProfileToday("learner");
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

    // Deep link (?volunteerId=): preselect that volunteer, label included.
    useEffect(() => {
        if (!isOpen || !volunteerId) return;
        let cancelled = false;
        GET_API(endpoints.volunteer.getIndividualVolunteer(volunteerId))
            .then(({ data }: any) => {
                if (cancelled || !data?.volunteer_id) return;
                setVolunteerOption({
                    value: data.volunteer_id,
                    label: joinNames(data?.volunteer_first_name, data?.volunteer_last_name) || "Volunteer",
                });
                setFormData((prev) => ({ ...prev, select_volunteer: data.volunteer_id }));
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, [isOpen, volunteerId]);

    const getAvailableDays = async () => {
        try {
            if (!selectedVolunteerId || !currentMonth) return [];
            setIsLoadingAvailableDays(true);
            const response = await GET_API(
                endpoints.volunteer_slot.availableDays(selectedVolunteerId, currentMonth)
            );

            // Make sure we're getting the array directly
            const availableDays = Array.isArray(response.data)
                ? response.data
                : response.data.available_days;

            // Handle available and unavailable dates
            const availableDates = response.data.available_dates || [];
            const unavailableDates = response.data.unavailable_dates || [];


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

    const hasSkillOptions = volunteerAcademicOptions.length > 0 || volunteerNonAcademicOptions.length > 0;
    const pickedSkillName = formData.academic_skills?.[0] || formData.non_academic_skills?.[0] || "";

    const validateForm = (): boolean => {
        // Category + skill are required whenever the volunteer has any to offer.
        const skillProblems = hasSkillOptions
            ? {
                  category: category ? undefined : "Please choose a category.",
                  skill: pickedSkillName ? undefined : "Please choose a skill.",
              }
            : {};
        setSkillErrors(skillProblems);
        const skillsOk = !skillProblems.category && !skillProblems.skill;
        try {
            meetingFormSchema.parse(formData);
            setErrors({});
            if (!skillsOk) showToast({ message: "Please complete the highlighted fields.", type: "error" });
            return skillsOk;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Partial<Record<keyof FormData, string>> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as keyof FormData] = err.message;
                    }
                });
                setErrors(newErrors);
                // Submitting with no slot used to do nothing visible - say what's missing.
                showToast({ message: error.errors[0]?.message || "Please complete the highlighted fields.", type: "error" });
            }
            return false;
        }
    };

    // Cancel / close discards the draft - reopening used to show the abandoned form.
    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setVolunteerOption(null);
        setAvailableSlots([]);
        setCategory("");
        setSkillErrors({});
        setErrors({});
        setSlotError("");
        setSelectedVolunteerId("");
    };
    const handleClose = () => {
        resetForm();
        onClose();
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
            academic_skills: formData.academic_skills || [],
            non_academic_skills: formData.non_academic_skills || [],
        };
        return await POST_API(endpoints.session.bookSession, payload);
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: () => handleSave(),
        success: () => {
            invalidateScheduleViews(queryClient, "learner");
            handleClose();
            // It's a request the volunteer still has to accept, not a scheduled meeting.
            showToast({
                message: "Session request sent",
                type: "success",
            });
        },
        error: (err) => {
            // Previously empty: a conflict / double-booking rejection from the backend
            // left the modal open with no indication anything went wrong.
            showToast({
                message: getApiErrorMessage(err, "Couldn't send the session request. Please try again."),
                type: "error",
            });
        },
    });

    const handleSubmit = () => {
        const isValid = validateForm();
        if (!isValid) {
            return;
        }
        onSave(formData);
    };

    // Slot times come back from the API already in the LEARNER's local time, so they are
    // labelled with the learner's own profile timezone (AvailableSlots resolves the label).
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            select_date: "",
            academic_skills: [],
            non_academic_skills: [],
        }));
        setCategory("");
        setSkillErrors({});
        if (formData.select_volunteer) {
            setSelectedVolunteerId(formData.select_volunteer);

            // Fetch volunteer timezone + the skills they've declared they can teach,
            // which populate the Academic / Non-Academic Skills pickers.
            const fetchVolunteerDetails = async () => {
                try {
                    const { data } = await GET_API(
                        endpoints.volunteer.getIndividualVolunteer(formData.select_volunteer)
                    );
                    const { academic, nonAcademic } = skillOptionsByCategory(data);
                    setVolunteerAcademicOptions(academic.map((name) => ({ label: name, value: name })));
                    setVolunteerNonAcademicOptions(nonAcademic.map((name) => ({ label: name, value: name })));
                } catch (error) {
                    console.error("Error fetching volunteer details:", error);
                    setVolunteerAcademicOptions([]);
                    setVolunteerNonAcademicOptions([]);
                }
            };
            fetchVolunteerDetails();

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

            // Pre-fill the calendar-clicked date (also loads that volunteer's slots for it).
            const preset = initialDate ? dayjs(initialDate) : null;
            if (preset?.isValid() && preset.format("YYYY-MM-DD") >= today) {
                handleChange("select_date", preset.toDate());
            }
        } else {
            setVolunteerAcademicOptions([]);
            setVolunteerNonAcademicOptions([]);
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

    const COUNTERPART_FIELD = "select_volunteer";
    const skillFields = selectedVolunteerId !== "" && hasSkillOptions && (
        <>
            <CategoryField
                value={category}
                error={skillErrors.category}
                available={[
                    ...(volunteerAcademicOptions.length > 0 ? (["academic"] as const) : []),
                    ...(volunteerNonAcademicOptions.length > 0 ? (["non_academic"] as const) : []),
                ]}
                onChange={(value) => {
                    setCategory(value);
                    setFormData((prev) => ({ ...prev, academic_skills: [], non_academic_skills: [] }));
                    setSkillErrors({});
                }}
            />
            <SkillField
                category={category}
                options={(category === "academic" ? volunteerAcademicOptions : volunteerNonAcademicOptions).map((o) => o.value)}
                value={pickedSkillName ? ({ skill_id: pickedSkillName, skill_name: pickedSkillName } as PickedSkill) : null}
                error={skillErrors.skill}
                onChange={(value) => {
                    const names = value ? [value.skill_name] : [];
                    setFormData((prev) => ({
                        ...prev,
                        academic_skills: category === "academic" ? names : [],
                        non_academic_skills: category === "non_academic" ? names : [],
                    }));
                    setSkillErrors((e) => ({ ...e, skill: undefined }));
                }}
            />
        </>
    );
    const detailsField = (
        <SessionDetailsField
            value={formData.description}
            error={errors.description}
            placeholder="What do you want to cover? Anything the volunteer should know or prepare?"
            onChange={(value) => handleChange("description", value)}
        />
    );

    if (!isOpen) return null;
    return (
        <SideModal
            title="Add New Session"
            saveButtonText="Send Request"
            onClose={handleClose}
            isOpen={isOpen}
            onSave={handleSubmit}
            isLoading={isPending}
            onCancel={handleClose}
            modalWidth={isMobileScreen ? 600 : 400}
        >
            <div className="flex flex-col max-lg:gap-3 px-5 mt-7">
                {LearnerScheduleModalConstants.map((field: any) => {
                    const availableDaysForField =
                        field.name === "select_date" ? volunteerAvailableDays : undefined;
                    const availableDatesForField =
                        field.name === "select_date" ? volunteerAvailableDates : undefined;
                    const unavailableDatesForField =
                        field.name === "select_date" ? volunteerUnavailableDates : undefined;


                    if (field.name === "select_date" && selectedVolunteerId === "") return null;

                    if (field.name === COUNTERPART_FIELD) {
                        return (
                            <Fragment key={field.name}>
                                <CounterpartSelect
                                    kind="volunteer"
                                    name={field.name}
                                    label={field.label}
                                    placeholder="Type a volunteer's name"
                                    value={volunteerOption}
                                    disabled={Boolean(volunteerId)}
                                    error={errors.select_volunteer}
                                    onChange={(option) => {
                                        setVolunteerOption(option);
                                        handleChange(field.name, option?.value ?? "");
                                    }}
                                />
                                {skillFields}
                            </Fragment>
                        );
                    }

                    return (
                        <Fragment key={field.name}>
                        <Input
                            {...field}
                            earliestDate={field.name === "select_date" ? today : undefined}
                            onChange={(value: any) => handleChange(field.name, value)}
                            value={formData[field.name as keyof FormData]}
                            required={field.required}
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

                                            // Always update and fetch, even if month appears the same (to handle edge cases)
                                            setCurrentMonth(newMonth);

                                            // Directly fetch available days for the new month
                                            try {
                                                setIsLoadingAvailableDays(true);
                                                const apiUrl =
                                                    endpoints.volunteer_slot.availableDays(
                                                        selectedVolunteerId,
                                                        newMonth
                                                    );

                                                const response = await GET_API(apiUrl);

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
                        {field.name === "title_of_the_meeting" && detailsField}
                        </Fragment>
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
                    volunteerTimezone={profileTimeZone}
                />

            </div>
        </SideModal>
    );
}
