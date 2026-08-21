import React from "react";
import Image from "next/image";
import Nomessage from "@/assets/images/Nomessage.png";
import Button from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/auth";
import { useState } from "react";
const NoMessage = () => {
    const router = useRouter();
    const role = getCookie("role");
    const [isNavigating, setIsNavigating] = useState(false);

    const handleGoToSettings = () => {
        if (role === "volunteer") {
            router.push("/volunteer/settings");
        } else {
            router.push("/learner/settings");
        }
    };

    const handleStartConversation = () => {
        setIsNavigating(true);
        if (role === "volunteer") {
            router.push("/volunteer/learners");
        } else {
            router.push("/learner/volunteer");
        }
    };
    return (
        <div className="w-full border-[0.5px] md:border-none border-t-gray-400 h-full min-h-0 flex flex-col md:gap-4 gap-[20px] bg-white items-center justify-center animate-fadeIn">
            <div className="w-[319px] h-[259px] relative flex items-center justify-center">
                <Image src={Nomessage} alt="No Message" fill />
            </div>
            <p className="md:text-2xl text-[24px] font-medium">No Messages Yet</p>
            <p className="md:text-base text-[14px] text-center">
                Looks like you haven't initiated a conversation with <br /> any of our volunteers.
            </p>
            <Button
                onClick={handleStartConversation}
                loading={isNavigating}
                disabled={isNavigating}
                className="!text-[16px] !bg-black !text-white hover:!bg-black/80 hover:!text-white !rounded-full"
            >
                Start Conversation
            </Button>
            <p className="flex flex-col md:flex-row md:text-base text-[12px] text-center">
                Let volunteers reach out and help - turn on messages.{"  "}
                <span
                    className=" mt-1 md:mt-0 md:text-base underline md:underline-none text-[16px] font-medium hover:underline cursor-pointer"
                    onClick={handleGoToSettings}
                >
                    Go to settings
                </span>
            </p>
        </div>
    );
};

export default NoMessage;
