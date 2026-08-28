import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
let apiOrigin = "";
try {
    apiOrigin = apiUrl ? new URL(apiUrl).origin : "";
} catch {
    apiOrigin = "";
}

// App-wide Content-Security-Policy. 'unsafe-inline'/'unsafe-eval' stay on
// script-src because Next + MUI/emotion inject inline scripts/styles and this
// app has no nonce pipeline; the value here is that connect-src / img-src /
// frame-src are pinned to known hosts (so an injected script can't exfiltrate
// the JS-readable auth cookie to an attacker host) and the frame directives
// stop clickjacking.
const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://apis.google.com https://accounts.google.com https://us.i.posthog.com https://us-assets.i.posthog.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://www.googletagmanager.com https://*.google-analytics.com https://lh3.googleusercontent.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    [
        "connect-src 'self'",
        apiOrigin,
        "https://www.google-analytics.com",
        "https://*.google-analytics.com",
        "https://us.i.posthog.com",
        "https://us-assets.i.posthog.com",
        "https://accounts.google.com",
        "https://oauth2.googleapis.com",
        "https://www.googleapis.com",
    ]
        .filter(Boolean)
        .join(" "),
    "frame-src 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    // ESLint now has a config in the repo, but the codebase predates it and a
    // first run surfaces a backlog. Keep `next build` (and Vercel) green off
    // typecheck; lint runs separately in CI (informational) until the backlog
    // is cleared, then flip this back.
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
        ],
    },
    webpack: (config) => {
        config.resolve.alias["@"] = path.resolve(__dirname, "src");
        return config;
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: securityHeaders,
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'www.melodywings.org',
                    },
                ],
                destination: 'https://melodywings.org/:path*',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
