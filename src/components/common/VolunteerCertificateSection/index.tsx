"use client";

import { endpoints } from "@/api/constants";
import { downloadFile } from "@/utils/downloadFile";
import { isNativePlatform } from "@/utils/platform";
import { useState } from "react";

export default function VolunteerCertificateSection() {
    const [isDownloading, setIsDownloading] = useState(false);

    if (isNativePlatform()) return null;

    const handleDownload = async () => {
        setIsDownloading(true);
        await downloadFile(
            endpoints.volunteer.hoursCertificate,
            "melodywings-volunteer-certificate.pdf",
            "application/pdf"
        );
        setIsDownloading(false);
    };

    return (
        <div className="flex bg-white p-3 md:p-0 rounded-[12px] md:bg-transparent justify-between gap-2 items-center w-full">
            <div className="flex flex-col gap-2">
                <p className="md:text-base text-[14px] font-medium">Volunteer hours certificate</p>
                <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                    Download a certificate of your volunteer hours - handy for school or
                    program credit.
                </p>
            </div>
            <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDownloading ? "Preparing..." : "Download certificate"}
            </button>
        </div>
    );
}
