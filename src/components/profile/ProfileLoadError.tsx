"use client";

import QueryErrorNotice from "@/components/common/QueryErrorNotice";

/**
 * Shown instead of the profile layout when the profile request fails. Rendering the layout with
 * no data painted "0% complete / 0 volunteers / 0 hours", which looks like real (bad) data.
 */
export default function ProfileLoadError({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="h-full w-full flex items-center justify-center p-6 bg-background-input">
            <QueryErrorNotice message="Couldn't load your profile. Check your connection and try again." onRetry={onRetry} />
        </div>
    );
}
