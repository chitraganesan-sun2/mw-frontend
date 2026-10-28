import React, { useRef } from "react";

// MUI X v9 mobile pickers open only from their clock button; a click on the field text just
// focuses a section. Wrap a picker in this to make a click anywhere on the field open it, by
// pressing the picker's own clock button (so each picker keeps its own onOpen logic).
const OpenOnFieldClick: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={ref}
            className={className}
            onClick={(e) => {
                const target = e.target as HTMLElement;
                // Ignore the button itself, and clicks bubbling up from the dialog (portaled).
                if (target.closest("[data-mui-picker-open-button]")) return;
                if (!ref.current?.contains(target)) return;
                ref.current.querySelector<HTMLElement>("[data-mui-picker-open-button]")?.click();
            }}
        >
            {children}
        </div>
    );
};

export default OpenOnFieldClick;
