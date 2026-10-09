import { endpoints } from "../constants";
import { DELETE_API, GET_API, POST_API } from "../request";

type Role = "volunteer" | "learner";

export type ProfileChangeDiffItem = {
    path: string[];
    section: string;
    label: string;
    old: string | null;
    new: string | null;
};

export type ProfileChangeRequest = {
    request_id: string;
    status: string;
    change_count: number;
    created_on?: string;
    reviewed_on?: string;
    rejection_reason?: string | null;
    diff?: ProfileChangeDiffItem[];
};

export type ProfileChangeState = {
    requires_review: boolean;
    pending: ProfileChangeRequest | null;
    last_decision: ProfileChangeRequest | null;
};

export const getProfileChangeState = async (): Promise<ProfileChangeState> => {
    const response: any = await GET_API(endpoints.profileChanges.mine);
    return response.data;
};

/** What an admin would be shown for this edit - nothing is stored. */
export const previewProfileChange = async (role: Role, data: any): Promise<ProfileChangeDiffItem[]> => {
    const response: any = await POST_API(endpoints.profileChanges.preview(role), data);
    return response.data?.diff ?? [];
};

export const submitProfileChange = async (role: Role, data: any): Promise<ProfileChangeRequest> => {
    const response: any = await POST_API(endpoints.profileChanges.submit(role), data);
    return response.data;
};

export const withdrawProfileChange = async (requestId: string) => {
    const response: any = await DELETE_API(endpoints.profileChanges.withdraw(requestId));
    return response?.status;
};
