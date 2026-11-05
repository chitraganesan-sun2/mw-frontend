import Link from "next/link";

/**
 * "By continuing you agree..." line for the Log In / Sign Up screens, so the Terms and Privacy
 * Policy are in front of people before they create an account. (The recorded, versioned
 * acceptance happens at the end of onboarding - see services/policies.ts.)
 */
export default function PolicyNotice({ className = "" }: { className?: string }) {
    const link = "text-black underline font-medium";
    return (
        <p className={`text-xs text-gray-500 text-center ${className}`}>
            By continuing, you agree to our{" "}
            <Link href="/terms-and-conditions" target="_blank" className={link}>
                Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" target="_blank" className={link}>
                Privacy Policy
            </Link>
            .
        </p>
    );
}
