"use client";

import React, { useState } from "react";
import CenterModal from "@/components/common/Modals/CenterModal";
import { showToast } from "@/components/common/Toast";
import dayjs from "dayjs";
import LottieLoader from "@/components/common/Loader/Lottie";
import { GET_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useQuery } from "@tanstack/react-query";

interface RequestInstantSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Skill {
    skill_id: string;
    skill_name: string;
}

const DURATIONS = [15, 30, 45, 60];

const RequestInstantSessionModal: React.FC<RequestInstantSessionModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [sessionType, setSessionType] = useState<"academic" | "non_academic" | "">("");
    const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
    const [level, setLevel] = useState("");
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [duration, setDuration] = useState<number>(30);

    const { data: skillsData, isLoading: isSkillsLoading } = useQuery({
        queryKey: ["learner-request-skills", sessionType],
        queryFn: async () => {
            if (!sessionType) return [];
            const res = await GET_API(`${endpoints.common("skills")}?category=${sessionType}`);
            return (res?.data as Skill[]) || [];
        },
        enabled: isOpen && !!sessionType,
    });
    const skills: Skill[] = Array.isArray(skillsData) ? skillsData : [];

    const toggleSkill = (skillId: string) => {
        setSelectedSkillIds((prev) =>
            prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
        );
    };

    const resetForm = () => {
        setSessionType("");
        setSelectedSkillIds([]);
        setLevel("");
        setDate("");
        setTime("");
        setDuration(30);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!sessionType) {
            showToast({ message: "Please select what you want to learn", type: "error" });
            return;
        }
        if (selectedSkillIds.length === 0) {
            showToast({ message: "Please select at least one skill", type: "error" });
            return;
        }
        if (!level) {
            showToast({ message: "Please select a level", type: "error" });
            return;
        }
        if (!date || !time) {
            showToast({ message: "Please select both date and time", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                availability_date: dayjs(date).format("YYYY-MM-DD"),
                availability_start_time: time,
                duration: duration,
                session_type: sessionType,
                skill_ids: selectedSkillIds,
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
            title="Request a Session"
            topContent={
                <p className="text-sm text-gray-500 font-normal !mt-0">
                    Let a volunteer know when you&apos;re free to learn
                </p>
            }
            width={580}
            hideFooter={true}
            rootClassName="!rounded-3xl overflow-hidden"
            headerClassName="!px-6 !py-5"
            bodyClassName="!px-6 !py-[20px]"
        >
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-3xl">
                    <LottieLoader isLoading={true} />
                </div>
            )}

            <div className="flex flex-col gap-5">
                {/* Session Type */}
                <div className="flex flex-col gap-2">
                    <label className="text-base font-medium text-[#121212]">
                        What do you want to learn?
                    </label>
                    <select
                        className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212] appearance-none"
                        value={sessionType}
                        onChange={(e) => {
                            setSessionType(e.target.value as "academic" | "non_academic" | "");
                            setSelectedSkillIds([]);
                            setLevel("");
                        }}
                    >
                        <option value="" disabled>
                            Select a category
                        </option>
                        <option value="academic">Academic</option>
                        <option value="non_academic">Non-Academic (Skills/Arts)</option>
                    </select>
                </div>

                {/* Skills – multi-select, filtered by category */}
                {sessionType && (
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-[#121212]">
                            Which skills do you want to learn?
                        </label>
                        {isSkillsLoading ? (
                            <p className="text-sm text-gray-400">Loading skills...</p>
                        ) : skills.length === 0 ? (
                            <p className="text-sm text-gray-400">No skills found for this category.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                                {skills.map((skill) => {
                                    const isSelected = selectedSkillIds.includes(skill.skill_id);
                                    return (
                                        <button
                                            key={skill.skill_id}
                                            type="button"
                                            onClick={() => toggleSkill(skill.skill_id)}
                                            className={`py-2 px-3 rounded-xl border text-sm font-medium capitalize transition-all duration-150 cursor-pointer ${
                                                isSelected
                                                    ? "border-black bg-black text-white"
                                                    : "border-gray-200 text-[#121212] bg-white hover:border-gray-400"
                                            }`}
                                        >
                                            {skill.skill_name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Level */}
                {sessionType && (
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-[#121212]">
                            {sessionType === "academic" ? "Grade Level" : "Expertise Level"}
                        </label>
                        {sessionType === "academic" ? (
                            <select
                                className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212] appearance-none"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                            >
                                <option value="" disabled>
                                    Select your grade
                                </option>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <option key={i} value={`Grade ${i + 1}`}>
                                        Grade {i + 1}
                                    </option>
                                ))}
                                <option value="College">College</option>
                                <option value="Other">Other</option>
                            </select>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {["beginner", "intermediate", "expert"].map((exp) => (
                                    <button
                                        key={exp}
                                        type="button"
                                        onClick={() => setLevel(exp)}
                                        className={`py-3 px-2 rounded-xl border text-center text-sm font-medium capitalize transition-all duration-150 cursor-pointer ${
                                            level === exp
                                                ? "border-black bg-black text-white"
                                                : "border-gray-200 text-[#121212] bg-white hover:border-gray-400"
                                        }`}
                                    >
                                        {exp}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-[#121212]">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={dayjs().format("YYYY-MM-DD")}
                            className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212]"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-[#121212]">Start Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none hover:border-gray-400 focus:border-black transition-colors bg-white text-base text-[#121212]"
                        />
                    </div>
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-2">
                    <label className="text-base font-medium text-[#121212]">Duration</label>
                    <div className="grid grid-cols-4 gap-2">
                        {DURATIONS.map((dur) => (
                            <button
                                key={dur}
                                type="button"
                                onClick={() => setDuration(dur)}
                                className={`py-3 px-2 rounded-xl border text-center text-sm font-medium transition-all duration-150 cursor-pointer ${
                                    duration === dur
                                        ? "border-black bg-black text-white"
                                        : "border-gray-200 text-[#121212] bg-white hover:border-gray-400"
                                }`}
                            >
                                {dur} min
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-5 border-t border-gray-100">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-2xl border border-gray-200 font-medium text-black hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-2xl bg-black text-white font-medium hover:bg-gray-900 transition-colors"
                    >
                        {isLoading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </div>
        </CenterModal>
    );
};

export default RequestInstantSessionModal;
