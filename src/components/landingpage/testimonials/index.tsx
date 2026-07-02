import React from "react";
import ContainerWrapper from "../components/ContainerWrapper";
import ContainerHeader from "../components/ContainerHeader";
import Testimonial from "../components/Testimonial";
import { testimonialsLearners, testimonialsVolunteers } from "@/constants/landingPage";
import TestimonialCard from "../components/Testimonial/Card";

export interface TestimonialData {
    category: string;
    quote: string;
    author: string;
    role: string;
    image: any;
}

const Testimonials = () => {
    return (
        <ContainerWrapper>
            <ContainerHeader
                title="Testimonials"
                subTitle="What our community says"
                description="Heartwarming stories from volunteers and families who've experienced the joy of learning together."
            />
            <div className="lg:bg-[#f4f7fb] lg:shadow-inner rounded-3xl md:p-6 md:py-20 grid lg:grid-cols-2 grid-cols-1 gap-4 place-items-center w-full mt-10 lg:mt-0">
                <div className="w-[90%] md:w-[80%]">
                    <Testimonial testimonials={testimonialsLearners} />
                </div>
                <div className="w-[90%] md:w-[80%]">
                    <Testimonial testimonials={testimonialsVolunteers} />
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default Testimonials;
