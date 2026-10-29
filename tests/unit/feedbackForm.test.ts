import test from "node:test";
import assert from "node:assert/strict";
import { buildFeedbackPayload, quickQuestions, ratingQuestion, validateFeedback } from "../../src/utils/feedbackForm.ts";

test("a learner is no longer asked about 'the learner' when rating their volunteer", () => {
    assert.doesNotMatch(ratingQuestion("learner"), /learner/i);
    assert.match(ratingQuestion("volunteer"), /learner/i);
});

test("each role gets its own wording for the two quick questions", () => {
    assert.notEqual(quickQuestions("learner").helpful, quickQuestions("volunteer").helpful);
    assert.notEqual(quickQuestions("learner").goal, quickQuestions("volunteer").goal);
});

test("only the comment and the rating are required - not a session duration", () => {
    assert.equal(validateFeedback({ notes: "Great", rating: "4" }), null);
    assert.match(validateFeedback({ rating: "4" }) ?? "", /feedback/);
    assert.match(validateFeedback({ notes: "   ", rating: "4" }) ?? "", /feedback/);
    assert.match(validateFeedback({ notes: "Great" }) ?? "", /feedback/);
});

test("the rating goes in the field the endpoint expects for each role", () => {
    const l = buildFeedbackPayload("learner", { notes: "n", rating: "4" }, { session_id: "s1" });
    assert.equal(l.volunteer_commitment_level, 4);
    assert.ok(!("learner_interest_level" in l));
    const v = buildFeedbackPayload("volunteer", { notes: "n", rating: "2" }, { session_id: "s1" });
    assert.equal(v.learner_interest_level, 2);
    assert.ok(!("volunteer_commitment_level" in v));
    assert.equal(l.session_id, "s1");
});

test("quick answers are sent only when chosen, as the API expects them", () => {
    const none = buildFeedbackPayload("learner", { notes: "n", rating: "3" });
    assert.ok(!("session_helpful" in none) && !("goal_addressed" in none));
    const yes = buildFeedbackPayload("learner", { notes: "n", rating: "3", session_helpful: "yes", goal_addressed: "partly" });
    assert.equal(yes.session_helpful, true);
    assert.equal(yes.goal_addressed, "partly");
    assert.equal(buildFeedbackPayload("volunteer", { notes: "n", rating: "3", session_helpful: "no" }).session_helpful, false);
});
