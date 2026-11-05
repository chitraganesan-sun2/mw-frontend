"use client";

import { useState, useEffect } from "react";
import { setCookie } from "nookies";
import { TbCookieFilled } from "react-icons/tb";
import Button from "@/components/common/Button";
import { CONSENT_COOKIE, CONSENT_EVENT, doNotTrackEnabled, getConsent } from "@/utils/consent";
import { isNativePlatform } from "@/utils/platform";

/**
 * Analytics cookie banner. Google Analytics and PostHog only load after "Allow"; "Decline" (or
 * ignoring the banner) keeps them off. Shown on every page until the visitor answers - as a
 * small card, not a modal, so it never blocks the page. Not shown in the native app or when the
 * browser sends Do Not Track (which we honour as a decline).
 */
export default function CookieConsent() {
  // The choice lives in a cookie, which isn't readable during SSR, so start hidden and reveal
  // after mount to keep the first client render identical to the server's.
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (isNativePlatform() || doNotTrackEnabled()) return;
    setShowBanner(!getConsent());
  }, []);

  const handleConsent = (accepted: boolean) => {
    setCookie(null, CONSENT_COOKIE, accepted ? "accepted" : "declined", {
      maxAge: 180 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
    setShowBanner(false);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="max-md:mx-3 fixed bottom-4 right-0 md:right-4 z-50 bg-white shadow-lg rounded-3xl p-6 border border-gray-300 max-w-md mx-auto flex flex-col gap-5"
    >
      <h3 className="font-medium text-lg flex items-center gap-2">
        <TbCookieFilled className="text-2xl" /> We use cookies on our website to:
      </h3>
      <ul className="text-sm text-gray-600 space-y-2">
        <li>1. Understand and save your preferences for future visits.</li>
        <li>2. Compile aggregate data about site traffic and interactions.</li>
        <li>3. Allow trusted third-party services to track this information.</li>
      </ul>
      <p className="text-sm font-normal">
        Analytics only runs if you choose Allow. We honor Do Not Track signals and will not track or plant analytics
        cookies if it&apos;s enabled.
      </p>
      <div className="flex justify-end space-x-2">
        <Button
          title="Allow"
          btnVariant="secondary"
          onClick={() => handleConsent(true)}
          rootClassName="!w-full !text-sm !py-2 !bg-action !text-white"
        />
        <Button
          title="Decline"
          btnVariant="tertiary"
          onClick={() => handleConsent(false)}
          rootClassName="!w-full !text-sm !py-2"
        />
      </div>
    </div>
  );
}
