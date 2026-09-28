import ModalCloseIcon from "@/assets/icons/FeedModalCloseIcon";
import { Drawer } from "antd";
import React, { useState } from "react";

interface SideNavBarProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

const SideModal: React.FC<SideNavBarProps> = ({ children, isOpen, onClose }) => {
    return (
        <div>
            <Drawer
                placement="right"
                closable={false}
                onClose={onClose}
                open={isOpen}
                width={"100%"}
                className="py-4 !px-0"
                styles={{ body: { padding: 0 } }}
            >
                {children}
            </Drawer>
        </div>
    );
};

export default SideModal;
