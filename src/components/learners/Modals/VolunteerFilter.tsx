"use client";

import { Input } from "@/components/common/Input";
import SideModal from "@/components/common/Modals/SideModal";
import { useState, useEffect } from "react";
import { z } from "zod";
import { VolunteerFilterModalConstants } from "@/constants/modals";
import { useQueryState } from "nuqs";
import dayjs from "dayjs";
import InnerWidth from "@/utils/innerWidth";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const meetingFormSchema = z.object({
    country: z.any().optional(),
    languages_known: z.any().optional(),
    subjects: z.array(z.string()).optional(),
    skill_ids: z.array(z.string()).optional(),
    available_time: z.any(),
    available_days: z.any(),
});

type FilterData = z.infer<typeof meetingFormSchema>;

interface VolunteerFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    isFilterApplying: boolean;
}

export default function VolunteerFilterModal({
    isOpen,
    isFilterApplying,
    onClose,
}: VolunteerFilterModalProps) {
    const [language_ids, setLanguages] = useQueryState("language_ids");
    const [subject_ids, setSubjects] = useQueryState("subject_ids");
    const [country, setCountry] = useQueryState("country");
    const [start_time, setStartTime] = useQueryState("start_time");
    const [end_time, setEndTime] = useQueryState("end_time");
    const [start_date, setStartDate] = useQueryState("start_date");
    const [end_date, setEndDate] = useQueryState("end_date");
    const [skill_ids, setSkills] = useQueryState("skill_ids");
    const [filterData, setFilterData] = useState<FilterData>({});
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);

    const convertToDate = (date: any) => (date ? dayjs(date)?.format("YYYY-MM-DD") : null);
    const convertToTime = (time: any) => (time ? time?.format("HH:mm") : null);

    // Update form data when query state changes
    useEffect(() => {
        let from = start_time ? dayjs(start_time, "HH:mm") : null;
        let to = end_time ? dayjs(end_time, "HH:mm") : null;
        if (from && to && from.isAfter(to)) [from, to] = [to, from];

        setFilterData({
            languages_known: language_ids?.split(",") || [],
            subjects: subject_ids?.split(",") || [],
            country: country || null,
            available_days: [
                start_date ? dayjs(start_date) : null,
                end_date ? dayjs(end_date) : null,
            ],
            available_time: { from, to },
            skill_ids: skill_ids?.split(",") || [],
        });
    }, [language_ids, subject_ids, start_date, end_date, start_time, end_time, skill_ids]);

    const handleChange = (name: keyof FilterData, value: any) => {
        setFilterData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        setStartDate(convertToDate(filterData?.available_days?.[0]));
        setEndDate(convertToDate(filterData?.available_days?.[1]));

        setStartTime(convertToTime(filterData?.available_time?.from));
        setEndTime(convertToTime(filterData?.available_time?.to));

        setLanguages(
            filterData?.languages_known?.length ? filterData.languages_known.join(",") : null
        );
        setSubjects(filterData?.subjects?.length ? filterData.subjects.join(",") : null);
        setCountry(filterData?.country ? filterData?.country : null);
        setSkills(filterData?.skill_ids?.length ? filterData.skill_ids.join(",") : null);
        onClose();
    };

    const handleClear = () => {
        setFilterData({});
        setStartDate(null);
        setEndDate(null);
        setStartTime(null);
        setEndTime(null);
        setLanguages(null);
        setSubjects(null);
        setCountry(null);
        setSkills(null);
        onClose();
    };

    const isMobileScreen = InnerWidth() < 768;

    return (
        <SideModal
            title="Volunteer Filters"
            onClose={onClose}
            isOpen={isOpen}
            saveButtonText="Apply Filters"
            cancelButtonText="Clear All"
            onSave={handleSave}
            isLoading={isFilterApplying}
            onCancel={handleClear}
            modalWidth={isMobileScreen ? 600 : 400}
        >
            <div className="flex flex-col max-lg:gap-2 px-5 mt-7">
                {VolunteerFilterModalConstants.map((field: any) => (
                    <Input
                        key={field.name}
                        {...field}
                        onChange={(value: any) =>
                            handleChange(field.name as keyof FilterData, value)
                        }
                        value={filterData[field.name as keyof FilterData]}
                    />
                ))}
                <div className="flex flex-col">
                    <label
                        htmlFor="available_days"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Available Days
                    </label>
                    <button
                        className="bg-white border border-gray-300 text-black py-2 px-4 rounded-lg"
                        onClick={() => setIsDateModalOpen((prev) => !prev)}
                    >
                        {filterData?.available_days?.[0] && filterData?.available_days?.[1]
                            ? `${dayjs(filterData?.available_days[0]).format(
                                  "DD-MM-YYYY"
                              )} - ${dayjs(filterData?.available_days[1]).format("DD-MM-YYYY")}`
                            : "Select Available Date Range"}
                    </button>
                </div>
                {isDateModalOpen && (
                    <div className="fixed p-4 bg-white rounded-lg shadow-lg border max-w-[350px]">
                        <DayPicker
                            mode="range"
                            disabled={{ before: new Date() }}
                            selected={{
                                from: filterData?.available_days?.[0]
                                    ? dayjs(filterData?.available_days?.[0]).toDate()
                                    : undefined,
                                to: filterData?.available_days?.[1]
                                    ? dayjs(filterData?.available_days?.[1]).toDate()
                                    : undefined,
                            }}
                            onSelect={(range) => {
                                const formatDate = (d: Date | undefined) =>
                                    d ? dayjs(d).format("YYYY-MM-DD") : undefined;
                                const fromDate = formatDate(range?.from);
                                const toDate = formatDate(range?.to);

                                if (fromDate && toDate) {
                                    handleChange("available_days", [fromDate, toDate]);
                                } else if (fromDate && !toDate) {
                                    handleChange("available_days", [fromDate, undefined]);
                                } else {
                                    handleChange("available_days", [undefined, undefined]);
                                }
                            }}
                            modifiers={{
                                start: filterData?.available_days?.[0]
                                    ? dayjs(filterData?.available_days?.[0]).toDate()
                                    : undefined,
                                end: filterData?.available_days?.[1]
                                    ? dayjs(filterData?.available_days?.[1]).toDate()
                                    : undefined,
                            }}
                        />
                        <div className="flex justify-end mt-4 gap-3">
                            <button
                                onClick={() => setIsDateModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setIsDateModalOpen(false)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </SideModal>
    );
}
