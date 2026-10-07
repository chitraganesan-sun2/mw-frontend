import React from "react";
import { Modal } from "antd";

interface ViewModalProps {
    modalOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: number | string;
    height?: number | string;
    style?: React.CSSProperties;
    className?: string;
    borderRadius?: string;
    showCloseIcon?: boolean;
    /**
     * While the content is loading or failed, callers' own close buttons (which live
     * inside the loaded content) aren't rendered - show the modal's close icon then so
     * there's always a way out (on mobile the modal is full-screen with no mask to tap).
     */
    isLoading?: boolean;
    isError?: boolean;
}

const ViewModal: React.FC<ViewModalProps> = ({
    modalOpen,
    onClose,
    children,
    width = 800,
    height = 720,
    style,
    className = "",
    borderRadius,
    showCloseIcon = false,
    isLoading = false,
    isError = false,
}) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
        <Modal
            className={className}
            styles={{
                wrapper: {
                    zIndex: 1000,
                },
                content: {
                    padding: 0,
                    borderRadius: isMobile ? 0 : borderRadius || "1rem",
                },
                body: {
                    padding: 0,
                    height: height,
                },
                mask: {
                    backdropFilter: "blur(4px)",
                },
            }}
            style={{
                ...style,
                margin: 0,
                padding: 0,
            }}
            modalRender={(node) => (
                <div
                    style={{
                        borderRadius: isMobile ? 0 : borderRadius || "12px",
                        overflow: "hidden",
                        width: "100%",
                    }}
                >
                    {node}
                </div>
            )}
            centered
            open={modalOpen}
            closeIcon={showCloseIcon || isLoading || isError}
            onCancel={onClose}
            footer={null}
            width={width}
        >
            {children}
        </Modal>
    );
};

export default ViewModal;
