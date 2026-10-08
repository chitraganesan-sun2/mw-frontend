"use client";
import { Fragment } from "react";
import { endpoints } from "@/api/constants";
import { GET_API, POST_API } from "@/api/request";
import { Input } from "@/components/common/Input";
import SideModal from "@/components/common/Modals/SideModal";
import {
    VolunteerScheduleModalConstants,
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
import { skillOptionsByCategory } from "./AddNewMeetingModal";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import { useProfileTimeZone, useProfileToday } from "@/hooks/schedule/useProfileTimeZone";

const EMPTY_FORM = {
    title_of_the_meeting: "",
    select_learner: "",
    select_date: "",
    start_time: "",
    end_time: "",
    description: "",
    selected_slot: "",
    academic_skills: [] as string[],
    non_academic_skills: [] as string[],
};

// Define Zod schema for form validation
const meetingFormSchema = z.object({
    title_of_the_meeting: z.string().trim().min(1, "Please enter a session title."),
    select_learner: z.string().min(1, "Please choose a learner."),
    select_date: z
        .union([z.string(), z.date(), z.null()])
        .refine((val) => val !== null && val !== "", {
            message: "Please choose a date.",
        }),
    start_time: z.string(),
    end_time: z.string(),
    description: z.string().trim().min(1, "Please describe the session details and expectations."),
    selected_slot: z.string().min(1, "Please choose a time slot."),
    // One skill, picked from the volunteer's own subjects / skills (same as a learner booking).
    academic_skills: z.array(z.string()).optional().default([]),
    non_academic_skills: z.array(z.string()).optional().default([]),
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
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);

    const [category, setCategory] = useState<SessionCategory | "">("");
    const [skillErrors, setSkillErrors] = useState<{ category?: string; skill?: string }>({});
    // The picked learner (id + display name) for the searchable picker.
    const [learnerOption, setLearnerOption] = useState<CounterpartOption | null>(null);
    const queryClient = useQueryClient();
    // Profile timezone label + "today" in it (date gates must not use the browser's date).
    const profileTimeZone = useProfileTimeZone("volunteer");
    const today = useProfileToday("volunteer");
    const searchParams = useSearchParams();
    const learnerId = searchParams.get("learnerId");
    // ?reschedule=<session id>: ask the learner to move that accepted session to a new time.
    const rescheduleId = searchParams.get("reschedule");
    const [rescheduleSource, setRescheduleSource] = useState<{
        academic: string[];
        nonAcademic: string[];
    } | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [slotError, setSlotError] = useState<string>("");
    const [fetchingSlots, setFetchingSlots] = useState<boolean>(false);
    const [ownAvailableDays, setOwnAvailableDays] = useState<string[]>([]);
    const [ownAvailableDates, setOwnAvailableDates] = useState<string[]>([]);
    const [ownUnavailableDates, setOwnUnavailableDates] = useState<string[]>([]);
    const [isLoadingAvailableDays, setIsLoadingAvailableDays] = useState(false);
    const [currentMonth, setCurrentMonth] = useState<string>(dayjs().format("YYYY-MM"));
    const volunteerId = getCookie("volunteer_id") as string;

    // The volunteer's own subjects / skills - same query key as the schedule page, so this is
    // usually already cached.
    const { data: ownProfile } = useQuery<any>({
        queryKey: ["volunteer-details", volunteerId],
        queryFn: async () => (await GET_API(endpoints.volunteer.getIndividualVolunteer(volunteerId)))?.data ?? null,
        enabled: isOpen && Boolean(volunteerId),
    });
    // Skill options per Category (academic skills listed under Academic, not Arts & Life Skills).
    const { academic: ownAcademic, nonAcademic: ownArts } = skillOptionsByCategory(ownProfile);
    const hasSkillOptions = ownAcademic.length > 0 || ownArts.length > 0;
    const pickedSkillName = formData.academic_skills?.[0] || formData.non_academic_skills?.[0] || "";

    // Reschedule: carry over what the original session was about (title, details, skill).
    useEffect(() => {
        if (!isOpen || !rescheduleId) return;
        let cancelled = false;
        GET_API(endpoints.session.getSessionDetail(rescheduleId))
            .then(({ data }: any) => {
                if (cancelled || !data) return;
                setRescheduleSource({
                    academic: data.academic_skills || [],
                    nonAcademic: data.non_academic_skills || [],
                });
                setFormData((prev) => ({
                    ...prev,
                    title_of_the_meeting: data.session_title || prev.title_of_the_meeting,
                    description: data.session_description || prev.description,
                }));
            })
            .catch(() => showToast({ message: "Couldn't load the session to reschedule.", type: "error" }));
        return () => {
            cancelled = true;
        };
    }, [isOpen, rescheduleId]);

    // Deep link (?learnerId=): preselect that learner, label included.
    useEffect(() => {
        if (!isOpen || !learnerId) return;
        let cancelled = false;
        GET_API(endpoints.learner.getIndividualLearner(learnerId))
            .then(({ data }: any) => {
                if (cancelled || !data?.learner_id) return;
                setLearnerOption({
                    value: data.learner_id,
                    label:
                        joinNames(
                            data?.learner_personal_info?.learner_first_name,
                            data?.learner_personal_info?.learner_last_name
                        ) || "Learner",
                });
                setFormData((prev) => ({ ...prev, select_learner: data.learner_id }));
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, [isOpen, learnerId]);

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
        const skillProblems = hasSkillOptions && !rescheduleId
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
        setLearnerOption(null);
        setAvailableSlots([]);
        setCategory("");
        setSkillErrors({});
        setErrors({});
        setSlotError("");
        setRescheduleSource(null);
    };
    const handleClose = () => {
        resetForm();
        onClose();
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
            academic_skills: rescheduleId ? rescheduleSource?.academic || [] : formData.academic_skills || [],
            non_academic_skills: rescheduleId ? rescheduleSource?.nonAcademic || [] : formData.non_academic_skills || [],
            ...(rescheduleId ? { reschedules_session_id: rescheduleId } : {}),
        };
        return await POST_API(endpoints.session.bookVolunteerInitiatedSession, payload);
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: () => handleSave(),
        success: () => {
            invalidateScheduleViews(queryClient, "volunteer");
            handleClose();
            // It's a request the learner still has to accept, not a scheduled meeting.
            showToast({
                message: rescheduleId ? "Reschedule request sent" : "Session request sent",
                type: "success",
            });
        },
        error: (err) => {
            // Previously empty: a conflict / double-booking rejection from the backend
            // left the modal open with no indication anything went wrong.
            showToast({
                message: getApiErrorMessage(
                    err,
                    rescheduleId
                        ? "Couldn't send the reschedule request. Please try again."
                        : "Couldn't send the session request. Please try again."
                ),
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

    // Slots are labelled with the volunteer's profile timezone (AvailableSlots resolves the
    // label to the abbreviation in effect on the date). The old lookup keyed an abbreviation
    // map by the FULL label ("EST - Eastern ..."), always missed, and labelled slots "UTC".
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            select_date: "",
        }));

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

    const COUNTERPART_FIELD = "select_learner";
    const skillFields = hasSkillOptions && !rescheduleId && (
        <>
            <CategoryField
                value={category}
                error={skillErrors.category}
                available={[
                    ...(ownAcademic.length > 0 ? (["academic"] as const) : []),
                    ...(ownArts.length > 0 ? (["non_academic"] as const) : []),
                ]}
                onChange={(value) => {
                    setCategory(value);
                    setFormData((prev) => ({ ...prev, academic_skills: [], non_academic_skills: [] }));
                    setSkillErrors({});
                }}
            />
            <SkillField
                category={category}
                options={category === "academic" ? ownAcademic : ownArts}
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
            placeholder="What will you cover? Anything the learner should know or bring?"
            onChange={(value) => handleChange("description", value)}
        />
    );

    if (!isOpen) return null;
    return (
        <SideModal
            title={rescheduleId ? "Reschedule Session" : "Add New Session"}
            saveButtonText={rescheduleId ? "Send New Time" : "Send Request"}
            onClose={handleClose}
            isOpen={isOpen}
            onSave={handleSubmit}
            isLoading={isPending}
            onCancel={handleClose}
            modalWidth={isMobileScreen ? 600 : 400}
        >
            <div className="flex flex-col max-lg:gap-3 px-5 mt-7">
                {rescheduleId && (
                    <p className="mb-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900">
                        Pick a new time with {learnerOption?.label || "the learner"}. Your current session stays booked until the new time is accepted.
                    </p>
                )}
                {VolunteerScheduleModalConstants.map((field: any) => {
                    const availableDaysForField =
                        field.name === "select_date" ? ownAvailableDays : undefined;
                    const availableDatesForField =
                        field.name === "select_date" ? ownAvailableDates : undefined;
                    const unavailableDatesForField =
                        field.name === "select_date" ? ownUnavailableDates : undefined;

                    if (field.name === COUNTERPART_FIELD) {
                        return (
                            <Fragment key={field.name}>
                                <CounterpartSelect
                                    kind="learner"
                                    name={field.name}
                                    label={field.label}
                                    placeholder="Type a learner's name"
                                    value={learnerOption}
                                    disabled={Boolean(learnerId)}
                                    error={errors.select_learner}
                                    onChange={(option) => {
                                        setLearnerOption(option);
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
