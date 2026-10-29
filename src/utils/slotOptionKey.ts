/**
 * A weekly availability slot keeps one volunteer_slot_id for every date it repeats on, so the
 * id alone cannot tell "Oct 31 1pm" from "Nov 7 1pm". An option is identified by date + id.
 */
export function slotOptionKey(slot: { date: string; volunteer_slot_id: string }): string {
    return `${slot.date}|${slot.volunteer_slot_id}`;
}

/** The option key for the form's current selection, or "" when nothing is picked. */
export function selectedSlotKey(selectedDate: string | undefined, selectedSlotId: string | undefined): string {
    return selectedDate && selectedSlotId ? `${selectedDate}|${selectedSlotId}` : "";
}
