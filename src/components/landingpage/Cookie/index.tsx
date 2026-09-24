"use client";

import { useState, useEffect } from "react";
import { setCookie, parseCookies } from "nookies";
import { TbCookieFilled } from "react-icons/tb";
import Button from "@/components/common/Button";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookies = parseCookies();
    setShowBanner(!cookies.cookieConsent);
  }, []);

  const handleConsent = (accepted: boolean) => {
    setCookie(null, "cookieConsent", accepted ? "accepted" : "declined", {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-50 w-[calc(100%-2rem)] max-w-md bg-white shadow-lg rounded-3xl p-6 border border-gray-300 flex flex-col gap-5"
    >
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <TbCookieFilled className="text-2xl" aria-hidden="true" /> We use Cookies on our Website to
      </h3>
      <ul className="text-sm text-gray-600 space-y-2">
        <li>1. Understand and save your preferences for future visits.</li>
        <li>2. Compile aggregate data about site traffic and interactions.</li>
        <li>3. Allow trusted third-party services to track this information.</li>
      </ul>
      <p className="text-sm font-normal">
        We honor Do Not Track signals and will not track or plant cookies if it&apos;s enabled.
      </p>
      <div className="flex justify-end space-x-2">
        <Button
          title="Allow"
          btnVariant="secondary"
          onClick={() => handleConsent(true)}
          rootClassName="!w-full !text-sm !py-2 !bg-black !text-white focus-ring"
        />
        <Button
          title="Decline"
          btnVariant="tertiary"
          onClick={() => handleConsent(false)}
          rootClassName="!w-full !text-sm !py-2 focus-ring"
        />
      </div>
    </div>
  );
}
