import React from "react";
import { FiDollarSign } from "react-icons/fi";

interface DonationAmountSelectorProps {
    amounts: number[];
    selectedAmount: number | null;
    customAmount: string;
    isCustom: boolean;
    frequency: "one-time" | "monthly";
    onAmountSelect: (amount: number) => void;
    onCustomAmountChange: (amount: string) => void;
    onFrequencyChange: (frequency: "one-time" | "monthly") => void;
    error?: string;
}

const DonationAmountSelector: React.FC<DonationAmountSelectorProps> = ({
    amounts,
    selectedAmount,
    customAmount,
    isCustom,
    frequency,
    onAmountSelect,
    onCustomAmountChange,
    onFrequencyChange,
    error,
}) => {
    return (
        <div className="space-y-6">
            {/* Frequency Toggle - Prominent Recurring Option */}
            <div className="bg-gradient-to-r from-learner-light to-volunteer-light rounded-2xl p-1 flex gap-1">
                <button
                    type="button"
                    onClick={() => onFrequencyChange("one-time")}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                        frequency === "one-time"
                            ? "bg-white shadow-md text-gray-900"
                            : "text-gray-700 hover:text-gray-900"
                    }`}
                >
                    One-Time Gift
                </button>
                <button
                    type="button"
                    onClick={() => onFrequencyChange("monthly")}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                        frequency === "monthly"
                            ? "bg-white shadow-md text-gray-900"
                            : "text-gray-700 hover:text-gray-900"
                    }`}
                >
                    <div className="flex flex-col items-center gap-0.5">
                        <span>Monthly Giving</span>
                        <span className="text-xs text-volunteer-dark font-semibold">💝 Sustained Impact</span>
                    </div>
                </button>
            </div>

            {/* Amount Preset Buttons */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                    {frequency === "monthly" ? "Monthly Donation Amount" : "Donation Amount"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {amounts.map((amount) => (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => onAmountSelect(amount)}
                            className={`py-4 px-4 rounded-xl border-2 font-semibold text-lg transition-all ${
                                selectedAmount === amount && !isCustom
                                    ? "border-learner-dark bg-learner-light text-learner-dark shadow-md scale-105"
                                    : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-sm"
                            }`}
                        >
                            ${amount}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Amount Input */}
            <div className="relative">
                <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-900 mb-2">
                    Or enter custom amount
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiDollarSign className="text-gray-400" size={20} />
                    </div>
                    <input
                        id="custom-amount"
                        type="number"
                        min="1"
                        step="1"
                        value={customAmount}
                        onChange={(e) => onCustomAmountChange(e.target.value)}
                        onFocus={() => onAmountSelect(-1)} // Signal custom mode
                        placeholder="Enter amount"
                        className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-learner-dark focus:border-transparent ${
                            isCustom && customAmount
                                ? "border-learner-dark bg-learner-light text-learner-dark"
                                : "border-gray-200 bg-white text-gray-900"
                        } ${error ? "border-error" : ""}`}
                    />
                </div>
                {error && <p className="mt-2 text-sm text-error">{error}</p>}
            </div>

            {/* Impact Calculator */}
            {(selectedAmount || (isCustom && customAmount)) && (
                <div className="bg-volunteer-light border border-volunteer-dark/20 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">Your Impact:</p>
                    <p className="text-sm text-gray-700">
                        <ImpactMessage 
                            amount={isCustom ? Number(customAmount) : selectedAmount || 0}
                            frequency={frequency}
                        />
                    </p>
                </div>
            )}
        </div>
    );
};

// Impact calculator helper
const ImpactMessage: React.FC<{ amount: number; frequency: "one-time" | "monthly" }> = ({ amount, frequency }) => {
    const hours = Math.floor(amount / 25); // $25 per hour rough estimate
    const sessions = Math.floor(amount / 12.50); // $12.50 per 30-min session
    
    if (frequency === "monthly") {
        const yearlyHours = hours * 12;
        return (
            <>
                <strong className="text-volunteer-dark">${amount * 12}/year</strong> provides approximately{" "}
                <strong>{yearlyHours} hours</strong> of specialized tutoring annually, changing {yearlyHours >= 100 ? "dozens of lives" : "multiple lives"}.
            </>
        );
    }
    
    if (hours >= 2) {
        return (
            <>
                <strong className="text-volunteer-dark">${amount}</strong> funds approximately{" "}
                <strong>{hours} hours</strong> of specialized tutoring for students with disabilities.
            </>
        );
    }
    
    return (
        <>
            <strong className="text-volunteer-dark">${amount}</strong> funds approximately{" "}
            <strong>{sessions} tutoring sessions</strong> for students with special needs.
        </>
    );
};

export default DonationAmountSelector;
