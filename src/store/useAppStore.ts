"use client";
import { create } from "zustand";
import { useVolunteer } from "./useVolunteer";
import { useLearner } from "./useLearner";
import { useGlobalStore } from "./useGlobalStore";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

const isDev = process.env.NODE_ENV === "development";

// Only these keys are written to localStorage. The full decrypted profile
// blobs (volunteerDetails / learnerDetails) and per-event details are kept in
// memory / the react-query cache instead of sitting at rest in localStorage.
const PERSISTED_KEYS = new Set<string>([
    "userName",
    "userImage",
    "volunteerName",
    "volunteerImage",
    "volunteerTimeZone",
    "volunteerUtcOffset",
    "learnerName",
    "learnerImage",
    "learnerTimeZone",
    "learnerUtcOffset",
    "currentMonth",
]);

export const useAppStore = create<UseAppStoreProps>()(
    devtools(
        persist(
            (set, get, api) => {
                return {
                    userImage: "",
                    setUserName: (name: string) => set({ userName: name }),
                    userName: "",
                    setUserImage: (image: string) => set({ userImage: image }),
                    ...useVolunteer(set, get, api),
                    ...useLearner(set, get, api),
                    ...useGlobalStore(set, get, api),
                };
            },
            {
                name: "melody-wings-store",
                storage: createJSONStorage(() => localStorage),
                partialize: (state) =>
                    Object.fromEntries(
                        Object.entries(state).filter(([key]) => PERSISTED_KEYS.has(key))
                    ) as Partial<UseAppStoreProps>,
            }
        ),
        { enabled: isDev }
    )
);
