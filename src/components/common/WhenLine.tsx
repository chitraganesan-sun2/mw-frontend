import React from "react";

/** "October 9, 2026 · 1:00 PM – 1:30 PM EDT · 30 min" with the date in bold - the one fact
 * people scan for first on a session card (same emphasis as the My Schedule card). */
export default function WhenLine({ text, className = "" }: { text: string; className?: string }) {
    const at = text.indexOf(" · ");
    const date = at === -1 ? text : text.slice(0, at);
    const rest = at === -1 ? "" : text.slice(at);
    return (
        <p className={`text-xs text-gray-700 break-words ${className}`}>
            <span className="font-semibold text-gray-900">{date}</span>
            {rest}
        </p>
    );
}
