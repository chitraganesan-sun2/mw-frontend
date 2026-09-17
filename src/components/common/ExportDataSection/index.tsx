"use client";

import { endpoints } from "@/api/constants";
import { downloadFile } from "@/utils/downloadFile";
import { isNativePlatform } from "@/utils/platform";
import { useState } from "react";

interface ExportDataSectionProps {
    role: "learner" | "volunteer";
}

export default function ExportDataSection({ role }: ExportDataSectionProps) {
    const [isExporting, setIsExporting] = useState(false);

    if (isNativePlatform()) return null;

    const handleExport = async () => {
        setIsExporting(true);
        const endpoint = role === "learner" ? endpoints.learner.exportData : endpoints.volunteer.exportData;
        await downloadFile(endpoint, "my_melodywings_data.csv", "text/csv");
        setIsExporting(false);
    };

    return (
        <div className="flex flex-col gap-4 mt-4 md:mt-8 pt-4 md:pt-8 border-t border-gray-200">
            <p className="md:text-2xl text-[16px] font-medium">Your Data</p>
            <div className="flex bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full">
                <div className="flex flex-col gap-2">
                    <p className="md:text-base text-[14px] font-medium">Download my data</p>
                    <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                        Get a CSV copy of the profile information MelodyWings has on file for you.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting ? "Preparing..." : "Download my data"}
                </button>
            </div>
        </div>
    );
}
