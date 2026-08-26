export const alertModalConstants = {
    title: "Alert!",
    content:
        "Canceling a scheduled meeting less than 6 hours in advance can impact your credibility as a volunteer. Please notify us at least 6 hours before the meeting if you need to reschedule or cancel.",
    placeholder: "Add notes here",
    rows: 6,
};

export const LearnerFeedbackFormConstants: FormField[] = [
    {
        name: "classDuration",
        label: "How long was the class?",
        inputType: "number",
        contentType: "number",
        placeholder: "Enter the duration of the class",
        sublabel: "(In hrs)",
        sublabelAlignment: "right",
        min: 0,
        inputClassName: "!bg-white",
    },
    {
        name: "rating",
        label: "Focus/ Interest level of the student",
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
        label: "Your comments",
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

export const LearnerScheduleModalConstants = [
    {
        name: "title_of_the_meeting",
        label: "Title of the Meeting",
        inputType: "text",
        placeholder: "Enter meeting title",
        required: true,
    },
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
        name: "select_date",
        label: "Select Date",
        inputType: "datepicker",
        placeholder: "Select a date",
        required: true,
    },
];

export const LearnerScheduleModalDescriptionConstants = [
    {
        name: "description",
        label: "Description",
        inputType: "textarea",
        placeholder: "Enter meeting description here",
        required: true,
    },
];

export const VolunteerScheduleModalConstants = [
    {
        name: "title_of_the_meeting",
        label: "Title of the Meeting",
        inputType: "text",
        placeholder: "Enter meeting title",
        required: true,
    },
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
        name: "select_date",
        label: "Select Date",
        inputType: "datepicker",
        placeholder: "Select a date",
        required: true,
    },
];

export const VolunteerScheduleModalDescriptionConstants = [
    {
        name: "description",
        label: "Description",
        inputType: "textarea",
        placeholder: "Enter meeting description here",
        required: true,
    },
];
