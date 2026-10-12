import { getAPI_URL } from "@/definitions";
import { endpoints } from "../constants";
import axios from "axios";
import { setCookie } from "@/utils/auth";

export const handleCookie = (data: any) => {
    const role = data?.role;
    const idKey = `${role}_id`;
    const cookieData = {
        [idKey]: data[idKey],
        token: data?.access_token,
        role,
        onboarded_status: data?.onboarded_status,
    };

    setCookie(cookieData);
};

export const apiGoogleSignUp = async (access_token: string, payload: any) => {
    const apiUrl = getAPI_URL();
    const response = await axios(`${apiUrl}/${endpoints.user.signIn}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
        },
        data: payload,
    });

    const { data, status } = response;
    if (status === 201) handleCookie(data);
    return { ...data, status };
};

export const apiGoogleLogin = async (access_token: string) => {
    const apiUrl = getAPI_URL();
    const response = await axios(`${apiUrl}/${endpoints.user.login}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
        },
    });

    const { data, status } = response;
    if (status === 200) handleCookie(data);
    return { ...data, status };
};

export const apiRequestEmailOtp = async (email: string) => {
    const apiUrl = getAPI_URL();
    await axios.post(`${apiUrl}/${endpoints.user.emailOtpRequest}`, { email });
};

// Returns a proof-of-email token; send it as the Bearer to signup/login like a Google token.
export const apiVerifyEmailOtp = async (email: string, code: string): Promise<string> => {
    const apiUrl = getAPI_URL();
    const { data } = await axios.post(`${apiUrl}/${endpoints.user.emailOtpVerify}`, { email, code });
    return data.email_token;
};

const bearer = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export const apiEmailSignUp = async (emailToken: string, payload: any, password: string) => {
    const apiUrl = getAPI_URL();
    const { data, status } = await axios.post(
        `${apiUrl}/${endpoints.user.emailSignup}`,
        { ...payload, password },
        bearer(emailToken),
    );
    if (status === 201) handleCookie(data);
    return { ...data, status };
};

export const apiEmailLogin = async (email: string, password: string) => {
    const apiUrl = getAPI_URL();
    const { data, status } = await axios.post(`${apiUrl}/${endpoints.user.emailLogin}`, { email, password });
    if (status === 200) handleCookie(data);
    return { ...data, status };
};

export const apiEmailResetPassword = async (emailToken: string, password: string) => {
    const apiUrl = getAPI_URL();
    const { data, status } = await axios.post(
        `${apiUrl}/${endpoints.user.emailResetPassword}`,
        { password },
        bearer(emailToken),
    );
    if (status === 200) handleCookie(data);
    return { ...data, status };
};
