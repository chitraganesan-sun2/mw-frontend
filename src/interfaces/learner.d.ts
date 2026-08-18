interface Learner {
    learner_personal_info: Learnerpersonalinfo;
    parent_info?: Parentinfo;
    learner_special_needs: Learnerspecialneeds;
    education: Education;
    // Sections below are no longer collected by the onboarding/profile-edit UI (their
    // fields moved into education/learner_special_needs/learner_goals) but stay optional
    // here since existing records may still carry this data - see
    // docs/learner-volunteer-onboarding-migration-plan.md.
    social_skills?: Socialskills;
    current_interests?: Currentinterests;
    additional_info?: Additionalinfo;
    learner_goals: Learnergoals;
    consent_and_permissions: Consentandpermissions;
    profile_picture?: ProfilePicture | null;
}

interface Consentandpermissions {
    photo_or_video_consent: boolean;
    // acknowledgement_of_program_policies: boolean;
}

interface Additionalinfo {
    cultural_consideration?: string;
    other_concerns_or_requests?: string;
    what_motivates_to_learn?: string;
}

interface Learnergoals {
    expected_goals: string[];
    skills_to_learn?: { skill_name: string; skill_id: string }[];
    academic_skills_to_learn?: { skill_name: string; skill_id: string }[];
    arts_life_skills_to_learn?: { skill_name: string; skill_id: string }[];
    academic_goals_description?: string;
    arts_life_goals_description?: string;
    other_comments_or_notes?: string;
    preferred_volunteer_qualities: string;
    skill_level: string;
}

interface Currentinterests {
    interests?: string[];
    extra_curricular_activities?: string[] | string;
    favorite_activities?: string[] | string;
}

interface Socialskills {
    communication_preferences?: string[];
    social_interaction_styles?: string[];
    behavioral_concerns?: string[];
    techniques_to_calm?: string[];
}

interface Education {
    current_school: string;
    iep_plan_key?: string;
    program_iep_504_plan?: string;
    grade_or_education_level?: string;
    cultural_religious_considerations?: string;
    extracurricular_activities?: string;
    favorite_free_time_activities?: string;
    academic_strengths: string[];
    academic_challenges?: string[];
}

interface Learnerspecialneeds {
    type_of_developmental_disability: string;
    level_of_support_needed: string;
    assistive_device_used: string;
    communication_style: string;
    description: string;
    areas_of_support_needed?: string[];
    learning_styles?: string[];
    behavioral_concerns?: string;
    behavior_support_strategies?: string[];
}

interface Learnerpersonalinfo {
    learner_first_name: string;
    learner_last_name: string;
    learner_date_of_birth: string;
    learner_gender: string;
    learner_preferred_pronoun: string;
    learner_primary_language: string;
    learner_contact_details: Learnercontactdetails;
}

interface Learnercontactdetails {
    email: string;
    contact_number: Parentcontactnumber;
    zip_code: string;
    country: string,
    timezone: string,
    utc_offset: string
}

interface Parentinfo {
    parent_first_name: string;
    parent_last_name: string;
    parent_contact_number: Parentcontactnumber;
    parent_address: string;
    relationship_to_learner: string;
    parent_email: string;
}

interface Parentcontactnumber {
    number: string;
    country_code: string;
}

interface ProfilePicture {
    image_url: string;
    image_id: string;
}
