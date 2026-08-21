"use client";

import { useEffect, useState } from "react";
import { getTheme } from "@/utils/theme";
import { ConfigProvider, ThemeConfig } from "antd";
import { Poppins } from "next/font/google";
import { getCookie } from "@/utils/auth";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["latin"],
    display: "swap",
});

interface ThemeProviderProps {
    children: React.ReactNode;
}

const theme: ThemeConfig = {
    token: {
        // Using CSS variables for dynamic theming
        colorPrimary: "var(--primary-color)",
        colorBgContainer: "var(--white-color)",
        colorTextBase: "var(--black-color)",
        colorError: "var(--error-color)",
        colorSuccess: "var(--success-color)",
        colorBgLayout: "var(--secondary-color)", // For background

        // Typography
        fontSize: 16,
        fontFamily: poppins.style.fontFamily,
        borderRadius: 6,
        borderRadiusLG: 8,
        borderRadiusSM: 4,

        padding: 16,
        margin: 16,
    },
    components: {
        Button: {
            borderRadiusLG: 20,
            borderRadiusSM: 18,
            borderRadius: 14,
            controlHeight: 40,

            // Error states
            dangerColor: "var(--error-color)",
            dangerShadow: "var(--error-color-light)",
        },

        Input: {
            borderRadius: 6,
            colorError: "var(--error-color)",
            colorErrorBorder: "var(--error-color)",
            colorErrorHover: "var(--error-color)",
        },
        Modal: {
            borderRadius: 8,
            paddingContentHorizontalLG: 24,
        },
        Card: {
            borderRadius: 8,
        },
        Message: {
            colorError: "var(--error-color)",
            colorSuccess: "var(--success-color)",
        },
    },
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [currentRole, setCurrentRole] = useState<UserType | null>(null);

    // Function to update theme based on current role
    const updateTheme = () => {
        if (typeof window === "undefined") return; // SSR safety check
        const theme = getTheme();
        document.documentElement.style.setProperty("--primary-color", theme.primary);
        document.documentElement.style.setProperty("--background-color", theme.background);
        document.documentElement.style.setProperty(
            "--background-secondary-color",
            theme.backgroundSecondary
        );
    };

    // Watch for cookie changes
    useEffect(() => {
        const checkCookies = () => {
            const role = getCookie("role") as UserType | undefined;
            if (role !== currentRole) {
                setCurrentRole(role || null);
                updateTheme();
            }
        };

        // Check immediately
        checkCookies();

        // Set up an interval to check for cookie changes
        const intervalId = setInterval(checkCookies, 1000);

        // Clean up
        return () => clearInterval(intervalId);
    }, [currentRole]);

    // Listen for storage events (in case cookies are changed in another tab)
    useEffect(() => {
        if (typeof window === "undefined") return; // SSR safety check
        
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "role") {
                updateTheme();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return <ConfigProvider theme={theme}>
        {children}
        <Toaster />
    </ConfigProvider>;
};
