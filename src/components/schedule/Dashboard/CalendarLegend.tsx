import type { ScheduleRole } from "./scheduleCategories";

// Swatches mirror Calender/EventCard.tsx's status styles.
const ITEMS: { key: string; label: string; swatch: string; roles: ScheduleRole[] }[] = [
    { key: "available", label: "Available (your availability)", swatch: "bg-white border border-dashed border-gray-500", roles: ["volunteer"] },
    { key: "posted", label: "Posted instant session", swatch: "bg-amber-50 border border-amber-400", roles: ["volunteer"] },
    { key: "pending", label: "Pending", swatch: "bg-[#F4F7FB] border border-[#E0E0E0]", roles: ["volunteer", "learner"] },
    { key: "accepted", label: "Accepted", swatch: "bg-[#DCFCE7] border border-[#86EFAC]", roles: ["volunteer", "learner"] },
    { key: "completed", label: "Completed", swatch: "bg-blue-200 border border-blue-600", roles: ["volunteer", "learner"] },
    { key: "rejected", label: "Declined", swatch: "bg-[#FEE2E2] border border-[#FCA5A5]", roles: ["volunteer", "learner"] },
];

/** Key for the calendar, so availability and booked sessions can't be confused. */
const CalendarLegend = ({ role }: { role: ScheduleRole }) => (
    <ul aria-label="Calendar legend" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-700">
        {ITEMS.filter((item) => item.roles.includes(role)).map((item) => (
            <li key={item.key} className="flex items-center gap-1.5">
                <span aria-hidden="true" className={`inline-block h-3 w-5 rounded ${item.swatch}`} />
                {item.label}
            </li>
        ))}
    </ul>
);

export default CalendarLegend;
