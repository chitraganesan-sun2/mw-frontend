import React, { useState, useEffect } from "react";
import { Input as AntInput, Checkbox, DatePicker as AntDatePicker, InputNumber, Spin } from "antd";
import { cn } from "@/utils/merge-class";
import { IoIosSearch } from "react-icons/io";
import RadioInput from "./RadioButton";
import Uploader from "./Upload";
import "react-datepicker/dist/react-datepicker.css";
import { AsyncSelect, MultiSelect } from "./Select";
import { Select } from "./Select";
import ContactInput from "../ContactInput";
import dayjs from "dayjs";
import SelectInputCreatable from "./Select/SelectInputCreatable";
import TimeRangePicker from "./Picker/TimeRangePicker";

const { TextArea } = AntInput;
const { RangePicker: DateRangePicker } = AntDatePicker;

const isAvailableDay = (date: any, availableDays: string[]) => {
    if (!availableDays || !Array.isArray(availableDays)) return true;
    const dayName = dayjs(date).format("dddd");
    return availableDays.includes(dayName);
};

// Separate component for DatePicker to properly use hooks
const DatePickerComponent: React.FC<{
    value: Date | null;
    onChange: (value: Date | null) => void;
    onOpenChange?: (open: boolean) => void;
    onPanelChange?: (value: any, mode: any) => void;
    disabled?: boolean;
    isLoading?: boolean;
    availableDays?: string[];
    availableDates?: string[];
    unavailableDates?: string[];
    inputClassName?: string;
    format?: string;
}> = ({
    value,
    onChange,
    onOpenChange,
    onPanelChange,
    disabled,
    isLoading,
    availableDays,
    availableDates,
    unavailableDates,
    inputClassName,
    format = "DD-MMM-YYYY",
}) => {
    const today = dayjs().startOf("day");

    const parseDate = (date: any) => {
        if (!date) return null;
        if (dayjs.isDayjs(date)) return date;
        if (date instanceof Date) return dayjs(date);
        if (typeof date === "string") {
            const parsed = dayjs(date, "DD-MM-YYYY");
            return parsed.isValid() ? parsed : null;
        }
        return null;
    };

    // State to track the displayed month (pickerValue) independently from selected value
    const [pickerValue, setPickerValue] = useState<dayjs.Dayjs | null>(() => {
        const parsed = parseDate(value);
        return parsed || dayjs();
    });

    // Update pickerValue when value changes (e.g., when date is selected)
    useEffect(() => {
        const parsed = parseDate(value);
        if (parsed) {
            setPickerValue(parsed);
        } else if (!value) {
            // Reset to current month if value is cleared
            setPickerValue(dayjs());
        }
    }, [value]);

    return (
        <div className="relative">
            <AntDatePicker
                value={parseDate(value)}
                pickerValue={pickerValue || undefined}
                onChange={(date) => {
                    if (date && !Array.isArray(date)) {
                        const dateObject = date.toDate();
                        onChange(dateObject);
                    } else if (!date) {
                        onChange(null);
                    }
                }}
                onOpenChange={(open) => {
                    if (onOpenChange) {
                        onOpenChange(open);
                    }
                }}
                onPanelChange={(value, mode) => {
                    // Block month/year change while loading to prevent rapid requests
                    if (isLoading) return;
                    // Update pickerValue when panel changes (month navigation)
                    if (value) {
                        setPickerValue(value);
                    }
                    // Always call onPanelChange when provided
                    if (onPanelChange) {
                        onPanelChange(value, mode);
                    }
                }}
                format={format}
                disabled={disabled}
                panelRender={
                    isLoading
                        ? (panelNode) => (
                              <div className="relative">
                                  {panelNode}
                                  {/* Disable navigation arrows while loading */}
                                  <div
                                      className="absolute left-0 top-0 h-10 w-20 cursor-not-allowed opacity-50 bg-white"
                                      style={{ zIndex: 10, pointerEvents: "auto" }}
                                      aria-hidden
                                  />
                                  <div
                                      className="absolute right-0 top-0 h-10 w-20 cursor-not-allowed opacity-50 bg-white"
                                      style={{ zIndex: 10, pointerEvents: "auto" }}
                                      aria-hidden
                                  />
                              </div>
                          )
                        : undefined
                }
                renderExtraFooter={() => {
                    if (isLoading) {
                        return (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 20,
                                    pointerEvents: "none",
                                }}
                            >
                                <Spin size="default" />
                            </div>
                        );
                    }
                    return null;
                }}
                disabledDate={(current) => {
                    if (!current) return true;

                    // Always disable dates before today
                    if (current.isBefore(today, "day")) return true;

                    const currentDay = current.format("dddd");
                    const currentDate = current.format("YYYY-MM-DD");

                    // Disable if in unavailableDates
                    if (unavailableDates && unavailableDates.includes(currentDate)) return true;

                    // Priority: If availableDates is provided, only enable dates explicitly in that array
                    if (availableDates && availableDates.length > 0) {
                        return !availableDates.includes(currentDate);
                    }

                    // If only availableDays is provided (and no availableDates), use day-based filtering
                    if (availableDays && availableDays.length > 0) {
                        return !availableDays.includes(currentDay);
                    }

                    // If no data provided yet, disable all dates
                    return true;
                }}
                placeholder={isLoading ? "Loading available dates..." : "Click to select date"}
                className={cn(
                    "w-full text-sm p-2 rounded-lg border border-stroke focus:!border-stroke focus:!bg-background-input placeholder:text-sm hover:bg-background-input bg-background-input",
                    inputClassName
                )}
            />
        </div>
    );
};

export const Input: React.FC<InputProps> = (props) => {
    const {
        label,
        sublabel,
        sublabelAlignment = "bottom",
        name,
        required = false,
        error,
        disabled = false,
        className = "",
        rootClassName = "",
        labelClassName = "",
    } = props;

    const renderLabel = () => {
        if (!label) return null;

        const labelContent = (
            <div className="inner-label">
                <span>
                    {label}
                    {required && <span className="text-red-500">&nbsp;*</span>}
                </span>
            </div>
        );

        const sublabelContent = sublabel && (
            <p
                className={`text-xs text-gray-light mb-1 text-gray-500 font-normal
                ${sublabelAlignment === "right" ? "!mb-0" : "mt-1"}`}
            >
                {sublabel}
            </p>
        );

        return (
            <label
                htmlFor={name}
                className={cn(
                    "text-[16px] md:text-sm font-normal text-gray-700",
                    labelClassName
                )}
            >
                <div
                    className={`flex ${
                        sublabelAlignment === "right" ? "items-center" : "flex-col items-start"
                    }`}
                >
                    {labelContent}
                    {sublabelContent}
                </div>
            </label>
        );
    };

    const preventInvalidInputForNumber = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent 'e', 'E', '-', and '+' for numeric input
        if (["e", "E", "-", "+"].includes(event.key)) {
            event.preventDefault();
        }
    };

    const renderInput = () => {
        switch (props.inputType) {
            case "text":
                return (
                    <AntInput
                        name={name}
                        type={props.contentType}
                        placeholder={props.placeholder}
                        value={props.value}
                        onChange={(e) =>
                            props.onChange(
                                props?.responseType === "array" ? [e.target.value] : e.target.value
                            )
                        }
                        onKeyDown={props.onKeyDown}
                        disabled={disabled}
                        rootClassName={cn(
                            props.inputClassName ? "w-[49%]" : "",
                            "hover:!border-stroke border h-fit focus:!border-stroke focus:!bg-background-input border-stroke"
                        )}
                        className={cn(
                            `text-sm p-2 rounded-md hover:bg-background-input bg-background-input`,
                            props.inputClassName
                        )}
                    />
                );
            case "number":
                return (
                    <InputNumber
                        {...props}
                        maxLength={props?.maxLength}
                        min={props?.min}
                        name={name}
                        type={props.inputType}
                        placeholder={props.placeholder}
                        value={props.value}
                        onChange={(value) => props.onChange(value)}
                        onKeyDown={preventInvalidInputForNumber}
                        disabled={disabled}
                        rootClassName={cn(
                            props.inputClassName ? "w-[49%]" : "",
                            "w-full !mb-0 border !border-stroke hover:!border-stroke h-fit focus:!border-stroke focus:!bg-background-input"
                        )}
                        className={cn(
                            `!mb-0 text-sm p-[6px] rounded-md hover:!bg-background-input !bg-background-input`,
                            props?.inputClassName
                        )}
                    />
                );

            case "textarea":
                return (
                    <TextArea
                        name={name}
                        placeholder={props.placeholder}
                        value={props.value}
                        onChange={(e) => props.onChange(e.target.value)}
                        disabled={disabled}
                        onKeyDown={(event) => (props.onKeyDown ? props.onKeyDown(event) : event)}
                        rootClassName={cn(
                            props.inputClassName,
                            `hover:!border-stroke border focus:!border-stroke focus:!bg-background-input border-stroke`
                        )}
                        className={cn(
                            props.inputClassName,
                            `w-full text-sm p-2 rounded-md hover:bg-background-input bg-background-input`
                        )}
                        rows={props.rows ?? 4}
                        autoSize={props.rows === 1 ? { minRows: 1, maxRows: 6 } : false}
                    />
                );

            case "search":
                return (
                    <AntInput
                        inputMode="search"
                        placeholder={props.placeholder}
                        onChange={(e) => props.onChange(e.target.value)}
                        value={props.value}
                        rootClassName={cn(
                            "hover:!border-stroke border focus:!bg-background-input !border-stroke w-full h-fit focus:!border-stroke focus:!bg-background-input",
                            props.inputClassName
                        )}
                        className={cn(
                            `w-full text-sm p-2 rounded-md hover:bg-background-input !bg-background-input`,
                            props.inputClassName
                        )}
                        prefix={<IoIosSearch className="text-gray text-xl" />}
                    />
                );

            case "select":
                return <Select {...props} />;

            case "multiselect":
                return <MultiSelect {...props} />;

            case "select-creatable":
                return <SelectInputCreatable {...props} />;

            case "async-select":
                return <AsyncSelect {...props} />;
            case "datepicker":
                return (
                    <DatePickerComponent
                        value={props.value}
                        onChange={props.onChange}
                        onOpenChange={props.onOpenChange}
                        onPanelChange={props.onPanelChange}
                            disabled={props.disabled}
                        isLoading={props.isLoading}
                        availableDays={props.availableDays}
                        availableDates={props.availableDates}
                        unavailableDates={props.unavailableDates}
                        inputClassName={props.inputClassName}
                        format={props.format}
                    />
                );

            case "birthdatepicker":
                const { birthDatePicker, format = "DD-MM-YYYY", value, onChange } = props;
                const startDate = dayjs().subtract(birthDatePicker?.maxAge || 100, "year");
                const endDate = dayjs().subtract(birthDatePicker?.minAge || 0, "year");

                const disabledDate = (current: any) =>
                    current &&
                    (current.isBefore(startDate, "day") || current.isAfter(endDate, "day"));

                const parseBirthDate = (date: any) =>
                    date && dayjs(date, format).isValid() ? dayjs(date, format) : null;

                const handleDateChange = (date: any, dateString: string | string[]) => {
                    // Pass the raw date object to the parent component
                    const formattedDate = dayjs(date).format("DD-MM-YYYY");
                    onChange(formattedDate);
                };

                return (
                    <div>
                        <AntDatePicker
                            value={parseBirthDate(value) || null}
                            disabledDate={disabledDate}
                            onChange={handleDateChange}
                            format="DD-MMM-YYYY"
                            allowClear={false}
                            defaultPickerValue={parseBirthDate(value) || endDate}
                            disabled={props?.disabled}
                            placeholder="Click to select date"
                            className={cn(
                                "w-full text-sm p-2 rounded-lg border border-stroke hover:!border-gray-400 focus:!border-stroke focus:!bg-background-input placeholder:text-sm hover:bg-background-input bg-background-input",
                                props.inputClassName
                            )}
                        />
                    </div>
                );

            case "checkbox":
                return (
                    <Checkbox
                        className={`max-md:!text-sm ${props.inputClassName}`}
                        name={name}
                        checked={props.value}
                        onChange={(e) => props.onChange(e.target.checked)}
                        disabled={disabled}
                    >
                        {props.children || props.placeholder}
                    </Checkbox>
                );
            case "radio":
                return <RadioInput {...props} />;

            case "upload":
                return <Uploader {...props} />;
            case "contact-input":
                return <ContactInput {...props} error={error} />;
            case "timerange":
                return (
                    <div className="flex items-center gap-2">
                        <TimeRangePicker {...props} />
                    </div>
                );
            case "daterange":
                return (
                    <DateRangePicker
                        {...props}
                        format="YYYY-MM-DD"
                        placeholder={["Start Date", "End Date"]}
                        onChange={(date) => props.onChange(date)}
                        disabledDate={(current) =>
                            Boolean(current && current.isBefore(dayjs().startOf("day"), "day"))
                        }
                    />
                );
        }
    };

    return (
        <div
            className={`mb-1 lg:mb-2 w-full h-auto flex flex-col gap-2 ${className} ${rootClassName}`}
        >
            {renderLabel()}
            {renderInput()}
            {error && <p className="text-xs text-red-500 capitalize font-medium">{error}</p>}
        </div>
    );
};
