"use client";

import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import { MessageModal, TestmonialModal } from "@/components/learners/Modals";
import LearnersTable from "@/components/learners/Table";
import { getHeaderIcon } from "@/layouts/helper";
import { useComponentStore } from "@/store/useComponenetStore";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { getCookie } from "@/utils/auth";
import InnerWidth from "@/utils/innerWidth";
import CardChips from "@/components/leaner/VolunteerCard/CardChips";
import Image from "next/image";
import DummyProfile from "@/assets/images/DummyProfile.png";
import Button from "@/components/common/Button";
import MobileMessageModal from "@/components/learners/Modals/MobileMessageModal";
import LottieLoader from "@/components/common/Loader/Lottie";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";

interface PaginationParams {
    page: number;
    size: number;
}

interface TableLearner {
    id: string;
    name: string;
    classesTaken: number;
    subject: string;
}

const LearnerCard = ({ learner, handleMessage }: { learner: any; handleMessage: () => void }) => {
    const {
        profile_picture = "",
        name = "",
        classesTaken = "",
        country = "",
        chat_permission = false,
    } = learner;

    return (
        <div className="bg-white rounded-xl w-full p-4 space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-[40px] h-[40px] rounded-full relative">
                    <Image
                        src={profile_picture?.image_url ? profile_picture?.image_url : DummyProfile}
                        alt="avatar"
                        fill
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-base font-semibold">{name}</p>
                    <p className="text-sm font-medium">{country && `From ${country}`}</p>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-1">
                    <CardChips label="Classes Taken" value={classesTaken || "-"} />
                </div>
                <div className="w-full border-t pt-3 mt-3 flex justify-between gap-2">
                    {/* <Button
                        title="Upload Testimonial"
                        customClassName="!px-2 !py-1 !h-auto !rounded-2xl !text-sm"
                        btnVariant="tertiary"
                        onClick={handleTestimonial}
                    /> */}
                    <Button
                        title="Message Learner"
                        customClassName={`!px-2 !py-1 !h-auto !rounded-2xl !text-sm ${
                            !chat_permission ? "!text-gray-400" : ""
                        }`}
                        btnVariant="tertiary"
                        onClick={handleMessage}
                        disabled={!chat_permission}
                    />
                </div>
            </div>
        </div>
    );
};

export default function LearnersPage() {
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();
    const isMobileScreen = InnerWidth() < 768;
    const router = useRouter();

    const [learnerData, setLearnerData] = useState<TableLearner[]>([]);
    const [pagination, setPagination] = useState<PaginationParams>({
        page: 1,
        size: 10,
    });
    const [total, setTotal] = useState<number>(0);
    const volunteerId = getCookie("volunteer_id");
    const [size] = useQueryState("size", { defaultValue: "10" });
    const [page] = useQueryState("page", { defaultValue: "1" });
    const [query] = useQueryState("query");
    const [debouncedQuery] = useDebounce(query, 500);

    const getAllLearners = async ({ page, size }: PaginationParams) => {
        const endpoint = `${endpoints.volunteer.getConnectedLearners(
            volunteerId as string
        )}?query=${debouncedQuery || ""}&page=${page}&size=${size}`;
        const response: any = await GET_API(endpoint);
        return response.data;
    };

    const { data: learners, isLoading, isFetching } = useQuery({
        queryKey: ["learners", pagination.page, pagination.size, debouncedQuery],
        queryFn: () => getAllLearners(pagination),
    });

    useEffect(() => {
        if (learners?.items) {
            const transformedData = learners.items.map((learner: any) => ({
                id: learner.learner_id,
                name: `${learner.learner_name}`,
                classesTaken: learner.total_sessions,
                country: learner.country,
                profile_picture: learner.profile_picture,
                chat_permission: learner.chat_permission,
            }));
            setLearnerData(transformedData);
            setTotal(learners.total);
        }
    }, [learners]);

    const handleTableChange = (pagination: any) => {
        setPagination({
            page: pagination.current,
            size: pagination.pageSize,
        });
    };

    const [learnerId, setLearnerId] = useQueryState("id", {
        shallow: true,
    });
    const [mode, setMode] = useQueryState("mode", {
        shallow: true,
    });

    const handleMessageLearner = (learnerId: string) => {
        GET_API(endpoints.chat.createChatForLearner(learnerId)).then((res: any) => {
            console.log(res, "chat response");
            router.push(`/volunteer/messages?chatId=${res.data.chat_id}&learnerId=${learnerId}`);
        });
        // setMode("message");
    };

    const handleUploadTestimonial = (learnerId: string) => {
        console.log("Upload testimonial:", learnerId);
        setLearnerId(learnerId);
        setMode("testimonial");
    };

    const handleClose = () => {
        setLearnerId(null);
        setMode(null);
    };

    useEffect(() => {
        setHeaderOptions({
            title: "Learners",
            titleIcon: getHeaderIcon("backIcon"),
            titleIconClick: () => router.push("/volunteer/learners"),
            searchPlaceholder: "Find your learner",
            showTitleButton: true,
        });
    }, [setHeaderOptions]);

    const LearnerMessageModal = isMobileScreen ? MobileMessageModal : MessageModal;

    return (
        <div className="w-full h-full py-6 px-4 md:p-6 animate-fadeIn">
            <LearnerMessageModal
                key={learnerId}
                receiverId={learnerId}
                isOpen={mode === "message"}
                onClose={handleClose}
            />
            <TestmonialModal
                isOpen={mode === "testimonial"}
                mode={"create"}
                onClose={handleClose}
            />
            {isMobileScreen ? (
                (isLoading || isFetching) && learnerData.length === 0 ? (
                    <LottieLoader isLoading={true} />
                ) : (
                    <div className="grid grid-cols-1">
                        {learnerData.map((learner, index) => (
                            <LearnerCard
                                key={index}
                                learner={learner}
                                handleMessage={() => handleMessageLearner(learner?.id)}
                            />
                        ))}
                    </div>
                )
            ) : (
                <LearnersTable
                    data={learnerData}
                    handleMessageLearner={handleMessageLearner}
                    handleUploadTestimonial={handleUploadTestimonial}
                    loading={isLoading || isFetching}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.size,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                    }}
                    onChange={handleTableChange}
                />
            )}
            {isMobileScreen && learnerData?.length === 0 && (
                <div className="flex-center h-full">No Learner Found</div>
            )}
        </div>
    );
}
