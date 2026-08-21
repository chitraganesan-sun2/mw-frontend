"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { endpoints } from "@/api/constants";
import { GET_API, POST_API } from "@/api/request";
import Cookies from "js-cookie";
import { getCookie } from "@/utils/auth";
import { useQueryState } from "nuqs";
import Button from "@/components/common/Button";
import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { getDefaultRouteForRole } from "@/utils/routeGuard";

const LoginPage = () => {
    const router = useRouter();
    const [role, setRole] = useState<UserType>((getCookie("role") as UserType) || "volunteer");
    const [code] = useQueryState("code");
    const [Loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        try {
            const payload = {
                code,
                signup_type: role,
            };
            const response = await POST_API(endpoints.user.signIn, payload);

            if (response.status === 200 || response.status === 201) {
                handleSignUpSuccess(response?.data);
            }

            return response?.data;
        } catch (error) {
            console.error("Error signing up:", error);
            throw error;
        }
    };

    const handleSignUpSuccess = (data: any) => {
        const idKey = role === "volunteer" ? "volunteer_id" : "learner_id";

        const decodedToken: any = jwtDecode(data?.access_token);
        const currentTime = Math.floor(Date.now() / 1000);
        const expireSeconds = decodedToken?.exp - currentTime;
        const expireDays = Math.ceil(expireSeconds / (60 * 60 * 24)) || 1;

        Cookies.set(idKey, data[idKey], { expires: expireDays });
        Cookies.set("token", data?.access_token, { expires: expireDays });
        Cookies.set("role", role, { expires: expireDays });
        Cookies.set("onboarded_status", data?.onboarded_status, { expires: expireDays });
        handleNavigation(data);
    };

    const handleNavigation = (data: any) => {
        if (data.onboarded_status === "verification_pending") {
            router.push("/onboarding/verification");
        } else if (data.onboarded_status === "details_pending") {
            router.push("/onboarding");
        } else if (data.onboarded_status === "partially_filled") {
            router.push("/onboarding");
        } else if (data.onboarded_status === "verification_completed") {
            router.push(getDefaultRouteForRole(role));
        }
    };

    const { data, isLoading } = useQuery({
        queryKey: ["onboarded_status"],
        queryFn: handleSignUp,
        enabled: !!code,
    });

    useEffect(() => {
        const savedRole = getCookie("role") as UserType;
        if (savedRole) {
            setRole(savedRole);
        }
    }, []);

    const handleLogin = () => {
        setLoading(true);
        GET_API(endpoints.auth.oauth2callback)
            .then((res: any) => {
                console.log("res ", res);
                setLoading(false);
                if (res?.data) {
                    if (typeof window !== "undefined") {
                        window.location.href = res.data;
                    }
                }
            })
            .catch((err) => {
                console.log("err ", err);
                setLoading(false);
            });
    };

    const handleSetRole = (newRole: UserType) => {
        console.log("newRole", newRole);
        setRole(newRole);
        Cookies.set("role", newRole, { expires: 30 });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h3 className="text-2xl font-bold">Login Page</h3>

            <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-lg">
                <button
                    onClick={() => handleSetRole("volunteer")}
                    className={`px-4 py-2 rounded-md bg-primary  transition-colors duration-300 ${
                        role === "volunteer"
                            ? "bg-blue-500 text-white"
                            : "bg-transparent text-gray-700"
                    }`}
                >
                    Volunteer
                </button>
                <button
                    onClick={() => handleSetRole("learner")}
                    className={`px-4 py-2 rounded-md  bg-primary transition-colors duration-300 ${
                        role === "learner"
                            ? "bg-blue-500 text-white"
                            : "bg-transparent text-gray-700"
                    }`}
                >
                    Learner
                </button>
            </div>

            <Button
                onClick={handleLogin}
                title={`Login as ${role}`}
                loading={isLoading || Loading}
                rootClassName="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 px-7"
            />
        </div>
    );
};

export default LoginPage;
