"use client";

import Link from "next/link";

export default function DonateSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-10 h-10 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {/* Message */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Thank You for Your Donation!
                </h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Your generous contribution helps us provide learning resources
                    and support to children with special needs. Every donation makes
                    a difference.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors inline-block"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/donate"
                        className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors inline-block"
                    >
                        Donate Again
                    </Link>
                </div>

                {/* Receipt Note */}
                <p className="text-xs text-gray-400 mt-6">
                    A receipt has been sent to your email. If you don&apos;t see it, 
                    please check your spam folder.
                </p>
            </div>
        </div>
    );
}
