"use client";

import { cn } from "@/utils/merge-class";
import { quickQuestions, type FeedbackFormData, type FeedbackRole } from "@/utils/feedbackForm";

interface Choice<T extends string> {
    value: T;
    label: string;
}

const HELPFUL: Choice<"yes" | "no">[] = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "Not really" },
];
const GOAL: Choice<"yes" | "partly" | "no">[] = [
    { value: "yes", label: "Yes" },
    { value: "partly", label: "Partly" },
    { value: "no", label: "No" },
];

/** One optional question answered with a tap. Tapping the chosen answer again clears it. */
function QuickQuestion<T extends string>({
    id, label, choices, value, onChange,
}: {
    id: string;
    label: string;
    choices: Choice<T>[];
    value?: T;
    onChange: (next: T | undefined) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <p id={id} className="text-base font-medium">
                {label} <span className="font-normal text-gray-600">(optional)</span>
            </p>
            <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-2">
                {choices.map((c) => {
                    const selected = value === c.value;
                    return (
                        <button
                            key={c.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onChange(selected ? undefined : c.value)}
                            className={cn(
                                "rounded-full border px-4 h-9 text-sm cursor-pointer",
                                selected ? "border-black bg-black text-white" : "border-gray-300 bg-white text-black"
                            )}
                        >
                            {c.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/** The two optional one-tap questions under the comment, worded for the reviewer's role. */
const FeedbackQuickQuestions = ({
    role, value, onChange,
}: {
    role: FeedbackRole;
    value: FeedbackFormData;
    onChange: (key: "session_helpful" | "goal_addressed", next: string | undefined) => void;
}) => {
    const q = quickQuestions(role);
    return (
        <div className="flex flex-col gap-4 mt-2">
            <QuickQuestion
                id="feedback-helpful-q"
                label={q.helpful}
                choices={HELPFUL}
                value={value.session_helpful}
                onChange={(next) => onChange("session_helpful", next)}
            />
            <QuickQuestion
                id="feedback-goal-q"
                label={q.goal}
                choices={GOAL}
                value={value.goal_addressed}
                onChange={(next) => onChange("goal_addressed", next)}
            />
        </div>
    );
};

export default FeedbackQuickQuestions;
