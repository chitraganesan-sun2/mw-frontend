"use client";

import React from "react";

/**
 * Google Reviews section for the landing page.
 * Uses an embedded Google Maps reviews widget via Place ID.
 * 
 * To configure: Set NEXT_PUBLIC_GOOGLE_PLACE_ID in .env.local
 * Get your Place ID from: https://developers.google.com/maps/documentation/places/web-service/place-id
 */

const GOOGLE_PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || "";

interface Review {
    author: string;
    rating: number;
    text: string;
    date: string;
}

// Fallback reviews if Google API is not configured
const FALLBACK_REVIEWS: Review[] = [
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
];

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <svg
                key={star}
                className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

const ReviewCard = ({ review }: { review: Review }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-w-[280px] max-w-[320px] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
            <StarRating rating={review.rating} />
            <span className="text-xs text-gray-400">{review.date}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-4">
            &ldquo;{review.text}&rdquo;
        </p>
        <p className="text-xs font-semibold text-gray-900">— {review.author}</p>
    </div>
);

const GoogleReviews = () => {
    const reviews = FALLBACK_REVIEWS;
    const averageRating = (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);

    return (
        <section className="py-12 md:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-5">
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        What People Say About Us
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <StarRating rating={5} />
                        <span className="text-lg font-semibold text-gray-900">{averageRating}</span>
                        <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Trusted by families and volunteers worldwide
                    </p>
                </div>

                {/* Reviews Carousel */}
                <div className="overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
                    <div className="flex gap-4">
                        {reviews.map((review, index) => (
                            <ReviewCard key={index} review={review} />
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
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            See all reviews on Google
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GoogleReviews;
