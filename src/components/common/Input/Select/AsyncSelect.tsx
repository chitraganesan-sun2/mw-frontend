import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { convertToOptions, customStyles } from "./helper";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import CreatableSelect from "react-select/creatable";
import { BiCaretDown } from "react-icons/bi";
import TagComponent from "../../Tag";
import { cn } from "@/utils/merge-class";
import { StylesConfig } from "react-select";
import { usePathname } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

const AsyncSelect = ({
    variant,
    creatable,
    endpoint,
    responseAsLabel,
    responseAsValue,
    onError,
    noneOption,
    ...props
}: AsyncSelectProps) => {
    const pathname = usePathname();
    const [data, setData] = useState<any[]>([]);

    const { isLoading, refetch } = useQuery({
        queryKey: ["async-select", props.name, endpoint],
        queryFn: async () => {
            try {
                const { data } = await GET_API(endpoints.common(endpoint));
                setData(data);
                return data;
            } catch (error) {
                onError?.(error as Error);
                throw error;
            }
        },
        enabled: !!endpoint && !!responseAsLabel && !!responseAsValue,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        refetch();
    }, [pathname]);

    const handleChange = (value: any) => {
        if (!data) return;

        if (variant === "multi") {
            if (!value) {
                props.onChange?.([]);
                return;
            }

            // "None" is mutually exclusive with every real selection. filteredOptions already
            // empties the dropdown once "None" is active, so the only mixed set that can ever
            // reach here is "some real options were selected, then None was just clicked" -
            // collapse to just None in that case. (The reverse - picking a real option while
            // None is active - can't happen through the UI since there's nothing to pick.)
            let resolvedValue = value;
            if (noneOption && value.length > 1) {
                const noneIncluded = value.some((o: any) => o.label === noneOption.label);
                if (noneIncluded) {
                    resolvedValue = value.filter((o: any) => o.label === noneOption.label);
                }
            }

            // For multi-select, handle array of values
            const selectedValues = resolvedValue.map((selectedOption: any) => {
                if (Array.isArray(responseAsValue)) {
                    // If responseAsValue is array, return object with multiple keys
                    const obj: any = {};
                    responseAsValue.forEach((key: string) => {
                        obj[key] = selectedOption.value[key];
                    });
                    return obj;
                }
                // If responseAsValue is string, return string value
                return selectedOption.value;
            });

            props.onChange?.(selectedValues);
        } else {
            // For single select
            if (!value) {
                props.onChange?.(null);
                return;
            }

            if (Array.isArray(responseAsValue)) {
                // If responseAsValue is array, return object with multiple keys
                const obj: any = {};
                responseAsValue.forEach((key: string) => {
                    obj[key] = value.value[key];
                });
                props.onChange?.(obj);
            } else {
                // If responseAsValue is string, return string value
                props.onChange?.(value.value);
            }
        }
    };

    const getValue = useMemo(() => {
        if (!data || !props.value) return variant === "multi" ? [] : null;

        if (variant === "multi" && Array.isArray(props.value) && responseAsValue) {
            // For multi-select
            return props.value
                .map((val: any) => {
                    const matchingItem = data.find((d: any) => {
                        if (Array.isArray(responseAsValue)) {
                            // Match all keys if responseAsValue is array
                            return responseAsValue.every((key) => d[key] === val[key]);
                        }
                        // Match single key if responseAsValue is string
                        return d[responseAsValue] === val;
                    });

                    if (!matchingItem) {
                        // Not in the fetched LOV data - could be the synthetic "None" entry,
                        // which never comes from the backend.
                        if (noneOption) {
                            const isNone = Array.isArray(responseAsValue)
                                ? responseAsValue.every((key) => val?.[key] === noneOption.value?.[key])
                                : val === noneOption.value;
                            if (isNone) return { value: noneOption.value, label: noneOption.label };
                        }
                        return null;
                    }

                    return {
                        value: Array.isArray(responseAsValue)
                            ? matchingItem
                            : matchingItem[responseAsValue],
                        label: matchingItem[responseAsLabel],
                    };
                })
                .filter(Boolean);
        }

        // For single select
        const matchingItem = data.find((d: any) => {
            if (!responseAsValue) return d === props.value;

            if (Array.isArray(responseAsValue)) {
                return responseAsValue.every((key) => d[key] === props.value[key]);
            }
            return d[responseAsValue] === props.value;
        });

        if (!matchingItem) return null;

        if (!responseAsValue)
            return {
                value: props.value,
                label: props.value,
            };

        return {
            value: Array.isArray(responseAsValue) ? matchingItem : matchingItem[responseAsValue],
            label: matchingItem[responseAsLabel],
        };
    }, [data, props.value, responseAsValue, responseAsLabel, variant, noneOption]);

    // console.log("Get Value: ", getValue);

    const options = useMemo(() => {
        const fetched = convertToOptions(data, responseAsValue, responseAsLabel, isLoading);
        if (!noneOption) return fetched;
        return [{ label: noneOption.label, value: noneOption.value }, ...fetched];
    }, [data, responseAsValue, responseAsLabel, isLoading, noneOption]);

    const filteredOptions = useMemo(() => {
        if (variant === "multi" && Array.isArray(getValue) && getValue?.length > 0) {
            // Once "None" is the active selection, no other option can be added without
            // removing it first - keeps the two mutually exclusive without a stray click
            // silently overwriting the choice.
            const noneIsSelected =
                noneOption && getValue.some((v: any) => v?.label === noneOption.label);
            if (noneIsSelected) return [];

            return options.filter(
                (option: any) =>
                    !getValue.some((selectValue) => selectValue?.label === option?.label)
            );
        }
        return options;
    }, [variant, getValue, options, noneOption]);

    // Add createOption handler
    const handleCreate = (inputValue: string) => {
        if (creatable && "onCreate" in props) {
            const keys = Object.keys(data[0] || {});
            const [key1 = "label", key2 = "value"] = keys;
            const randomId = key2.toLowerCase() === "language_id" ? uuidv4() : inputValue;
            const option = { [key1]: inputValue, [key2]: randomId };
            setData((prev) => [...prev, option]);
            props.onCreate(Array.isArray(responseAsValue) ? option : inputValue);
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <CreatableSelect
                {...props}
                required={false}
                isMulti={variant === "multi"}
                options={filteredOptions}
                value={getValue}
                onChange={handleChange as any}
                onCreateOption={handleCreate}
                isLoading={isLoading}
                isClearable
                classNamePrefix="select"
                isDisabled={props.disabled}
                placeholder={props.placeholder || "Search and Select"}
                formatCreateLabel={(inputValue: string) =>
                    `${creatable ? "Create" : "Not Found"} - "${inputValue}"`
                }
                hideSelectedOptions={variant === "multi"}
                loadingMessage={() => "Loading..."}
                styles={
                    {
                        ...customStyles,
                        placeholder: (base) => ({
                            ...base,
                            fontSize: "0.875rem",
                        }),
                    } as StylesConfig
                }
                components={{
                    DropdownIndicator: () => <BiCaretDown className="text-black mr-1" />,
                    ClearIndicator: () => null,
                    MultiValueContainer: () => null,
                }}
                classNames={{
                    container: () => (props?.inputClassName ? "md:w-[49%]" : "w-full"),
                }}
                backspaceRemovesValue={false}
            />
            {variant === "multi" && Array.isArray(getValue) && (
                <div className={cn("flex-wrap gap-1", getValue?.length > 0 ? "flex" : "hidden")}>
                    {getValue?.map((item: any, index: number) => (
                        <TagComponent
                            key={`${item.value}-${index}`}
                            onClose={() =>
                                handleChange(getValue?.filter((v: any) => v.value !== item.value))
                            }
                            text={item.label}
                            isClose={true}
                            className="!bg-black !text-white p-1 px-4"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AsyncSelect;
