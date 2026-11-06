import type { CSSProperties, ReactNode } from "react";
import { gradientTextStyle } from "@/constants/landingPage";

/** The Features page only uses the site palette: learner blue, volunteer orange, and the
 *  role-neutral slate/greys used on the other pages. */
export type Tone = "learner" | "volunteer" | "neutral";

const toneClasses: Record<Tone, { tile: string; accent: string; eyebrow: string }> = {
    learner: { tile: "bg-learner-light text-learner-dark", accent: "text-learner-dark", eyebrow: "text-learner-dark" },
    volunteer: { tile: "bg-volunteer-light text-volunteer-dark", accent: "text-volunteer-dark", eyebrow: "text-volunteer" },
    neutral: { tile: "bg-background-input text-action", accent: "text-action", eyebrow: "" },
};

export function SectionHeader({
    tone,
    eyebrow,
    title,
    description,
}: {
    tone: Tone;
    eyebrow: string;
    title: string;
    description: string;
}) {
    const t = toneClasses[tone];
    // Role-neutral headers use the same blue-to-orange gradient label as the home page.
    const style: CSSProperties | undefined = tone === "neutral" ? gradientTextStyle : undefined;
    return (
        <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-3 text-center lg:mb-14">
            <p className={`text-base font-semibold lg:text-xl ${t.eyebrow}`} style={style}>
                {eyebrow}
            </p>
            <h2 className="text-2xl font-medium leading-normal lg:text-[2rem]">{title}</h2>
            <p className="text-sm leading-normal text-gray-light lg:text-lg">{description}</p>
        </div>
    );
}

export function FeatureCard({
    tone,
    icon,
    title,
    description,
    points,
}: {
    tone: Tone;
    icon: ReactNode;
    title: string;
    description: string;
    points: string[];
}) {
    const t = toneClasses[tone];
    return (
        <div className="flex h-full flex-col rounded-2xl border border-stroke bg-white p-6 transition-shadow duration-200 hover:shadow-md">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${t.tile}`}>{icon}</div>
            <h3 className="mb-2 text-lg font-medium">{title}</h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-light">{description}</p>
            <ul className="mt-auto space-y-2">
                {points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-gray">
                        <svg
                            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${t.accent}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
