import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/**/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary-color)",
                background: {
                    DEFAULT: "var(--background-color)",
                    input: "var(--input-background)",
                    secondary: "var(--background-secondary-color)",
                },
                gray: {
                    DEFAULT: "var(--gray-color)",
                    light: "var(--gray-light-color)",
                },
                white: "var(--white-color)",
                black: "var(--black-color)",
                stroke: "var(--border-stroke)",
                error: {
                    DEFAULT: "var(--error-color)",
                    light: "var(--error-light-color)",
                },
                success: {
                    DEFAULT: "var(--success-color)",
                    light: "var(--success-light-color)",
                },
            },
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
            },
            fontWeight: {
                light: "var(--font-light)",
                regular: "var(--font-regular)",
                medium: "var(--font-medium)",
                semibold: "var(--font-semibold)",
                bold: "var(--font-bold)",
            },
            animation: {
                "marquee-reviews": "marquee-reviews 30s linear infinite",
            },
            keyframes: {
                "marquee-reviews": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
