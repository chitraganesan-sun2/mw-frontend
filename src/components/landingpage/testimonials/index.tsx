"use client";

import React from "react";
import ContainerWrapper from "../components/ContainerWrapper";
import ContainerHeader from "../components/ContainerHeader";
import { testimonialsLearners, testimonialsVolunteers } from "@/constants/landingPage";
import Image from "next/image";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";

export interface TestimonialData {
    category: string;
    quote: string;
    author: string;
    role: string;
    image: any;
}

const TestimonialMarqueeCard = ({ testimonial }: { testimonial: TestimonialData }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-[340px] md:w-[380px] flex-shrink-0 mx-3 flex flex-col justify-between min-h-[220px]">
        {/* Category badge */}
        <div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                testimonial.category === "Learners" 
                    ? "bg-blue-50 text-blue-600" 
                    : "bg-orange-50 text-orange-600"
            }`}>
                {testimonial.category}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed mt-3 line-clamp-5">
                {testimonial.quote}
            </p>
        </div>
        {/* Author */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
            <Image
                src={testimonial.image || DummyProfileImg}
                alt={testimonial.author || testimonial.role}
                width={36}
                height={36}
                className="rounded-full object-cover w-9 h-9"
            />
            <div>
                <p className="text-sm font-semibold text-gray-900">
                    {testimonial.author || testimonial.role}
                </p>
                {testimonial.author && (
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                )}
            </div>
        </div>
    </div>
);

const Testimonials = () => {
    // Interleave learners and volunteers for variety
    const allTestimonials: TestimonialData[] = [];
    const maxLen = Math.max(testimonialsLearners.length, testimonialsVolunteers.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < testimonialsLearners.length) allTestimonials.push(testimonialsLearners[i]);
        if (i < testimonialsVolunteers.length) allTestimonials.push(testimonialsVolunteers[i]);
    }

    // Duplicate for seamless infinite scroll
    const marqueeItems = [...allTestimonials, ...allTestimonials];

    return (
        <ContainerWrapper>
            <ContainerHeader
                title="Testimonials"
                subTitle="What our community says"
                description="Heartwarming stories from volunteers and families who've experienced the joy of learning together."
            />

            {/* Marquee container */}
            <div className="relative mt-10 group">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background-input to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background-input to-transparent z-10 pointer-events-none" />

                {/* Scrolling track */}
                <div className="overflow-hidden">
                    <div className="flex animate-marquee-testimonials group-hover:[animation-play-state:paused]">
                        {marqueeItems.map((testimonial, index) => (
                            <TestimonialMarqueeCard key={`t-${index}`} testimonial={testimonial} />
                        ))}
                    </div>
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default Testimonials;
