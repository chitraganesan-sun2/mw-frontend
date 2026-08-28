'use client';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

interface JoinUsState {
    applicationId: string | null;
    step1Submitted: boolean;
    step2Submitted: boolean;
    step3Submitted: boolean;
    
    // Draft data so we don't lose user's input across navigation
    step1Data: any;
    step2Data: any;
    step3Data: any;

    setApplicationId: (id: string | null) => void;
    setStep1Submitted: (submitted: boolean) => void;
    setStep2Submitted: (submitted: boolean) => void;
    setStep3Submitted: (submitted: boolean) => void;
    
    setStep1Data: (data: any) => void;
    setStep2Data: (data: any) => void;
    setStep3Data: (data: any) => void;
    
    clearStore: () => void;
}

const initialState = {
    applicationId: null,
    step1Submitted: false,
    step2Submitted: false,
    step3Submitted: false,
    step1Data: {},
    step2Data: {},
    step3Data: {},
};

export const useJoinUsStore = create<JoinUsState>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,
                setApplicationId: (id) => set({ applicationId: id }),
                setStep1Submitted: (submitted) => set({ step1Submitted: submitted }),
                setStep2Submitted: (submitted) => set({ step2Submitted: submitted }),
                setStep3Submitted: (submitted) => set({ step3Submitted: submitted }),
                setStep1Data: (data) => set({ step1Data: data }),
                setStep2Data: (data) => set({ step2Data: data }),
                setStep3Data: (data) => set({ step3Data: data }),
                clearStore: () => set(initialState),
            }),
            {
                name: 'join-us-store',
                storage: createJSONStorage(() => sessionStorage), // using sessionStorage so it resets if they close the tab, could be localStorage too
            }
        ),
        { enabled: process.env.NODE_ENV === 'development' }
    )
);
