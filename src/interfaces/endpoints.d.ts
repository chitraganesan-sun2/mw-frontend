import { create } from "zustand";

export type EndpointProps = {
    onboarding: {
        update: (role: "volunteer" | "learner") => `onboarding/${typeof role}`;
        getOnboardingStatus: (id: string, role: "volunteer" | "learner") => string;
        setLearnerOnboardingStatus: (id: string) => string;
        getOnboardingVolunteerData: (id: string) => string;
        getOnboardingLearnerData: (id: string) => string;
    };
    auth: {
        oauth2callback: string;
        checkCalendarScope: string;
        revokeGoogleAuth: string;
    };
    user: {
        signIn: string;
        login: string;
        deleteAccount: string;
    };
    learner: {
        update: (id: string) => string;
        getAllLearners: string;
        getIndividualLearner: (id: string) => string;
        getConnectedVolunteers: (id: string) => string;
        getTotalLearnersCount: string;
        emailPreference: (id: string) => string;
    };
    volunteer: {
        update: (id: string) => string;
        getAllVolunteers: string;
        getIndividualVolunteer: (id: string) => string;
        getConnectedLearners: (id: string) => string;
        getTotalVolunteersHours: string;
    };
    volunteer_slot: {
        update: string;
        get: string;
        availableSlots: (id: string, date: string) => string;
        availableDays: (id: string, month: string) => string;
        getAllSlotsForMonth: (month: string) => string;
        deleteParticularSlot: string;
        getAvailableDaysForDate: (date: string) => string;
        createSlotForParticularDate: string;
    };
    session: {
        bookSession: string;
        createInstantSession: string;
        claimInstantSession: string;
        getInstantSessions: string;
        validateInstantSession: (session_date: string, session_start_time: string, session_end_time: string) => string;
        getVolunteerInstantSession: (volunteer_slot_id: string, date: string, volunteer_id: string) => string;
        getLearnerInstantSession: (date: string, isAccepted?: boolean, query?: string) => string;
        getAcceptedInstantSessionsByDate: (date: string) => string;
        getLearnerInstantSessionDetail: (volunteer_slot_id: string) => string;
        unclaimInstantSession: (volunteer_slot_id: string) => string;
        getLearnerSessions: (id: string) => string;
        cancelSession: (id: string) => string;
        getApprovalNotifications: (id: string) => string;
        updateNotificationStatus: (id: string) => string;
        getCalendarEvents: (
            id: string,
            userType: "volunteer" | "learner",
            month?: string,
            status?: string
        ) => string;
        markAsCompleted: (id: string) => string;
        getUnreadCount: (userType?: "volunteer" | "learner") => string;
        updateReadsNotifications: string;
        createLearnerInstantSessionRequest: string;
        getLearnerRequests: (page?: number, size?: number, query?: string, requestStatus?: string) => string;
        cancelLearnerRequest: (id: string) => string;
        getVolunteerLearnerRequests: (page?: number, size?: number, query?: string) => string;
        acceptLearnerRequest: (id: string) => string;
        getMyInstantSessions: (page?: number, size?: number, query?: string, requestStatus?: string) => string;
        getSessionDetail: (sessionId: string) => string;
    };
    volunteer_chat: {
        sendMessage: (id: string) => string;
        getMessages: (id: string) => string;
    };
    learner_chat: {
        sendMessage: (id: string) => string;
        getMessages: (id: string) => string;
    };
    resources: {
        create: string;
        get: string;
        getMyResources: string;
        getResourcesByCategory: (category: string) => string;
        getCategories: string;
        getResource: (resource_id: string) => string;
        delete: (resource_id: string) => string;
        update: (resource_id: string) => string;
        like: (resource_id: string) => string;
        dislike: (resource_id: string) => string;
    };
    post: {
        createPost: string;
        getPosts: string;
        getMyPosts: string;
        getSavedPosts: string;
        getSinglePost: (post_id: string) => string;
        like: (post_id: string) => string;
        unlike: (post_id: string) => string;
        save: (post_id: string) => string;
        unsave: (post_id: string) => string;
        getNotifications: string;
        readNotifications: string;
        updatePost: (id: string) => string;
        deletePost: (id: string) => string;
    };
    comment: {
        createComment: string;
        getPostComments: (post_id: string) => string;
        commentLikes: (comment_id: string) => string;
    };
    common: (path: CommonPath) => string;
    volunterFeedback: {
        create: string;
        get: (id: string) => string;
        update: string;
    };
    learnerFeedback: {
        create: string;
        get: (id: string) => string;
        update: string;
    };
    report: {
        create: string;
    };
    media_uploader: {
        image: string;
        video: string;
        document: string;
        deleteImage: (id: string) => string;
        deleteVideo: (id: string) => string;
        deleteDocument: (id: string) => string;
    };
    chat: {
        createChatForVolunteer: (volunteerId: string) => string;
        createChatForLearner: (learnerId: string) => string;
        sendMessageToVolunteer: (volunteerId: string) => string;
        sendMessageToLearner: (learnerId: string) => string;
        getMessagesForVolunteer: (volunteerId: string) => string;
        getMessagesForLearner: (learnerId: string) => string;
        getAllchatsOfVolunteer: (volunteerId: string) => string;
        getAllchatsOfLearner: (learnerId: string) => string;
        getIndividualChat: (chatId: string, type: "learner" | "volunteer") => string;
        readMessage: string;
        volunteerPermission: (id: string) => string;
        learnerPermission: (id: string) => string;
    };
    tutorialLinks: {
        getAll: string;
    };
    publicSessions: {
        getInstantSessions: (limit?: number) => string;
    };
    contact: {
        create: string;
    };
};

// (string & {}) keeps literal autocomplete for known paths while still accepting any
// string - needed for query-bearing values like "skills?category=academic".
type CommonPath =
    | "skills"
    | "languages"
    | "subjects"
    | "media"
    | "categories"
    | "development_disabilities"
    | "assistive_devices"
    | "communication_styles"
    | "areas_of_support"
    | "preferred_learner_age_group"
    | "support_preference"
    | (string & {});
