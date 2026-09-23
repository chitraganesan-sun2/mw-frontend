import { customStyles } from "./helper";
import CreatableSelect from "react-select/creatable";
import { BiCaretDown } from "react-icons/bi";
import TagComponent from "../../Tag";
import { useState, useEffect, useMemo } from "react";

const SelectInputCreatable = ({
    value = [],
    onChange,
    options = [],
    disabled = false,
    placeholder = "Search and Select",
    className = "",
    isLoading = false,
    variant,
    ...props
}: MultiSelectInputCreatableProps) => {
    const [selectOptions, setSelectOptions] = useState(options);
    const isMultiSelect = variant === "multi";

    useEffect(() => {
        setSelectOptions(options);
    }, [options]);

    const filteredOptions = useMemo(() => {
        return isMultiSelect
            ? selectOptions.filter(option => !value?.includes(option?.value))
            : selectOptions;
    }, [selectOptions, value, isMultiSelect]);

    const selectedValue = useMemo(() => {
        if (isMultiSelect) return value;
        const singleVal = Array.isArray(value) ? value[0] : value;
        return selectOptions.find(option => option?.value === singleVal);
    }, [selectOptions, value, isMultiSelect]);

    const handleCreate = (inputValue: string) => {
        setSelectOptions(prev => [...prev, { label: inputValue, value: inputValue }]);
        props.onCreate(inputValue);
    };

    const handleChange = (newValue: any) => {
        if (isMultiSelect) {
            onChange([...value, newValue?.value]);
        } else {
            onChange(newValue ? newValue?.value : null);
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full relative">
            {isLoading && (
                <div
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/80"
                    aria-hidden
                >
                   loading...
                </div>
            )}
            <CreatableSelect
                {...props}
                inputId={props.name}
                required={false}
                options={filteredOptions}
                value={selectedValue}
                onChange={handleChange}
                onCreateOption={handleCreate}
                isLoading={false}
                isClearable
                classNamePrefix="select"
                isDisabled={disabled || isLoading}
                placeholder={isLoading ? "" : (placeholder || "Search and Select")}
                formatCreateLabel={(inputValue: string) => `Create - "${inputValue}"`}
                loadingMessage={() => "Loading..."}
                hideSelectedOptions={isMultiSelect}
                components={{
                    DropdownIndicator: () => <BiCaretDown className="text-black mr-1" />,
                    ClearIndicator: () => null,
                    MultiValueContainer: () => null,
                }}
                classNames={{
                    container: () =>
                        props.inputClassName?.includes("w-full") ? "w-full" : (props.inputClassName ? "w-[49%]" : "w-full"),
                }}
                backspaceRemovesValue={false}
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                menuPosition="fixed"
                styles={{
                    ...customStyles,
                    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                }}
            />

            {isMultiSelect && (
                <div className='flex flex-wrap gap-1'>
                    {value?.map((item: any) => (
                        <TagComponent
                            key={item}
                            onClose={() => onChange(value.filter(v => v !== item))}
                            text={item.toString().replace(/_/g, " ")}
                            isClose={true}
                            className='!bg-black !text-white p-1 px-4'
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectInputCreatable;