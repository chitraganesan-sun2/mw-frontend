import React from "react";
import Card from "./Card";
import ContainerWrapper from "../components/ContainerWrapper";
import { cardData } from "@/constants/landingPage";
const WhyWeBuild = () => {
    return (
        <ContainerWrapper>
            <h2 className="text-2xl mb-6 lg:mb-0 lg:text-[2rem] text-center font-medium">Why are we building this?</h2>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-7 md:items-stretch md:content-start">
                {cardData.map((item, index) => (
                    <Card key={index} title={item.title} description={item.description} index={index} />
                ))}
            </div>
        </ContainerWrapper>
    );
};

export default WhyWeBuild;
