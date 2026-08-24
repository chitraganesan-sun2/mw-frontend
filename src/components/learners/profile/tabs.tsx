import ContactDetails from "@/components/profile/Bio/ContactDetails";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { formatString, formatStringBy } from "@/utils/stringFormats";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const InfoItem = ({ label, value, fullWidth }: { label: string, value?: string | string[], fullWidth?: boolean }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    const renderValue = (value: string | string[] | { value: string }) => {
        if (Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map((item, index) => (
                        <p key={index} className="text-xs px-2 py-1 rounded-full font-medium bg-background break-words">
                            {formatString(item)}
                        </p>
                    ))}
                </div>
            );
        }
        return <p className="text-base font-medium break-words">{formatString(typeof value === "object" ? value?.value : value)}</p>;
    };

    // Length-based full-width was too aggressive to trust on its own (many short
    // descriptions still wrapped awkwardly in a half-width column) - callers of
    // free-text/description fields pass fullWidth explicitly instead.
    const isFullWidth = fullWidth || (Array.isArray(value) && value.length > 3) || String(value).length > 40;
    return (
        <div className={`flex flex-col gap-1 ${isFullWidth ? "col-span-2" : ""}`}>
            <p className="text-sm font-normal text-gray-light">{label}</p>
            {renderValue(value)}
        </div>
    )
}


export const ProfileDetails = ({ data }: { data: Learnerpersonalinfo }) => {
    const contact_data = data?.learner_contact_details;
    const contactDetails = [
        { title: "Phone Number", value: contact_data?.contact_number?.number, icon: <FaPhoneAlt size={13} /> },
        { title: "Email", value: contact_data?.email, icon: <MdEmail size={15} /> },
    ].filter(item => item.value);

    const details = [
        { label: "First Name", value: data?.learner_first_name },
        { label: "Last Name", value: data?.learner_last_name },
        { label: "Date of Birth", value:  dayjs(data?.learner_date_of_birth, "DD-MM-YYYY").format("DD-MMM-YYYY") },
        { label: "Gender", value: formatString(data?.learner_gender) },
        { label: "Preferred Pronoun", value: formatStringBy({ str: data?.learner_preferred_pronoun, to: "/" }) },
        { label: "Primary Language", value: formatString(data?.learner_primary_language) },
        { label: "Zip Code", value: contact_data?.zip_code },
        { label: "Country of Residence", value: formatString(contact_data?.country) },
        { label: "Timezone", value: formatString(contact_data?.timezone) },
        { label: "UTC Offset", value: contact_data?.utc_offset },
    ].filter(item => item.value);

    return (
        <div>
            <h5 className="text-xl font-semibold mb-3">Profile Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {details.map((detail) => (
                    <InfoItem key={detail.label} label={detail.label} value={detail.value} />
                ))}
                <div className="col-span-2">
                    <ContactDetails tags={contactDetails} />
                </div>
            </div>
        </div>
    )
}


export const ParentGuardianInformation = ({ data }: { data: Parentinfo }) => {
    const details = [
        { label: "First Name", value: data?.parent_first_name },
        { label: "Last Name", value: data?.parent_last_name },
        { label: "Address", value: data?.parent_address },
        { label: "Relationship", value: data?.relationship_to_learner },
    ].filter(item => item.value);

    const number = data?.parent_contact_number?.number;
    const email = data?.parent_email;
    const emergencyNumber = data?.emergency_contact_number?.number;

    const contactDetails = [
        { title: "Phone Number", value: number, icon: <FaPhoneAlt size={13} /> },
        { title: "Email", value: email, icon: <MdEmail size={15} /> },
        { title: "Emergency Contact Number", value: emergencyNumber, icon: <FaPhoneAlt size={13} /> },
    ].filter(item => item.value);

    if(details.length === 0 && contactDetails.length === 0) return <div className="text-center text-base font-medium h-full flex-center">No information found</div>;

    return (
        <div>
            <h5 className="text-xl font-semibold mb-3">Guardian Information</h5>
            <div className="grid grid-cols-2 gap-3">
                {details.map((detail) => (
                    <InfoItem key={detail.label} label={detail.label} value={detail.value} />
                ))}
                <div className="col-span-2">
                    <ContactDetails tags={contactDetails} />
                </div>
            </div>
        </div>
    )
}


export const LearnerInformation = ({ data }: { data: Learner }) => {
    // Hand-curated per section (rather than Object.entries over the raw backend object) so:
    // - labels read the same as the other tabs, instead of a raw snake_case key run through
    //   a single-capitalize formatter (e.g. "Academic goals description").
    // - legacy pre-restructure fields (expected_goals, skill_level, skills_to_learn,
    //   skills_to_learn_unclassified, areas_of_support_needed, learning_styles - none of which
    //   the current onboarding form collects) don't show up as stray, unlabeled rows.
    // - free-text description fields are always full width, not just past a length threshold,
    //   so short ones don't wrap awkwardly in a half-width column.
    const sections = [
        {
            title: "Disability-Specific Information",
            fields: [
                { label: "Type of Developmental Disability", value: data?.learner_special_needs?.type_of_developmental_disability },
                { label: "Level of Support Needed", value: formatString(data?.learner_special_needs?.level_of_support_needed || "") },
                { label: "Assistive Devices Used", value: data?.learner_special_needs?.assistive_device_used },
                { label: "Communication Style", value: data?.learner_special_needs?.communication_style },
                { label: "Behavioral Concerns", value: data?.learner_special_needs?.behavioral_concerns, fullWidth: true },
                { label: "Behavior Support Strategies", value: data?.learner_special_needs?.behavior_support_strategies?.map(formatString) },
                { label: "Disability Details", value: data?.learner_special_needs?.description, fullWidth: true },
            ],
        },
        {
            title: "Education and Hobbies",
            fields: [
                { label: "Name of the Academy", value: data?.education?.current_school },
                { label: "Grade or Education Level", value: data?.education?.grade_or_education_level },
                { label: "Program or IEP or 504 Plan", value: data?.education?.program_iep_504_plan, fullWidth: true },
                { label: "Cultural/Religious Considerations", value: data?.education?.cultural_religious_considerations, fullWidth: true },
                { label: "Academic Strengths", value: data?.education?.academic_strengths?.map(formatString) },
                { label: "Extracurriculars/ Non-Academic Skills", value: data?.education?.extracurricular_activities, fullWidth: true },
                { label: "Favorite Free-Time Activities", value: data?.education?.favorite_free_time_activities, fullWidth: true },
            ],
        },
        {
            title: "Skills to Learn from Volunteers",
            fields: [
                { label: "Academic Skills to Learn", value: data?.learner_goals?.academic_skills_to_learn?.map(skill => skill?.skill_name) },
                { label: "Academic Goals Description", value: data?.learner_goals?.academic_goals_description, fullWidth: true },
                { label: "Arts & Life Skills to Learn", value: data?.learner_goals?.arts_life_skills_to_learn?.map(skill => skill?.skill_name) },
                { label: "Arts, Life Skills & Goals Description", value: data?.learner_goals?.arts_life_goals_description, fullWidth: true },
                { label: "Goals & Preferred Volunteer Qualities", value: data?.learner_goals?.preferred_volunteer_qualities, fullWidth: true },
                { label: "Other Comments or Notes", value: data?.learner_goals?.other_comments_or_notes, fullWidth: true },
            ],
        },
    ].map(section => ({ ...section, fields: section.fields.filter(field => field.value && (!Array.isArray(field.value) || field.value.length > 0)) }))
     .filter(section => section.fields.length > 0);

    return (
        <div className="flex flex-col">
            <h5 className="text-xl font-semibold mb-2">Personal Info</h5>
            <div className="flex flex-col gap-3 divide-y divide-gray-dark">
                {sections.map(({ title, fields }) => (
                    <div key={title} className="py-3">
                        <h5 className="text-xl font-medium mb-2">{title}</h5>
                        <div className="grid grid-cols-2 gap-3">
                            {fields.map((field) => (
                                <InfoItem key={field.label} label={field.label} value={field.value} fullWidth={field.fullWidth} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};



export const AdditionalInformation = ({ data }: { data: Additionalinfo }) => {
    const details = [
        { label: "Cultural Consideration", value: data?.cultural_consideration ?? "" },
        { label: "Other Concerns or Requests", value: data?.other_concerns_or_requests ?? "" },
        { label: "What Motivates to Learn", value: data?.what_motivates_to_learn ?? "" },
    ]

    return (
        <div>
            <h5 className="text-xl font-semibold mb-3">Additional Information</h5>
            <div className="grid grid-cols-1 gap-3">
                {details.map((detail) => (
                    <InfoItem key={detail.label} label={detail.label} value={detail.value} />
                ))}
            </div>
        </div>
    )
}
