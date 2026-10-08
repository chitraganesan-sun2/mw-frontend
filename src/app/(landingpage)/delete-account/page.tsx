import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Delete Your Account",
    description: "How to delete your MelodyWings account and personal data, in the app or by email.",
    alternates: {
        canonical: "/delete-account",
    },
};

const SUPPORT_EMAIL = "support@melodywings.org";

const DeleteAccountPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-semibold">Delete your MelodyWings account</h1>
                <p className="text-gray-700">
                    You can delete your MelodyWings account and the personal information tied to it at any time. This page
                    explains how, what is removed, and what we may keep.
                </p>
            </header>

            <section aria-labelledby="in-app" className="flex flex-col gap-2">
                <h2 id="in-app" className="text-xl font-medium">Option 1 – Delete it yourself, in the app or on the website</h2>
                <ol className="list-decimal list-inside text-gray-800 flex flex-col gap-1">
                    <li>Log in to MelodyWings (website or Android app).</li>
                    <li>Open <strong>Settings</strong> from the menu.</li>
                    <li>Scroll to <strong>Danger Zone</strong> and choose <strong>Delete Account</strong>.</li>
                    <li>Type <strong>DELETE</strong> to confirm and choose <strong>Permanently Delete</strong>.</li>
                </ol>
                <p className="text-gray-700">
                    Deletion is immediate and permanent and cannot be undone. You are logged out on all devices straight away.
                </p>
            </section>

            <section aria-labelledby="by-email" className="flex flex-col gap-2">
                <h2 id="by-email" className="text-xl font-medium">Option 2 – Ask us by email</h2>
                <p className="text-gray-800">
                    If you cannot log in, email{" "}
                    <a className="underline" href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20MelodyWings%20account`}>
                        {SUPPORT_EMAIL}
                    </a>{" "}
                    from the email address on the account, with the subject &quot;Delete my MelodyWings account&quot;. We will
                    verify your identity and respond within forty-five (45) days.
                </p>
            </section>

            <section aria-labelledby="what-is-removed" className="flex flex-col gap-2">
                <h2 id="what-is-removed" className="text-xl font-medium">What is deleted</h2>
                <ul className="list-disc list-inside text-gray-800 flex flex-col gap-1">
                    <li>Your profile and personal information</li>
                    <li>Your scheduled sessions and session records (the other person is told their session was cancelled)</li>
                    <li>Your messages and community posts and comments</li>
                    <li>Your notifications and push-notification registration</li>
                    <li>Photos, videos and documents you uploaded</li>
                </ul>
            </section>

            <section aria-labelledby="what-is-kept" className="flex flex-col gap-2">
                <h2 id="what-is-kept" className="text-xl font-medium">What we may keep</h2>
                <p className="text-gray-800">
                    Donation records are kept for the period required by applicable tax and accounting law, and we keep
                    information we are legally required to retain. Crash reports are not linked to your account. See our{" "}
                    <Link className="underline" href="/privacy-policy">Privacy Policy</Link> for details.
                </p>
            </section>
        </div>
    );
};

export default DeleteAccountPage;
