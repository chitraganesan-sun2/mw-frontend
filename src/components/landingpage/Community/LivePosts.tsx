"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { safeImageSrc } from "@/utils/safeHref";
import { useQueryState } from "nuqs";

interface PublicPost {
    post_id: string;
    text: string;
    /** First image of a volunteer's post (the API never sends learners' images). */
    image_url?: string | null;
    author_role: "learner" | "volunteer";
    created_at?: string;
}

/** Fewer than this many posts looks odd sliding past, so they are shown as a still row instead. */
const MIN_FOR_MARQUEE = 3;
/** Cards per copy of the loop, so a short list still fills the strip without a gap. */
const MIN_CARDS_PER_COPY = 6;
/** Seconds each card takes to cross - keeps the speed readable whatever the number of posts. */
const SECONDS_PER_CARD = 7;

/** The API sends UTC without a zone suffix; read it as UTC, not the visitor's local time. */
function timeAgo(createdAt?: string): string {
    if (!createdAt) return "";
    const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(createdAt) ? createdAt : `${createdAt}Z`);
    const minutes = Math.round((Date.now() - date.getTime()) / 60000);
    if (Number.isNaN(minutes)) return "";
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days} d ago`;
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const PostCard = ({ post, onClick }: { post: PublicPost; onClick: () => void }) => {
    const isVolunteer = post.author_role === "volunteer";
    // A bad URL in API data must not reach next/image (it throws) - unsafe ones are skipped.
    const imageSrc = safeImageSrc(post.image_url);
    return (
        <li className="w-[280px] sm:w-[320px] h-[320px] shrink-0">
            <button
                type="button"
                onClick={onClick}
                className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md hover:border-gray-200 transition-all cursor-pointer text-left"
            >
                {imageSrc && (
                    <div className="relative h-40 w-full bg-gray-100">
                        {/* Decorative: the post's text carries the meaning. */}
                        <Image src={imageSrc} alt="" fill sizes="320px" className="object-cover" />
                    </div>
                )}
                <div className="p-5 flex flex-1 flex-col justify-between gap-4">
                    {post.text && (
                        <p className="text-sm lg:text-base leading-relaxed text-gray-800 line-clamp-4 break-words">{post.text}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span
                            className={`rounded-full px-2.5 py-0.5 font-medium text-black ${
                                isVolunteer ? "bg-volunteer-light" : "bg-learner-light"
                            }`}
                        >
                            {isVolunteer ? "Volunteer" : "Learner"}
                        </span>
                        <span>{timeAgo(post.created_at)}</span>
                    </div>
                </div>
            </button>
        </li>
    );
};

/**
 * "Live from the community": the newest community posts sliding past on the landing page.
 * Re-polls every minute, so new posts appear and the oldest drop off without a reload (the
 * server only ever returns the latest few). Renders nothing until there is something to show -
 * an empty or failed feed must not leave a hole on the page.
 */
const LivePosts = () => {
    const [, setParamMode] = useQueryState("signup_as");
    
    const { data: posts = [] } = useQuery<PublicPost[]>({
        queryKey: ["public-community-posts"],
        queryFn: async () => {
            const res = await GET_API(endpoints.publicCommunity.getPosts(12));
            return Array.isArray(res?.data) ? res.data : [];
        },
        refetchInterval: 60000,
        staleTime: 30000,
        retry: 1,
    });

    if (posts.length === 0) return null;
    
    // When a visitor clicks a post, open the signup modal
    const handlePostClick = () => {
        setParamMode("learner");
    };

    const heading = (
        <h3 className="text-center text-base lg:text-xl font-medium mb-5 flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            Live from the community
        </h3>
    );

    if (posts.length < MIN_FOR_MARQUEE) {
        return (
            <div className="mt-10 w-full">
                {heading}
                <ul className="flex flex-wrap justify-center gap-4">
                    {posts.map((post) => (
                        <PostCard key={post.post_id} post={post} onClick={handlePostClick} />
                    ))}
                </ul>
            </div>
        );
    }

    const perCopy = Math.ceil(MIN_CARDS_PER_COPY / posts.length);
    const copy = Array.from({ length: perCopy }).flatMap(() => posts);
    const seconds = copy.length * SECONDS_PER_CARD;

    return (
        <div className="mt-10 w-full">
            {heading}
            <div
                className="mw-marquee overflow-hidden py-2"
                // Fade the edges so cards slide in and out softly.
                style={{
                    maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                }}
            >
                <div className="mw-marquee-track" style={{ animationDuration: `${seconds}s` }}>
                    {[false, true].map((isClone) => (
                        <ul
                            key={String(isClone)}
                            className="mw-marquee-copy flex shrink-0 gap-4 pr-4"
                            // The second copy only exists for the seamless loop; screen readers
                            // read the list once.
                            aria-hidden={isClone || undefined}
                            aria-label={isClone ? undefined : "Latest community posts"}
                        >
                            {copy.map((post, i) => (
                                <PostCard key={`${post.post_id}-${i}`} post={post} onClick={handlePostClick} />
                            ))}
                        </ul>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LivePosts;
