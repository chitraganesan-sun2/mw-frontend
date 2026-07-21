import { EndpointProps } from "@/interfaces/endpoints";

type UserType = "volunteer" | "learner";
type CommonPath = "skills" | "languages" | "subjects" | "media" | "categories";

export const endpoints: EndpointProps = {
    onboarding: {
        update: (role: "volunteer" | "learner") => `onboarding/${role}`,
        getOnboardingStatus: (id: string, role: "volunteer" | "learner") =>
            `onboarding/status/${role}/${id}`,
        setLearnerOnboardingStatus: (id: string) =>
            `onboarding/update_verification_status/learner/${id}?verification_status=verification_completed`,
        getOnboardingVolunteerData: (id: string) => `auth/decrypt_volunteer_details/${id}`,
        getOnboardingLearnerData: (id: string) => `auth/decrypt_learner_details/${id}`,
    },
    auth: {
        oauth2callback: "auth/oauth2callback",
        checkCalendarScope: "auth/check_calendar_scope",
        revokeGoogleAuth: "auth/revoke_google_auth",
    },
    user: {
        signIn: "auth/signup",
        login: "auth/login",
        deleteAccount: "auth/delete-account",
    },
    learner: {
        update: (id: string) => `learner/${id}`,
        getAllLearners: "learner",
        getIndividualLearner: (id: string) => `learner/${id}`,
        getConnectedVolunteers: (id: string) => `learner/${id}/connected_volunteers`,
        getTotalLearnersCount: "learner/total_learners_count",
        emailPreference: (id: string) => `learner/${id}/email_preference`,
    },
    volunteer: {
        update: (id: string) => `volunteers/${id}`,
        getAllVolunteers: "volunteers",
        getIndividualVolunteer: (id: string) => `volunteers/${id}`,
        getConnectedLearners: (id: string) => `volunteers/${id}/connected_learners`,
        getTotalVolunteersHours: "volunteers/total_volunteered_hours",
    },
    volunteer_slot: {
        update: "volunteer_slots",
        get: `volunteer_slots`,
        availableSlots: (id: string, date: string) =>
            `volunteer_slots/available_slots/${id}/${date}`,
        availableDays: (id: string, month: string) =>
            `volunteer_slots/available_days/${id}/${month}`,
        getAllSlotsForMonth: (month: string) => `volunteer_slots/slots_and_sessions/${month}`,
        deleteParticularSlot: `volunteer_slots/add_unavailable_slots`,
        getAvailableDaysForDate: (date: string) => `volunteer_slots/get_slots_by_date/${date}`,
        createSlotForParticularDate: `volunteer_slots/add_available_slots`,
    },
    session: {
        bookSession: "session",
        createInstantSession: "session/instant_session",
        claimInstantSession: "session/instant_session/claim",
        /** GET all active instant sessions (for dedicated instant sessions page) */
        getInstantSessions: "session/instant_session/active",
        validateInstantSession: (session_date: string, session_start_time: string, session_end_time: string) =>
            `session/instant_session/validate?session_date=${encodeURIComponent(session_date)}&session_start_time=${encodeURIComponent(session_start_time)}&session_end_time=${encodeURIComponent(session_end_time)}`,
        /** GET instant session by slot (query: volunteer_slot_id, date YYYY-MM-DD, volunteer_id) */
        getVolunteerInstantSession: (volunteer_slot_id: string, date: string, volunteer_id: string) =>
            `session/volunteer/instant_session?volunteer_slot_id=${encodeURIComponent(volunteer_slot_id)}&date=${encodeURIComponent(date)}&volunteer_id=${encodeURIComponent(volunteer_id)}`,
        /** GET learner instant sessions (query: date YYYY-MM-DD, is_accepted boolean) */
        getLearnerInstantSession: (date: string, isAccepted?: boolean) =>
            `session/learner/instant_session?date=${encodeURIComponent(date)}${isAccepted !== undefined ? `&is_accepted=${isAccepted}` : ""}`,
        /** GET accepted instant sessions by date (path: date YYYY-MM-DD) */
        getAcceptedInstantSessionsByDate: (date: string) =>
            `session/learner/instant_session/accepted/${encodeURIComponent(date)}`,
        getLearnerInstantSessionDetail: (volunteer_slot_id: string) =>
            `session/learner/instant_session/${volunteer_slot_id}`,
        unclaimInstantSession: (volunteer_slot_id: string) =>
            `session/instant_session/unclaim/${volunteer_slot_id}`,
        getLearnerSessions: (id: string) => `session/learner/${id}`,
        cancelSession: (id: string) => `session/${id}`,
        getApprovalNotifications: (id: string) => `session/pending_invites/${id}`,
        getCalendarEvents: (id: string, userType: UserType, month?: string, status?: string) =>
            `session/${userType}/${id}${month ? `?month=${month}` : ""}${status ? `?status=${status}` : ""
            }`,
        updateNotificationStatus: (id: string) => `session/${id}`,
        markAsCompleted: (id: string) => `session/${id}/mark_as_completed`,
        getUnreadCount: (id: string) => `session/unread_count`,
        updateReadsNotifications: `session/mark_as_read`,
        createLearnerInstantSessionRequest: "session/learner/request_instant_session",
        getLearnerRequests: "session/learner/my_requests",
        cancelLearnerRequest: (id: string) => `session/learner/request/${id}`,
        getVolunteerLearnerRequests: "session/volunteer/learner_requests",
        acceptLearnerRequest: (id: string) => `session/volunteer/accept_learner_request/${id}`,
    },
    volunteer_chat: {
        sendMessage: (id: string) => `chat/message/learner/${id}`,
        getMessages: (id: string) => `chat/messages/learner/${id}`,
    },
    learner_chat: {
        sendMessage: (id: string) => `chat/message/volunteer/${id}`,
        getMessages: (id: string) => `chat/messages/volunteer/${id}`,
    },
    post: {
        createPost: "post",
        getPosts: "post",
        getMyPosts: "post/my_posts/all",
        getSavedPosts: "post/saved_posts/all",
        getSinglePost: (post_id: string) => `post/${post_id}`,
        like: (post_id: string) => `post/${post_id}/like`,
        unlike: (post_id: string) => `post/${post_id}/unlike`,
        save: (post_id: string) => `post/${post_id}/save`,
        unsave: (post_id: string) => `post/${post_id}/unsave`,
        getNotifications: "post/notifications/all",
        readNotifications: "post/notifications/read",
        updatePost: (id: string) => `/post/${id}`,
        deletePost: (id: string) => `/post/${id}`,
    },
    comment: {
        createComment: "comment",
        getPostComments: (post_id: string) => `comment/${post_id}`,
        commentLikes: (comment_id: string) => `comment/${comment_id}/like`,
    },
    common: (path: CommonPath) => `common/${path}/`,
    resources: {
        create: "resource",
        get: "resource",
        getMyResources: "resource/myresources",
        getResourcesByCategory: (category: string) => `resource/categories/${category}`,
        getCategories: "resource/categories/all",
        getResource: (resource_id: string) => `resource/${resource_id}`,
        delete: (resource_id: string) => `resource/${resource_id}`,
        update: (resource_id: string) => `resource/${resource_id}`,
        like: (resource_id: string) => `resource/${resource_id}/like`,
        dislike: (resource_id: string) => `resource/${resource_id}/like`,
    },
    volunterFeedback: {
        create: "feedback/volunteer",
        get: (id: string) => `feedback/volunteer/${id}`,
        update: "feedback/volunteer",
    },
    learnerFeedback: {
        create: "feedback/learner",
        get: (id: string) => `feedback/learner/${id}`,
        update: "feedback/learner",
    },
    report: {
        create: "report",
    },
    media_uploader: {
        image: "common/media_uploader/image",
        video: "common/media_uploader/video",
        document: "common/media_uploader/document",
        deleteImage: (id: string) => `common/media_uploader/image/${id}`,
        deleteVideo: (id: string) => `common/media_uploader/video/${id}`,
        deleteDocument: (id: string) => `common/media_uploader/document/${id}`,
    },
    chat: {
        createChatForVolunteer: (volunteerId: string) => `chat/volunteer/${volunteerId}`,
        createChatForLearner: (learnerId: string) => `chat/learner/${learnerId}`,
        sendMessageToVolunteer: (volunteerId: string) => `chat/message/volunteer/${volunteerId}`,
        sendMessageToLearner: (learnerId: string) => `chat/message/learner/${learnerId}`,
        getMessagesForVolunteer: (volunteerId: string) => `chat/messages/volunteer/${volunteerId}`,
        getMessagesForLearner: (learnerId: string) => `chat/messages/learner/${learnerId}`,
        getAllchatsOfVolunteer: (volunteerId: string) => `chat/all/volunteer/${volunteerId}`,
        getAllchatsOfLearner: (learnerId: string) => `chat/all/learner/${learnerId}`,
        getIndividualChat: (chatId: string, type: "learner" | "volunteer") =>
            `chat/chat/${chatId}/${type}`,
        readMessage: `chat/message/read`,
        volunteerPermission: (id: string) => `volunteers/${id}/chat_permission`,
        learnerPermission: (id: string) => `learner/${id}/chat_permission`,
    },
    tutorialLinks: {
        getAll: "tutorial-links/",
    },
    publicSessions: {
        getInstantSessions: (limit?: number) => `session/public/instant_sessions${limit ? `?limit=${limit}` : ""}`,
    },
};
