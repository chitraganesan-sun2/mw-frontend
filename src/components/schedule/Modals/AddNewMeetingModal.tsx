"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { endpoints } from "@/api/constants";
import { GET_API, POST_API } from "@/api/request";
import { Input } from "@/components/common/Input";
import SideModal from "@/components/common/Modals/SideModal";
import {
    LearnerScheduleModalConstants,
} from "@/constants/schedule";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useSendData } from "@/hooks/useReactQuery";
import { z } from "zod";
import InnerWidth from "@/utils/innerWidth";
import { showToast } from "@/components/common/Toast";
import { getCookie } from "@/utils/auth";
import { getApiErrorMessage } from "@/utils/apiError";
import { joinNames } from "@/utils/joinNames";
import { compareOptionLabels } from "@/utils/optionOrder";
import { NONE_SKILL_OPTION, NONE_SUBJECT_OPTION } from "@/constants/volunteer";
import {
    AvailabilityField,
    CategoryField,
    LEARNER_DETAILS_PLACEHOLDER,
    SessionDetailsField,
    SkillField,
    type PickedSkill,
    type SessionCategory,
} from "@/components/schedule/forms/SessionFormFields";
import CounterpartSelect, { type CounterpartOption } from "@/components/schedule/forms/CounterpartSelect";
import PageIntro from "@/components/common/PageIntro";
import { HELP, TERMS } from "@/constants/copy";
import { invalidateScheduleViews } from "@/hooks/schedule/invalidateScheduleViews";
import { useProfileTimeZone } from "@/hooks/schedule/useProfileTimeZone";
import { useUpcomingSlots, type UpcomingSlot } from "@/hooks/schedule/useUpcomingSlots";

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
    // The onboarding "None" chip ("I don't teach this category", id "__none__") is stored on
    // the profile like a real pick - it is not a skill to book, and must not make a category
    // look available.
    const isReal = (id: unknown) => id !== NONE_SUBJECT_OPTION.value.subject_id && id !== NONE_SKILL_OPTION.value.skill_id;
    const skills: any[] = (profile?.volunteer_skills || []).filter((s: any) => isReal(s?.skill_id));
    const subjects: any[] = (profile?.volunteer_subjects || []).filter((s: any) => isReal(s?.subject_id));
    const academic = [
        ...subjects.map((s: any) => s?.subject_name),
        ...skills.filter((s) => s?.category === "academic").map((s) => s?.skill_name),
    ].filter(Boolean) as string[];
    const nonAcademic = skills.filter((s) => s?.category !== "academic").map((s) => s?.skill_name).filter(Boolean) as string[];
    const unique = (names: string[]) => Array.from(new Set(names)).sort(compareOptionLabels);
    return { academic: unique(academic), nonAcademic: unique(nonAcademic) };
}

const SLOT_REQUIRED = "Please choose a time.";

// Define Zod schema for form validation
const meetingFormSchema = z.object({
    title_of_the_meeting: z.string().trim().min(1, "Please enter a session title."),
    select_volunteer: z.string().min(1, "Please choose a volunteer."),
    select_date: z.string().min(1, SLOT_REQUIRED),
    start_time: z.string(),
    end_time: z.string(),
    google_meet_link: z.string(),
    description: z.string().trim().min(1, "Please describe the session details and expectations."),
    selected_slot: z.string().min(1, SLOT_REQUIRED),
    // Optional - picked from the selected volunteer's own declared subjects/skills.
    academic_skills: z.array(z.string()).optional().default([]),
    non_academic_skills: z.array(z.string()).optional().default([]),
});

// Infer TypeScript type from schema
type FormData = z.infer<typeof meetingFormSchema>;

interface AddNewMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** "YYYY-MM-DD" - the date clicked on the calendar. Once the volunteer's times load, the
     *  first one on that date is preselected (if they have any that day). */
    initialDate?: string | null;
}

export default function AddNewMeetingModal({ isOpen, onClose, initialDate }: AddNewMeetingModalProps) {
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
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
    // Profile timezone label: the volunteer's open times are returned (and shown) in it.
    const profileTimeZone = useProfileTimeZone("learner");
    const searchParams = useSearchParams();
    const volunteerId = searchParams.get("volunteerId");
    // ?reschedule=<session id>: ask the volunteer to move that accepted session to a new time.
    const rescheduleId = searchParams.get("reschedule");
    const [rescheduleSource, setRescheduleSource] = useState<{
        academic: string[];
        nonAcademic: string[];
    } | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const learnerId = getCookie("learner_id");
    const selectedVolunteerId = formData.select_volunteer;
    const upcoming = useUpcomingSlots(isOpen ? selectedVolunteerId || undefined : undefined, profileTimeZone);

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

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error for the field being changed
        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));

        // Validate single field
        try {
            const fieldSchema = meetingFormSchema.pick({ [name]: true } as any);
            fieldSchema.parse({ [name]: value });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldError = error.errors[0];
                setErrors((prev) => ({
                    ...prev,
                    [name]: fieldError.message,
                }));
            }
        }
    };

    const handleSlotSelection = (slot: UpcomingSlot | null) => {
        setFormData((prev) => ({
            ...prev,
            selected_slot: slot?.volunteer_slot_id ?? "",
            select_date: slot?.date ?? "",
            start_time: slot?.start_time ?? "",
            end_time: slot?.end_time ?? "",
        }));
        setErrors((prev) => ({ ...prev, selected_slot: undefined, select_date: undefined }));
    };

    // Calendar-clicked date: once the volunteer's times load, preselect their first one that day.
    const presetApplied = useRef(false);
    useEffect(() => {
        if (!isOpen) presetApplied.current = false;
    }, [isOpen]);
    useEffect(() => {
        if (presetApplied.current || !initialDate || !selectedVolunteerId || upcoming.isLoading) return;
        presetApplied.current = true;
        const first = upcoming.slots.find((s) => s.date === initialDate);
        if (first) handleSlotSelection(first);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- applied once per open, when the times arrive
    }, [isOpen, initialDate, selectedVolunteerId, upcoming.isLoading, upcoming.slots]);

    const hasSkillOptions = volunteerAcademicOptions.length > 0 || volunteerNonAcademicOptions.length > 0;
    const pickedSkillName = formData.academic_skills?.[0] || formData.non_academic_skills?.[0] || "";

    const validateForm = (): boolean => {
        // Category + skill are required whenever the volunteer has any to offer.
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
                // One slot control - show the missing-time message on it, whichever field flagged it.
                if (newErrors.select_date && !newErrors.selected_slot) newErrors.selected_slot = newErrors.select_date;
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
        setCategory("");
        setSkillErrors({});
        setErrors({});
        setRescheduleSource(null);
    };
    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        const payload = {
            volunteer_id: formData.select_volunteer,
            volunteer_slot_id: formData.selected_slot,
            session_date: formData.select_date,
            session_start_time: formData.start_time,
            session_end_time: formData.end_time,
            session_title: formData.title_of_the_meeting,
            session_description: formData.description,
            learner_id: learnerId,
            academic_skills: rescheduleId ? rescheduleSource?.academic || [] : formData.academic_skills || [],
            non_academic_skills: rescheduleId ? rescheduleSource?.nonAcademic || [] : formData.non_academic_skills || [],
            ...(rescheduleId ? { reschedules_session_id: rescheduleId } : {}),
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
            // The time may have just been taken: reload the list and make them pick again.
            handleSlotSelection(null);
            upcoming.refetch();
        },
    });

    const handleSubmit = () => {
        const isValid = validateForm();
        if (!isValid) {
            return;
        }
        onSave(formData);
    };

    // New volunteer: their skills, times and any picked slot are different. Their open times
    // load through useUpcomingSlots (keyed on the volunteer).
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            select_date: "",
            selected_slot: "",
            start_time: "",
            end_time: "",
            academic_skills: [],
            non_academic_skills: [],
        }));
        setCategory("");
        setSkillErrors({});
        if (formData.select_volunteer) {
            // The skills they've declared they can teach populate the Category / Skill pickers.
            let cancelled = false;
            GET_API(endpoints.volunteer.getIndividualVolunteer(formData.select_volunteer))
                .then(({ data }) => {
                    if (cancelled) return;
                    const { academic, nonAcademic } = skillOptionsByCategory(data);
                    setVolunteerAcademicOptions(academic.map((name) => ({ label: name, value: name })));
                    setVolunteerNonAcademicOptions(nonAcademic.map((name) => ({ label: name, value: name })));
                    // Only one category on offer: preselect it instead of leaving the other greyed out.
                    if (!rescheduleId && (academic.length === 0) !== (nonAcademic.length === 0)) {
                        setCategory(academic.length > 0 ? "academic" : "non_academic");
                    }
                })
                .catch((error) => {
                    if (cancelled) return;
                    console.error("Error fetching volunteer details:", error);
                    setVolunteerAcademicOptions([]);
                    setVolunteerNonAcademicOptions([]);
                });
            return () => {
                cancelled = true;
            };
        }
        setVolunteerAcademicOptions([]);
        setVolunteerNonAcademicOptions([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the selected volunteer changes; depending on anything else would reset the form on every render
    }, [formData.select_volunteer]);

    const isMobileScreen = InnerWidth() < 768;

    const COUNTERPART_FIELD = "select_volunteer";
    const skillFields = selectedVolunteerId !== "" && hasSkillOptions && !rescheduleId && (
        <div className="flex flex-col gap-4 mb-4">
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
        </div>
    );
    const detailsField = (
        <div className="flex flex-col gap-4 mb-4">
            <SessionDetailsField
                value={formData.description}
                error={errors.description}
                label="What do you want to learn?"
                placeholder={LEARNER_DETAILS_PLACEHOLDER}
                onChange={(value) => handleChange("description", value)}
            />
        </div>
    );

    if (!isOpen) return null;
    return (
        <SideModal
            title={rescheduleId ? "Reschedule Session" : TERMS.bookForLater}
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
                        Pick a new time with {volunteerOption?.label || "the volunteer"}. Your current session stays booked until the new time is accepted.
                    </p>
                )}
                {!rescheduleId && <PageIntro className="mb-3">{HELP.bookForLater}</PageIntro>}
                {LearnerScheduleModalConstants.map((field: any) => {
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
                                onChange={(value: any) => handleChange(field.name, value)}
                                value={formData[field.name as keyof FormData]}
                                required={field.required}
                                error={errors[field.name as keyof FormData]}
                            />
                            {field.name === "title_of_the_meeting" && detailsField}
                        </Fragment>
                    );
                })}
                {selectedVolunteerId !== "" && (
                    <AvailabilityField
                        slots={upcoming.slots}
                        value={formData.selected_slot || ""}
                        selectedDate={formData.select_date}
                        onChange={handleSlotSelection}
                        isLoading={upcoming.isLoading}
                        isError={upcoming.isError}
                        onRetry={() => upcoming.refetch()}
                        timeZoneLabel={profileTimeZone}
                        error={errors.selected_slot || errors.select_date}
                    />
                )}
            </div>
        </SideModal>
    );
}
