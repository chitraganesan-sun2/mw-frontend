export const alertModalConstants = {
    title: "Late Cancellation Notice",
    content:
        "Cancelling a scheduled session less than 6 hours in advance can affect your credibility as a volunteer. Please notify us at least 6 hours before the session if you need to reschedule or cancel.",
    placeholder: "Add notes here",
    rows: 6,
};

export const LearnerFeedbackFormConstants: FormField[] = [
    {
        name: "classDuration",
        label: "How long was the session?",
        inputType: "number",
        contentType: "number",
        placeholder: "Enter the duration of the session",
        sublabel: "(In hrs)",
        sublabelAlignment: "right",
        min: 0,
        inputClassName: "!bg-white",
    },
    {
        name: "rating",
        label: "Focus / interest level of the learner",
        inputType: "radio",
        variant: "rating",
        options: [
            { label: "Bad", value: "1" },
            { label: "Normal", value: "2" },
            { label: "Good", value: "3" },
            { label: "Very Good", value: "4" },
            { label: "Excellent", value: "5" },
        ],
        inputClassName: "mx-md:justify-start justify-between md:p-2",
    },
    {
        name: "notes",
        label: "Your Comments",
        inputType: "textarea",
        placeholder: "Enter comments here",
        inputClassName: "bg-white",
    },
    // {
    //     name: "uploadPictures",
    //     label: "Do you want to upload any pictures to share in the community/forum?",
    //     inputType: "upload",
    //     maxFiles: 5,
    // },
];

// Shared session-form order (see components/schedule/forms/SessionFormFields): counterpart,
// then Category/Skill and Session Title, Session Details & Expectations, Date, slots.
export const LearnerScheduleModalConstants = [
    {
        name: "select_volunteer",
        label: "Select Volunteer",
        inputType: "select",
        placeholder: "Select a volunteer",
        required: true,
        isLoading: true,
        options: [],
    },
    {
        name: "title_of_the_meeting",
        label: "Session Title",
        inputType: "text",
        placeholder: "Enter session title",
        required: true,
    },
    {
        name: "select_date",
        label: "Date",
        inputType: "datepicker",
        placeholder: "Select a date",
        required: true,
    },
];

// Shared session-form order (see components/schedule/forms/SessionFormFields): counterpart,
// then Category/Skill and Session Title, Session Details & Expectations, Date, slots.
export const VolunteerScheduleModalConstants = [
    {
        name: "select_learner",
        label: "Select Learner",
        inputType: "select",
        placeholder: "Select a learner",
        required: true,
        isLoading: true,
        options: [],
    },
    {
        name: "title_of_the_meeting",
        label: "Session Title",
        inputType: "text",
        placeholder: "Enter session title",
        required: true,
    },
    {
        name: "select_date",
        label: "Date",
        inputType: "datepicker",
        placeholder: "Select a date",
        required: true,
    },
];

