"use client";
import React, { useEffect, useState, useRef } from "react";
import { useComponentStore } from "@/store/useComponenetStore";
import { getHeaderIcon } from "@/layouts/helper";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import ChatList from "@/components/messages/ChatList";
import ChatHeader from "@/components/messages/ChatHeader";
import MessageBubble from "@/components/messages/MessageBubble";
import { Input } from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";
import VolunteerChatList from "@/components/messages/VolunteerChatList";
import NoMessage from "@/components/messages/NoMessage";
import LottieLoader from "@/components/common/Loader/Lottie";
import AddNewMeetingModalVolunteer from "@/components/schedule/Modals/AddNewMeetingModalVolunteer";
import { useAppStore } from "@/store/useAppStore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { SendIcon } from "@/assets/icons";

dayjs.extend(utc);
dayjs.extend(timezone);

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const update = () => setIsMobile(mql.matches);
        update();
        mql.addEventListener("change", update);
        return () => mql.removeEventListener("change", update);
    }, []);
    return isMobile;
}

interface VolunteerChatItem {
    chat_id: string;
    volunteer_id: string;
    learner_id: string;
    learner_name: string;
    learner_profile_picture: { image_url: string; image_id: string };
    learner_country?: string;
    chat_permission?: boolean;
    message: string;
    created_at: string;
    unread_messages_count: number;
}

interface ChatMessage {
    message_id: string;
    chat_id: string;
    created_at: string;
    created_by: string;
    message: string;
    read: boolean;
    receiver_id: string;
    receiver_name: string;
    receiver_profile_picture: {
        image_url: string;
        image_id: string;
    };
    sender_id: string;
    sender_name: string;
    sender_profile_picture: {
        image_url: string;
        image_id: string;
    };
}

const Messages = () => {
    const { setHeaderOptions } = useComponentStore();
    const { volunteerDetails } = useAppStore();
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useQueryState("query");
    const [message, setMessage] = useState("");
    const volunteerId = getCookie("volunteer_id");
    const [chats, setChats] = useState<VolunteerChatItem[]>([]);
    const urlChatId = useSearchParams().get("chatId");
    const urlLearnerId = useSearchParams().get("learnerId");
    // Fall back to the first chat before the URL has synced, so the individual-chat
    // fetch can start immediately instead of waiting on a navigation round trip.
    const firstChat = !isMobile ? chats[0] : undefined;
    const chatId = urlChatId ?? firstChat?.chat_id ?? null;
    const learnerId = urlLearnerId ?? firstChat?.learner_id ?? null;
    const [individualChat, setIndividualChat] = useState<ChatMessage[]>([]);
    const [recieverName, setRecieverName] = useState("");
    const [recieverImage, setRecieverImage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatPermission, setChatPermission] = useState(true);
    const [isIndividualLoading, setIsIndividualLoading] = useState(false);
    const queryClient = useQueryClient();
    const [messageId, setMessageId] = useState([]);
    const [noChats, setNoChats] = useState<boolean | null>(null);
    const [location, setLocation] = useState("");
    const [isRefetching, setIsRefetching] = useState(false);
    const [pendingMessages, setPendingMessages] = useState<Map<string, ChatMessage>>(new Map());
    const [isOpenSchedule, setIsOpenSchedule] = useState(false);
    const handleScheduleMeeting = () => setIsOpenSchedule(!isOpenSchedule);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [individualChat]);

    const getAllChatsForLearners = async () => {
        setIsLoading(true);
        try {
            const res: any = await GET_API(endpoints.chat.getAllchatsOfVolunteer(volunteerId as string));
            setChats(res.data);
            setNoChats(res.data.length === 0);

            // Find matching chat and update receiver details
            if (chatId) {
                const matchingChat = res.data.find((chat: any) => chat.chat_id === chatId);
                if (matchingChat) {
                    setRecieverName(matchingChat.learner_name);
                    setRecieverImage(matchingChat.learner_profile_picture.image_url);
                    setChatPermission(matchingChat.chat_permission);
                    setLocation(matchingChat.learner_country);
                }
            }
            // Do not redirect here; desktop auto-open is handled in useEffect (mobile stays on list)
            return res.data;
        } catch (err: any) {
            console.log(err);
            setNoChats(true);
            return [];
        } finally {
            setIsLoading(false);
            setIsRefetching(false);
        }
    };

    const getIndividualChat = async () => {
        const isFirstLoadForThisChat = individualChat.length === 0;
        if (isFirstLoadForThisChat) setIsIndividualLoading(true);
        try {
            const response = await GET_API(
                endpoints.chat.getIndividualChat(chatId as string, "volunteer")
            );

            if (response.data.length === 0) {
                queryClient.invalidateQueries({ queryKey: ["chats"] });
                setIsRefetching(true);
            }

            if (response.data.length > 0) {
                setRecieverName(response.data[0].learner_name);
                setRecieverImage(response.data[0].learner_profile_picture.image_url);
                setLocation(response.data[0].learner_country);
            }

            // Only store message IDs for unread messages
            const unreadMessageIds = response.data
                .filter((msg: ChatMessage) => !msg.read)
                .map((msg: ChatMessage) => msg.message_id);

            setMessageId(unreadMessageIds);

            // Merge server messages with pending optimistic messages
            // Match optimistic messages with server messages by content to avoid duplicates
            setIndividualChat((prev) => {
                const serverMessages = response.data || [];
                const serverMessageIds = new Set(
                    serverMessages.map((msg: ChatMessage) => msg.message_id)
                );

                // Track which optimistic messages were matched
                const matchedTempIds = new Set<string>();

                // Filter out optimistic messages that have been matched with server messages
                // Match by: same message content and created within last 10 seconds
                const pendingOnly = prev.filter((msg) => {
                    if (!msg.message_id.startsWith("temp-")) return false;
                    if (serverMessageIds.has(msg.message_id)) {
                        matchedTempIds.add(msg.message_id);
                        return false;
                    }

                    // Check if a server message with same content exists (within 10 seconds)
                    const msgTime = new Date(msg.created_at).getTime();
                    const hasMatchingServerMessage = serverMessages.some(
                        (serverMsg: ChatMessage) => {
                            const serverTime = new Date(serverMsg.created_at).getTime();
                            const timeDiff = Math.abs(serverTime - msgTime);
                            const sameContent =
                                serverMsg.message?.trim().toLowerCase() ===
                                msg.message?.trim().toLowerCase();
                            if (sameContent && timeDiff < 10000) {
                                matchedTempIds.add(msg.message_id);
                                return true;
                            }
                            return false;
                        }
                    );

                    return !hasMatchingServerMessage;
                });

                // Clean up matched pending messages
                if (matchedTempIds.size > 0) {
                    setPendingMessages((prev) => {
                        const newMap = new Map(prev);
                        matchedTempIds.forEach((id) => newMap.delete(id));
                        return newMap;
                    });
                }

                return [...serverMessages, ...pendingOnly].sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
            });

            if (isFirstLoadForThisChat) setIsIndividualLoading(false);
            return response.data;
        } catch (error) {
            console.log(error);
            if (isFirstLoadForThisChat) setIsIndividualLoading(false);
        }
    };

    const {
        data,
        isLoading: isLoadingChats,
        isError: isErrorChats,
    } = useQuery({
        queryKey: ["chats"],
        queryFn: () => getAllChatsForLearners(),
        refetchInterval: 8000,
    });

    const { data: individualChatData, refetch: refetchIndividualChat } = useQuery({
        queryKey: ["individualChat", chatId],
        queryFn: () => getIndividualChat(),
        enabled: !!chatId,
        refetchInterval: 4000,
    });

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const handleMessageChange = (value: string | string[]) => {
        setMessage(Array.isArray(value) ? value[0] : value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        if (!message.trim() || !chatId || !volunteerId) return;

        const messageText = message.trim();
        setMessage("");

        // Get current user's profile data from existing messages
        const currentUserMessage = individualChat.find(
            (msg) => msg.sender_id === volunteerId
        ) as any;

        // Create optimistic message
        const tempMessageId = `temp-${Date.now()}-${Math.random()}`;

        // Get volunteer's timezone and convert current time to that timezone instantly
        const volunteerTimezone = volunteerDetails?.volunteer_contact_details?.timezone;
        const volunteerUtcOffset = volunteerDetails?.volunteer_contact_details?.utc_offset;
        let now: string;

        if (volunteerUtcOffset || volunteerTimezone) {
            let offset: string | null = volunteerUtcOffset || null;

            // If no UTC offset available, try to extract it from timezone string
            if (!offset && volunteerTimezone) {
                const utcMatch = volunteerTimezone.match(/\(UTC([+-]\d{2}:\d{2})\)/);
                offset = utcMatch ? utcMatch[1] : null;
            }

            if (offset) {
                // Convert current time to volunteer's timezone using UTC offset
                // dayjs.utcOffset accepts offset in format like "+05:30" or "-09:00"
                const nowInTimezone = dayjs().utcOffset(offset);
                now = nowInTimezone.format(); // Returns ISO string with timezone offset (e.g., "2024-01-01T12:00:00+05:30")
            } else {
                // Fallback to UTC if offset cannot be determined
                now = new Date().toISOString();
            }
        } else {
            // Fallback to UTC if timezone not available
            now = new Date().toISOString();
        }

        const optimisticMessage: any = {
            message_id: tempMessageId,
            chat_id: chatId,
            created_at: now,
            created_by: volunteerId,
            message: messageText,
            read: false,
            receiver_id: learnerId || "",
            receiver_name: recieverName,
            receiver_profile_picture: {
                image_url: recieverImage || "",
                image_id: "",
            },
            sender_id: volunteerId,
            sender_name: currentUserMessage?.sender_name || "",
            sender_profile_picture: currentUserMessage?.sender_profile_picture || {
                image_url: "",
                image_id: "",
            },
            // Add fields used in rendering
            volunteer_profile_picture: currentUserMessage?.volunteer_profile_picture ||
                currentUserMessage?.sender_profile_picture || {
                    image_url: "",
                    image_id: "",
                },
            learner_profile_picture: {
                image_url: recieverImage || "",
                image_id: "",
            },
        };

        // Add optimistic message to UI immediately
        setIndividualChat((prev) => [...prev, optimisticMessage]);
        setPendingMessages((prev) => new Map(prev).set(tempMessageId, optimisticMessage));

        // Send API request in background
        const payload = {
            message: messageText,
            chat_id: chatId,
        };

        POST_API(endpoints.chat.sendMessageToLearner(learnerId as string), payload)
            .then((res: any) => {
                // Axios response structure: res.data contains the actual response from server
                // Handle different possible response structures
                const responseData = res?.data;
                const messageData = responseData?.data || responseData;

                // Replace optimistic message with real message from server (with correct backend
                // time). The send endpoint doesn't return profile picture fields, so carry them
                // over from the optimistic message to avoid the avatar briefly disappearing.
                if (messageData && messageData.message_id) {
                    const enrichedMessageData = {
                        ...messageData,
                        sender_profile_picture: optimisticMessage.sender_profile_picture,
                        receiver_profile_picture: optimisticMessage.receiver_profile_picture,
                        learner_profile_picture: optimisticMessage.learner_profile_picture,
                        volunteer_profile_picture: optimisticMessage.volunteer_profile_picture,
                    };
                    setIndividualChat((prev) => {
                        const filtered = prev.filter((msg) => msg.message_id !== tempMessageId);
                        // Sort by created_at to maintain chronological order
                        const updated = [...filtered, enrichedMessageData].sort(
                            (a, b) =>
                                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        );
                        return updated;
                    });
                    // Remove from pending messages
                    setPendingMessages((prev) => {
                        const newMap = new Map(prev);
                        newMap.delete(tempMessageId);
                        return newMap;
                    });
                } else {
                    // If response doesn't have message data, refetch chat to get the latest messages
                    // This ensures we get the message with correct time from backend
                    setTimeout(() => {
                        refetchIndividualChat();
                    }, 300);
                }
            })
            .catch((error) => {
                console.error("Failed to send message:", error);
                // Remove optimistic message on error
                setIndividualChat((prev) => prev.filter((msg) => msg.message_id !== tempMessageId));
                setPendingMessages((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(tempMessageId);
                    return newMap;
                });
                // Restore message text so user can retry
                setMessage(messageText);
            });
    };

    const postReadMessage = async () => {
        const response = await POST_API(endpoints.chat.readMessage, {
            message_ids: messageId,
        }).then((res: any) => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        });
    };

    useEffect(() => {
        setHeaderOptions({
            title: "Messages",
            titleIcon: getHeaderIcon(pathname),
            hideSearch: true,
            hideHeader: isMobile && !!chatId,
        });
    }, [setHeaderOptions, pathname, isMobile, chatId]);

    useEffect(() => {
        setIndividualChat([]);
    }, [chatId, learnerId]);

    useEffect(() => {
        if (messageId.length > 0) {
            postReadMessage();
        }
    }, [messageId]);

    // Desktop: sync the URL to the auto-selected first chat once loaded (data fetching
    // itself doesn't wait on this - see the chatId/learnerId derivation above).
    useEffect(() => {
        if (isMobile || !chats.length || urlChatId || urlLearnerId) return;
        router.push(
            `/volunteer/messages?chatId=${chats[0].chat_id}&learnerId=${chats[0].learner_id}`
        );
    }, [isMobile, chats, urlChatId, urlLearnerId, router]);

    if (noChats === null) {
        return <LottieLoader isLoading={true} />;
    }

    return (
        <>
            <AddNewMeetingModalVolunteer isOpen={isOpenSchedule} onClose={handleScheduleMeeting} />
            {noChats ? (
                <NoMessage />
            ) : (
                <div className="w-full h-full bg-white flex border border-gray-200 rounded-tl-[3rem] max-md:rounded-tl-none animate-fadeIn">
                    {/* Mobile: show list when no chat selected */}
                    <div
                        className={`w-full h-full ${
                            isMobile && chatId ? "hidden" : ""
                        } md:!block md:max-w-[440px] md:shrink-0`}
                    >
                        <VolunteerChatList
                            messages={chats}
                            searchQuery={searchQuery}
                            onSearch={handleSearch}
                            isIndividualChatLoading={false}
                        />
                    </div>
                    {/* Mobile: show conversation only when a chat is selected */}
                    <div
                        className={`w-full h-full flex-1 flex flex-col ${
                            isMobile && !chatId ? "hidden" : ""
                        }`}
                    >
                        <div className="flex md:pb-2 flex-col md:flex-row md:items-center md:gap-4 md:justify-between border-b border-gray-200">
                            <ChatHeader
                                name={recieverName}
                                location={location}
                                image={recieverImage}
                                onSeeMoreClick={() => {}}
                                showBackButton={isMobile}
                                onBack={() => router.push("/volunteer/messages")}
                            />
                            <div className="w-full  md:w-fit pb-4 md:pb-0 px-3">
                                <Button
                                    onClick={handleScheduleMeeting}
                                    title="Schedule Meeting"
                                    btnVariant="secondary"
                                    className="!rounded-xl !w-full md:w-fit  !text-sm !bg-black hover:!bg-black !text-white transition-all duration-300"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col md:gap-4 p-4 bg-[#f4f7fb] md:bg-white h-[calc(100vh-16em)] overflow-y-auto">
                            {isIndividualLoading ? (
                                <div className="flex-1 flex items-center justify-center min-h-[200px]">
                                    <LottieLoader isLoading={true} />
                                </div>
                            ) : (
                                <>
                                    {individualChat?.map((message: any, index: any) => (
                                        <MessageBubble
                                            key={message.message_id || `msg-${index}`}
                                            message={message.message}
                                            timestamp={new Date(
                                                message.created_at
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                            date={message.created_at}
                                            isOwnMessage={message.sender_id === volunteerId}
                                            userImage={
                                                message.sender_id === volunteerId
                                                    ? message.volunteer_profile_picture
                                                          ?.image_url ||
                                                      message.sender_profile_picture?.image_url
                                                    : message.learner_profile_picture?.image_url ||
                                                      message.receiver_profile_picture?.image_url
                                            }
                                        />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                        <div className="p-4 flex items-end gap-2 md:gap-8 transition-all duration-300">
                            {chatPermission ? (
                                <>
                                    <div className="flex-1 relative">
                                        <div className="absolute bottom-0 left-0 right-0 w-full">
                                            <Input
                                                value={message}
                                                inputType="textarea"
                                                name="message"
                                                inputClassName="!bg-[#f4f7fb] !rounded-lg gap-1 font-medium items-center !h-[38px] w-full transition-all duration-300 !resize-none !pb-[2px]"
                                                className="!bg-transparent w-full !mb-0"
                                                onChange={handleMessageChange}
                                                onKeyDown={handleKeyDown}
                                                placeholder={"Type message here"}
                                                rows={1}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Button
                                            disabled={!message.trim() || !chatPermission}
                                            loading={false}
                                            onClick={handleSendMessage}
                                            title={isMobile ? undefined : "Send Message"}
                                            btnVariant="secondary"
                                            className="!rounded-xl !text-sm !bg-black hover:!bg-black !text-white transition-all duration-300"
                                        >
                                            {isMobile ? <SendIcon /> : null}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-600 text-sm text-center w-full font-medium">
                                    {recieverName} has disabled chat for this conversation
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Messages;
