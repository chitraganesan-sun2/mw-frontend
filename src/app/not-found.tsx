import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/common/Logo";
import Button from "@/components/common/Button";

export const metadata: Metadata = {
    title: "Page Not Found",
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotFound() {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center bg-background-input">
            <Link href="/" aria-label="MelodyWings home">
                <Logo />
            </Link>
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-5xl font-medium">404</h1>
                <p className="text-base md:text-lg text-gray-600">
                    We couldn&apos;t find the page you&apos;re looking for.
                </p>
            </div>
            <Link href="/">
                <Button title="Back to Home" btnVariant="primary" />
            </Link>
        </div>
    );
}
