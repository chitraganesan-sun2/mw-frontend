import React from "react";
import { Select } from "antd";
import { BiCaretDown } from "react-icons/bi";
import TagComponent from "../../Tag";



const MultiSelect: React.FC<MultiSelectInputProps> = ({
    name,
    value = [],
    onChange,
    options = [],
    disabled = false,
    placeholder = "Search and Select",
    className = "",
    isLoading = false,
}) => {
    return (
        <div className="flex flex-col gap-2 h-fit">
            <Select
                id={name}
                mode='multiple'
                showSearch
                value={value}
                placeholder={placeholder}
                defaultActiveFirstOption={false}
                onChange={onChange}
                disabled={disabled}
                suffixIcon={<BiCaretDown className='text-black' />}
                className={`w-full text-sm ${className}`}
                rootClassName='text-sm border hover:bg-background-input !bg-background-input border-stroke rounded-md'
                maxTagCount={0}
                tagRender={() => <div className="hidden" />}
                listHeight={300}
                menuItemSelectedIcon={null}
                popupClassName='!bg-background-input'
                options={options.filter(option => !value?.includes(option?.value))}
                loading={isLoading}
            />
            <div className='flex flex-wrap gap-1'>
                {value.map(item => (
                    <TagComponent
                        key={item}
                        onClose={() => onChange(value.filter(v => v !== item))}
                    text={item.toString().replace(/_/g, " ")}
                        isClose={true}
                        className='!bg-black !text-white p-1 px-4'
                    />
                ))}
            </div>
        </div>
    );
};

export default MultiSelect;
