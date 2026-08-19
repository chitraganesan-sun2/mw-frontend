type InputOption = {
    label: string;
    value: any;
    sublabel?: string;
};

type SublabelAlignment = "right" | "bottom";

type BaseInputProps = {
    label?: string;
    sublabel?: string;
    sublabelAlignment?: SublabelAlignment;
    name: string;
    required?: boolean;
    error?: any;
    disabled?: boolean;
    rootClassName?: string;
    className?: string;
    labelClassName?: string;
    inputClassName?: string;
    contentType?: "number" | "text";
};

type TextInputProps = BaseInputProps & {
    inputType: "text";
    value: string;
    onChange: (value: string | string[]) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    responseType?: string;
};

type NumberInputProps = BaseInputProps & {
    inputType: "number";
    value: number;
    onChange: (value: number | null) => void;
    placeholder?: string;
    responseType?: string;
    maxLength?: number;
    min?: number;
};

type TextAreaInputProps = BaseInputProps & {
    inputType: "textarea";
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
};

type SelectInputProps = BaseInputProps & {
    inputType: "select";
    value: string | number;
    onChange: (value: string | number) => void;
    options: InputOption[];
    groupOptions?: InputOption[];
    placeholder?: string;
    isLoading?: boolean;
    showSearch?: boolean;
};

type MultiSelectInputProps = BaseInputProps & {
    inputType: "multiselect";
    value: (string | number)[];
    onChange: (value: (string | number)[]) => void;
    options: InputOption[];
    placeholder?: string;
    isLoading?: boolean;
};

type MultiSelectInputCreatableProps = BaseInputProps & {
    inputType: "select-creatable";
    value: (string | number)[];
    options: InputOption[];
    placeholder?: string;
    variant?: "single" | "multi";
    isLoading?: boolean;
    creatable?: boolean;
    disabled?: boolean;
    allowCreate: boolean;
    endpoint: CommonPath;
    onError?: (error: Error) => void;
    onChange: (value: any) => void;
    onCreate: (value: any) => void;
};

type DatePickerInputProps = BaseInputProps & {
    inputType: "datepicker";
    value: Date | null;
    onChange: (value: Date | null) => void;
    placeholder?: string;
    availableDays?: string[];
    availableDates?: string[];
    unavailableDates?: string[];
    isLoading?: boolean;
    onOpenChange?: (open: boolean) => void;
    onPanelChange?: (value: any, mode: any) => void;
    format?: string;
};

type SessionDatePickerInputProps = BaseInputProps & {
    inputType: "sessionDatePicker";
    value: Date | null;
    onChange: (value: Date | null) => void;
    placeholder?: string;
};

type BirthDatePickerInputProps = BaseInputProps & {
    inputType: "birthdatepicker";
    value?: Date | string | null;
    onChange: (value: Date | string | string[] | null) => void;
    placeholder?: string;
    format?: string;
    birthDatePicker: { minAge: number | 0; maxAge: number | 100 };
};

type CheckboxInputProps = BaseInputProps & {
    inputType: "checkbox";
    value: boolean;
    onChange: (value: boolean) => void;
    placeholder?: string;
    children?: React.ReactNode;
};

type RadioVariant = "default" | "rating";

type RadioInputProps = BaseInputProps & {
    name?: string;
    disabled?: boolean;
    inputType: "radio";
    value: string | number;
    onChange: (value: string | number) => void;
    options: InputOption[];
    variant?: RadioVariant;
    inputClassName?: string;
    radioButtonClassName?: string;
    /** Stack options in a column (full-width rows) instead of wrapping horizontally */
    layout?: "horizontal" | "vertical";
    /** Classes for each option's main label (default variant) */
    optionLabelClassName?: string;
    /** Classes for each option's sublabel (default variant) */
    optionSublabelClassName?: string;
};

type UploadProps = BaseInputProps & {
    inputType: "upload";
    value: any;
    onChange: (value: any) => void;
    maxFiles?: number;
    inputClassName?: string;
    variant?: "cover-image" | "file" | "profile-image";
    fileType?: "image/*" | "application/*" | "video/*" | "application/*,image/*";
    error?: (error: Error) => void;
};

type SearchInputProps = BaseInputProps & {
    inputType: "search";
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

type SingleImageUploadProps = Partial<ImageUploadProps> & {
    handleRemove: (index: number) => void;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

type TimeRangeValue = {
    from: string;
    to: string;
};

type BaseAsyncSelectProps = BaseInputProps & {
    inputType: "async-select";
    variant: "multi" | "single";
    creatable?: boolean;
    allowCreate: boolean;
    endpoint: CommonPath;
    responseAsLabel: string;
    responseAsValue: string | string[] | "payload" | null;
    onError?: (error: Error) => void;
    onChange: (value: any) => void;
    value: any;
    placeholder?: string;
    // Adds a synthetic "None" option (never fetched from the backend LOV) to a multi-select -
    // selecting it clears/replaces any other selection and vice versa. See AsyncSelect.tsx.
    noneOption?: { label: string; value: any };
};

type CreatableSelectProps = BaseAsyncSelectProps & {
    creatable: true;
    onCreate: (value: any) => void;
};

type AsyncSelectProps = BaseAsyncSelectProps | CreatableSelectProps;

type ContactInputProps = BaseInputProps & {
    inputType: "contact-input";
    value: {
        country_code: string;
        number: string;
    };
    onChange: (value: { country_code: string; number: string }) => void;
    changeErrorMsg: (string) => void;
};

type TimeRangeInputProps = BaseInputProps & {
    inputType: "timerange";
    onChange: (value: any) => void;
    fromPlaceholder?: string;
    toPlaceholder?: string;
    value: any;
};

type DateRangeInputProps = BaseInputProps & {
    inputType: "daterange";
    onChange: (value: any) => void;
    fromPlaceholder?: string;
    toPlaceholder?: string;
    value: any;
};

type InputProps =
    | TextInputProps
    | NumberInputProps
    | TextAreaInputProps
    | SelectInputProps
    | MultiSelectInputProps
    | MultiSelectInputCreatableProps
    | DatePickerInputProps
    | BirthDatePickerInputProps
    | CheckboxInputProps
    | RadioInputProps
    | UploadProps
    | MultiSelectInputProps
    | SearchInputProps
    | AsyncSelectProps
    | ContactInputProps
    | TimeRangeInputProps
    | DateRangeInputProps;
