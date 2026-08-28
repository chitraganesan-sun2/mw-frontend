interface VolunteerCardProps {
    onSeeMoreClick: (volunteerId: string) => void;
    volunteerId: string;
    profileImage: string;
    name: string;
    location: string;
    volunteerHrs: string;
    studentConnected: string;
    subjects: string[];
    languages: string[];
    totalReviews: string;
    overallRating: string;
    chatPermission?: boolean;
    /** From the list API's has_time_slots. Only an explicit `false` hides the
     * "Schedule a meeting" button; `undefined` (callers that don't pass it) keeps it. */
    hasTimeSlots?: boolean;
    skillsToLearn?: Array<{
        skill_name: string;
        skill_id: string;
    }>;
}
