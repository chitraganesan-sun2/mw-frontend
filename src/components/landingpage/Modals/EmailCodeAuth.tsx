import { useState } from "react";
import { Input } from "antd";
import { MdOutlineMailOutline } from "react-icons/md";
import Button from "@/components/common/Button";
import { showToast } from "@/components/common/Toast";
import { apiRequestEmailOtp, apiVerifyEmailOtp } from "@/api/auth";

const errorMessage = (err: any, fallback: string) => {
    const detail = err?.response?.data?.detail;
    return typeof detail === "string" ? detail : fallback;
};

/**
 * Email one-time-code sign-in for people without a Google account. Asks for an email,
 * emails a 6-digit code, then hands the resulting proof-of-email token to `onVerified`
 * (which calls the same signup/login API a Google token goes to).
 */
const EmailCodeAuth = ({
    actionLabel,
    disabled,
    loading,
    onVerified,
}: {
    actionLabel: string;
    disabled?: boolean;
    loading?: boolean;
    onVerified: (emailToken: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [busy, setBusy] = useState(false);

    const sendCode = async () => {
        setBusy(true);
        try {
            await apiRequestEmailOtp(email.trim());
            setCodeSent(true);
            showToast({ type: "success", message: "We've emailed you a 6-digit code." });
        } catch (err) {
            showToast({ type: "error", message: errorMessage(err, "Couldn't send the code. Please try again.") });
        } finally {
            setBusy(false);
        }
    };

    const verify = async () => {
        setBusy(true);
        try {
            onVerified(await apiVerifyEmailOtp(email.trim(), code.trim()));
        } catch (err) {
            showToast({ type: "error", message: errorMessage(err, "Couldn't verify the code. Please try again.") });
        } finally {
            setBusy(false);
        }
    };

    if (!open) {
        return (
            <Button
                title={actionLabel}
                btnVariant="outline"
                className="w-full !px-3 !py-2 text-sm !rounded-xl"
                icon={<MdOutlineMailOutline className="text-xl" />}
                disabled={disabled}
                onClick={() => setOpen(true)}
            />
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <Input
                type="email"
                autoComplete="email"
                aria-label="Email address"
                placeholder="Enter your email address"
                value={email}
                disabled={codeSent}
                onChange={(e) => setEmail(e.target.value)}
                onPressEnter={() => !codeSent && email && sendCode()}
            />
            {codeSent ? (
                <>
                    <Input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        aria-label="6-digit code"
                        placeholder="6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        onPressEnter={() => code.length === 6 && verify()}
                    />
                    <Button
                        title="Verify and continue"
                        btnVariant="secondary"
                        className="w-full !px-3 !py-2 text-sm !rounded-xl"
                        loading={busy || loading}
                        disabled={code.length !== 6}
                        onClick={verify}
                    />
                    <button
                        type="button"
                        className="appearance-none border-0 bg-transparent text-sm underline"
                        disabled={busy}
                        onClick={() => {
                            setCodeSent(false);
                            setCode("");
                        }}
                    >
                        Use a different email
                    </button>
                </>
            ) : (
                <Button
                    title="Send me a code"
                    btnVariant="secondary"
                    className="w-full !px-3 !py-2 text-sm !rounded-xl"
                    loading={busy}
                    disabled={!email.trim()}
                    onClick={sendCode}
                />
            )}
        </div>
    );
};

export default EmailCodeAuth;
