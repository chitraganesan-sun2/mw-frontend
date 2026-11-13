"use client";

import { RECORDING_NOTICE } from "@/constants/copy";
import { useRecordingNotices } from "@/hooks/useRecordingNotices";

type Kind = "wingtimeLearner" | "wingtimeHost" | "oneToOne";

/**
 * A short "this session is recorded / transcribed" note. Renders nothing unless the backend says that kind of
 * capture is really switched on (see useRecordingNotices), so it is safe to leave in place permanently.
 */
export default function RecordingNotice({ kind, className = "" }: { kind: Kind; className?: string }) {
    const notices = useRecordingNotices();
    const active = kind === "oneToOne" ? notices.sessionTranscripts : notices.wingtimeRecording;
    if (!active) return null;
    return (
        <p
            role="note"
            className={`rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] px-3 py-2 text-sm text-[#4F4F4F] ${className}`}
        >
            {RECORDING_NOTICE[kind]}
        </p>
    );
}
