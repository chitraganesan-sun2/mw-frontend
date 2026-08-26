import dayjs from "dayjs";

export type FeedbackModalProps = {
    isOpen: boolean;
    mode?: "view" | "edit" | "create";
    onClose: () => void;
    onSubmit: (data: any) => void;
    data: EventApi | null;
    Loading: boolean;
};

export type AllEventsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
    data: {
        events: any[];
        date: string;
        w?: any;
    };
    onEventClick: (event: any, data: any) => void;
};

export type AlertModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onProceed: () => void;
    onCancel: () => void;
    value: string;
    onChange: (value: string) => void;
};

export type AddNewMeetingModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export type MyScheduleModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export type ApprovalModalProps = {
    isOpen: boolean;
    onClose: () => void;
    /** Whose pending session requests to show/act on. Defaults to "volunteer". */
    role?: "learner" | "volunteer";
};

export type CustomRecurrenceModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (data: {
        repeatEvery: number;
        repeatUnit: string;
        startDate: dayjs.Dayjs | null;
        endType: "never" | "date";
        endDate: dayjs.Dayjs | null;
    }) => void;
};