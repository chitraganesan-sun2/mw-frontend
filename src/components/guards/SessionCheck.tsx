"use client";

import { signOut } from "@/utils/signOut";

/**
 * Shown by the private layout while the server confirms who the signed-in member is
 * (no sidebar, no name, no page content - nothing fabricated from cookies).
 */
export default function SessionCheck({ error, onRetry }: { error?: boolean; onRetry?: () => void }) {
    if (!error) {
        return (
            <div role="status" aria-live="polite" className="h-[100dvh] w-screen flex items-center justify-center bg-background-input">
                <div className="flex flex-col items-center gap-3 text-gray-light">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
                    <p className="text-sm">Checking your account...</p>
                </div>
            </div>
        );
    }
    return (
        <div role="alert" className="h-[100dvh] w-screen flex items-center justify-center bg-background-input px-4">
            <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                <p className="text-lg font-medium">Couldn&apos;t check your account.</p>
                <p className="text-sm text-gray-light">Check your connection and try again, or log out and log back in.</p>
                <div className="flex gap-4">
                    {onRetry && (
                        <button type="button" onClick={onRetry} className="text-primary underline font-medium bg-transparent border-0 p-0 cursor-pointer">
                            Retry
                        </button>
                    )}
                    <button type="button" onClick={() => void signOut()} className="text-gray-light underline bg-transparent border-0 p-0 cursor-pointer">
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
