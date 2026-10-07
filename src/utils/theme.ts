"use client";

import { getCookie } from "@/utils/auth";

export const VolunteerTheme = {
    // History: #FE5B11 (read as the error red #ef4444, 3.1:1 with white) -> #B54708 (5.4:1,
    // but too dark/brown per user feedback) -> #E35D0B: a clearly orange middle ground,
    // still distinct from the error red, 3.6:1 with white text (WCAG AA for large/bold
    // text and UI components) and 3.1:1 on the volunteer background below.
    primary: "#E35D0B",
    background: "#FFE9D4",
    backgroundSecondary: "#FFAC71",
};

export const LearnerTheme = {
    primary: "#09BAEE",
    background: "#DFF5FF",
    backgroundSecondary: "#68DBFF",
};

export const getTheme = () => {
    if (typeof window === "undefined") return LearnerTheme;

    const userType = getCookie("role");

    switch (userType) {
        case "volunteer":
            return VolunteerTheme;
        case "learner":
            return LearnerTheme;
        default:
            return VolunteerTheme;
    }
};
