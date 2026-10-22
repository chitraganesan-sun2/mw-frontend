"use client";

import React, { useRef, useState } from "react";
import Button from "@/components/common/Button";
import { deleteResume, uploadResume } from "@/api/join-us";
import { getApiErrorMessage } from "@/utils/apiError";
import { MAX_RESUME_MB, validateResumeFile } from "@/utils/joinUsValidation";

export type ResumeMeta = { filename: string; size_bytes?: number | null };

const formatSize = (bytes?: number | null) => {
    if (!bytes && bytes !== 0) return "";
    return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};


type Props = {
    applicationId: string;
    value: ResumeMeta | null;
    onChange: (meta: ResumeMeta | null) => void;
    disabled?: boolean;
};

const ResumeUpload = ({ applicationId, value, onChange, disabled }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Reset so choosing the same file again (after an error) still fires onChange.
        e.target.value = "";
        if (!file || busy) return;
        const problem = validateResumeFile(file);
        if (problem) {
            setError(problem);
            return;
        }
        setError("");
        setBusy(true);
        try {
            const form = new FormData();
            form.append("file", file);
            const res: any = await uploadResume(applicationId, form);
            const meta = res?.data?.data?.resume ?? res?.data?.resume;
            onChange({ filename: meta?.filename || file.name, size_bytes: meta?.size_bytes ?? file.size });
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Couldn't upload your resume. Please try again."));
        } finally {
            setBusy(false);
        }
    };

    const handleRemove = async () => {
        if (busy) return;
        setError("");
        setBusy(true);
        try {
            await deleteResume(applicationId);
            onChange(null);
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Couldn't remove your resume. Please try again."));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-2 w-full min-w-0">
            <label htmlFor="resume-upload" className="text-[16px] md:text-sm font-normal text-gray-800">
                Resume <span className="text-gray-500">(PDF or DOCX, up to {MAX_RESUME_MB} MB)</span>
            </label>
            <input
                ref={inputRef}
                id="resume-upload"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={handleFile}
                disabled={disabled || busy}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {value ? (
                    <>
                        <p className="min-w-0 flex-1 truncate rounded-xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm text-gray-900" title={value.filename}>
                            {value.filename}
                            {value.size_bytes != null && <span className="text-gray-500"> · {formatSize(value.size_bytes)}</span>}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                title={busy ? "Uploading..." : "Replace"}
                                btnVariant="outline"
                                loading={busy}
                                disabled={disabled || busy}
                                customClassName="!px-4 !py-2 !h-10 !rounded-[10px] !w-full sm:!w-auto"
                                onClick={() => inputRef.current?.click()}
                            />
                            <Button
                                type="button"
                                title="Remove"
                                btnVariant="outline"
                                disabled={disabled || busy}
                                customClassName="!px-4 !py-2 !h-10 !rounded-[10px] !w-full sm:!w-auto"
                                onClick={handleRemove}
                            />
                        </div>
                    </>
                ) : (
                    <Button
                        type="button"
                        title={busy ? "Uploading..." : "Upload Resume"}
                        btnVariant="outline"
                        loading={busy}
                        disabled={disabled || busy}
                        customClassName="!px-4 !py-2 !h-10 !rounded-[10px] !w-full sm:!w-auto"
                        onClick={() => inputRef.current?.click()}
                    />
                )}
            </div>
            <p aria-live="polite" className="sr-only">
                {busy ? "Uploading resume" : value ? `Selected file: ${value.filename}` : ""}
            </p>
            {error && (
                <p role="alert" className="text-xs text-red-700 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
};

export default ResumeUpload;
