"use client";
import { useState, useEffect } from "react";
import CenterModal from "@/components/common/Modals/CenterModal";
import { DatePicker, Radio, Input } from "antd";
import dayjs, { Dayjs } from "dayjs";
import UpdownIcon from "@/assets/icons/UpdownIcon";
import cn from "classnames";
import { useProfileToday } from "@/hooks/schedule/useProfileTimeZone";

interface CustomRecurrenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (data: {
        repeatEvery: number;
        repeatUnit: string;
        startDate: Dayjs | null;
        endType: "never" | "date";
        endDate: Dayjs | null;
    }) => void;
    initialData?: {
        start_date?: string;
        end_date?: string | null;
        repeatEvery?: number;
    };
}

const CustomRecurrenceModal: React.FC<CustomRecurrenceModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    // "Today" in the user's PROFILE timezone - the browser's date can differ.
    const today = useProfileToday();
    const [repeatEvery, setRepeatEvery] = useState<number>(initialData?.repeatEvery ?? 0);
    const [startDate, setStartDate] = useState<Dayjs | null>(
        initialData?.start_date ? dayjs(initialData.start_date) : null
    );
    const [endType, setEndType] = useState<"never" | "date">(
        initialData?.end_date ? "date" : "never"
    );
    const [endDate, setEndDate] = useState<Dayjs | null>(
        initialData?.end_date ? dayjs(initialData.end_date) : null
    );

    // Reset form when modal opens/closes or initialData changes
    useEffect(() => {
        if (isOpen) {
            setRepeatEvery(initialData?.repeatEvery ?? 0);
            setStartDate(initialData?.start_date ? dayjs(initialData.start_date) : null);
            setEndType(initialData?.end_date ? "date" : "never");
            setEndDate(initialData?.end_date ? dayjs(initialData.end_date) : null);
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (onSave) {
            onSave({
                repeatEvery,
                repeatUnit: "weeks",
                startDate,
                endType,
                endDate: endType === "date" ? endDate : null,
            });
        }
        // Note: Modal closing is handled by the parent component in onSave
        // to avoid race conditions with async state updates
    };

    return (
        <CenterModal
            isOpen={isOpen}
            onClose={onClose}
            title="Custom Recurrence"
            width={643}
            customClassName="!rounded-3xl"
            mobileWidth={353}
            mobileHeight={537}
            mobileBorderRadius={24}
            mobileBorderWidth={1}
            primaryActionProps={{
                onClick: handleSave,
                title: "Save",
                customClassName: "!bg-black !text-white !rounded-xl w-[100px] h-[40px]",
            }}
            secondaryActionProps={{
                onClick: onClose,
                title: "Cancel",
                btnVariant: "secondary",
                customClassName: "!bg-white !text-black !border !border-gray-300 !rounded-xl w-[100px] h-[40px]",
            }}
        >
            <div className="flex flex-col gap-6 max-md:px-2 max-md:py-6 md:px-6 md:py-6">
                {/* Repeats Every Section */}
                <div className="flex items-center gap-3">
                    <label className="text-base font-medium text-black whitespace-nowrap w-[114px] pt-[3px] h-6 leading-none tracking-normal align-middle">Repeats Every</label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            min={0}
                            max={6}
                            value={repeatEvery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = Number(e.target.value);
                                if (!isNaN(value) && value >= 0 && value <= 6) {
                                    setRepeatEvery(value);
                                }
                            }}
                            className="!w-[41px] !h-10 !rounded-xl !border !border-[#E0E0E0] !bg-[#F4F7FB] !text-sm !font-medium !text-center  !py-0 [&_input]:!text-center [&_input]:!h-full [&_input]:!bg-[#F4F7FB] [&_input]:!text-[#121212]"
                        />
                        <div className="flex flex-col items-center justify-center h-10">
                        <button
                            type="button"
                            onClick={() => setRepeatEvery((prev) => Math.min(6, prev + 1))}
                            className="p-0 border-0 bg-transparent hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center"
                            style={{ height: '12px', width: '20px' }}
                        >
                            <div className="relative" style={{ clipPath: 'inset(0 0 50% 0)', height: '23px', width: '20px' , marginTop: '11px'}}>
                                <UpdownIcon className="!w-5 !h-[23px]" />
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRepeatEvery((prev) => Math.max(0, prev - 1))}
                            className="p-0 border-0 bg-transparent hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center"
                            style={{ height: '12px', width: '20px' }}
                        >
                            <div className="relative" style={{ clipPath: 'inset(50% 0 0 0)', height: '23px', width: '20px', marginTop: '-9px' }}>
                                <UpdownIcon className="!w-5 !h-[23px]" />
                            </div>
                        </button>
                        </div>
                    </div>
                   
                  
                    <span className="text-sm font-medium text-[#121212] leading-none tracking-normal align-middle">Weeks</span>
             
                </div>

                {/* Starts Section */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-gray-700">Starts</label>
                    <div className="flex items-center gap-3">
                        <Radio checked={true} />
                        <DatePicker
                            value={startDate}
                            onChange={(date) => setStartDate(date)}
                            format="MMM DD, YYYY"
                            placeholder="Select date"
                            className="!w-[180px] !h-10 [&_.ant-picker]:!rounded-full [&_.ant-picker]:!bg-[#F4F7FB] [&_.ant-picker]:!border [&_.ant-picker]:!border-[#E0E0E0] [&_.ant-picker-input>input]:!bg-gray-50 [&_.ant-picker-input>input]:!px-4 [&_.ant-picker-input>input]:!py-2 [&_.ant-picker-input>input]:!text-sm [&_.ant-picker-input>input]:!font-medium [&_.ant-picker-input>input]:!h-full"
                            disabledDate={(current) => {
                                return current && current.format("YYYY-MM-DD") < today;
                            }}
                        />
                    </div>
                </div>

                {/* Ends Section */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-gray-700">Ends</label>
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <Radio
                                checked={endType === "never"}
                                onChange={() => setEndType("never")}
                            />
                            <div className="w-[73px] h-10 px-4 py-2 bg-[#F4F7FB] border border-[#E0E0E0] rounded-xl text-sm font-medium text-black flex items-center justify-center">
                                Never
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Radio
                                checked={endType === "date"}
                                onChange={() => setEndType("date")}
                            />
                            <DatePicker
                                value={endType === "date" ? endDate : null}
                                onChange={(date) => setEndDate(date)}
                                format="MMM DD, YYYY"
                                placeholder="Select date"
                                className="!w-[180px] !h-10 [&_.ant-picker]:!rounded-full [&_.ant-picker]:!bg-gray-50 [&_.ant-picker]:!border [&_.ant-picker]:!border-[#E0E0E0] [&_.ant-picker-input>input]:!bg-gray-50 [&_.ant-picker-input>input]:!px-4 [&_.ant-picker-input>input]:!py-2 [&_.ant-picker-input>input]:!text-sm [&_.ant-picker-input>input]:!font-medium [&_.ant-picker-input>input]:!h-full"
                                disabled={endType !== "date"}
                                disabledDate={(current) => {
                                    if (!current || !startDate) return false;
                                    return current < startDate.startOf("day");
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </CenterModal>
    );
};

export default CustomRecurrenceModal;

