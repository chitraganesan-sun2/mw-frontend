import React from "react";
import { Button as AntButton } from "antd";

const Button: React.FC<ButtonProps> = ({
    btnVariant = "primary",
    customClassName = "",
    title,
    children,
    ...props
}) => {
    const baseStyles =
        "rounded-2xl px-4 py-4 font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 active:scale-95";

    const variantStyles = {
        primary: "bg-primary text-white hover:bg-primary focus:bg-primary",
        secondary: "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white",
        tertiary: "bg-white text-black",
        error: "bg-error-light text-error hover:bg-error focus:bg-error-light",
        success: "bg-success-light text-success hover:bg-success focus:bg-success-light",
        link: "text-primary border-none shadow-none hover:underline !bg-transparent hover:!bg-transparent hover:!text-primary text-sm font-normal",
        learner: "!bg-[#68DBFF] hover:!bg-[#68DBFF] border-0 border-r-2 border-b-2 border-[#009BCC] hover:!border-[#009BCC] !text-sm !text-black !rounded-[10px] shadow-sm !py-4 !px-3",
        volunteer: "!bg-[#FFAC71] hover:!bg-[#FFAC71] border-0 border-r-2 border-b-2 border-[#CC5600] hover:!border-[#CC5600] !text-sm !text-black !rounded-[10px] shadow-sm !py-4 !px-3",
    };

    return (
        <AntButton
            rootClassName={`${baseStyles} ${
                variantStyles[btnVariant as keyof typeof variantStyles]
            } ${customClassName}`}
            {...props}
            icon={props.icon}
        >
            {title && title}
            {children}
        </AntButton>
    );
};

export default Button;
