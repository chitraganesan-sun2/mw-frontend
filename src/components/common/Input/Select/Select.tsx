import { Select as AntSelect, Spin } from "antd";
import { BiCaretDown } from "react-icons/bi";

const Select = ({ disabled, inputType, inputClassName, isLoading, ...props }: SelectInputProps) => {
    if (inputType !== "select") return null;

    return (
        <AntSelect
            id={props.name}
            // No aria-label here: rc-select's Selector only forwards an explicit, closed
            // prop list to the real combobox input, and aria-label isn't on it (id is,
            // which is why that one works). A caller needing an accessible name without
            // a visible label should render its own <label htmlFor={name}> instead - see
            // ContactInput for the pattern.
            placeholder={props.placeholder}
            value={props.value || undefined}
            onChange={props.onChange}
            disabled={disabled}
            showSearch={props.showSearch}
            notFoundContent={<p className="text-center py-2 font-medium text-gray-700">{isLoading ? <Spin size="small" /> : "No Data"}</p>}
            rootClassName='text-sm  hover:bg-background-input !bg-background-input rounded-md'
            className={`w-full text-sm h-fit rounded-md hover:bg-background-input bg-background-input ${inputClassName}`}
            options={props.options}
            popupClassName="overflow-auto no-scrollbar"
            dropdownStyle={{ maxHeight: "262px", overflowY: "auto" }}
            suffixIcon={<BiCaretDown className='text-black' />}
            filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase()) ||
                option?.value?.toLowerCase().includes(input.toLowerCase())
            }
        />
    );
};

export default Select;