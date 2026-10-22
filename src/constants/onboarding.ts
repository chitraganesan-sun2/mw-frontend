// "How did you hear about us?" on the learner and volunteer onboarding forms (Consent tab).
// The stored value is the label itself. Keep in step with the backend's HEARD_ABOUT_US_OPTIONS
// (models/v1/common/consent_and_permissions.py), which rejects anything not on this list.
export const HEARD_ABOUT_US_OTHER = "Other";

export const HEARD_ABOUT_US_OPTIONS = [
    "Handshake",
    "Social Media",
    "Friend / Referral",
    "Google Search",
    "Email Newsletter",
    "School / Community Event",
    HEARD_ABOUT_US_OTHER,
];

export const HEARD_ABOUT_US_FIELDS: FormField[] = [
    {
        id: "heard_about_us",
        label: "How did you hear about us?",
        inputType: "select",
        placeholder: "Select an option",
        options: HEARD_ABOUT_US_OPTIONS.map((option) => ({ label: option, value: option })),
        gridCols: 2,
        required: true,
    },
    {
        // Only shown once "Other" is chosen (FormTabs hideFields).
        id: "heard_about_us_other",
        label: "Please tell us how",
        inputType: "text",
        placeholder: "e.g. a podcast, a flyer",
        gridCols: 2,
    },
];
