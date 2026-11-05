"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { GOOGLE_ANALYTICS_ID } from "@/definitions";
import { CONSENT_EVENT, analyticsAllowed } from "@/utils/consent";

/** Loads Google Analytics only once the visitor has allowed analytics cookies. */
export default function GoogleAnalytics() {
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const update = () => setAllowed(analyticsAllowed());
        update();
        window.addEventListener(CONSENT_EVENT, update);
        return () => window.removeEventListener(CONSENT_EVENT, update);
    }, []);

    if (!allowed || !GOOGLE_ANALYTICS_ID) return null;

    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`} strategy="afterInteractive" />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GOOGLE_ANALYTICS_ID}');
                    `,
                }}
            />
        </>
    );
}
