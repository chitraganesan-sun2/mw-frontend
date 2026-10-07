import React from 'react'
import { TestimonialData } from "@/components/landingpage/testimonials";
import TagComponent from '@/components/common/Tag';
import Image from 'next/image';

const TestimonialCard = ({ testimonial }: { testimonial: TestimonialData }) => {
    return (
        <div className="bg-white rounded-3xl p-6 pb-14 w-full">
            <div className="flex flex-col md:gap-8 gap-6">
                <div className="flex justify-center">
                    <TagComponent
                        className={`${testimonial.category === "Learners"
                            ? "!bg-learner-light !text-learner-dark"
                            : "!text-volunteer !bg-volunteer-light"
                            } py-1 !text-sm px-4 border-none`}
                        text={testimonial.category}
                    />
                </div>
                <p className="xl:text-xl text-lg font-normal">
                    {testimonial.quote}
                </p>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded-full overflow-hidden flex-shrink-0">
                        <Image
                            src={testimonial.image.src}
                            alt={testimonial.author}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-lg">
                            {testimonial.author}
                        </p>
                        <p className="font-medium text-lg">
                            {testimonial.role}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestimonialCard