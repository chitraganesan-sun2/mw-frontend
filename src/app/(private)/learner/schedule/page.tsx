"use client";

import Calendar from "@/components/schedule/Calender";
import AddNewMeetingModal from "@/components/schedule/Modals/AddNewMeetingModal";
import FeedbackModal from "@/components/schedule/Modals/FeedbackModal";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getCalendarEvents } from "@/utils/calender";
import { useQueryClient } from "@tanstack/react-query";
import { useSendData } from "@/hooks/useReactQuery";
import LottieLoader from "@/components/common/Loader/Lottie";
import { useQueryState } from "nuqs";
import InnerWidth from "@/utils/innerWidth";
import MobileCalender from "@/components/schedule/MobileCalender";

export default function LearnerSchedulePage() {
    const [isOpenSchedule, setIsOpenSchedule] = useState(false);
    const [isOpenFeedback, setIsOpenFeedback] = useState(false);

    const router = useRouter();
    const isMobileOrTabScreen = InnerWidth() < 1024;

    const { eventDetails, currentMonth, setLearnerUtcOffset, setLearnerTimeZone } = useAppStore();
    const queryClient = useQueryClient();

    const [modal] = useQueryState("modal");
    const learnerId = Cookies.get("learner_id");

    const getEvents = () => getCalendarEvents(learnerId as string, "learner", currentMonth);

    const { data, isFetching } = useQuery({
        queryKey: ["learner-events", currentMonth],
        queryFn: getEvents,
    });

    const getLearnerDetails = async () => {
        const res = await GET_API(endpoints.learner.getIndividualLearner(learnerId as string));
        if (res?.status === 200) {
            console.log("res?.data?.learner_contact_details?.utc_offset", res?.data?.learner_personal_info?.learner_contact_details?.utc_offset);
            setLearnerUtcOffset(res?.data?.learner_personal_info?.learner_contact_details?.utc_offset);
            setLearnerTimeZone(res?.data?.learner_personal_info?.learner_contact_details?.timezone);
            return res?.data;
        }
        return null;
    };

    const { data: learnerDetails } = useQuery<any>({
        queryKey: ["learner-details", learnerId],
        queryFn: getLearnerDetails,
    });

    const handleNavigate = () => {
        router.push(`/learner/schedule?current_month=${currentMonth}`);
    };

    const handleSubmitFeedback = async (formData: any) => {
        const payload = {
            comment: formData?.notes,
            volunteer_commitment_level: formData?.rating || 0,
            ...eventDetails,
        };
        return await POST_API(endpoints.learnerFeedback.create, payload);
    };

    const { mutate: onSave, isPending } = useSendData({
        fn: (formData: any) => handleSubmitFeedback(formData),
        invalidateKey: ["learner-events"],
        success: () => {
            handleNavigate();
            queryClient.invalidateQueries({ queryKey: ["learner-events", currentMonth] });
        },
        error: (err) => {
            console.log("Error: ", err);
        },
    });

    useEffect(() => {
        setIsOpenSchedule(modal === "add_new_meeting");
        setIsOpenFeedback(modal === "feedback");
    }, [modal]);

    return (
        <>
            <div className="w-full h-full animate-fadeIn">
                {isFetching ? (
                    <LottieLoader isLoading={true} fullscreen={false} />
                ) : isMobileOrTabScreen ? (
                    <MobileCalender events={data || []} />
                ) : (
                    <Calendar events={data || []} />
                )}
                <AddNewMeetingModal isOpen={isOpenSchedule} onClose={handleNavigate} />
                <FeedbackModal
                    mode="create"
                    isOpen={isOpenFeedback}
                    onClose={handleNavigate}
                    onSubmit={onSave}
                    data={eventDetails}
                    Loading={isPending}
                />
            </div>
        </>
    );
}
