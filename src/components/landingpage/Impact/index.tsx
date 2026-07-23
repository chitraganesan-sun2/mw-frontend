"use client";

import React from "react";
import ContainerWrapper from "../components/ContainerWrapper";
import ContainerHeader from "../components/ContainerHeader";
import { gradientInnerTextStyle, imapactData } from "@/constants/landingPage";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import numeral from "numeral";
import { Spin } from "antd";

const Impact = () => {

    const getTotalLearnersCount = async () => {
        const response = await GET_API(endpoints.learner.getTotalLearnersCount);
        return response.data.total_learners_count;
    };

    const getTotalVolunteersHours = async () => {
        const response = await GET_API(endpoints.volunteer.getTotalVolunteersHours);
        return response.data;
    };

    const {data: totalLearnersCount, isLoading: isLoadingLearners} = useQuery({
        queryKey: ["totalLearnersCount"],
        queryFn: () => getTotalLearnersCount(),
    });

    const {data: totalVolunteersHours, isLoading: isLoadingVolunteers} = useQuery({
        queryKey: ["totalVolunteersHours"],
        queryFn: () => getTotalVolunteersHours(),
    });

    // Format numbers with K notation for counts and round hours
    const formatCount = (count: number) => {
        return numeral(count).format('0a'); // This will show 1K, 2K, etc.
    };

    const formatHours = (hours: number) => {
        return Math.round(hours); // Round to nearest integer
    };

    return (
        <ContainerWrapper>
            <div className="flex flex-col gap-10 w-full">
                <ContainerHeader
                    title="Our Impact So Far"
                    subTitle="Together, We're Making a Difference"
                    description="Here's how our community is spreading knowledge and bringing change."
                />
                <div className="bg-white lg:bg-[#f4f7fb] shadow-inner rounded-3xl p-6 py-10 md:py-20 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 place-items-center w-full">
                    <div className="flex flex-col">
                            <span
                                style={gradientInnerTextStyle}
                                className="text-center lg:text-start text-[4rem] font-semibold tracking-tighter"
                            >
                                {isLoadingVolunteers ? (
                                    <Spin size="large" />
                                ) : (
                                    `${formatHours(totalVolunteersHours?.total_volunteered_hours || 0)}+`
                                )}
                            </span>
                            <p className="text-xl md:text-base lg:text-xl font-medium -mt-2">Total Hours</p>
                        </div>
                        <div className="flex flex-col">
                            <span
                                style={gradientInnerTextStyle}
                                className="text-center lg:text-start text-[4rem] font-semibold tracking-tighter"
                            >
                                {isLoadingLearners ? (
                                    <Spin size="large" />
                                ) : (
                                    formatCount(totalLearnersCount || 0)
                                )}
                            </span>
                            <p className="text-xl md:text-base lg:text-xl font-medium -mt-2"> Learners Supported</p>
                        </div>
                       
                        <div className="flex flex-col">
                            <span
                                style={gradientInnerTextStyle}
                                className="text-center lg:text-start text-[4rem] font-semibold tracking-tighter"
                            >
                                {isLoadingVolunteers ? (
                                    <Spin size="large" />
                                ) : (
                                    formatCount(totalVolunteersHours?.verified_volunteers_count || 0)
                                )}
                            </span>
                            <p className="text-xl md:text-base lg:text-xl font-medium -mt-2">Volunteers Engaged</p>
                        </div>
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default Impact;
