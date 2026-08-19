type Volunteer = {
    volunteer_first_name: string;
    volunteer_last_name: string;
    volunteer_birth_date: string;
    volunteer_description: string;
    volunteer_parent_email: string;
    volunteer_parent_contact_number?: Contactnumber;
    volunteer_higher_education: string;
    volunteer_gender: string;
    volunteer_experience?: string;
    consented_from_parent: boolean;
    volunteer_parent_name?: string;
    volunteer_contact_details: Volunteercontactdetails;
    legal_and_safety_info: Legalandsafetyinfo;
    consent_and_permissions: Consentandpermissions;
    profile_picture?: Profilepicture | null;
    profile_video?: Profilevideo | null;
    profile_document?: Profiledocument | null;
    volunteer_languages: Volunteerlanguage[];
    volunteer_subjects?: Volunteersubject[];
    volunteer_skills: Volunteerskill[];
    volunteer_education: string;
    education_details?: string;
    volunteer_work_experience?: string;
    volunteer_favorite_activities?: string;
    // New fields added by the onboarding restructure (2026-08) - see
    // docs/learner-volunteer-onboarding-migration-plan.md for the full old->new field mapping.
    preferred_learner_age_group?: string;
    volunteer_academic_skills_notes?: string;
    volunteer_arts_life_skills_notes?: string;
    support_preference?: string;
    volunteer_teaching_traits?: string;
};

type Consentandpermissions = {
    photo_or_video_consent: boolean;
    // acknowledgement_of_program_policies: boolean;
};

type Profiledocument = {
    document_url: string;
    document_id: string;
};

type Profilevideo = {
    video_url: string;
    video_id: string;
};

type Profilepicture = {
    image_url: string;
    image_id: string;
};

type Legalandsafetyinfo = {
    criminal_background_check_details: Criminalbackgroundcheckdetails;
    sex_offender_check_details: Sexoffendercheckdetails;
    disciplinary_check_details: Disciplinarycheckdetails;
    health_and_safety_check_details: Healthandsafetycheckdetails;
    other_consents_details: Otherconsentsdetails;
    volunteer_experience_details: Volunteerexperiencedetails;
};

type Volunteerexperiencedetails = {
    previously_volunteered: boolean;
    invloved_in_complaints: boolean;
    description: string;
};

type Otherconsentsdetails = {
    consent_to_background_checks: boolean;
    agree_to_follow_organization_policies: boolean;
    agree_to_understand_termination_of_volunteer_agreement: boolean;
    description: string;
};

type Healthandsafetycheckdetails = {
    having_health_issues: boolean;
    description: string;
};

type Disciplinarycheckdetails = {
    terminated_from_volunteer_position: boolean;
    involved_in_disputes: boolean;
    dismissed_from_institution: boolean;
    description: string;
};

type Sexoffendercheckdetails = {
    checked_for_sex_offender: boolean;
    description: string;
};

type Criminalbackgroundcheckdetails = {
    convicted_of_a_felony: boolean;
    involved_in_criminal_activity: boolean;
    convicted_of_a_crime: boolean;
    description: string;
};

type Volunteerskill = {
    skill_name: string;
    skill_id: string;
};

type Volunteersubject = {
    subject_name: string;
    subject_id: string;
};

type Volunteerlanguage = {
    language_name: string;
    language_id: string;
};

type Volunteercontactdetails = {
    email?: string;
    contact_number: Contactnumber;
    zip_code: string;
    country: string;
    timezone: string;
    utc_offset: string;
};

type Contactnumber = {
    number: string;
    country_code: string;
};
