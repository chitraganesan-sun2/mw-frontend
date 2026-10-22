import { DELETE_API, POST_API, PUT_API } from '@/api/request';

export const submitStep1 = async (data: any) => {
    return await POST_API('/join-us/step-1', data);
};

export const updateStep1 = async (applicationId: string, data: any) => {
    return await PUT_API(`/join-us/step-1/${applicationId}`, data);
};

export const submitStep2 = async (data: any) => {
    return await POST_API('/join-us/step-2', data);
};

export const updateStep2 = async (applicationId: string, data: any) => {
    return await PUT_API(`/join-us/step-2/${applicationId}`, data);
};

export const submitStep3 = async (data: any) => {
    return await POST_API('/join-us/step-3', data);
};

export const updateStep3 = async (applicationId: string, data: any) => {
    return await PUT_API(`/join-us/step-3/${applicationId}`, data);
};

export const uploadResume = async (applicationId: string, form: FormData) => {
    return await POST_API(`/join-us/resume/${applicationId}`, form);
};

export const deleteResume = async (applicationId: string) => {
    return await DELETE_API(`/join-us/resume/${applicationId}`);
};
