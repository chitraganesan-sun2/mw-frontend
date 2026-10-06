"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { showToast } from "@/components/common/Toast";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

/**
 * Pops a toast when the unread chat-message count goes up while the user is elsewhere in
 * the app - previously a new message only showed up if they happened to open Messages.
 * Not on first load (that's existing mail, already badged in the sidebar), and not while
 * they are already on the Messages page.
 */
const NewMessageAlert = () => {
    const { unreadMessages } = useUnreadMessages();
    const pathname = usePathname();
    const previous = useRef<number | null>(null);

    useEffect(() => {
        const before = previous.current;
        previous.current = unreadMessages;
        if (before === null) return;
        if (unreadMessages > before && !pathname?.includes("/messages")) {
            const added = unreadMessages - before;
            showToast({
                type: "info",
                position: "top-right",
                duration: 6000,
                message: added === 1 ? "You have a new message." : `You have ${added} new messages.`,
            });
        }
    }, [unreadMessages, pathname]);

    return null;
};

export default NewMessageAlert;
