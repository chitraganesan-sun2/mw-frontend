"use client";

import { getCookie } from "@/utils/auth";

export const VolunteerTheme = {
    primary: "#FE5B11",
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
