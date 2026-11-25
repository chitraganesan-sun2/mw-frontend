import React from "react";
import { AGENDA_KIND_LABEL, type AgendaKind } from "@/utils/scheduleAgenda";

// One quiet colour per kind. Not blue or orange: those mean Learner and Volunteer across the app,
// and the status pills already own green / amber / rose / gray.
const KIND_CLASS: Record<AgendaKind, string> = {
    session: "bg-slate-100 text-slate-700",
    instant: "bg-teal-50 text-teal-800",
    wingtime: "bg-violet-50 text-violet-800",
};

/** What kind of thing an agenda card is ("Session" / "Instant" / "WingTime"), plus an optional
 * few words on how the viewer got it ("You booked it", "Volunteer's posting"). */
export default function ScheduleTypeTag({ kind, note }: { kind: AgendaKind; note?: string }) {
    return (
        <p className="mb-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-tight">
            <span className={`rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide ${KIND_CLASS[kind]}`}>
                {AGENDA_KIND_LABEL[kind]}
            </span>
            {note && <span className="text-gray-500">{note}</span>}
        </p>
    );
}
