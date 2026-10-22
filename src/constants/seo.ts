// The link-preview image (1200x630, public/og-image.png) shown when a page is shared on
// WhatsApp, LinkedIn, Facebook, X, Slack, iMessage, etc.
//
// A page that sets its own `openGraph` REPLACES the root layout's openGraph object in Next's
// metadata merge (it is not deep-merged), so every such page must repeat `images: SHARE_IMAGES`
// or its preview silently loses the picture. tests/unit/seo.test.ts enforces that.
export const SHARE_IMAGES = [
    {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MelodyWings - free tutoring for students with disabilities and special needs",
    },
];
