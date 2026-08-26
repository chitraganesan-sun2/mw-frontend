interface LearnerCardProps {
    onSeeMoreClick: (learnerId: string) => void;
    learnerId: string;
    profileImage: string;
    name: string;
    location: string;
    learnerHrs: string;
    studentConnected: string;
    subjects: string[];
    languages: string;
    totalReviews: string;
    overallRating: string;
    chatPermission?: boolean;
    developementDisability: string;
    skillsToLearn?: Array<{
        skill_name: string;
        skill_id: string;
    }>;
}
