"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Popover } from "antd";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { cn } from "@/utils/merge-class";

interface InfoTipProps {
    /** What this explains ("My Sessions"). Becomes the button's accessible name: "About My Sessions". */
    label: string;
    /** Short heading inside the popover; defaults to `label`. */
    title?: string;
    /** The explanation: a sentence, or a few <p> / <ul> elements (purpose, how it works, what to do). */
    children: ReactNode;
    placement?: "top" | "bottom" | "left" | "right" | "bottomLeft" | "bottomRight";
    className?: string;
}

/**
 * The app's "what is this?" pattern: a small (i) button that opens a short explanation on
 * hover, keyboard focus, or tap (so it works on phones too). Use it for features whose purpose
 * isn't obvious from the label; use a plain `PageIntro` line for short, always-visible context.
 * Never put the only copy of important information here.
 */
export default function InfoTip({ label, title, children, placement = "bottom", className }: InfoTipProps) {
    // Controlled so a tap (which fires hover, then click) opens it instead of toggling it shut.
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (!open) return;
        const close = (e: Event) => {
            const target = e.target as Node;
            if (buttonRef.current?.contains(target) || (target as HTMLElement).closest?.(".ant-popover")) return;
            setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("pointerdown", close);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", close);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            trigger={["hover", "focus"]}
            placement={placement}
            title={<span className="text-sm font-semibold">{title ?? label}</span>}
            content={<div className="max-w-[16rem] text-xs leading-relaxed text-gray-700 flex flex-col gap-1.5">{children}</div>}
        >
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded={open}
                aria-label={`About ${label}`}
                aria-haspopup="dialog"
                className={cn(
                    "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 align-middle text-gray-500 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black cursor-pointer",
                    className
                )}
            >
                <HiOutlineInformationCircle size={16} aria-hidden="true" />
            </button>
        </Popover>
    );
}
