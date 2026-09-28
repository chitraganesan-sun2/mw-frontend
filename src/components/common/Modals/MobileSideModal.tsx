import { Drawer } from "antd";
import React from "react";

interface SideNavBarProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose?: () => void;
    placement?: "right" | "left";
}

const MobileSideModal: React.FC<SideNavBarProps> = ({ children, isOpen, onClose, placement }) => {
    return (
        <div>
            <Drawer
                placement={placement || "right"}
                closable={false}
                onClose={onClose}
                open={isOpen}
                width={"100%"}
                styles={{ body: { padding: 0 } }}
            >
                {children}
            </Drawer>
        </div>
    );
};

export default MobileSideModal;