import React, { useState } from "react";
import { FiMail, FiUser, FiCreditCard, FiLock } from "react-icons/fi";
import { SiApplepay, SiGooglepay } from "react-icons/si";
import Button from "@/components/common/Button";

interface ExpressDonateFormProps {
    amount: number;
    frequency: "one-time" | "monthly";
    onSubmit: (data: { firstName: string; lastName: string; email: string }) => Promise<void>;
    isSubmitting: boolean;
}

const ExpressDonateForm: React.FC<ExpressDonateFormProps> = ({
    amount,
    frequency,
    onSubmit,
    isSubmitting,
}) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!firstName.trim()) newErrors.firstName = "First name is required";
        if (!lastName.trim()) newErrors.lastName = "Last name is required";
        
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || isSubmitting) return;
        
        await onSubmit({ firstName, lastName, email });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-learner-light to-volunteer-light rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">
                            {frequency === "monthly" ? "Monthly Donation" : "One-Time Donation"}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                            ${amount}
                            {frequency === "monthly" && <span className="text-lg text-gray-600">/month</span>}
                        </p>
                    </div>
                    {frequency === "monthly" && (
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Annual Impact</p>
                            <p className="text-xl font-semibold text-volunteer-dark">${amount * 12}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiUser className="text-gray-400" />
                    Your Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                if (errors.firstName) setErrors({ ...errors, firstName: "" });
                            }}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-learner-dark focus:border-transparent transition-all ${
                                errors.firstName ? "border-error" : "border-gray-200"
                            }`}
                            placeholder="John"
                            disabled={isSubmitting}
                        />
                        {errors.firstName && <p className="mt-1 text-sm text-error">{errors.firstName}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                                setLastName(e.target.value);
                                if (errors.lastName) setErrors({ ...errors, lastName: "" });
                            }}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-learner-dark focus:border-transparent transition-all ${
                                errors.lastName ? "border-error" : "border-gray-200"
                            }`}
                            placeholder="Doe"
                            disabled={isSubmitting}
                        />
                        {errors.lastName && <p className="mt-1 text-sm text-error">{errors.lastName}</p>}
                    </div>
                </div>
                
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiMail className="text-gray-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({ ...errors, email: "" });
                            }}
                            className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-learner-dark focus:border-transparent transition-all ${
                                errors.email ? "border-error" : "border-gray-200"
                            }`}
                            placeholder="john.doe@example.com"
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
                    <p className="mt-2 text-xs text-gray-500">
                        Your tax-deductible receipt will be sent to this email.
                    </p>
                </div>
            </div>

            {/* Security & Payment Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FiLock className="text-green-600" />
                    <span className="font-medium">Secure Checkout powered by Stripe</span>
                </div>
                <p className="text-xs text-gray-600">
                    Payment details are collected securely by Stripe. We support credit/debit cards, Apple Pay, and Google Pay.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded">
                        <FiCreditCard size={14} />
                        Cards
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded">
                        <SiApplepay size={14} />
                        Apple Pay
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded">
                        <SiGooglepay size={14} />
                        Google Pay
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                title={isSubmitting ? "Processing..." : `Proceed to Secure Checkout →`}
                btnVariant="common"
                size="large"
                customClassName="w-full !py-4 !text-base !font-semibold"
                disabled={isSubmitting}
            />

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                    ✅ 501(c)(3) Tax Deductible
                </span>
                <span className="flex items-center gap-1">
                    🔒 SSL Encrypted
                </span>
                <span className="flex items-center gap-1">
                    💝 100% to Programs
                </span>
            </div>
        </form>
    );
};

export default ExpressDonateForm;
