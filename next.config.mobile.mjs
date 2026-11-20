import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dxezkqczp/**",
      },
    ],
  },
  // No server-side redirects for mobile - handled client-side via RouteGuard.
  //
  // NOTE (security): a static export cannot send headers, so the Android WebView runs WITHOUT the
  // Content-Security-Policy that next.config.mjs sets for the web build. The equivalent is a
  // <meta http-equiv="Content-Security-Policy"> in the exported HTML (no frame-ancestors via meta),
  // with connect-src for the Cloud Run API, Google sign-in, Sentry and Cloudinary media. It is not
  // added blind because a wrong policy silently breaks login on the device: enable it together with
  // a device smoke test (login, Google sign-in, push, images/video, donate).
};

export default nextConfig;
