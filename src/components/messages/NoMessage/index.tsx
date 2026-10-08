import React from "react";
import Image from "next/image";
import Nomessage from "@/assets/images/Nomessage.png";
import Button from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/auth";
import { useEffect, useState } from "react";
const NoMessage = () => {
    const router = useRouter();
    // Read after mount - getCookie in render differs between SSR and client.
    const [role, setRole] = useState<string | undefined>(undefined);
    useEffect(() => {
        setRole(getCookie("role"));
    }, []);
    const [isNavigating, setIsNavigating] = useState(false);
    // Copy names the *other* side of the platform.
    const counterparts = role === "volunteer" ? "learners" : "volunteers";

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
                Looks like you haven&apos;t initiated a conversation with <br /> any of our {counterparts}.
            </p>
            <Button
                onClick={handleStartConversation}
                loading={isNavigating}
                disabled={isNavigating}
                className="!text-[16px] !bg-action !text-white hover:!bg-action-hover hover:!text-white !rounded-full"
            >
                Start Conversation
            </Button>
            <p className="flex flex-col md:flex-row md:text-base text-[12px] text-center">
                {role === "volunteer"
                    ? "Let learners reach out to you - turn on messages."
                    : "Let volunteers reach out and help - turn on messages."}
                {"  "}
                <button
                    type="button"
                    className="mt-1 md:mt-0 md:text-base underline md:underline-none text-[16px] font-medium hover:underline cursor-pointer appearance-none border-0 bg-transparent p-0"
                    onClick={handleGoToSettings}
                >
                    Go to settings
                </button>
            </p>
        </div>
    );
};

export default NoMessage;
