import React from "react";
import { Radio } from "antd";

const RadioInput: React.FC<RadioInputProps> = ({
    name,
    value,
    onChange,
    disabled,
    options = [],
    inputClassName = "",
    variant = "default",
    radioButtonClassName = "",
    layout = "horizontal",
    optionLabelClassName = "",
    optionSublabelClassName = "",
}) => {
    if (variant === "rating") {
        return (
            <Radio.Group
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`flex flex-wrap gap-3 md:gap-4 ${inputClassName}`}
            >
                {options.map((option, index) => (
                    <div key={option.value} className="flex flex-col items-center gap-2">
                        <Radio.Button
                            value={option.value}
                            className={`max-md:hidden flex items-center justify-center w-12 h-12 rounded-full
                            ${value === option.value
                                    ? "bg-primary text-white border-primary"
                                    : "bg-background-input text-gray hover:border-primary"
                                } transition-colors ${radioButtonClassName}`}
                        >
                            {option.value}
                        </Radio.Button>
                        <Radio.Button
                            className="md:hidden !p-0"
                            value={option.value}
                        >
                            <span
                            className={`px-3 py-2 border !rounded-2xl !bg-white text-sm  ${value === option.value ? "!text-primary !border-primary" : "text-gray"
                                }`}
                            >
                                {option.label}
                            </span>
                        </Radio.Button>
                        <span
                            className={`max-md:hidden text-sm ${value === option.value ? "!text-primary" : "text-gray"
                                }`}
                        >
                            {option.label}
                        </span>
                    </div>
                ))}
            </Radio.Group>
        );
    }

    const customRadioStyles = (
        <style
            dangerouslySetInnerHTML={{
                __html: `
            .custom-radio-group .ant-radio-inner {
                border-width: 1px !important;
                border-color: #d9d9d9 !important;
                width: 18px !important;
                height: 18px !important;
                background-color: #fff !important;
            }
            .custom-radio-group .ant-radio-checked .ant-radio-inner {
                border-width: 2px !important;
                border-color: #000 !important;
            }
            .custom-radio-group .ant-radio-checked .ant-radio-inner::after {
                background-color: #000 !important;
                width: 10px !important;
                height: 10px !important;
                margin-top: -5px !important;
                margin-left: -5px !important;
                transform: scale(1) !important;
                opacity: 1 !important;
            }
            .custom-radio-group .ant-radio-wrapper:hover .ant-radio-inner {
                border-color: #000 !important;
            }
        `,
            }}
        />
    );
    return (
        <Radio.Group
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`custom-radio-group w-full ${inputClassName}`}
        >
            {customRadioStyles}
            <div
                className={
                    layout === "vertical"
                        ? "flex flex-col gap-3 w-full"
                        : "flex flex-wrap items-center gap-2 w-full h-full"
                }
            >
                {options.map((option) => (
                    <div
                        key={option.value}
                        className={`flex items-center min-w-0 hover:bg-white bg-background-input px-2 py-1 rounded-lg border border-stroke ${
                            layout === "vertical" ? "w-full" : ""
                        } ${radioButtonClassName}`}
                    >
                        <Radio value={option.value} className="w-full">
                            <div>
                                <span
                                    className={
                                        optionLabelClassName.trim()
                                            ? optionLabelClassName
                                            : "text-sm font-medium text-gray-900"
                                    }
                                >
                                    {option.label}
                                </span>
                                {option.sublabel && (
                                    <p
                                        className={
                                            optionSublabelClassName.trim()
                                                ? `${optionSublabelClassName} mt-0.5 leading-snug`
                                                : "text-sm text-gray-500 mt-0.5 leading-snug"
                                        }
                                    >
                                        {option.sublabel}
                                    </p>
                                )}
                            </div>
                        </Radio>
                    </div>
                ))}
            </div>
        </Radio.Group>
    );
};

export default RadioInput;
