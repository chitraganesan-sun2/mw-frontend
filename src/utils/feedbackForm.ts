export type FeedbackRole = "learner" | "volunteer";
export type YesNo = "yes" | "no";
export type GoalAnswer = "yes" | "partly" | "no";

export interface FeedbackFormData {
    notes?: string;
    rating?: string;
    /** One-tap answers; undefined = skipped. */
    session_helpful?: YesNo;
    goal_addressed?: GoalAnswer;
}

/** The same 1-5 rating, worded for whoever is giving it. A learner used to be asked about
 *  "the learner's" focus when rating their volunteer. */
export function ratingQuestion(role: FeedbackRole): string {
    return role === "learner" ? "How committed and prepared was your volunteer?" : "Focus / interest level of the learner";
}

export function quickQuestions(role: FeedbackRole) {
    return role === "learner"
        ? { helpful: "Was this session helpful to you?", goal: "Did you work on what you wanted to?" }
        : { helpful: "Did the session go well?", goal: "Did you get to what the learner wanted to work on?" };
}

/** An error message for the form, or null. Only the comment and rating are required. */
export function validateFeedback(form: FeedbackFormData): string | null {
    if (!form.notes?.trim() || !form.rating) return "Please enter your feedback.";
    return null;
}

/** The POST body. The 1-5 rating goes in the field each endpoint expects, and a one-tap answer is
 *  sent only when chosen. `event` carries the session id (and the ids the server ignores). */
export function buildFeedbackPayload(role: FeedbackRole, form: FeedbackFormData, event: Record<string, unknown> = {}) {
    return {
        comment: form.notes,
        [role === "learner" ? "volunteer_commitment_level" : "learner_interest_level"]: Number(form.rating) || 0,
        ...(form.session_helpful ? { session_helpful: form.session_helpful === "yes" } : {}),
        ...(form.goal_addressed ? { goal_addressed: form.goal_addressed } : {}),
        ...event,
    };
}
