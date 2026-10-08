import React from "react";
import type dayjs from "dayjs";
import { canJoinSession, isJoinTooEarly, JOIN_OPENS_MINUTES_BEFORE } from "@/utils/sessionDisplay";

/** "Join opens 3 minutes before the session starts." - shown in place of a Join button on a
 * live session that has a Meet link but is still too early to join. */
export default function JoinOpensNote({
    status,
    meetLink,
    bounds,
    now,
    className = "",
}: {
    status?: string | null;
    meetLink?: string | null;
    bounds?: { start: dayjs.Dayjs; end: dayjs.Dayjs } | null;
    now?: dayjs.Dayjs;
    className?: string;
}) {
    // Same checks as canJoinSession, ignoring only the "too early" part.
    const joinableOtherwise = canJoinSession({ status, meet_link: meetLink }, { end: bounds?.end }, now);
    if (!joinableOtherwise || !isJoinTooEarly(bounds, now)) return null;
    return (
        <p className={`text-xs text-gray-500 ${className}`}>
            Join opens {JOIN_OPENS_MINUTES_BEFORE} minutes before the session starts.
        </p>
    );
}
