"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";

export type RecordingNotices = {
    /** WingTime sessions are recorded (video) and transcribed. */
    wingtimeRecording: boolean;
    /** One-to-one sessions are transcribed (never recorded). */
    sessionTranscripts: boolean;
    /** Either of the above: a learner's Guardian has to be told and asked to agree. */
    any: boolean;
    isLoaded: boolean;
};

const OFF: RecordingNotices = { wingtimeRecording: false, sessionTranscripts: false, any: false, isLoaded: false };

/**
 * What the backend is really recording or transcribing right now. Notices and the Guardian's consent box
 * are shown only for what is switched on, so the text can never promise something that isn't happening.
 * A failed request means "show nothing" (the server still insists on the consent at the end of onboarding).
 */
export function useRecordingNotices(): RecordingNotices {
    const { data } = useQuery({
        queryKey: ["recording-notices"],
        queryFn: async () => {
            const res: any = await GET_API(endpoints.recordingNotices);
            const d = res?.data ?? {};
            return {
                wingtimeRecording: d.wingtime_recording === true,
                sessionTranscripts: d.session_transcripts === true,
                any: d.any === true,
                isLoaded: true,
            } as RecordingNotices;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
    return data ?? OFF;
}
