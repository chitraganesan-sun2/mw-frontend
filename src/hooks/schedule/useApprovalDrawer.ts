"use client";
import { create } from "zustand";

/**
 * Open state of the header bell's Approval drawer, shared so other screens (e.g. a pending
 * card's "Respond" button on the Schedule dashboard) can open the same drawer instead of
 * rendering a second copy of it.
 */
interface ApprovalDrawerState {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const useApprovalDrawer = create<ApprovalDrawerState>()((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));
