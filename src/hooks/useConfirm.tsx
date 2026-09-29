"use client";

import { useCallback, useRef, useState } from "react";
import ConfirmModal from "@/components/common/Modals/ConfirmModal";

type ConfirmOptions = {
    title?: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
};

/**
 * Promise-based replacement for window.confirm(), rendered with the app's ConfirmModal.
 * The native dialog looked out of place and is unreliable inside the Capacitor mobile
 * build. Usage: `if (!(await confirm({ description: "..." }))) return;` and render
 * `{confirmModal}` once in the component.
 */
export function useConfirm() {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolverRef = useRef<((ok: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions) => {
        setOptions(opts);
        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const settle = (ok: boolean) => {
        resolverRef.current?.(ok);
        resolverRef.current = null;
        setOptions(null);
    };

    const confirmModal = (
        <ConfirmModal
            isOpen={!!options}
            title={options?.title}
            description={options?.description ?? ""}
            confirmText={options?.confirmText}
            cancelText={options?.cancelText}
            danger={options?.danger}
            onConfirm={() => settle(true)}
            onCancel={() => settle(false)}
        />
    );

    return { confirm, confirmModal };
}
