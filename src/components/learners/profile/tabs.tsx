import ContactDetails from "@/components/profile/Bio/ContactDetails";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { formatString, formatStringBy } from "@/utils/stringFormats";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const InfoItem = ({ label, value }: { label: string, value: string | string[] }) => {
    if (!value) return null;
    
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
    
    const isFullWidth = (Array.isArray(value) && value.length > 3) || String(value).length > 40;
    return (
        <div className={`flex flex-col gap-1 ${isFullWidth ? "col-span-2" : ""}`}>
            <p className="text-sm font-normal text-gray-light">{formatString(label)}</p>
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

    const contactDetails = [
        { title: "Phone Number", value: number, icon: <FaPhoneAlt size={13} /> },
        { title: "Email", value: email, icon: <MdEmail size={15} /> },
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
    const skills_to_learn = data?.learner_goals?.skills_to_learn?.map(skill => skill?.skill_name);
    const sections = [
        { title: "Disability-Specific Information", sectionData: data.learner_special_needs },
        { title: "Education and Background", sectionData: data.education },
        { title: "Behavior and Social Skills", sectionData: data.social_skills },
        { title: "Current Interests and Hobbies", sectionData: data.current_interests },
        {
            title: "Expectations and Goals",
            sectionData: {
                ...data?.learner_goals,
                // Rename key so it displays with the correct label
                "Skills and Expertise to Learn from Volunteers": skills_to_learn,
                skills_to_learn: undefined,
            }
        },
    ].filter(section => section.sectionData && Object.keys(section.sectionData).length);

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

    return (
        <div className="flex flex-col">
            <h5 className="text-xl font-semibold mb-2">Personal Info</h5>
            <div className="flex flex-col gap-3 divide-y divide-gray-dark">
                {sections.map(({ title, sectionData }) => (
                    <div key={title} className="py-3">
                        <h5 className="text-xl font-medium mb-2">{title}</h5>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(sectionData).map(([key, value]) => (
                                <InfoItem key={key} label={key} value={value} />
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
        { label: "Cultural Consideration", value: data?.cultural_consideration },
        { label: "Other Concerns or Requests", value: data?.other_concerns_or_requests },
        { label: "What Motivates to Learn", value: data?.what_motivates_to_learn },
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
