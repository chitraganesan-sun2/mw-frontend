import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
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
