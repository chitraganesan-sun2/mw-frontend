import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { TestimonialData } from "@/components/landingpage/testimonials";
import TestimonialCard from "./Card";

interface TestimonialProps {
    testimonials: TestimonialData[];
}

export default function Testimonial({ testimonials }: TestimonialProps) {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
    };

    return (
        <div className="w-full max-w-6xl mx-auto ">
            <Slider {...settings} className="testimonial-slider">
                {testimonials.map((testimonial, index) => (
                    <div key={index}>
                        <TestimonialCard testimonial={testimonial}/>
                    </div>
                ))}
            </Slider>
            <style jsx global>{`
                .testimonial-slider .slick-track {
                    display: flex !important;
                    gap: 0.1rem;
                }
                .testimonial-slider .slick-slide {
                    height: inherit !important;
                    margin: 0 0.1rem;
                }
                .testimonial-slider .slick-slide > div {
                    height: 100%;
                }
                .testimonial-slider .slick-dots {
                    bottom: 15px !important;
                }
            `}</style>
        </div>
    );
}
