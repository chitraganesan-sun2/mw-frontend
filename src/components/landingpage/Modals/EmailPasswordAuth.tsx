import { useState } from "react";
import { Input } from "antd";
import { MdOutlineMailOutline } from "react-icons/md";
import Button from "@/components/common/Button";
import { showToast } from "@/components/common/Toast";
import {
    apiEmailLogin,
    apiEmailResetPassword,
    apiEmailSignUp,
    apiRequestEmailOtp,
    apiVerifyEmailOtp,
} from "@/api/auth";
import { emailError, emailTypoSuggestion, PASSWORD_RULES, passwordValid } from "@/utils/emailPassword";

type Step = "collapsed" | "login" | "email" | "code" | "password";

const detailOf = (err: any, fallback: string) => {
    const detail = err?.response?.data?.detail;
    return typeof detail === "string" ? detail : fallback;
};

const PasswordChecklist = ({ password, email }: { password: string; email: string }) => (
    <ul className="text-xs flex flex-col gap-1" aria-label="Password requirements">
        {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(password, email);
            return (
                <li key={rule.label} className={ok ? "text-success" : "text-gray-light"}>
                    {ok ? "✓" : "○"} {rule.label}
                </li>
            );
        })}
    </ul>
);

/**
 * Email + password sign-in for people without a Google account.
 *  - login:  email + password; "Forgot password?" verifies the email by code, then sets a new one.
 *  - signup: email -> emailed 6-digit code -> choose a password.
 * Every account API call is run through `run`, so the parent applies its usual success/error
 * handling (cookie, onboarding redirect, loaders, toasts) exactly as it does for Google sign-in.
 */
const EmailPasswordAuth = ({
    mode,
    actionLabel,
    disabled,
    loading,
    signupPayload,
    run,
}: {
    mode: "login" | "signup";
    actionLabel: string;
    disabled?: boolean;
    loading?: boolean;
    signupPayload?: any;
    run: (call: () => Promise<any>) => Promise<void>;
}) => {
    const [step, setStep] = useState<Step>("collapsed");
    const [resetting, setResetting] = useState(false);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [emailToken, setEmailToken] = useState("");
    const [touched, setTouched] = useState(false);
    const [busy, setBusy] = useState(false);

    const trimmed = email.trim();
    const emailProblem = emailError(trimmed);
    const typo = emailTypoSuggestion(trimmed);
    const showEmailError = touched && emailProblem;

    const sendCode = async () => {
        setTouched(true);
        if (emailProblem) return;
        setBusy(true);
        try {
            await apiRequestEmailOtp(trimmed);
            setStep("code");
            showToast({ type: "success", message: "We've emailed you a 6-digit code." });
        } catch (err) {
            showToast({ type: "error", message: detailOf(err, "Couldn't send the code. Please try again.") });
        } finally {
            setBusy(false);
        }
    };

    const verifyCode = async () => {
        setBusy(true);
        try {
            setEmailToken(await apiVerifyEmailOtp(trimmed, code.trim()));
            setPassword("");
            setStep("password");
        } catch (err) {
            showToast({ type: "error", message: detailOf(err, "Couldn't verify the code. Please try again.") });
        } finally {
            setBusy(false);
        }
    };

    const submitPassword = () =>
        run(() => {
            if (resetting) return apiEmailResetPassword(emailToken, password);
            if (mode === "signup") return apiEmailSignUp(emailToken, signupPayload, password);
            return apiEmailLogin(trimmed, password);
        });

    const startReset = () => {
        setResetting(true);
        setCode("");
        setStep("email");
    };

    const onSubmit = () => {
        if (step === "login") {
            if (emailProblem || !password) setTouched(true);
            else submitPassword();
        } else if (step === "email") sendCode();
        else if (step === "code") {
            if (code.length === 6) verifyCode();
        } else if (passwordValid(password, trimmed)) submitPassword();
    };

    if (step === "collapsed") {
        return (
            <Button
                title={actionLabel}
                btnVariant="outline"
                className="w-full !px-3 !py-2 text-sm !rounded-xl"
                icon={<MdOutlineMailOutline className="text-xl" />}
                disabled={disabled}
                onClick={() => setStep(mode === "login" ? "login" : "email")}
            />
        );
    }

    const emailLocked = step === "code" || step === "password";

    return (
        <form
            className="flex flex-col gap-3"
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            {resetting && <span className="text-sm font-medium">Reset your password</span>}
            <div className="flex flex-col gap-1">
                <Input
                    type="email"
                    autoComplete="email"
                    aria-label="Email address"
                    aria-invalid={!!showEmailError}
                    placeholder="Enter your email address"
                    value={email}
                    disabled={emailLocked}
                    status={showEmailError ? "error" : undefined}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                />
                {showEmailError && <span className="text-xs text-error">{emailProblem}</span>}
                {!showEmailError && typo && (
                    <button
                        type="button"
                        className="appearance-none border-0 bg-transparent p-0 text-xs text-left underline"
                        onClick={() => setEmail(typo)}
                    >
                        Did you mean {typo}?
                    </button>
                )}
            </div>

            {step === "login" && (
                <>
                    <Input.Password
                        autoComplete="current-password"
                        aria-label="Password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        title="Log In"
                        btnVariant="secondary"
                        className="w-full !px-3 !py-2 text-sm !rounded-xl"
                        htmlType="submit"
                        loading={loading}
                        disabled={!trimmed || !password}
                    />
                    <button
                        type="button"
                        className="appearance-none border-0 bg-transparent text-sm underline"
                        onClick={startReset}
                    >
                        Forgot password?
                    </button>
                </>
            )}

            {step === "email" && (
                <Button
                    title="Send me a code"
                    btnVariant="secondary"
                    className="w-full !px-3 !py-2 text-sm !rounded-xl"
                    htmlType="submit"
                    loading={busy}
                    disabled={!trimmed}
                />
            )}

            {step === "code" && (
                <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    aria-label="6-digit code"
                    placeholder="6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
            )}
            {step === "code" && (
                <Button
                    title="Verify email"
                    btnVariant="secondary"
                    className="w-full !px-3 !py-2 text-sm !rounded-xl"
                    htmlType="submit"
                    loading={busy}
                    disabled={code.length !== 6}
                />
            )}

            {step === "password" && (
                <>
                    <Input.Password
                        autoComplete="new-password"
                        aria-label={resetting ? "New password" : "Choose a password"}
                        placeholder={resetting ? "New password" : "Choose a password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <PasswordChecklist password={password} email={trimmed} />
                    <Button
                        title={resetting ? "Set new password and log in" : "Create account"}
                        btnVariant="secondary"
                        className="w-full !px-3 !py-2 text-sm !rounded-xl"
                        htmlType="submit"
                        loading={loading}
                        disabled={!passwordValid(password, trimmed)}
                    />
                </>
            )}

            {(emailLocked || (resetting && step === "email")) && (
                <button
                    type="button"
                    className="appearance-none border-0 bg-transparent text-sm underline"
                    disabled={busy}
                    onClick={() => {
                        setStep(mode === "login" ? "login" : "email");
                        setResetting(false);
                        setCode("");
                        setPassword("");
                    }}
                >
                    {mode === "login" ? "Back to log in" : "Use a different email"}
                </button>
            )}
        </form>
    );
};

export default EmailPasswordAuth;
