"use client";

import React, { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft, FiHeart } from "react-icons/fi";
import DonationAmountSelector from "@/components/donate/DonationAmountSelector";
import ExpressDonateForm from "@/components/donate/ExpressDonateForm";
import { createCheckoutSession } from "@/api/donation";
import { showToast } from "@/components/common/Toast";

const PRESET_AMOUNTS = [25, 50, 100, 250];

const ExpressDonatePage = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState("");
    const [isCustom, setIsCustom] = useState(false);
    const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
    const [amountError, setAmountError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAmountSelect = (amount: number) => {
        if (amount === -1) {
            // Custom mode
            setIsCustom(true);
            setSelectedAmount(null);
        } else {
            setIsCustom(false);
            setSelectedAmount(amount);
            setCustomAmount("");
        }
        setAmountError("");
    };

    const handleCustomAmountChange = (value: string) => {
        setCustomAmount(value);
        setIsCustom(true);
        setSelectedAmount(null);
        setAmountError("");
    };

    const handleFrequencyChange = (newFrequency: "one-time" | "monthly") => {
        setFrequency(newFrequency);
    };

    const handleContinueToCheckout = () => {
        const amount = isCustom ? Number(customAmount) : selectedAmount;
        
        if (!amount || amount <= 0) {
            setAmountError("Please select or enter a donation amount");
            showToast({ type: "error", message: "Please select or enter a donation amount" });
            return;
        }

        if (amount < 1) {
            setAmountError("Minimum donation is $1");
            showToast({ type: "error", message: "Minimum donation is $1" });
            return;
        }

        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDonateSubmit = async (data: { firstName: string; lastName: string; email: string }) => {
        setIsSubmitting(true);
        const amount = isCustom ? Number(customAmount) : selectedAmount || 0;

        const successUrl = typeof window !== "undefined" 
            ? `${window.location.origin}/donate/success` 
            : "";
        const cancelUrl = typeof window !== "undefined" 
            ? `${window.location.origin}/donate-express` 
            : "";

        const payload = {
            amount,
            frequency: frequency === "monthly" ? "recurring" : "one_time",
            cover_processing_fee: false,
            success_url: successUrl,
            cancel_url: cancelUrl,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            // Stripe Checkout will collect billing address
            name_visibility: "Show my full name",
            show_on_donor_wall: true,
        };

        try {
            const response = await createCheckoutSession(payload);
            const checkoutUrl = (response as any)?.data?.url || (response as any)?.url;

            if (checkoutUrl && typeof checkoutUrl === "string") {
                window.location.href = checkoutUrl;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error: any) {
            console.error("Checkout error:", error);
            showToast({
                type: "error",
                message: error?.message || "Failed to create checkout session. Please try again.",
            });
            setIsSubmitting(false);
        }
    };

    const currentAmount = isCustom ? Number(customAmount) : selectedAmount || 0;

    return (
        <div className="w-full bg-background-input min-h-screen py-8 md:py-12">
            <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 md:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <FiArrowLeft size={16} />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-learner-fill to-volunteer-fill flex items-center justify-center">
                            <FiHeart className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Support Free Tutoring
                            </h1>
                            <p className="text-sm text-gray-600">
                                Every dollar directly funds specialized education for students with disabilities
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${step >= 1 ? "text-learner-dark" : "text-gray-400"}`}>
                            1. Amount
                        </span>
                        <span className={`text-sm font-medium ${step >= 2 ? "text-learner-dark" : "text-gray-400"}`}>
                            2. Checkout
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-learner-dark to-volunteer-dark transition-all duration-500"
                            style={{ width: step === 1 ? "50%" : "100%" }}
                        />
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-200">
                    {step === 1 ? (
                        <div className="space-y-8">
                            <DonationAmountSelector
                                amounts={PRESET_AMOUNTS}
                                selectedAmount={selectedAmount}
                                customAmount={customAmount}
                                isCustom={isCustom}
                                frequency={frequency}
                                onAmountSelect={handleAmountSelect}
                                onCustomAmountChange={handleCustomAmountChange}
                                onFrequencyChange={handleFrequencyChange}
                                error={amountError}
                            />

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={handleContinueToCheckout}
                                    disabled={!currentAmount || currentAmount <= 0}
                                    className="flex-1 btn-common py-4 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue to Checkout →
                                </button>
                                <Link
                                    href="/donate"
                                    className="sm:w-auto text-center px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm transition-all"
                                >
                                    Advanced Options
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                            >
                                <FiArrowLeft size={14} />
                                Change amount or frequency
                            </button>

                            <ExpressDonateForm
                                amount={currentAmount}
                                frequency={frequency}
                                onSubmit={handleDonateSubmit}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    )}
                </div>

                {/* Trust Footer */}
                <div className="mt-8 text-center space-y-4">
                    <div className="flex items-center justify-center gap-6 text-xs text-gray-600 flex-wrap">
                        <span>🏛️ 501(c)(3) Nonprofit</span>
                        <span>🔒 Secure Payment</span>
                        <span>📧 Instant Receipt</span>
                    </div>
                    <p className="text-xs text-gray-500 max-w-2xl mx-auto">
                        MelodyWings is a registered 501(c)(3) nonprofit organization. Your donation is tax-deductible to the fullest extent permitted by law. You will receive an email receipt for your records.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExpressDonatePage;
