import nationalities from "@/data/nationalities.json";
import timezones from "@/data/selectiveTimeZones.json";

export const ADULT_VOLUNTEER_AGE = 21;

// The two support_preference options that require a follow-up free-text explanation -
// must match the LOV option text exactly (migrations/seed_preferred_learner_age_group_and_support_preference.py).
export const SUPPORT_PREFERENCE_OPTIONS_REQUIRING_DETAILS = [
    "I have some preferences or limitations",
    "I am not sure and would like guidance",
];

export const TestimonialFormConstants: FormField[] = [
    {
        name: "comments",
        label: "Your Comments",
        inputType: "textarea",
        placeholder: "Enter comments here",
    },
    {
        name: "uploadPictures",
        label: "Do you want to upload any pictures to share in the community/forum?",
        inputType: "upload",
        maxFiles: 3,
    },
];

export const MessageModalConstants: FormField[] = [
    {
        name: "message",
        inputType: "textarea",
        placeholder: "Type message here",
        rows: 10,
    },
];

//* Volunteer Onboarding Form Fields

// "Volunteer Info" tab - renamed from the old "Profile Details" tab, now split into three
// card subsections (Volunteer Details / Parent Details / Education & Work Experience) per
// the latest spec, absorbing the old "Contact Details" tab's fields into "Volunteer Details"
// (via per-field parent: "volunteer_contact_details" overrides, same pattern used for
// learner_contact_details in constants/learner.ts). CardWrapper gives each subsection its
// own independent 2-column grid and auto-numbers the title ("1. Volunteer Details", etc.).
const VolunteerDetailsFields: FormField[] = [
    {
        id: "volunteer_first_name",
        label: "First Name",
        inputType: "text",
        placeholder: "Enter First Name",
        gridCols: 1,
        required: true,
    },
    {
        id: "volunteer_last_name",
        label: "Last Name",
        inputType: "text",
        placeholder: "Enter Last Name",
        gridCols: 1,
        required: true,
    },
    {
        id: "volunteer_birth_date",
        label: "Enter your birthday",
        inputType: "birthdatepicker",
        placeholder: "DD/MM/YYYY",
        format: "DD-MM-YYYY",
        sublabel: "Minors must be at least 13 years of age to begin volunteering",
        gridCols: 1,
        required: true,
        disabled: true,
        birthDatePicker: { minAge: 13, maxAge: 100 },
    },
    {
        id: "volunteer_gender",
        label: "Select Gender",
        inputType: "radio",
        options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Do not wish to reveal", value: "not_specified" },
        ],
        gridCols: 1,
        required: true,
        wrapperClassName: "justify-end",
    },
    {
        parent: "volunteer_contact_details",
        id: "email",
        label: "Email address",
        inputType: "text",
        placeholder: "Enter Email ID",
        gridCols: 1,
        disabled: true,
        required: true,
    },
    {
        parent: "volunteer_contact_details",
        id: "contact_number",
        label: "Your contact number",
        sublabel: "(with country code)",
        inputType: "contact-input",
        placeholder: "Enter Contact Number",
        sublabelAlignment: "right",
        gridCols: 1,
        disabled: false,
        required: true,
    },
    {
        parent: "volunteer_contact_details",
        id: "zip_code",
        label: "Zip Code",
        inputType: "text",
        placeholder: "Enter Zip Code",
        gridCols: 1,
        required: true,
    },
    {
        parent: "volunteer_contact_details",
        id: "country",
        label: "Country of Residence",
        inputType: "select",
        placeholder: "Select Country of Residence",
        options: nationalities,
        showSearch: true,
        gridCols: 1,
        required: true,
    },
    {
        parent: "volunteer_contact_details",
        id: "timezone",
        label: "Time Zone",
        inputType: "select",
        placeholder: "Search or select time zone",
        options: timezones,
        showSearch: true,
        gridCols: 2,
        inputClassName: "!w-full",
        required: true,
    },
];

const ParentDetailsFields: FormField[] = [
    {
        id: "volunteer_parent_name",
        label: "Parent Full Name",
        inputType: "text",
        placeholder: "Enter Parent FullName",
        gridCols: 1,
    },
    {
        id: "volunteer_parent_email",
        label: "Parent Email ID",
        inputType: "text",
        placeholder: "Enter Email ID",
        gridCols: 1,
    },
    {
        id: "volunteer_parent_contact_number",
        label: "Parent Contact Number",
        sublabel: "(with country code)",
        inputType: "contact-input",
        placeholder: "Enter Contact Number",
        sublabelAlignment: "right",
        gridCols: 2,
    },
    {
        id: "consented_from_parent",
        label: "I'm a minor and I've consent from my parent or guardian to be a volunteer.",
        sublabel: "(Parent details are mandatory for minors - below 18-21 depending on the US State)",
        inputType: "checkbox",
        gridCols: 2,
        inputClassName: "max-md:text-sm w-fit",
    },
];

const EducationWorkExperienceFields: FormField[] = [
    {
        id: "volunteer_higher_education",
        label: "Highest Education",
        inputType: "select",
        placeholder: "Select education level",
        options: [
            { label: "Bachelor's Degree", value: "bachelors" },
            { label: "High School", value: "high_school" },
            { label: "Middle School", value: "middle_school" },
            { label: "Elementary School", value: "elementary_school" },
            { label: "Master's Degree", value: "masters" },
            { label: "PhD", value: "phd" },
            { label: "Others", value: "others" },
            { label: "N/A", value: "N/A" },
        ],
        gridCols: 1,
        inputClassName: "!w-full",
        required: true,
    },
    {
        id: "volunteer_education",
        label: "Education Summary and Specialization",
        inputType: "text",
        placeholder: "Describe your education here",
        gridCols: 1,
        required: true,
    },
    {
        id: "volunteer_work_experience",
        label: "Work Experience",
        inputType: "text",
        placeholder: "Describe your work experience here",
        gridCols: 1,
    },
    {
        id: "volunteer_experience",
        label: "Prior Volunteer Experience",
        inputType: "text",
        placeholder: "Describe your volunteer work here",
        gridCols: 1,
    },
    {
        id: "volunteer_favorite_activities",
        label: "Favorite Free Time Activities",
        inputType: "textarea",
        placeholder: "Enter here",
        gridCols: 2,
        required: true,
    },
];

// "Profile Details" tab - new identity, repurposing the name after the old "Profile
// Details" tab above is renamed to "Volunteer Info". Holds "Skills to teach Learners".
const SkillsToTeachFields: FormField[] = [
    {
        id: "volunteer_languages",
        label: "Preferred Teaching Language(s)",
        inputType: "async-select",
        placeholder: "Don't see your option? Type it in to add.",
        creatable: true,
        gridCols: 1,
        endpoint: "languages",
        responseAsLabel: "language_name",
        responseAsValue: ["language_id", "language_name"],
        variant: "multi",
        required: true,
    },
    {
        id: "preferred_learner_age_group",
        label: "Preferred Learner Age Group",
        inputType: "async-select",
        endpoint: "preferred_learner_age_group",
        variant: "single",
        responseAsLabel: "preferred_learner_age_group_name",
        responseAsValue: "preferred_learner_age_group_name",
        placeholder: "Select preferred learner age group",
        gridCols: 1,
        required: true,
    },
    {
        id: "volunteer_subjects",
        label: "Academic Subjects You're Interested in Teaching",
        inputType: "async-select",
        placeholder: "Select Subjects",
        creatable: true,
        variant: "multi",
        gridCols: 1,
        endpoint: "subjects",
        responseAsLabel: "subject_name",
        responseAsValue: ["subject_id", "subject_name"],
    },
    {
        id: "volunteer_academic_skills_notes",
        label: "More about your academic skills",
        inputType: "text",
        placeholder: "Enter here",
        gridCols: 1,
    },
    {
        id: "volunteer_skills",
        label: "Arts & Life Skills you're interested in teaching",
        inputType: "async-select",
        placeholder: "Don't see your option? Type it in to add.",
        creatable: true,
        gridCols: 1,
        endpoint: "skills",
        responseAsLabel: "skill_name",
        responseAsValue: ["skill_id", "skill_name"],
        variant: "multi",
    },
    {
        id: "volunteer_arts_life_skills_notes",
        label: "More about your arts/life skills",
        inputType: "text",
        placeholder: "Enter here",
        gridCols: 1,
    },
    {
        id: "support_preference",
        label: "What type of support are you comfortable providing?",
        inputType: "async-select",
        endpoint: "support_preference",
        variant: "single",
        responseAsLabel: "support_preference_name",
        responseAsValue: "support_preference_name",
        placeholder: "Select an option",
        gridCols: 2,
        required: true,
    },
    {
        id: "support_preference_details",
        label: "Please tell us more",
        sublabel: "Required when you select a preference or limitation above",
        inputType: "textarea",
        placeholder: "Describe your preferences or limitations",
        gridCols: 2,
    },
    {
        id: "volunteer_teaching_traits",
        label: "What are your Teaching Traits, Preferences & Limitations",
        sublabel: "(optional, not tied to your answer above)",
        inputType: "textarea",
        placeholder: "Describe here",
        gridCols: 2,
    },
];

const CriminalBackgroundCheckFields: FormField[] = [
    {
        id: "convicted_of_a_felony",
        label: "Have you ever been convicted of a felony or misdemeanor?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "involved_in_criminal_activity",
        label: "Have you ever been involved in any criminal activity or legal proceedings, including pending charges or arrests?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "convicted_of_a_crime",
        label: "Have you been convicted of any crimes involving minors, abuse, or neglect?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "description",
        label: `Please describe the circumstance behind the "yes" answer above.`,
        inputType: "textarea",
        placeholder: "Describe here",
        gridCols: 2,
    },
];

const SexOffenderCheckFields: FormField[] = [
    {
        id: "checked_for_sex_offender",
        label: "Are you listed on any state or national sex offender registries?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "description",
        label: `Please describe the circumstance behind the "yes" answer above.`,
        inputType: "textarea",
        placeholder: "Describe here",
        gridCols: 2,
    },
];

const DisciplinaryCheckDetailsFields: FormField[] = [
    {
        id: "terminated_from_volunteer_position",
        label: "Have you ever been terminated or asked to resign from a volunteer or employment position for reasons related to misconduct or inappropriate behavior?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "involved_in_disputes",
        label: "Have you ever been involved in any disputes with employers or organizations related to safety or ethical issues?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "dismissed_from_institution",
        label: "Have you ever faced dismissal, suspension, probation, or any other disciplinary or academic action from a college, university, or professional school?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "description",
        label: `Please describe the circumstance behind the "yes" answer above.`,
        inputType: "textarea",
        placeholder: "Describe here",
        gridCols: 2,
    },
];

const HealthSafetyAgreementFields: FormField[] = [
    {
        id: "having_health_issues",
        label: "Do you have any physical or mental health conditions that may affect your ability to perform volunteer duties?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "description",
        label: `Please describe the circumstance behind the "yes" answer above.`,
        inputType: "textarea",
        placeholder: "Describe here",
        required: false,
        gridCols: 2,
    },
];

const OtherConsentsDetailsFields: FormField[] = [
    {
        id: "consent_to_background_checks",
        label: "Do you consent to do child abuse registry and sex offender checks if needed?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "agree_to_follow_organization_policies",
        label: "Do you agree to follow the organization’s policies on confidentiality, behavior, and safeguarding procedures?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "agree_to_understand_termination_of_volunteer_agreement",
        label: "Do you understand that your volunteer role may be terminated based on any criminal activity or failure to adhere to the organization's policies?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "description",
        label: `Please describe the circumstance behind the "no" answer above.`,
        inputType: "textarea",
        placeholder: "Describe here",
        gridCols: 2,
    },
];

const VolunteerExperienceDetailsFields: FormField[] = [
    // {
    //     id: "previously_volunteered",
    //     label: "Have you previously volunteered with children or vulnerable populations?",
    //     inputType: "radio",
    //     options: [
    //         { label: "Yes", value: true },
    //         { label: "No", value: false },
    //     ],
    //     gridCols: 2,
    //     required: true,
    // },
    {
        id: "invloved_in_complaints",
        label: "Have you ever been involved in any incidents or complaints during previous volunteer roles?",
        inputType: "radio",
        options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
        ],
        gridCols: 2,
        required: true,
    },
    {
        id: "description",
        label: `Please describe the circumstance behind the "yes" answer above.`,
        inputType: "textarea",
        placeholder: "Describe here",
        gridCols: 2,
    },
];

export const VolunteerFormSections: FormSectionConfig[] = [
    {
        title: "Volunteer Info",
        fields: [
            {
                parent: null,
                title: "Volunteer Details",
                fields: VolunteerDetailsFields,
            },
            {
                parent: null,
                title: "Parent Details",
                fields: ParentDetailsFields,
            },
            {
                parent: null,
                title: "Education & Work Experience",
                fields: EducationWorkExperienceFields,
            },
        ],
        type: "card",
    },
    {
        parent: null,
        title: "Profile Details",
        fields: [
            {
                parent: null,
                title: "Skills to teach Learners",
                fields: SkillsToTeachFields,
            },
        ],
        type: "card",
    },
    {
        parent: "legal_and_safety_info",
        title: "Legal and Safety Info",
        fields: [
            {
                parent: "criminal_background_check_details",
                title: "Criminal Background Check",
                fields: CriminalBackgroundCheckFields,
            },
            {
                parent: "sex_offender_check_details",
                title: "Sex Offender Registry Check",
                fields: SexOffenderCheckFields,
            },
            {
                parent: "disciplinary_check_details",
                title: "Disciplinary History",
                fields: DisciplinaryCheckDetailsFields,
            },
            {
                parent: "health_and_safety_check_details",
                title: "Health and Safety Information",
                fields: HealthSafetyAgreementFields,
            },
            {
                parent: "other_consents_details",
                title: "Consents",
                fields: OtherConsentsDetailsFields,
            },
            {
                parent: "volunteer_experience_details",
                title: "Previous Volunteer Experience",
                fields: VolunteerExperienceDetailsFields,
            },
        ],
        type: "card",
    },
    {
        //TODO: Need Clarification
        title: "Volunteer snapshot",
        fields: [
            {
                id: "volunteer_description",
                label: "Why do you want to tutor with us, and what do you hope to gain from this experience? What subjects would you like to teach, and why?",
                sublabel:
                    "Please share an overview of your profile, your areas of expertise and the reasons behind your choice, such as your passion for the subject or past teaching experience.",
                inputType: "textarea",
                placeholder: "Describe here",
                required: true,
                gridCols: 2,
            },
            {
                id: "profile_picture",
                label: "Profile Picture",
                inputType: "upload",
                required: true,
                gridCols: 1,
                variant: "file",
                fileType: "image/*",
            },
            {
                id: "profile_video",
                label: "Profile Video",
                sublabel:
                    "Record a Video summarizing your profile and qualifications. This will help the learners to get to know you better!  Feel free to share your hobbies, extracurricular activities, and explain how and why you believe you're well-suited to teach the subject you've chosen to special needs learners. You can keep it casual ! Speak from the heart and share what feels natural.",
                inputType: "upload",
                gridCols: 2,
                variant: "file",
                fileType: "video/*",
            },
            // {
            //     id: "profile_document",
            //     label: "ID Verification",
            //     sublabel:
            //         "Please share an overview of your profile, your areas of expertise and the reasons behind your choice, such as your passion for the subject or past teaching experience.",
            //     inputType: "upload",
            //     required: true,
            //     gridCols: 2,
            //     variant: "file",
            //     fileType: "application/*,image/*",
            // },
        ],
    },
    {
        title: "Consent",
        parent: "consent_and_permissions",
        fields: [
            {
                id: "photo_or_video_consent",
                label: "Photo/Video Consent",
                sublabel: "(for use in program materials or promotional content)",
                inputType: "radio",
                options: [
                    { label: "Yes", value: true },
                    { label: "No", value: false },
                ],
                required: false,
                gridCols: 1,
            },
            // {
            //     id: "acknowledgement_of_program_policies",
            //     label: "Acknowledgment of Program Policies ",
            //     sublabel: "(Rules, Expectations, and Procedures)",
            //     options: [
            //         { label: "Yes", value: true },
            //         { label: "No", value: false },
            //     ],
            //     inputType: "radio",
            //     gridCols: 1,
            // },
        ],
    },
];

export const VolunteerProfileFormConstants: FormSectionConfig[] = VolunteerFormSections?.filter(
    (section) => section.parent !== "consent_and_permissions"
);

export const VolunteerOnboardingConstants = {
    title: "Join as a Volunteer",
    description:
        "Flexible schedules, meaningful impact—volunteer your way to help someone with special needs to discover their potential.",
};

export const VolunteerThankyouCardConstants = {
    title: "Thank You for Applying!",
    description:
        "We appreciate you considering this rewarding opportunity to change lives. MelodyWings team will verify the information provided in your application and thank you for your enthusiasm and willingness to make a difference in the lives of others.",
};

export const VolunteerRejectedMessage = {
    title: "Thank you for your interest!",
    description:
        "At this time, we are unable to proceed with your application. We truly appreciate your willingness to contribute and encourage you to check back for future opportunities!",
};
