"use client";

import { useQueryState } from "nuqs";

interface ProfileNameLinkProps {
    /** Whose profile this name opens. */
    role: "learner" | "volunteer";
    id?: string | null;
    name: string;
    className?: string;
}

/**
 * A learner's / volunteer's name that opens their profile modal. Sets ?learnerId= /
 * ?volunteerId=, which LearnerViewModal / VolunteerViewModal read - the host page renders
 * the modal. Falls back to plain text when there is no id. Coloured by the PERSON's role
 * (blue = Learner, orange = Volunteer), like every other role indicator.
 */
const ProfileNameLink: React.FC<ProfileNameLinkProps> = ({ role, id, name, className = "" }) => {
    const [, setProfileId] = useQueryState(role === "learner" ? "learnerId" : "volunteerId");
    if (!id) return <span className={className}>{name}</span>;
    return (
        <button
            type="button"
            onClick={() => setProfileId(id)}
            aria-label={`View ${name}'s profile`}
            className={`appearance-none border-0 bg-transparent p-0 text-left font-semibold underline underline-offset-2 cursor-pointer hover:opacity-80 ${
                role === "learner" ? "text-learner-dark decoration-learner/40" : "text-volunteer-dark decoration-volunteer/40"
            } ${className}`}
        >
            {name}
        </button>
    );
};

export default ProfileNameLink;
