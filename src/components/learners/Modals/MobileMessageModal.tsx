import { endpoints } from "@/api/constants";
import { GET_API, POST_API } from "@/api/request";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { toUserTimeZone } from "@/utils/timeFunctions";
import Loader from "@/components/common/Loader";
import { useAppStore } from "@/store/useAppStore"
import InnerWidth from "@/utils/innerWidth";
import MobileSideModal from "@/components/common/Modals/MobileSideModal";
import { FeedModalCloseIcon } from "@/assets/icons";
import { BsFillSendFill } from "react-icons/bs";
import Image from "next/image";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";

type MobileMessageModalProps = {
    receiverId?: string | null;
    isOpen: boolean;
    onClose: () => void;
};

type MessageProps = {
    message?: string,
    created_at?: any,
    created_by?: string,
    learner_id?: string,
    volunteer_id?: string,
    message_id?: string,
}

const MobileMessageModal = ({ receiverId, isOpen, onClose }: MobileMessageModalProps) => {
    if (!receiverId) return;

    const { learnerDetails, volunteerDetails } = useAppStore();

    const [messages, setMessages] = useState<MessageProps[]>([]);
    const [message, setMessage] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userRole = Cookies.get("role");
    const userTimezone = userRole === "learner" ? learnerDetails?.learner_personal_info?.learner_contact_details?.timezone : volunteerDetails?.volunteer_contact_details?.timezone

    // Role Based endpoints
    const endpoint = userRole === "learner" ? {
        sendMessage: endpoints.learner_chat.sendMessage(receiverId),
        getMessages: endpoints.learner_chat.getMessages(receiverId || ""),
        getReceiverData: endpoints.volunteer.getIndividualVolunteer(receiverId)
    } : {
        sendMessage: endpoints.volunteer_chat.sendMessage(receiverId),
        getMessages: endpoints.volunteer_chat.getMessages(receiverId || ""),
        getReceiverData: endpoints.learner.getIndividualLearner(receiverId)
    }

    const getUserData = async () => {
        const { data } = await GET_API(endpoint.getReceiverData);

        const profileData = userRole === "volunteer" ? {
            profile_picture: data?.profile_picture?.image_url,
            fullName: `${data?.learner_personal_info?.learner_first_name} ${data?.learner_personal_info?.learner_last_name}`,
            country: data?.learner_personal_info?.learner_contact_details?.country
        } : {
            profile_picture: data?.profile_picture?.image_url,
            fullName: `${data?.volunteer_first_name} ${data?.volunteer_last_name}`,
            country: data?.volunteer_contact_details?.country
        }
        return profileData;
    }
    const { data: userData, isFetching: isFetchingUser } = useQuery({ queryKey: [userRole, "profile_data"], queryFn: getUserData })


    const getUserMessages = async () => {
        const { data } = await GET_API(endpoint.getMessages);
        setMessages(data?.items)
        return data;
    }
    const { data: userMessages, isFetching } = useQuery({ queryKey: [userRole, "messages"], queryFn: getUserMessages })

    const handleSubmit = async (message: string) => {
        if (!message) return;
        setMessage('');
        const { data } = await POST_API(endpoint.sendMessage, { message });
        setMessages(prev => [...prev, { message: data?.message, created_at: data?.created_at, created_by: data?.created_by, learner_id: data?.learner_id, volunteer_id: data?.volunteer_id, message_id: data?.message_id }])
    };

    const handleClose = () => {
        setMessage('');
        setMessages([]);
        onClose()
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isFetchingUser]);

    const headerComponent = isFetchingUser ?
        <div className="flex gap-2 w-full items-center animate-pulse">
            <div className="h-[40px] w-[40px] bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div>
                <div className="h-[12px] w-[160px] bg-gray-200 rounded-full dark:bg-gray-500 mb-2"></div>
                <div className="h-[8px] w-[200px] bg-gray-200 rounded-full dark:bg-gray-500"></div>
            </div>
        </div> :
        <div className="flex gap-2 w-full border-stroke items-center">
            <div className="h-[40px] w-[40px] relative flex-shrink-0 border rounded-full overflow-hidden">
                <Image
                    src={userData?.profile_picture || DummyProfileImg}
                    alt={userData?.fullName || "profile picture"}
                    fill
                    className="object-cover"
                />
            </div>
            <div>
                <h5 className="font-medium !text-sm">{userData?.fullName}</h5>
                <p className="!text-xs">From <span className="capitalize">{userData?.country}</span></p>
            </div>
        </div>

    return (
        <MobileSideModal isOpen={isOpen} onClose={handleClose}>
            <div className="flex flex-col justify-between h-full overflow-hidden">
                <div className="px-4 py-2 h-[10vh] border-b flex items-center justify-between gap-3">
                    <Button
                        onClick={onClose}
                        customClassName="!bg-transparent !border-none !p-0 !w-fit !h-fit"
                    >
                        <FeedModalCloseIcon width="30" height="30" />
                    </Button>
                    {headerComponent}
                </div>
                <div className="flex flex-col gap-3 max-h-[80vh] h-full overflow-y-auto p-4">
                    {isFetchingUser || isFetching ?
                        <div className="!h-full !w-full">
                            <Loader size="large" />
                        </div> :
                        messages?.length === 0 && <div className="flex-center !h-full !w-full">No Message Found</div>
                    }
                    {!isFetchingUser && !isFetching && Array.isArray(messages) &&
                        messages.map((message: MessageProps, index: number) => (
                            <div key={message?.message_id || index} className={`!max-w-[80%] rounded-xl text-base !bg-background-input p-3 ${message?.created_by === userRole ? 'ml-auto' : 'mr-auto'}`}>
                                <p className="!text-black mb-3 break-word">{message?.message}</p>
                                <div className={`${message?.created_by === userRole && 'flex flex-end'}`}>
                                    <p className="flex items-center gap-1 text-sm text-gray-light ml-auto">
                                        {toUserTimeZone({ date: message?.created_at, timeZone: userTimezone, format: "h:mm A" })}
                                        <span className="text-xl text- !font-black">•</span>
                                        {toUserTimeZone({ date: message?.created_at, timeZone: userTimezone, format: "Do MMM" })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2 w-full border-t border-stroke items-end mt-0 p-3 h-[10vh]">
                    <Input name="message" className="!mb-0 h-full" inputClassName="!text-md !w-full" inputType="textarea" rows={0} placeholder="Type message here"
                        onChange={(e) => setMessage(e.toString())}
                        value={message || ""}
                    />
                    <Button
                        onClick={() => handleSubmit(message)}
                        icon={<BsFillSendFill />}
                        disabled={!message}
                        btnVariant="secondary"
                        customClassName="!rounded-xl !text-white !bg-black hover:!bg-black text-sm hover:!text-white"
                    />
                </div>
            </div>
        </MobileSideModal>
    );
};

export default MobileMessageModal;