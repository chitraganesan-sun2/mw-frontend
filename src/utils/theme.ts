"use client";

import { getCookie } from "@/utils/auth";

export const VolunteerTheme = {
    // Was #FE5B11 - bright enough to read as the error red (#ef4444) and only 3.1:1 with
    // white text. #B54708 is darker and further from red's hue, and passes WCAG AA with
    // white text (5.4:1) and on the volunteer background below (4.6:1).
    primary: "#B54708",
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
