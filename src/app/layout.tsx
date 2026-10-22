import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";

import RootLayoutClient from "./RootLayoutClient";
import PostHogProvider from "@/providers/PostHog";
import { GOOGLE_ANALYTICS_ID } from "@/definitions";
import { SHARE_IMAGES } from "@/constants/seo";

const poppins = Poppins({
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["latin"],
    display: "swap",
});

const SITE_TITLE = "MelodyWings - Free Tutoring for Students with Disabilities & Special Needs";
const SITE_DESCRIPTION =
    "MelodyWings is a 501(c)(3) nonprofit offering free online tutoring for students with disabilities and special needs, taught by caring volunteers. Get a tutor, volunteer to teach, or donate.";

const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "MelodyWings",
    url: "https://melodywings.org",
    logo: "https://melodywings.org/logo.png",
    description: SITE_DESCRIPTION,
    email: "support@melodywings.org",
    sameAs: [
        "https://www.linkedin.com/company/melodywings",
        "https://www.instagram.com/melodywings_",
        "https://www.facebook.com/profile.php?id=61575239913366",
    ],
};

export const metadata: Metadata = {
    title: {
        default: SITE_TITLE,
        template: "%s | MelodyWings",
    },
    description: SITE_DESCRIPTION,
    keywords: [
        "free tutoring",
        "special needs tutoring",
        "students with disabilities",
        "online tutoring",
        "volunteer tutoring",
        "volunteer opportunities for students",
        "community service hours",
        "nonprofit",
    ],
    authors: [{ name: "MelodyWings" }],
    creator: "MelodyWings",
    publisher: "MelodyWings",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/logo.png", type: "image/png", sizes: "32x32" },
        ],
        shortcut: "/favicon.ico",
        apple: "/logo.png",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://melodywings.org",
        siteName: "MelodyWings",
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        images: SHARE_IMAGES,
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        images: SHARE_IMAGES,
    },
    metadataBase: new URL("https://melodywings.org"),
    alternates: {
        canonical: "/",
    },
};

// Removed force-dynamic — was disabling all Next.js caching/static generation.
// Pages that truly need dynamic rendering (e.g., reading cookies server-side)
// should add `export const dynamic = 'force-dynamic'` individually.

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="any" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
                    strategy="afterInteractive"
                />
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
            </head>
            <body className={poppins.className}>
                <PostHogProvider>
                    <RootLayoutClient>{children}</RootLayoutClient>
                </PostHogProvider>
            </body>
        </html>
    );
}
