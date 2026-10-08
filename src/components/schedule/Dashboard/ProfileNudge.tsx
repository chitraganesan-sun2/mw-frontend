"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MdClose } from "react-icons/md";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { getCookie } from "@/utils/auth";
import { calculateLearnerCompletion, calculateVolunteerCompletion } from "@/components/profile/ProfileCompletionBar";
import type { ScheduleRole } from "./scheduleCategories";

/** Below this the nudge is shown. */
const NUDGE_BELOW_PERCENT = 80;
/** Once dismissed it stays away for a week. */
const SNOOZE_DAYS = 7;
const storageKey = (role: ScheduleRole, userId: string) => `mw-profile-nudge:${role}:${userId}`;

function isSnoozed(key: string): boolean {
    try {
        const until = Number(window.localStorage.getItem(key));
        return Number.isFinite(until) && until > Date.now();
    } catch {
        return false;
    }
}

/**
 * A dismissible reminder on the Schedule page when the profile is less than 80% complete.
 * Shares the profile query the page already runs (same key), so it costs no extra request.
 */
const ProfileNudge: React.FC<{ role: ScheduleRole }> = ({ role }) => {
    // Deferred cookie / storage reads - see Sidebar/index.tsx for the SSR hydration reason.
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [dismissed, setDismissed] = useState(true);
    useEffect(() => {
        const id = getCookie(role === "volunteer" ? "volunteer_id" : "learner_id");
        setUserId(id);
        setDismissed(id ? isSnoozed(storageKey(role, id)) : true);
    }, [role]);

    const { data } = useQuery<any>({
        queryKey: [`${role}-details`, userId],
        queryFn: async () => {
            const res = await GET_API(
                role === "volunteer"
                    ? endpoints.volunteer.getIndividualVolunteer(userId as string)
                    : endpoints.learner.getIndividualLearner(userId as string)
            );
            return res?.status === 200 ? res?.data : null;
        },
        enabled: Boolean(userId),
    });

    if (!userId || dismissed || !data) return null;
    const { percentage, missingFields } = role === "volunteer" ? calculateVolunteerCompletion(data) : calculateLearnerCompletion(data);
    if (percentage >= NUDGE_BELOW_PERCENT) return null;

    const dismiss = () => {
        setDismissed(true);
        try {
            window.localStorage.setItem(storageKey(role, userId), String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000));
        } catch {
            // Private mode / blocked storage: it just comes back next visit.
        }
    };

    return (
        <div
            role="region"
            aria-label="Complete your profile"
            className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
        >
            <div className="min-w-0 text-sm text-amber-900">
                <p className="font-semibold">Your profile is {percentage}% complete</p>
                <p className="text-xs">
                    {missingFields.length > 0 && <>Still missing: {missingFields.slice(0, 3).join(", ")}{missingFields.length > 3 ? ` +${missingFields.length - 3} more` : ""}. </>}
                    {role === "volunteer" ? "A complete profile helps learners choose you." : "A complete profile helps us match you with the right volunteer."}{" "}
                    <Link href={`/${role}/profile`} className="font-semibold underline underline-offset-2">
                        Complete profile
                    </Link>
                </p>
            </div>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Hide this reminder for a week"
                className="shrink-0 rounded-full border-0 bg-transparent p-1 text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
                <MdClose size={18} aria-hidden="true" />
            </button>
        </div>
    );
};

export default ProfileNudge;
