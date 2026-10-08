import React from "react";

/** Placeholder for the Messages page while the chat list loads (was a full-page spinner). */
export const MessagesPageSkeleton: React.FC = () => (
    <div className="flex h-full w-full gap-4 p-3 animate-pulse" aria-busy="true" aria-label="Loading messages">
        <div className="hidden md:flex w-[300px] shrink-0 flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-2">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
                    <div className="flex flex-1 flex-col gap-2">
                        <div className="h-3 w-2/3 rounded bg-gray-200" />
                        <div className="h-2.5 w-full rounded bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
        <div className="flex flex-1 flex-col gap-3">
            <div className="h-12 w-full rounded-xl bg-gray-100" />
            <ChatBubblesSkeleton />
        </div>
    </div>
);

/** Placeholder for one conversation's messages while they load. */
export const ChatBubblesSkeleton: React.FC = () => (
    <div className="flex flex-col gap-3 animate-pulse" aria-busy="true" aria-label="Loading conversation">
        {[
            "w-2/5 self-start",
            "w-1/3 self-end",
            "w-1/2 self-start",
            "w-2/5 self-end",
            "w-1/4 self-start",
        ].map((cls, i) => (
            <div key={i} className={`h-10 rounded-2xl bg-gray-200 ${cls}`} />
        ))}
    </div>
);
