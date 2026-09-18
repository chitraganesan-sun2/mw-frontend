"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getDonationHistory } from "@/api/donation";

interface DonationHistoryEntry {
    donation_id: string;
    final_amount: number | null;
    fund_destination: string | null;
    payment_status: string;
    created_at: string | null;
}

const formatDate = (iso: string | null) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export default function DonationHistoryPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["donationHistory"],
        queryFn: async () => {
            const response: any = await getDonationHistory();
            return (response?.data?.data ?? []) as DonationHistoryEntry[];
        },
    });

    const history = data ?? [];
    const totalDonated = history.reduce((sum, entry) => sum + (entry.final_amount || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 md:py-16">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Your Donation History</h1>
                    <Link
                        href="/donate"
                        className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
                    >
                        Donate again
                    </Link>
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-gray-500">Loading...</div>
                ) : isError ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
                        Couldn&apos;t load your donation history. Please try again later.
                    </div>
                ) : history.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
                        You haven&apos;t made a donation from this account yet.
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl p-6 mb-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">Total donated</span>
                            <span className="text-xl font-bold text-gray-900">
                                ${totalDonated.toFixed(2)}
                            </span>
                        </div>
                        <div className="bg-white rounded-2xl divide-y divide-gray-100">
                            {history.map((entry) => (
                                <div
                                    key={entry.donation_id}
                                    className="flex items-center justify-between px-6 py-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-gray-900">
                                            {entry.fund_destination || "General Fund"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(entry.created_at)}
                                        </span>
                                    </div>
                                    <span className="text-base font-semibold text-gray-900">
                                        ${(entry.final_amount ?? 0).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <p className="text-xs text-gray-400 mt-6 text-center">
                    Only donations made while signed in to this account appear here. Guest
                    donations are still confirmed by email receipt.
                </p>
            </div>
        </div>
    );
}
