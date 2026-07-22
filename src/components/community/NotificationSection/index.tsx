import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { getNotifications, markNotificationsAsRead } from "@/api/community";
import NotificationProfileImg from "@/assets/images/NotificationProfileImg.png";
import PostImg from "@/assets/images/PostImg.png";
import { Spin } from "antd";
import ErrorMsg from "@/components/common/Messages/ErrorMsg";
import { timesAgo } from "@/utils/timeFunctions";
import { useQueryState } from "nuqs";
import Cookies from "js-cookie";

const POST_NOTIFICATION_TYPES = ["like", "comment", "liked_on_your_comment", "replied_to_your_comment"];

interface Author {
    name: string;
    profile_picture: {
        image_url: string;
        image_id: string;
    }
}

interface Notification {
    notification_id: string;
    author_id?: string;
    notification_type: string;
    read: boolean;
    user_id: string;
    created_by: string;
    created_at: string;
    post_id?: string;
    post_image?: string;
    reference_id?: string;
    title?: string;
    author?: Author;
}

interface NotificationPage {
    items: Notification[];
    total: number;
    page: number;
    size: number;
}

const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => {
    const router = useRouter();
    const [_, setPostId] = useQueryState("id");
    const [mode, setMode] = useQueryState("mode");
    const role = Cookies.get("role");
    const isPostNotification = POST_NOTIFICATION_TYPES.includes(notification.notification_type);

    const getNotificationMessage = (type: string, createdBy?: string) => {
        switch (type) {
            case "like":
                return `${createdBy} liked your post`;
            case "comment":
                return `${createdBy} commented on your post`;
            case "liked_on_your_comment":
                return `${createdBy} liked your comment`;
            case "replied_to_your_comment":
                return `${createdBy} replied to your comment`;
            default:
                return `${createdBy} interacted with your post`;
        }
    };

    const handleClick = () => {
        switch (notification.notification_type) {
            case "new_message":
                router.push(`/${role}/messages${notification.reference_id ? `?chatId=${notification.reference_id}` : ""}`);
                break;
            case "session_booked":
            case "session_accepted":
            case "session_rejected":
            case "session_cancelled":
                router.push(`/${role}/schedule`);
                break;
            default:
                if (notification.post_id) {
                    setPostId(notification.post_id);
                    setMode("view");
                }
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`flex gap-2 sm:gap-3 items-start sm:items-center justify-between pb-3 cursor-pointer ${notification.read ? "opacity-50" : ""}`}
        >
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <div className="w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] relative flex-shrink-0">
                    <Image
                        src={notification?.author?.profile_picture?.image_url || NotificationProfileImg}
                        alt="Profile"
                        fill
                        className="rounded-full object-cover"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3">
                    <p className="text-gray-light font-medium text-sm sm:text-base">
                        {notification.title ||
                            getNotificationMessage(
                                notification.notification_type,
                                notification?.author?.name
                            )}
                    </p>
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    <p className="text-gray-light font-medium text-sm sm:text-base">
                        {timesAgo(notification?.created_at)}
                    </p>
                </div>
            </div>
            {isPostNotification && (
                <div className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] relative flex-shrink-0">
                    <Image src={notification?.post_image || PostImg} alt="Post preview" fill className="rounded-md object-cover" />
                </div>
            )}
        </div>
    );
};

const NotificationSkeleton = ({ size = 5 }: { size?: number }) => {
    return (
        <div className="">
            {[...Array(size)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 animate-pulse pb-3">
                    <div className="flex items-center gap-1 md:gap-3 w-full">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full max-md:mr-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-2 bg-gray-200 rounded-full w-2" />
                        <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-9 w-9 md:h-11 md:w-11 bg-gray-200 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const NotificationSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [visibleIds, setVisibleIds] = useState<string[]>([]);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isError } =
        useInfiniteQuery<NotificationPage>({
            queryKey: ["notifications"],
            queryFn: ({ pageParam = 1 }) =>
                getNotifications({ page: pageParam as number, size: 20 }),
            getNextPageParam: (lastPage) => {
                const nextPage = lastPage.page + 1;
                const totalPages = Math.ceil(lastPage.total / lastPage.size);
                return nextPage <= totalPages ? nextPage : undefined;
            },
            initialPageParam: 1,
        });

    const markAsReadMutation = useMutation({
        mutationFn: (notificationIds: string[]) => markNotificationsAsRead(notificationIds),
    });

    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

        if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }

        if (typeof window === "undefined") return; // SSR safety check
        
        const visibleItems = document.querySelectorAll<HTMLDivElement>(".notification-item");
        const newVisibleIds: string[] = [];
        visibleItems.forEach((item) => {
            const rect = item.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                const id = item.getAttribute("data-id");
                if (id) newVisibleIds.push(id);
            }
        });

        if (
            newVisibleIds.length > 0 &&
            JSON.stringify(newVisibleIds) !== JSON.stringify(visibleIds)
        ) {
            setVisibleIds(newVisibleIds);
            markAsReadMutation.mutate(newVisibleIds);
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, [visibleIds, hasNextPage, isFetchingNextPage]);

    if (isError) return (<ErrorMsg />);

    return (
        <div ref={containerRef} className="flex flex-col h-full overflow-y-auto p-4 md:p-0 no-scrollbar">
            <h2 className="text-xl font-medium max-md:hidden mb-4">Notifications</h2>
            {isFetching ? (
                <NotificationSkeleton size={10} />
            ) : (data?.pages[0]?.items?.length === 0) ? (
                <div className="flex-center min-h-[50vh] w-full h-full">Notifications is Empty</div>
            ) : (
                data?.pages.map((page, i) => (
                    <React.Fragment key={i}>
                        {page.items.map((notification) => (
                            <div
                                key={notification.notification_id}
                                data-id={notification.notification_id}
                                className="notification-item"
                            >
                                <NotificationCard notification={notification} />
                            </div>
                        ))}
                    </React.Fragment>
                ))
            )}
            {isFetchingNextPage && (
                <div className="flex-center p-4">
                    <Spin className="custom-ant-spin" />
                </div>
            )}
        </div>
    );
};

export default NotificationSection;
