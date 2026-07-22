import ModalCloseIcon from "@/assets/icons/FeedModalCloseIcon";
import { Drawer, Spin } from "antd";
import React from "react";
import Divider from "../Divider";
import Button from "@/components/common/Button";
import cn from "classnames";

const SideModal: React.FC<SideModalProps> = ({
    children,
    title = "Some title",
    onClose,
    saveButtonText = "Save",
    cancelButtonText = "Cancel",
    onSave,
    onCancel,
    isOpen = false,
    isDisabled = false,
    isNeedButton = true,
    isLoading = false,
    modalWidth = 400,
    loading = false,
    hideHeaderDividerOnMobile = false,
    mobileBgGray = false,
}) => {
    return (
        <div>
            <Drawer
                placement="right"
                closable={false}
                onClose={onClose}
                open={isOpen}
                width={modalWidth}
                bodyStyle={{ padding: 0 }}
            >
                <div
                    className={cn(
                        "flex py-4 !px-0 flex-col h-full",
                        mobileBgGray && "max-md:bg-[#f4f7fb]"
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center gap-4 mb-3 px-3 md:px-5",
                            title ? "justify-between" : "justify-start"
                        )}
                    >
                        {title ? (
                            <>
                                <h3 className="text-xl font-medium">{title}</h3>
                                <button type="button" aria-label="Close" onClick={onClose} className="cursor-pointer bg-transparent border-0 p-0">
                                    <ModalCloseIcon />
                                </button>
                            </>
                        ) : (
                            <button type="button" aria-label="Close" onClick={onClose} className="cursor-pointer bg-transparent border-0 p-0">
                                <ModalCloseIcon />
                            </button>
                        )}
                    </div>
                    <Divider
                        className={hideHeaderDividerOnMobile ? "hidden md:block" : undefined}
                    />
                    {loading ? (
                        <div className="flex flex-col h-full justify-center items-center">
                            <Spin spinning={true} />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pb-2">{children}</div>
                    )}
                    {isNeedButton && (
                        <div className="mt-auto">
                            <Divider />
                            <div className="flex items-center justify-end gap-4 px-5 pt-4">
                                <Button
                                    onClick={onCancel}
                                    title={cancelButtonText}
                                    disabled={isLoading}
                                    className="w-fit px-4 py-2 !text-sm !text-black !bg-white !border !border-stroke-light rounded-xl"
                                />
                                <Button
                                    loading={isLoading}
                                    disabled={isDisabled}
                                    onClick={onSave}
                                    title={saveButtonText}
                                    className={`w-fit !text-sm px-4 py-2 !bg-black !text-white rounded-xl ${
                                        isDisabled
                                            ? "!bg-opacity-50 !bg-gray-light !cursor-not-allowed"
                                            : ""
                                    }`}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Drawer>
        </div>
    );
};

export default SideModal;
