import React from "react";

interface ContainerWrapperProps {
    children: React.ReactNode;
    id?: string;
    className?: string;
}

const ContainerWrapper: React.FC<ContainerWrapperProps> = ({ children, id, className }) => {
    return (
        // scroll-mt keeps an anchored section (/#for-learners) clear of the sticky header.
        <div id={id} className={`scroll-mt-24 w-full max-w-[1400px] lg:mx-auto lg:bg-white lg:flex lg:flex-col lg:gap-8 items-center justify-center lg:p-[80px] lg:rounded-3xl ${className}`}>
            {children}
        </div>
    );
};

export default ContainerWrapper;
