import React from "react";
import Button from "@/components/common/Button";
import { JOIN_OPENS_MINUTES_BEFORE, type JoinState } from "@/utils/sessionDisplay";

export const JOIN_EARLY_HINT = `Join opens ${JOIN_OPENS_MINUTES_BEFORE} minutes before the session starts`;

interface JoinButtonProps {
    state: JoinState;
    /** Meet link (opens in a new tab). Without it, `onClick` is used. */
    href?: string;
    onClick?: () => void;
    label?: string;
    /** "pill" = small inline button for cards; "block" = the regular modal button. */
    variant?: "pill" | "block";
    /** Wrapper classes for the block variant (layout, e.g. "flex-1" or "w-fit"). */
    wrapperClassName?: string;
    /** For cards that are themselves clickable. */
    stopPropagation?: boolean;
    /** What is being joined ("Guitar lesson") - lets a screen reader tell a page of "Join"
     * buttons apart. */
    contextLabel?: string;
}

/** The one Join button. Always visible on a joinable session; disabled (with a hint) until 3
 * minutes before the start, then live until the session ends. Renders nothing for "none". */
export default function JoinButton({
    state,
    href,
    onClick,
    label = "Join",
    variant = "pill",
    wrapperClassName = "",
    stopPropagation = false,
    contextLabel,
}: JoinButtonProps) {
    if (state === "none") return null;
    const early = state === "early";
    const stop = (e: React.SyntheticEvent) => {
        if (stopPropagation) e.stopPropagation();
    };
    const named = contextLabel ? `${label} ${contextLabel}` : label;

    if (variant === "pill") {
        if (early) {
            return (
                <span title={JOIN_EARLY_HINT} className="inline-flex" onClick={stop}>
                    {/* aria-disabled (not disabled): stays in the Tab order so keyboard and screen
                        reader users hear why Join isn't available yet. */}
                    <button
                        type="button"
                        aria-disabled="true"
                        aria-label={`${named} (${JOIN_EARLY_HINT.toLowerCase()})`}
                        onClick={(e) => e.preventDefault()}
                        className="rounded-full border-0 bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-500 cursor-not-allowed"
                    >
                        {label}
                    </button>
                </span>
            );
        }
        const pill = "rounded-full btn-primary-fill px-3 py-1 text-xs font-semibold hover:opacity-90";
        return href ? (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stop}
                aria-label={`${named} (opens in a new tab)`}
                className={pill}
            >
                {label}
            </a>
        ) : (
            <button
                type="button"
                onClick={(e) => {
                    stop(e);
                    onClick?.();
                }}
                aria-label={contextLabel ? named : undefined}
                className={pill}
            >
                {label}
            </button>
        );
    }

    // block
    if (early) {
        return (
            <span title={JOIN_EARLY_HINT} className={wrapperClassName}>
                <Button title={label} btnVariant="primary" disabled customClassName="w-full" />
            </span>
        );
    }
    return href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={wrapperClassName}>
            <Button title={label} btnVariant="primary" customClassName="w-full" />
        </a>
    ) : (
        <span className={wrapperClassName}>
            <Button title={label} btnVariant="primary" customClassName="w-full" onClick={onClick} />
        </span>
    );
}
