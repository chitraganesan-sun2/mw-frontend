"use client";

import Link from "next/link";
import { useEffect } from "react";
import * as Sentry from "@sentry/capacitor";
import Logo from "@/components/common/Logo";
import Button from "@/components/common/Button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center bg-background-input">
            <Link href="/" aria-label="MelodyWings home">
                <Logo />
            </Link>
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-medium">Something went wrong</h1>
                <p className="text-base text-gray-600">
                    We hit an unexpected error. Please try again.
                </p>
            </div>
            <div className="flex gap-3">
                <Button title="Try Again" btnVariant="primary" onClick={() => reset()} />
                <Link href="/">
                    <Button title="Back to Home" btnVariant="secondary" />
                </Link>
            </div>
        </div>
    );
}
