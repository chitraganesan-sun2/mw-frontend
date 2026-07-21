"use client";

import React, { useState } from "react";
import CenterModal from "@/components/common/Modals/CenterModal";
import ModalCloseIcon from "@/assets/icons/ModalCloseIcon";
import { showToast } from "@/components/common/Toast";
import dayjs from "dayjs";
import LottieLoader from "@/components/common/Loader/Lottie";
import { POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";

interface RequestInstantSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const DURATIONS = [15, 30, 45, 60];

const RequestInstantSessionModal: React.FC<RequestInstantSessionModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [sessionType, setSessionType] = useState<"academic" | "non_academic" | "">("");
    const [level, setLevel] = useState("");
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [duration, setDuration] = useState<number>(30);

    const resetForm = () => {
        setStep(1);
        setSessionType("");
        setLevel("");
        setDate("");
        setTime("");
        setDuration(30);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleNext = () => {
        if (step === 1 && !sessionType) {
            showToast({ message: "Please select a session type", type: "error" });
            return;
        }
        if (step === 2 && !level) {
            showToast({ message: "Please select a level", type: "error" });
            return;
        }
        if (step === 3 && (!date || !time)) {
            showToast({ message: "Please select both date and time", type: "error" });
            return;
        }
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = {
                availability_date: dayjs(date).format("YYYY-MM-DD"),
                availability_start_time: time,
                duration: duration,
                session_type: sessionType,
                grade_level: sessionType === "academic" ? level : null,
                expertise_level: sessionType === "non_academic" ? level : null,
            };

            const res = await POST_API(endpoints.session.createLearnerInstantSessionRequest, payload);
            
            if (res.status === 201 || res.status === 200) {
                showToast({ message: "Session request created successfully! Volunteers will be notified.", type: "success" });
                onSuccess();
                handleClose();
            } else {
                showToast({ message: res.data?.detail || "Failed to create request", type: "error" });
            }
        } catch (error: any) {
            showToast({ message: error?.response?.data?.detail || "An error occurred", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CenterModal
            isOpen={isOpen}
            onClose={handleClose}
            width={500}
        >
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-3xl">
                    <LottieLoader isLoading={true} />
                </div>
            )}
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Request a Session</h2>
                <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    disabled={isLoading}
                >
                    <ModalCloseIcon />
                </button>
            </div>

            <div className="mb-6">
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                                i <= step ? "bg-black" : "bg-gray-200"
                            }`}
                        />
                    ))}
                </div>

                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-medium">What do you want to learn?</h3>
                        <div className="space-y-3">
                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${sessionType === 'academic' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="sessionType"
                                    className="hidden"
                                    checked={sessionType === 'academic'}
                                    onChange={() => setSessionType('academic')}
                                />
                                <span className="font-medium">Academic</span>
                            </label>
                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${sessionType === 'non_academic' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="sessionType"
                                    className="hidden"
                                    checked={sessionType === 'non_academic'}
                                    onChange={() => setSessionType('non_academic')}
                                />
                                <span className="font-medium">Non-Academic (Skills/Arts)</span>
                            </label>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-medium">
                            {sessionType === "academic" ? "What is your grade level?" : "What is your expertise level?"}
                        </h3>
                        <div className="space-y-3">
                            {sessionType === "academic" ? (
                                <select 
                                    className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors bg-white appearance-none"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                >
                                    <option value="" disabled>Select your grade</option>
                                    {Array.from({length: 12}).map((_, i) => (
                                        <option key={i} value={`Grade ${i+1}`}>Grade {i+1}</option>
                                    ))}
                                    <option value="College">College</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <div className="space-y-3">
                                    {['beginner', 'intermediate', 'expert'].map((exp) => (
                                        <label key={exp} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${level === exp ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input
                                                type="radio"
                                                name="expertiseLevel"
                                                className="hidden"
                                                checked={level === exp}
                                                onChange={() => setLevel(exp)}
                                            />
                                            <span className="font-medium capitalize">{exp}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-medium">When are you available?</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={dayjs().format("YYYY-MM-DD")}
                                    className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (Your Timezone)</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors bg-white"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-medium">How long do you want to learn?</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {DURATIONS.map((dur) => (
                                <label 
                                    key={dur} 
                                    className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all text-center ${
                                        duration === dur ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="duration"
                                        className="hidden"
                                        checked={duration === dur}
                                        onChange={() => setDuration(dur)}
                                    />
                                    <span className="font-medium">{dur} min</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                {step > 1 && (
                    <button
                        onClick={handleBack}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Back
                    </button>
                )}
                {step < 4 ? (
                    <button
                        onClick={handleNext}
                        className="flex-1 py-3 px-4 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition-colors"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? "Submitting..." : "Submit Request"}
                    </button>
                )}
            </div>
        </CenterModal>
    );
};

export default RequestInstantSessionModal;
