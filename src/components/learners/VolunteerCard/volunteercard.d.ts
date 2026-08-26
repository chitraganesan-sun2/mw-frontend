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
    skillsToLearn?: Array<{
        skill_name: string;
        skill_id: string;
    }>;
}
