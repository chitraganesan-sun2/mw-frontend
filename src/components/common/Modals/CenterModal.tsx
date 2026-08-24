import React from "react";
import { Modal, ModalProps } from "antd";
import Button from "../Button";
import { cn } from "@/utils/merge-class";
import ModalCloseIcon from "@/assets/icons/ModalCloseIcon";
import useInnerWidth from "@/hooks/useInnerWidth";

const CenterModal: React.FC<CenterModalProps> = ({
    isOpen,
    onClose,
    title = "",
    topContent = "",
    titleColor = "#1a1a1a",
    width = 520,
    height,
    mobileWidth,
    mobileHeight,
    mobileBorderRadius,
    mobileBorderWidth,
    children,
    rootClassName = "",
    bodyClassName = "",
    customClassName = "",
    titleClassName = "",
    headerRootClassName = "",
    primaryActionProps,
    secondaryActionProps,
    loading = false,
    headerComponent,
    footerComponent,
    zIndex = 1000,
    hideFooter = false,
    hideCloseIcon = false,
    headerClassName = "",
    footerClassName = "",
    showScrollbar = false,
}) => {
    const innerWidth = useInnerWidth();
    const isMobile = innerWidth > 0 && innerWidth < 768;
    // Desktop: always use original width/height. Mobile: use mobile* overrides only when provided.
    const effectiveWidth = isMobile && mobileWidth != null ? mobileWidth : width;
    const effectiveHeight = isMobile && mobileHeight != null ? mobileHeight : height;
    const mobileContentClass = cn(
        mobileBorderRadius === 24 && "max-md:!rounded-[24px]",
        mobileBorderWidth === 1 && "max-md:!border max-md:!border-gray-200"
    );
    const bodyHeight = isMobile && mobileHeight != null ? mobileHeight : height;
    const bodyMaxHeight = isMobile && mobileHeight != null ? mobileHeight : height ?? "95vh";
    const defaultButtonStyles = {
        primaryActionProps: {
            title: primaryActionProps?.title,
            shape: primaryActionProps?.shape ?? "round",
            btnVariant: primaryActionProps?.btnVariant ?? "secondary",
            size: primaryActionProps?.size ?? "small",
            ...primaryActionProps,
        },
        secondaryActionProps: {
            title: secondaryActionProps?.title,
            shape: secondaryActionProps?.shape ?? "round",
            btnVariant: secondaryActionProps?.btnVariant ?? "secondary",
            size: secondaryActionProps?.size ?? "small",
            ...secondaryActionProps,
        },
    };

    const buttons = [
        <Button key={1} {...defaultButtonStyles.secondaryActionProps} disabled={loading} />,
        <Button
            key={2}
            {...defaultButtonStyles.primaryActionProps}
            loading={loading}
            disabled={loading}
        />,
    ];

    const footer = footerComponent || (
        <div className="w-full flex gap-3 justify-end">{buttons.filter((button) => button)}</div>
    );

    const isDefaultHeader = Boolean(title && !headerComponent);

    const header =
        headerComponent ||
        (title && (
            <div
                className={`flex gap-2 w-full flex-col items-start justify-between ${headerRootClassName}`}
            >
                <h2 className={`text-xl text-[${titleColor}] font-semibold ${titleClassName}`}>
                    {title}
                </h2>
                {topContent && topContent}
            </div>
        ));

    const classNames: ModalProps["classNames"] = {
        footer: "!hidden",
        mask: "!bg-[#00000099]",
        content: cn("flex flex-col !rounded-none md:!rounded-2xl !p-0 !m-0", mobileContentClass),
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            zIndex={zIndex}
            width={effectiveWidth}
            className={cn(
                "custom-modal md:!max-w-[95vw] max-md:!max-w-none max-md:!m-0 [&_.ant-modal-close]:!bg-transparent",
                mobileWidth == null && "max-md:!w-screen",
                customClassName
            )}
            classNames={classNames}
            closeIcon={
                isDefaultHeader ? null : hideCloseIcon ? null : (
                    <ModalCloseIcon className="active:scale-80 transition-all duration-200" />
                 
                )
            }
            centered
            height={effectiveHeight}
            styles={{
                body: {
                    padding: 0,
                    height: bodyHeight,
                    maxHeight: bodyMaxHeight,
                },
            }}
        >
            <div
                className={cn(
                    "flex flex-col w-full h-full max-h-[100vh] max-w-screen md:max-h-[95vh] md:max-w-[95vw] overflow-hidden",
                    rootClassName
                )}
            >
                {header && (
                    <div
                        className={cn(
                            "flex px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:pt-5 border-b border-stroke flex-shrink-0",
                            isDefaultHeader
                                ? "flex-row items-center justify-between gap-3"
                                : "flex-center",
                            headerClassName
                        )}
                    >
                        {isDefaultHeader ? (
                            <>
                                <div className="flex-1 min-w-0 flex flex-col gap-2 items-start justify-between">
                                    {header}
                                </div>
                                {!hideCloseIcon && (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 active:scale-90 transition-all duration-200 inline-flex items-center justify-center"
                                        aria-label="Close"
                                    >
                                        <ModalCloseIcon className="w-[26px] h-[26px] md:w-6 md:h-6 active:scale-90 transition-all duration-200" />
                                    </button>
                                )}
                            </>
                        ) : (
                            header
                        )}
                    </div>
                )}
                {/* Modal Content */}
                <div
                    className={`flex-1 min-h-0 p-3 md:px-4 lg:px-6  md:py-3 bg-white overflow-y-auto ${showScrollbar ? "" : "no-scrollbar"} ${bodyClassName}`}
                >
                    {children}
                </div>
                {hideFooter ||
                    (footer && (
                        <div
                            className={cn(
                                "flex px-3 md:px-4 lg:px-6 py-3 md:py-4 border-t border-stroke flex-center flex-shrink-0",
                                footerClassName
                            )}
                        >
                            {footer}
                        </div>
                    ))}
            </div>
        </Modal>
    );
};

export default CenterModal;
