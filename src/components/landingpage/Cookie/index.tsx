"use client";

import { useState, useEffect } from "react";
import { setCookie, parseCookies } from "nookies";
import { TbCookieFilled } from "react-icons/tb";
import Button from "@/components/common/Button";
import { Modal } from "antd";

export default function CookieConsent() {
  // Whether to show the banner depends on a cookie, which isn't readable during
  // SSR - and antd's Modal renders via a Portal that only exists client-side
  // regardless, so starting "open" on the server (or on the client's first,
  // server-matching render) always mismatches once it hydrates for real. Starting
  // hidden and only showing it once mounted keeps the first render identical to
  // the server's; the effect below then reveals it if consent hasn't been given.
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
    <Modal
      open={showBanner}
      className='!w-auto max-w-[90%] absolute right-10 top-20'
      classNames={{ content: '!p-0' }}
      transitionName=""
      closable={false}
      footer={false}
    > 
      <div className="max-md:mx-3 fixed bottom-4 right-0 md:right-4 z-50 bg-white shadow-lg rounded-3xl p-6 border border-gray-300 max-w-md mx-auto flex flex-col gap-5">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <TbCookieFilled className="text-2xl" /> We use Cookies on our Website to
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>1. Understand and save your preferences for future visits.</li>
          <li>2. Compile aggregate data about site traffic and interactions.</li>
          <li>3. Allow trusted third-party services to track this information.</li>
        </ul>
        <p className="text-sm font-normal">
          We honor Do Not Track signals and will not track or plant cookies if it's enabled.
        </p>
        <div className="flex justify-end space-x-2">
          <Button
            title="Allow"
            btnVariant="secondary"
            onClick={() => handleConsent(true)}
            rootClassName="!w-full !text-sm !py-2 !bg-black !text-white"
          />
          <Button
            title="Decline"
            btnVariant="tertiary"
            onClick={() => handleConsent(false)}
            rootClassName="!w-full !text-sm !py-2"
          />
        </div>
      </div>
    </Modal>
  );
}
