"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isIOS } from "@/utils/platform";

export default function DonationHistorySection() {
    // Donations are not offered inside the iOS app (see appstore/00-ios-readiness-plan.md). Decided after
    // mount so the statically exported page hydrates identically on every platform.
    const [hidden, setHidden] = useState(false);
    useEffect(() => setHidden(isIOS()), []);
    if (hidden) return null;

    return (
        <div className="flex bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full">
            <div className="flex flex-col gap-2">
                <p className="md:text-base text-[14px] font-medium">Your Donation History</p>
                <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                    See donations you&apos;ve made to MelodyWings while logged in to this account.
                </p>
            </div>
            <Link
                href="/donate/history"
                className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
                View history
            </Link>
        </div>
    );
}
