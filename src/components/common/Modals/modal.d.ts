interface CenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    topContent?: string | React.ReactNode;
    headerComponent?: React.ReactNode;
    footerComponent?: React.ReactNode;
    titleColor?: string;
    width?: number | string;
    minWidth?: number | string;
    height?: number | string;
    minHeight?: number | string;
    /** Mobile-only width (px or CSS value e.g. "100%"). Applied below md breakpoint. */
    mobileWidth?: number | string;
    /** Mobile-only height (px or CSS value e.g. "100vh"). Applied below md breakpoint. */
    mobileHeight?: number | string;
    /** Mobile-only border radius (px). Applied below md breakpoint. */
    mobileBorderRadius?: number;
    /** Mobile-only border width (px). Applied below md breakpoint. */
    mobileBorderWidth?: number;
    children: React.ReactNode;
    rootClassName?: string;
    bodyClassName?: string;
    headerRootClassName?: string;
    customClassName?: string;
    titleClassName?: string;
    childrenClassName?: string;
    headerClassName?: string;
    footerClassName?: string;
    primaryActionProps?: ButtonProps;
    secondaryActionProps?: ButtonProps;
    hideFooter?: boolean;
    hideCloseIcon?: boolean;
    loading?: boolean;
    zIndex?: number;
    isDirty?: boolean; // For unsaved changes confirmation
    /** Show a visible scrollbar on the scrollable body instead of the default hidden one -
     * useful when the body holds long, multi-section content the user needs to navigate. */
    showScrollbar?: boolean;
}

interface ViewModalProps {
    modalOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: number | string;
    height?: number | string;
    style?: React.CSSProperties;
    className?: string;
    borderRadius?: string;
}

interface SideModalProps {
    children: React.ReactNode;
    title?: string;
    onClose: () => void;
    saveButtonText?: string;
    cancelButtonText?: string;
    onSave?: () => void;
    onCancel?: () => void;
    isOpen?: boolean;
    isDisabled?: boolean;
    isNeedButton?: boolean;
    isLoading?: boolean;
    modalWidth?: number | string;
    loading?: boolean;
    hideHeaderDividerOnMobile?: boolean;
    /** When true, applies gray background on mobile only (e.g. My Schedule modal). */
    mobileBgGray?: boolean;
}

type ShowModalType = "view" | "edit" | "create" | null;
