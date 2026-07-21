import { getAPI_URL } from "@/definitions";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getCookie, clearCookies } from "@/utils/auth";

// Define custom error interface
interface ApiError {
    message: string;
    status: number;
    data?: any;
}

// Create and configure axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: getAPI_URL(),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
        "ngrok-skip-browser-warning": "any",
        "bypass-tunnel-reminder": "yup",
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getCookie("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Handle FormData content type
        if (config.data instanceof FormData) {
            config.headers["Content-Type"] = "multipart/form-data";
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const apiError: ApiError = {
            message: "An unexpected error occurred",
            status: error.response?.status || 500,
            data: error.response?.data,
        };

        if (error.response) {
            // Server responded with error status
            switch (error.response.status) {
                case 401:
                    apiError.message = "Unauthorized access";
                    // Session expired/invalid — force a clean re-login instead of
                    // leaving the UI silently broken. Guard against redirect loops
                    // by skipping it if we're already at the landing/login page.
                    if (typeof window !== "undefined" && window.location.pathname !== "/") {
                        clearCookies();
                        window.location.href = "/";
                    }
                    break;
                case 403:
                    apiError.message = "Access forbidden";
                    break;
                case 404:
                    apiError.message = "Resource not found";
                    break;
                case 422:
                    apiError.message = "Validation error";
                    break;
                case 500:
                    apiError.message = "Internal server error";
                    break;
                default:
                    apiError.message = "Something went wrong";
            }
        } else if (error.request) {
            // Request made but no response received
            apiError.message = "No response from server";
        }

        return Promise.reject(apiError);
    }
);

export const request = async (options: AxiosRequestConfig): Promise<AxiosResponse | ApiError> => {
    try {
        const response = await axiosInstance(options);
        return response;
    } catch (error) {
        // Log error for debugging in development
        console.error("API Request Error:", error);
        return Promise.reject(error);
    }
};
