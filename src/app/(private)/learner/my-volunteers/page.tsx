"use client";

import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import VolunteerTable from "@/components/volunteers/Table";
import { getHeaderIcon } from "@/layouts/helper";
import { useComponentStore } from "@/store/useComponenetStore";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { getCookie } from "@/utils/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CardChips from "@/components/learners/VolunteerCard/CardChips";
import Button from "@/components/common/Button";
import InnerWidth from "@/utils/innerWidth";
import DummyProfile from "@/assets/images/DummyProfile.png";
import LottieLoader from "@/components/common/Loader/Lottie";
import { useDebounce } from "use-debounce";
import { getApiErrorMessage } from "@/utils/apiError";
import { showToast } from "@/components/common/Toast";
import { safeImageSrc } from "@/utils/safeHref";

interface PaginationParams {
    page: number;
    size: number;
}

interface TableVolunteer {
    id: string;
    name: string;
    classesTaken: number;
    subject: string;
}

const VolunteerCard = ({
    volunteer,
    handleMessage,
}: {
    volunteer: any;
    handleMessage: () => void;
}) => {
    const {
        profile_picture = "",
        name = "",
        classesTaken = "",
        country = "",
        chatPermission = false,
    } = volunteer;
    return (
        <div className="bg-white rounded-xl w-full p-4 space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-[40px] h-[40px] rounded-full relative">
                    <Image
                        src={safeImageSrc(profile_picture?.image_url) || DummyProfile}
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
                    <CardChips label="Sessions Taken" value={classesTaken || "-"} />
                </div>
                <div className="w-full border-t pt-3 mt-3 flex justify-between gap-2">
                    <Button
                        title="Message Volunteer"
                        customClassName={`!px-2 !py-1 !h-auto !rounded-2xl !text-sm ${
                            !chatPermission ? "!text-gray-400" : ""
                        }`}
                        btnVariant="tertiary"
                        onClick={handleMessage}
                        disabled={!chatPermission}
                    />
                </div>
            </div>
        </div>
    );
};

export default function VolunteerPage() {
    const router = useRouter();
    const isMobileScreen = InnerWidth() < 768;

    const [volunteerData, setVolunteerData] = useState<TableVolunteer[]>([]);
    const [pagination, setPagination] = useState<PaginationParams>({
        page: 1,
        size: 10,
    });
    const [total, setTotal] = useState<number>(0);
    const learner = getCookie("learner_id");
    const [size] = useQueryState("size", { defaultValue: "10" });
    const [page] = useQueryState("page", { defaultValue: "1" });
    const [query] = useQueryState("query");

    const [debouncedQuery] = useDebounce(query, 500);
    const getAllVolunteers = async ({ page, size }: PaginationParams) => {
        const endpoint = `${endpoints.learner.getConnectedVolunteers(learner as string)}?query=${
            debouncedQuery || ""
        }&page=${page}&size=${size}`;
        const response: any = await GET_API(endpoint);
        return response.data;
    };

    const { data: volunteers, isLoading, isFetching } = useQuery({
        queryKey: ["volunteers", pagination.page, pagination.size, debouncedQuery],
        queryFn: () => getAllVolunteers(pagination),
    });

    useEffect(() => {
        if (volunteers?.items) {
            const transformedData = volunteers.items.map((volunteer: any) => ({
                id: volunteer.volunteer_id,
                name: `${volunteer.volunteer_name}`,
                classesTaken: volunteer.total_sessions,
                country: volunteer.country,
                profile_picture: volunteer.profile_picture,
                chatPermission: volunteer.chat_permission,
            }));
            setVolunteerData(transformedData);
            setTotal(volunteers.total);
        }
    }, [volunteers]);

    const handleTableChange = (pagination: any) => {
        setPagination({
            page: pagination.current,
            size: pagination.pageSize,
        });
    };

    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();

    const handleMessageVolunteer = (volunteedId: string) => {
        GET_API(endpoints.chat.createChatForVolunteer(volunteedId)).then((res: any) => {
            // Must be `volunteerId` - the messages page reads that exact param. The old
            // `volunteedId` typo made it fall back to the wrong/null recipient.
            router.push(`/learner/messages?chatId=${res.data.chat_id}&volunteerId=${volunteedId}`);
        }).catch((err: any) => {
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't open the chat. Please try again.") });
        });
    };

    useEffect(() => {
        setHeaderOptions({
            title: "My Volunteers",
            titleIcon: getHeaderIcon("backIcon"),
            titleIconClick: () => router.push("/learner/volunteer"),
            searchPlaceholder: "Find a volunteer",
            showTitleButton: true,
        });
    }, [setHeaderOptions]);

    return (
        <div className="w-full h-full p-6 animate-fadeIn">
            {isMobileScreen ? (
                (isLoading || isFetching) && volunteerData.length === 0 ? (
                    <LottieLoader isLoading={true} />
                ) : (
                    <div className="grid grid-cols-1">
                        {volunteerData.map((volunteer, index) => (
                            <VolunteerCard
                                key={index}
                                volunteer={volunteer}
                                handleMessage={() => handleMessageVolunteer(volunteer?.id)}
                            />
                        ))}
                    </div>
                )
            ) : (
                <VolunteerTable
                    data={volunteerData}
                    handleMessageVolunteer={handleMessageVolunteer}
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
            {isMobileScreen && volunteerData?.length === 0 && (
                <div className="flex-center h-full">No Volunteers Found</div>
            )}
        </div>
    );
}
