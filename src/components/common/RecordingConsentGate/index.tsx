"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox, Modal } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import Button from "@/components/common/Button";
import { showToast } from "@/components/common/Toast";
import { useRecordingNotices } from "@/hooks/useRecordingNotices";
import { acceptRecordingConsent, type PolicyStatus } from "@/services/policies";
import { signOut } from "@/utils/signOut";

/**
 * One-time prompt for members who finished onboarding before recording / transcription existed (or before its
 * wording changed): the server says so through /policies/status and keeps the answer with a date and a version.
 * It only ever appears while recording or transcription is actually switched on, and it waits for the Terms and
 * Privacy prompt (PolicyUpdateGate) so two dialogs never stack. Working draft wording for the owner's lawyer.
 */
export default function RecordingConsentGate() {
    const queryClient = useQueryClient();
    const notices = useRecordingNotices();
    const [agreed, setAgreed] = useState(false);
    const [saving, setSaving] = useState(false);

    const { data } = useQuery<PolicyStatus | null>({
        queryKey: ["policy-status"],
        queryFn: async () => {
            const res: any = await GET_API(endpoints.policies.status);
            return (res?.data as PolicyStatus) ?? null;
        },
        staleTime: 10 * 60 * 1000,
        retry: false,
    });

    if (!data?.needs_recording_consent || data.needs_acceptance || !notices.any) return null;
    const version = data.recording_consent_version ?? "";

    const what =
        notices.wingtimeRecording && notices.sessionTranscripts
            ? "WingTime sessions are recorded and transcribed, and one-to-one sessions are transcribed (not recorded)"
            : notices.wingtimeRecording
              ? "WingTime sessions are recorded and transcribed"
              : "One-to-one sessions are transcribed (not recorded)";

    const handleAccept = async () => {
        setSaving(true);
        try {
            await acceptRecordingConsent(version);
            await queryClient.invalidateQueries({ queryKey: ["policy-status"] });
        } catch {
            showToast({ type: "error", message: "Couldn't save your choice. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open closable={false} maskClosable={false} keyboard={false} footer={false} centered>
            <div className="flex flex-col gap-4 p-1">
                <h2 className="text-xl font-medium">How MelodyWings sessions are recorded</h2>
                <p className="text-sm text-gray-600">
                    {what}, for safety.
                    {notices.wingtimeRecording
                        ? " Recordings are shared with MelodyWings members only after our team has reviewed them."
                        : ""}{" "}
                    Transcripts are checked for safety using automated analysis and are seen only by authorised staff.
                    The{" "}
                    <Link href="/privacy-policy" target="_blank" className="text-black underline font-medium">
                        Privacy Policy
                    </Link>{" "}
                    has the details.
                </p>
                <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
                    I understand and agree. If I am a parent or guardian, I agree for my child too.
                </Checkbox>
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <Button title="Log Out" btnVariant="tertiary" onClick={() => signOut()} />
                    <Button
                        title="Accept and Continue"
                        btnVariant="secondary"
                        disabled={!agreed || saving}
                        loading={saving}
                        onClick={handleAccept}
                    />
                </div>
            </div>
        </Modal>
    );
}
