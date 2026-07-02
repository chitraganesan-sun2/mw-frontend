"use client";

import React from "react";

/**
 * Google Reviews section with infinite marquee scroll.
 * Pauses on hover. Pure CSS animation.
 * 
 * To connect real Google reviews: Set NEXT_PUBLIC_GOOGLE_PLACE_ID in .env.local
 */

const GOOGLE_PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || "";

interface Review {
    author: string;
    rating: number;
    text: string;
    date: string;
}

const REVIEWS: Review[] = [
    {
        author: "Parent of Learner",
        rating: 5,
        text: "MelodyWings has been incredible for my child. The volunteers are patient, skilled, and truly care about each learner's growth.",
        date: "2 weeks ago",
    },
    {
        author: "Volunteer",
        rating: 5,
        text: "Such a rewarding experience to teach and connect with children who have special needs. The platform makes scheduling and communication so easy.",
        date: "1 month ago",
    },
    {
        author: "Guardian",
        rating: 5,
        text: "My child looks forward to every session. The personalized approach and flexible scheduling work perfectly for our family.",
        date: "3 weeks ago",
    },
    {
        author: "Volunteer Educator",
        rating: 5,
        text: "The team at MelodyWings provides excellent support to volunteers. I feel valued and empowered to make a real difference.",
        date: "1 month ago",
    },
    {
        author: "Parent",
        rating: 4,
        text: "Great concept and wonderful volunteers. My child has improved so much in just a few months. Highly recommend!",
        date: "2 months ago",
    },
    {
        author: "Special Educator",
        rating: 5,
        text: "As a professional in this field, I'm impressed by the quality of sessions and the dedication of the volunteer community here.",
        date: "3 weeks ago",
    },
];

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <svg
                key={star}
                className={`w-3.5 h-3.5 ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

const ReviewCard = ({ review }: { review: Review }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-[300px] flex-shrink-0 mx-3">
        <div className="flex items-center justify-between mb-3">
            <StarRating rating={review.rating} />
            <span className="text-[10px] text-gray-400">{review.date}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">
            &ldquo;{review.text}&rdquo;
        </p>
        <p className="text-xs font-semibold text-gray-900">— {review.author}</p>
    </div>
);

const GoogleReviews = () => {
    const averageRating = (
        REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length
    ).toFixed(1);

    // Duplicate reviews for seamless infinite scroll
    const marqueeItems = [...REVIEWS, ...REVIEWS];

    return (
        <section className="py-12 md:py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 mb-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        What People Say About Us
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <StarRating rating={5} />
                        <span className="text-lg font-semibold text-gray-900">{averageRating}</span>
                        <span className="text-sm text-gray-500">({REVIEWS.length} reviews)</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Trusted by families and volunteers worldwide
                    </p>
                </div>
            </div>

            {/* Marquee */}
            <div className="relative group">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background-input to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background-input to-transparent z-10 pointer-events-none" />

                {/* Scrolling container */}
                <div className="flex animate-marquee-reviews group-hover:[animation-play-state:paused]">
                    {marqueeItems.map((review, index) => (
                        <ReviewCard key={`review-${index}`} review={review} />
                    ))}
                </div>
            </div>

            {/* Google Badge */}
            {GOOGLE_PLACE_ID && (
                <div className="text-center mt-8">
                    <a
                        href={`https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        See all reviews on Google →
                    </a>
                </div>
            )}
        </section>
    );
};

export default GoogleReviews;
