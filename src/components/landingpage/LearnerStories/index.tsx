"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";

/** One real, consented learner, anonymised by the server: an age, skills they want to learn,
 *  optionally one sentence they wrote for this purpose and - only if they separately opted in - the
 *  type of developmental disability they entered. Nothing else is ever sent. */
interface LearnerStory {
    age: number;
    skills: string[];
    statement?: string;
    disability?: string;
    /** What they like to do in their free time (free text, screened by the server). */
    free_time?: string;
}

/** Fewer than this many stories look odd sliding past, so they are shown as a still row instead. */
const MIN_FOR_MARQUEE = 3;
/** Cards per copy of the loop, so a short list still fills the strip without a gap. */
const MIN_CARDS_PER_COPY = 6;
/** Seconds each card takes to cross - keeps the speed readable whatever the number of stories. */
const SECONDS_PER_CARD = 8;

/** "A", "A and B", "A, B and C". */
function joinSkills(skills: string[]): string {
    if (skills.length <= 1) return skills[0] ?? "";
    return `${skills.slice(0, -1).join(", ")} and ${skills[skills.length - 1]}`;
}

const StoryCard = ({ story }: { story: LearnerStory }) => (
    <li className="w-[280px] sm:w-[320px] shrink-0 list-none">
        <article className="h-full rounded-3xl border border-learner-light bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col gap-3">
            {/* The whole card is one flowing sentence: no pills or labels. */}
            <p className="text-sm lg:text-base leading-relaxed text-gray-900 break-words">
                I&apos;m {story.age} years old
                {story.disability ? `, I have ${story.disability.replace(/[.!\s]+$/, "")}` : ""}, and I want to learn{" "}
                {joinSkills(story.skills)}.
                {story.free_time ? ` In my free time, I enjoy ${story.free_time.replace(/[.!\s]+$/, "")}.` : ""}
            </p>
            {story.statement && (
                <p className="text-sm italic leading-relaxed text-gray-600 break-words line-clamp-3">
                    &ldquo;{story.statement}&rdquo;
                </p>
            )}
        </article>
    </li>
);

/**
 * "Learner stories": real, approved learners' anonymous learning goals (an age and the skills they chose),
 * shown by default until a learner or guardian opts out. Nothing is made up - with no eligible learners
 * the section simply isn't there.
 * It sits just below the fold, so the data is only requested when the visitor scrolls near it.
 */
const LearnerStories = () => {
    const sentinel = useRef<HTMLDivElement>(null);
    const [near, setNear] = useState(false);

    useEffect(() => {
        const el = sentinel.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") {
            setNear(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setNear(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "800px 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const { data: stories = [] } = useQuery<LearnerStory[]>({
        queryKey: ["public-learner-stories"],
        queryFn: async () => {
            const res = await GET_API(endpoints.publicLearnerStories.get(24));
            return Array.isArray(res?.data) ? res.data : [];
        },
        enabled: near,
        staleTime: 10 * 60 * 1000, // the server caches for the same ten minutes
        retry: 1,
    });

    if (stories.length === 0) return <div ref={sentinel} aria-hidden="true" />;

    const heading = (
        <div className="text-center mb-6 flex flex-col gap-1">
            <h2 className="text-2xl lg:text-[2rem] font-medium">Learner Stories</h2>
            <p className="text-sm lg:text-base text-gray-600">
                What our learners want to learn next.
            </p>
        </div>
    );

    if (stories.length < MIN_FOR_MARQUEE) {
        return (
            <section aria-label="Learner stories" className="w-full">
                <div ref={sentinel} aria-hidden="true" />
                {heading}
                <ul className="flex flex-wrap justify-center gap-4">
                    {stories.map((story, i) => (
                        <StoryCard key={i} story={story} />
                    ))}
                </ul>
            </section>
        );
    }

    const perCopy = Math.ceil(MIN_CARDS_PER_COPY / stories.length);
    const copy = Array.from({ length: perCopy }).flatMap(() => stories);
    const seconds = copy.length * SECONDS_PER_CARD;

    return (
        <section aria-label="Learner stories" className="w-full">
            <div ref={sentinel} aria-hidden="true" />
            {heading}
            {/* Always auto-scrolls, like the testimonials strip (it does not switch to a scrollbar for
                "reduce motion"); pauses on hover or keyboard focus. */}
            <div
                className="group overflow-hidden py-2"
                style={{
                    maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                }}
            >
                <div
                    className="flex w-max group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
                    style={{ animation: `mwMarquee ${seconds}s linear infinite` }}
                >
                    {[false, true].map((isClone) => (
                        <ul
                            key={String(isClone)}
                            className="mw-marquee-copy flex shrink-0 gap-4 pr-4"
                            // The second copy only exists for the seamless loop; screen readers read the list once.
                            aria-hidden={isClone || undefined}
                            aria-label={isClone ? undefined : "Learner stories"}
                        >
                            {copy.map((story, i) => (
                                <StoryCard key={i} story={story} />
                            ))}
                        </ul>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LearnerStories;
