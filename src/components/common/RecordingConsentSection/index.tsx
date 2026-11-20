"use client";

import { useState, useRef } from "react";
import { Modal } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import Button from "@/components/common/Button";
import { showToast } from "@/components/common/Toast";
import { useRecordingNotices } from "@/hooks/useRecordingNotices";
import { SUPPORT_EMAIL } from "@/constants/contact";
import { acceptRecordingConsent, withdrawRecordingConsent, type PolicyStatus } from "@/services/policies";
import { getApiErrorMessage } from "@/utils/apiError";
import { consentSummary } from "@/utils/recordingConsentView";

/**
 * Settings card: when the member agreed to how sessions are recorded or transcribed, with Withdraw and, after
 * withdrawing, "Give consent again". While consent is withdrawn the server stops them booking, accepting or joining
 * recorded sessions. Only shown while recording or transcription is switched on and the member has a consent record.
 * Working draft wording for the owner's lawyer.
 */
export default function RecordingConsentSection() {
    const queryClient = useQueryClient();
    const notices = useRecordingNotices();
    const [busy, setBusy] = useState(false);
    const busyInFlight = useRef(false); // synchronous re-entry guard (state lags a render behind a double-click)
    const [confirming, setConfirming] = useState(false);

    const { data } = useQuery<PolicyStatus | null>({
        queryKey: ["policy-status"],
        queryFn: async () => {
            const res: any = await GET_API(endpoints.policies.status);
            return (res?.data as PolicyStatus) ?? null;
        },
        staleTime: 10 * 60 * 1000,
        retry: false,
    });

    const view = consentSummary(data, notices.any);
    if (!view.visible) return null;

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["policy-status"] });

    const withdraw = async () => {
        if (busyInFlight.current) return;
        busyInFlight.current = true;
        setBusy(true);
        try {
            await withdrawRecordingConsent();
            await refresh();
            setConfirming(false);
            showToast({ type: "success", message: "Your consent is withdrawn." });
        } catch (err) {
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't withdraw your consent. Please try again.") });
        } finally {
            busyInFlight.current = false;
            setBusy(false);
        }
    };

    const giveAgain = async () => {
        if (busyInFlight.current) return;
        busyInFlight.current = true;
        setBusy(true);
        try {
            await acceptRecordingConsent(data?.recording_consent_version ?? "");
            await refresh();
            showToast({ type: "success", message: "Thank you. You can book and join sessions again." });
        } catch (err) {
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't save your consent. Please try again.") });
        } finally {
            busyInFlight.current = false;
            setBusy(false);
        }
    };

    return (
        <section aria-labelledby="recording-consent-heading" className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="flex flex-col gap-1">
                <h2 id="recording-consent-heading" className="md:text-2xl text-[16px] font-medium">
                    Session Recording
                </h2>
                <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">{view.status}</p>
                <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                    {view.withdrawn
                        ? "While your consent is withdrawn you can't book, accept or join sessions that are recorded or transcribed."
                        : "If you withdraw your consent you can't book, accept or join sessions that are recorded or transcribed until you give it again."}{" "}
                    Questions? Email{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                        {SUPPORT_EMAIL}
                    </a>
                    .
                </p>
            </div>
            <div>
                {view.withdrawn ? (
                    <Button title="Give consent again" btnVariant="secondary" loading={busy} disabled={busy} onClick={giveAgain} />
                ) : (
                    <Button title="Withdraw consent" btnVariant="tertiary" disabled={busy} onClick={() => setConfirming(true)} />
                )}
            </div>
            <Modal
                open={confirming}
                onCancel={() => !busy && setConfirming(false)}
                footer={false}
                centered
                title="Withdraw your recording consent?"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600">
                        You won&apos;t be able to book, accept or join sessions that are recorded or transcribed until you give your
                        consent again in Settings. Sessions you already have are not cancelled.
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                        <Button title="Keep my consent" btnVariant="tertiary" disabled={busy} onClick={() => setConfirming(false)} />
                        <Button title="Withdraw consent" btnVariant="secondary" loading={busy} disabled={busy} onClick={withdraw} />
                    </div>
                </div>
            </Modal>
        </section>
    );
}
