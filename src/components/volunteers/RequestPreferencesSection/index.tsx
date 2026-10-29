"use client";
import { useEffect, useState } from "react";
import { Switch } from "antd";
import { endpoints } from "@/api/constants";
import { GET_API, PUT_API } from "@/api/request";
import { showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";
import {
    MAX_PAUSE_DAYS,
    MAX_PENDING_CAP,
    buildRequestPreferencesPayload,
    validateRequestPreferences,
} from "@/utils/requestPreferences";

const isoDay = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Settings card: pause new learner requests (optionally until a date) and/or limit how many can
 * wait at once. Sessions you've already accepted and requests already waiting are not affected.
 */
const RequestPreferencesSection = ({ volunteerId }: { volunteerId: string }) => {
    const [paused, setPaused] = useState(false);
    const [pausedUntil, setPausedUntil] = useState("");
    const [capText, setCapText] = useState("");
    const [waiting, setWaiting] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        if (!volunteerId) return;
        setIsLoading(true);
        GET_API(endpoints.volunteer.requestPreferences(volunteerId))
            .then((res: any) => {
                setPaused(Boolean(res.data?.requests_paused));
                setPausedUntil(res.data?.requests_paused_until ?? "");
                setCapText(res.data?.max_pending_requests ? String(res.data.max_pending_requests) : "");
                setWaiting(typeof res.data?.waiting_requests === "number" ? res.data.waiting_requests : null);
                setLoadFailed(false);
            })
            .catch((err) => {
                setLoadFailed(true);
                showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't load your request settings.") });
            })
            .finally(() => setIsLoading(false));
    }, [volunteerId]);

    const today = new Date();
    const maxDay = new Date(today.getTime() + MAX_PAUSE_DAYS * 86_400_000);

    const handleSave = async () => {
        const form = { paused, pausedUntil, capText };
        const problem = validateRequestPreferences(form, isoDay(today));
        if (problem) {
            showToast({ type: "error", message: problem });
            return;
        }
        setIsSaving(true);
        try {
            const res: any = await PUT_API(endpoints.volunteer.requestPreferences(volunteerId), buildRequestPreferencesPayload(form));
            setPaused(Boolean(res.data?.requests_paused));
            setPausedUntil(res.data?.requests_paused_until ?? "");
            setWaiting(typeof res.data?.waiting_requests === "number" ? res.data.waiting_requests : waiting);
            showToast({ type: "success", message: "Request settings saved" });
        } catch (err) {
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't save your request settings. Please try again.") });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section aria-labelledby="request-prefs-heading" className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="flex flex-col gap-1">
                <h2 id="request-prefs-heading" className="md:text-2xl text-[16px] font-medium">
                    New session requests
                </h2>
                <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                    Take a break or keep your queue manageable. Sessions you&apos;ve already accepted and requests already
                    waiting aren&apos;t affected, and you can still propose sessions to learners yourself.
                </p>
                {waiting !== null && (
                    <p className="font-medium md:text-sm text-[12px]" aria-live="polite">
                        {waiting === 0 ? "No requests are waiting for your answer." : `${waiting} request${waiting === 1 ? " is" : "s are"} waiting for your answer.`}
                    </p>
                )}
            </div>

            <div className="flex justify-between gap-2 items-center w-full">
                <div className="flex flex-col gap-1">
                    <p id="pause-requests-label" className="md:text-base text-[14px] font-medium">Pause new requests</p>
                    <p className="font-normal text-[#4F4F4F] md:text-sm text-[12px]">
                        Learners will see that you aren&apos;t taking new requests and won&apos;t be able to book you.
                    </p>
                </div>
                <Switch
                    aria-labelledby="pause-requests-label"
                    checked={paused}
                    loading={isLoading}
                    disabled={loadFailed}
                    onChange={setPaused}
                    className="w-fit [&.ant-switch-checked]:bg-action"
                />
            </div>

            {paused && (
                <div className="flex flex-col gap-1">
                    <label htmlFor="pause-until" className="md:text-base text-[14px] font-medium">
                        Resume on <span className="font-normal text-gray-600">(optional)</span>
                    </label>
                    <input
                        id="pause-until"
                        type="date"
                        value={pausedUntil}
                        min={isoDay(today)}
                        max={isoDay(maxDay)}
                        onChange={(e) => setPausedUntil(e.target.value)}
                        className="w-full md:w-[240px] rounded-lg border border-gray-300 px-3 h-10"
                    />
                    <p className="text-xs text-gray-600">
                        Leave empty to stay paused until you turn this off. A pause can last up to {MAX_PAUSE_DAYS} days.
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-1 md:border-t md:border-gray-100 md:pt-5">
                <label htmlFor="pending-cap" className="md:text-base text-[14px] font-medium">
                    Limit waiting requests <span className="font-normal text-gray-600">(optional)</span>
                </label>
                <input
                    id="pending-cap"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_PENDING_CAP}
                    value={capText}
                    placeholder="No limit"
                    disabled={loadFailed}
                    onChange={(e) => setCapText(e.target.value)}
                    className="w-full md:w-[240px] rounded-lg border border-gray-300 px-3 h-10"
                />
                <p className="text-xs text-gray-600">
                    Once this many requests are waiting for your answer, learners can&apos;t send more until you respond.
                </p>
            </div>

            <div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || isLoading || loadFailed}
                    className="btn-primary-fill rounded-xl px-5 h-10 text-sm font-medium disabled:opacity-50 cursor-pointer"
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>
        </section>
    );
};

export default RequestPreferencesSection;
