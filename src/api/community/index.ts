import { endpoints } from "../constants";
import { GET_API, PUT_API } from "../request";

export const getNotifications = async ({ page = 1, size = 20 }: { page?: number, size?: number }) => {
    const response: any = await GET_API(`${endpoints.post.getNotifications}?page=${page}&size=${size}`);
    return response.data;
}

export const markNotificationsAsRead = async (notificationIds: string[]) => {
    const response: any = await PUT_API(endpoints.post.readNotifications, notificationIds);
    return response.data;
}

export const getSinglePost = async (post_id: string) => {
    if (!post_id) return null;
    const endpoint = endpoints.post.getSinglePost(post_id);
    const { data } = await GET_API(endpoint);
    return data || {};
}