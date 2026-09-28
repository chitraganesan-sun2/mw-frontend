"use client";

// Lists used to render their "nothing here yet" empty state when the fetch had actually
// failed, so users couldn't tell an outage from an empty list. Shown instead, with a retry.
export default function QueryErrorNotice({
    message = "Couldn't load this. Check your connection and try again.",
    onRetry,
}: {
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-gray-light">
            <span>{message}</span>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="text-primary underline font-medium bg-transparent border-0 p-0 cursor-pointer"
                >
                    Retry
                </button>
            )}
        </div>
    );
}
