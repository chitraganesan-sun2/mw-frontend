import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { endpoints } from "@/api/constants";
import { useSendData } from "./useReactQuery";
import { PUT_API } from "@/api/request";
import Cookies from "js-cookie";
import { getCookie } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/common/Toast";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export const useOnboardingForm = (schema: any) => {
    const role = getCookie("role");
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
    });
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { setImageId, setVideoId, setDocumentId } = useAppStore();

    const { mutate: updateOnboarding, isPending } = useSendData({
        fn: (data: z.infer<typeof schema>) =>
            PUT_API(endpoints.onboarding.update(role as "volunteer" | "learner"), { ...data, step: role === "volunteer" ? 5 : 6 }),
        success: () => {
            showToast({ type: "success", message: "Form Submitted!" });
            setIsRedirecting(true);
            Cookies.set("onboarded_status", "verification_pending");
            router.push("/onboarding/verification");
            setImageId(null);
            setVideoId(null);
            setDocumentId(null);
        },
        error: () => {
            showToast({ type: "error", message: "Something went wrong!" });
        },
    });

    const onSubmit = async (data: z.infer<typeof schema>) => {
        try {
            updateOnboarding(data);
            console.log("FORM_DATA", data);
        } catch (error) {
            console.error("Error submitting form:", error);
            showToast({ type: "error", message: "Fill required Fields!" });
            throw error;
        }
    };

    return {
        form,
        onSubmit: form.handleSubmit(onSubmit),
        isLoading: isPending,
        isRedirecting: isRedirecting,
    };
};
