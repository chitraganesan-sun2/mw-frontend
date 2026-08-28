import { Controller } from "react-hook-form";
import { Input } from "@/components/common/Input";
import type { Control, UseFormClearErrors } from "react-hook-form";
import type { LearnerFormData, VolunteerFormData } from "./config";
import { extractTimezoneOffset } from "@/utils/timeFunctions";

interface FormFieldProps {
    field: FormField;
    control: Control<VolunteerFormData | LearnerFormData>;
    errors: any;
    setValue: (name: string, value: any, options?: any) => void;
    clearErrors: UseFormClearErrors<VolunteerFormData | LearnerFormData>;
    parent?: string | null;
}

export const FormField = ({
    field,
    control,
    setValue,
    errors,
    parent,
    clearErrors,
}: FormFieldProps) => {
    const getFieldValue = (field: any) => {
        if (parent) {
            const parentKey = parent.split(".");
            const value =
                parentKey?.length > 1
                    ? control._formValues?.[parentKey[0]]?.[parentKey[1]]
                    : control._formValues?.[parentKey[0]];
            return value?.[field?.id];
        }
        return control._formValues?.[field?.id];
    };

    const getFieldProperty = (field: any, type: "error" | "name") => {
        const key = parent ? `${parent}.${field.id}` : field.id;
        if (type === "error") {
            if (parent) {
                const parentKeys = parent.split(".");
                let currentErrors = errors;
                for (const parentKey of parentKeys) {
                    currentErrors = currentErrors?.[parentKey];
                }
                return currentErrors?.[field.id]?.message;
            }
            return errors?.[field.id]?.message;
        }
        return key;
    };

    const handleCreate = (newValue: any) => {
        const fieldName = getFieldProperty(field, "name");
        if (field.variant === "single") {
            return setValue(fieldName, newValue);
        }
        const currentValues = getFieldValue(field) || [];

        setValue(fieldName, [...currentValues, newValue], {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const handleChange = (value: any) => {
        const fieldName = getFieldProperty(field, "name");

        // Check if this is a timezone field
        if (field.id === "timezone" && field.options && value) {
            // Find the selected option to get the full label
            let selectedOption = null;

            // Search through the nested timezone structure
            for (const region of field.options) {
                if ("options" in region && region.options) {
                    selectedOption = region.options.find((opt: any) => opt.value === value);
                    if (selectedOption) break;
                }
            }

            if (selectedOption?.label) {
                // Extract the timezone offset
                const offset = extractTimezoneOffset(selectedOption.label);

                // Store the offset in volunteer_contact_details
                if (offset && parent === "volunteer_contact_details") {
                    setValue("volunteer_contact_details.utc_offset", offset);
                }

                // Store the offset in learner_contact_details
                if (offset && parent === "learner_personal_info.learner_contact_details") {
                    setValue("learner_personal_info.learner_contact_details.utc_offset", offset);
                }
            }
        }

        // Check if this is a contact number field and validate phone number length
        if (field.inputType === "contact-input" && value) {
            const phoneNumber = value.number?.toString() || "";
            if (phoneNumber.length > 0 && phoneNumber.length !== 10) {
                // Set error for phone number validation
                const errorKey = getFieldProperty(field, "name");
                clearErrors(errorKey);
                // Don't return early - let the validation schema handle the error
            }
        }

        // Call the original onChange
        return value;
    };

    return (
        <div
            className={`${
                field.gridCols === 2 ? "col-span-2 w-full" : "col-span-2 md:col-span-1 w-full"
            }${field.wrapperClassName ? ` flex flex-col ${field.wrapperClassName}` : ""}`}
        >
            <Controller
                name={getFieldProperty(field, "name")}
                control={control}
                render={({ field: { onChange } }) => (
                    <Input
                        {...(field as any)}
                        onCreate={handleCreate}
                        error={getFieldProperty(field, "error")}
                        value={getFieldValue(field)}
                        onChange={(e: any) => {
                            const processedValue = handleChange(e);
                            onChange(processedValue);

                            // Clear errors when user starts typing
                            if (field.inputType === "contact-input" && e?.number) {
                                const phoneNumber = e.number.toString();
                                if (phoneNumber.length === 10) {
                                    clearErrors(getFieldProperty(field, "name"));
                                }
                            } else {
                                clearErrors(getFieldProperty(field, "name"));
                            }
                        }}
                        name={getFieldProperty(field, "name") as keyof FormData}
                        inputClassName={field.inputClassName}
                        options={field.options}
                        disabled={field.disabled}
                    />
                )}
            />
        </div>
    );
};
