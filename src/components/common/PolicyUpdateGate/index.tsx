"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox, Modal } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import Button from "@/components/common/Button";
import { showToast } from "@/components/common/Toast";
import { acceptPolicies, type PolicyStatus } from "@/services/policies";
import { signOut } from "@/utils/signOut";

/**
 * One-time prompt shown to signed-in members when the published Terms or Privacy Policy is newer
 * than the version they accepted (the server decides; see the backend's policy_acceptance
 * module). Blocks the app until they accept, or lets them log out instead.
 */
export default function PolicyUpdateGate() {
    const queryClient = useQueryClient();
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

    if (!data?.needs_acceptance) return null;

    const handleAccept = async () => {
        setSaving(true);
        try {
            await acceptPolicies(data.current);
            await queryClient.invalidateQueries({ queryKey: ["policy-status"] });
        } catch {
            showToast({ type: "error", message: "Couldn't save your choice. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const link = "text-black underline font-medium";
    return (
        <Modal open closable={false} maskClosable={false} keyboard={false} footer={false} centered>
            <div className="flex flex-col gap-4 p-1">
                <h2 className="text-xl font-medium">We&apos;ve updated our Terms and Privacy Policy</h2>
                <p className="text-sm text-gray-600">
                    Please review the latest{" "}
                    <Link href="/terms-and-conditions" target="_blank" className={link}>
                        Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" target="_blank" className={link}>
                        Privacy Policy
                    </Link>
                    , then accept them to keep using MelodyWings.
                </p>
                <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
                    I have read and agree to the Terms and Conditions and the Privacy Policy.
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
