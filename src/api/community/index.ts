import { endpoints } from "../constants";
import { GET_API, PUT_API } from "../request";
import { NOTIFICATIONS_PAGE_SIZE, isEndOfList, notificationsQuery } from "@/utils/notificationCursor";

/** One page of notifications by cursor: `before` is the id of the last item already loaded. An
 * unknown cursor (404) just means the list has ended. `total` is the unread count. */
export const getNotifications = async ({
    before,
    size = NOTIFICATIONS_PAGE_SIZE,
    includeRead = false,
}: { before?: string | null; size?: number; includeRead?: boolean } = {}) => {
    try {
        const response: any = await GET_API(
            `${endpoints.post.getNotifications}?${notificationsQuery({ before, size, includeRead })}`
        );
        return response.data;
    } catch (err) {
        if (before && isEndOfList(err)) return { items: [], total: 0 };
        throw err;
    }
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