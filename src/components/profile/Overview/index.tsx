import React from "react";
import OverViewCard from "./OverViewCard";
import ClockIcon from "@/assets/icons/ClockIcon";
import LearnerConnectIcon from "@/assets/icons/LearnerConnectIcon";
import RatingHeader from "./RatingHeader";
import RatingCard from "./RatingCard";
import ReviewFilter from "./ReviewFilter";
import Divider from "@/components/common/Divider";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { getCookie } from "@/utils/auth";

const Overview = ({ data, reviewEndpoint }: any) => {
    const role = getCookie("role") || "";
    const isLearner = role === "learner";

    const overViewCard = [
        {
            title: isLearner ? "Hours Attended" : "Hours Volunteered",
            value: data?.total_hours || 0,
            icon: <ClockIcon />,
        },
        {
            title: isLearner ? "Volunteer Connected" : "Students Connected",
            value: data?.connections,
            icon: <LearnerConnectIcon />,
        },
    ];

    const { data: reviews, isLoading } = useQuery({
        queryKey: ["my-reviews"],
        queryFn: async() => {
            const { data } = await GET_API(reviewEndpoint)
            return data
        }
    })

    return (
        <div className="bg-white rounded-3xl p-5 flex flex-col gap-7 h-[83vh]">
            <h2 className="text-xl font-medium">Overview</h2>
            <div className="flex gap-5">
                {overViewCard.map((item, index) => (
                    <OverViewCard
                        key={index}
                        title={item.title}
                        value={item.value}
                        icon={item.icon}
                    />
                ))}
            </div>
            <Divider />
            <ReviewFilter />
            <RatingHeader rating={reviews?.overall_rating || 0} totalReviews={reviews?.feedbacks?.length || 0} />
            <div className="flex flex-col gap-5 h-[60vh] overflow-y-auto">
                { Array.isArray(reviews?.feedbacks) && reviews?.feedbacks.map((item: any, index: number) => (
                    <RatingCard key={index} review={item?.comment} day={item?.created_at} profileImg={item?.author_profile_picture?.image_url} name={item?.author_name} rating={isLearner ? item?.learner_interest_level : item?.volunteer_commitment_level} />
                ))}
                { reviews?.feedbacks?.length === 0 && <div className="h-full flex-center">No Reviews Found</div> }
                { isLoading && <div className="h-full flex-center">Loading Reviews...</div> }
            </div>
        </div>
    );
};

export default Overview;
