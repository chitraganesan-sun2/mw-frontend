import React, { useMemo } from "react";
import { Input } from "@/components/common/Input";
import MessageCard from "@/components/messages/MessageCard";

interface Message {
    chat_id: string;
    volunteer_id: string;
    learner_id: string;
    learner_name: string;
    learner_profile_picture: {
        image_url: string;
        image_id: string;
    };
    message: string;
    created_at: string;
    unread_messages_count: number;
}

interface ChatListProps {
    messages: Message[];
    searchQuery: string | null;
    onSearch: (value: string) => void;
    isLoading?: boolean;
    isIndividualChatLoading?: boolean;
}

const ChatListSkeleton = () => {
    return (
        <div className="animate-pulse w-full max-w-[407px] shrink-0">
            {[1, 2, 3, 4, 5].map((item) => (
                <div
                    key={item}
                    className="flex  shrink-0 items-center gap-4 p-3 mb-2 bg-gray-100 rounded-lg"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const ChatList: React.FC<ChatListProps> = ({
    messages,
    searchQuery,
    onSearch,
    isLoading = false,
    isIndividualChatLoading = false,
}) => {
    const filteredMessages = useMemo(() => {
        if (!searchQuery) return messages;
        return messages.filter((message) =>
            message.learner_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [messages, searchQuery]);

    return (
        <div className="max-w-[440px] h-full shrink-0 rounded-tl-[3.1rem] md:p-4 border-r border-gray-200">
            <div className="hidden md:flex items-center justify-between rounded-tl-[3rem] py-2">
                <p className="text-2xl font-medium">All Chats</p>
                <p className="text-base text-gray-500 font-medium">
                    {filteredMessages.length} Chats
                </p>
            </div>
            <div className="py-4 px-4 md:px-0">
                <Input
                    value={searchQuery ?? ""}
                    inputType="search"
                    name="search"
                    inputClassName="!bg-transparent !rounded-3xl gap-1 font-medium items-center w-full"
                    className="!bg-transparent w-full !mb-0"
                    onChange={onSearch}
                    placeholder={"Search"}
                />
            </div>
            <div className="flex flex-col gap-2s">
                {isLoading ? (
                    <ChatListSkeleton />
                ) : (
                    filteredMessages?.map((message) => (
                        <MessageCard
                            key={message?.chat_id}
                            name={message?.learner_name}
                            image={message?.learner_profile_picture?.image_url}
                            chat_id={message?.chat_id}
                            volunteerId={message?.volunteer_id}
                            unreadMessages={message?.unread_messages_count}
                            message={message.message}
                            time={message.created_at}
                            date={message.created_at}
                            learnerId={message?.learner_id}
                            isIndividualChatLoading={isIndividualChatLoading}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatList;
