import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/**/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
        // Class names also live in helpers/constants (status pill colours in
        // utils/sessionDisplay.ts, calendar styles in utils/calender.ts, ...). Unscanned,
        // any class used ONLY there was never generated - e.g. the "Pending" pill had no
        // background at all.
        "./src/utils/**/*.{js,ts,jsx,tsx}",
        "./src/hooks/**/*.{js,ts,jsx,tsx}",
        "./src/constants/**/*.{js,ts,jsx,tsx}",
        "./src/providers/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary-color)",
                // Fixed ENTITY colours (Blue = Learner, Orange = Volunteer), independent of the
                // signed-in role: use these for anything that identifies a learner or a
                // volunteer (role tags, "For Learners" sections, learner/volunteer counts).
                // `primary` / `background*` stay the VIEWER's role theme. Keep in sync with
                // VolunteerTheme / LearnerTheme in src/utils/theme.ts.
                //   DEFAULT = text accent, dark = 3D edge / readable text, light = tint
                //   background, fill = filled-button tint (black text on it).
                volunteer: {
                    DEFAULT: "#E35D0B",
                    dark: "#B54708",
                    light: "#FFF0E6",
                    fill: "#FFAC71",
                },
                learner: {
                    DEFAULT: "#09BAEE",
                    dark: "#009BCC",
                    light: "#DFF5FF",
                    fill: "#68DBFF",
                },
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
                action: {
                    DEFAULT: "var(--action-color)",
                    hover: "var(--action-hover-color)",
                },
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
                "marquee-testimonials": "marquee-testimonials 28s linear infinite",
            },
            keyframes: {
                "marquee-reviews": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
                "marquee-testimonials": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
