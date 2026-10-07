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

    // Colour system: Blue = Learner, Orange = Volunteer, Black = login / common actions.
    //   primary   - the signed-in viewer's role action (themed tint fill)
    //   secondary - role-neutral / common action (solid black)
    //   outline   - the secondary action beside a primary one (Cancel, Close, Previous)
    //   learner / volunteer - fixed entity colours, whoever is viewing
    const variantStyles = {
        primary: "btn-primary-fill",
        secondary: "btn-common",
        outline: "btn-secondary-outline",
        tertiary: "bg-white text-black",
        error: "bg-error-light text-error hover:bg-error focus:bg-error-light",
        success: "bg-success-light text-success hover:bg-success focus:bg-success-light",
        link: "text-primary border-none shadow-none hover:underline !bg-transparent hover:!bg-transparent hover:!text-primary text-sm font-normal",
        learner: "btn-learner-fill !text-sm !rounded-[10px] shadow-sm !py-4 !px-3",
        volunteer: "btn-volunteer-fill !text-sm !rounded-[10px] shadow-sm !py-4 !px-3",
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
