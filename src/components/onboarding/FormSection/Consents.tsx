import Link from "next/link";

const PrivacyPolicyLink = () => {
    return (
        <Link
            href="/privacy-policy"
            target="_blank"
            className="text-black underline hover:underline font-medium"
        >
            Privacy Policy
        </Link>
    )
}

const TermsAndConditionsLink = () => {
    return (
        <Link
            href="/terms-and-conditions"
            target="_blank"
            className="text-black underline hover:underline font-medium"
        >
            Terms and Conditions
        </Link>
    )
}

const SafetyReviewNotice = () => (
    <span className="block mt-2 text-sm text-gray-600">
        To help keep learners safe, MelodyWings may review session recordings or transcripts that our staff upload or import,
        using automated analysis (including an AI model). The transcript and findings are stored and seen only by authorised
        staff. The Privacy Policy has the details.
    </span>
);

export const PrivacyPolicyElement = ({ enrolled_by }: { enrolled_by: string }) => {
    return (
        <>
            {enrolled_by === "parent" ? (
                <p>
                    I verify that I am the parent and/or legal guardian of the learner and I consent to MelodyWings collecting, using and/or sharing certain personal information from the learner as mentioned in the <PrivacyPolicyLink />.
                </p>
            ) : (
                <p>
                    I consent to MelodyWings collecting, using and/or sharing my personal information as mentioned in the <PrivacyPolicyLink />.
                </p>
            )
            }
            <SafetyReviewNotice />
        </>
    )
}

export const TermsAndConditionElement = () => {
    return (
        <>
            <p>
                By accepting the <TermsAndConditionsLink />, either by clicking a box indicating your acceptance or by using and navigating through our platform through our website,
                you agree that
                (a) you have read and understood the agreement;
                (b) you meet the age requirements in the agreement;
                (c) you can form a binding contract; and
                (d) you accept this agreement and agree that you are legally bound by its terms.
                Learners under 13 and people who need support making decisions may use the services only with a parent or legal guardian, and volunteers under 18 need a parent or legal guardian&apos;s consent.
                Parents or guardians signing up or consenting for such users, by accepting the <TermsAndConditionsLink />,
                either by clicking a box indicating your acceptance or by using and navigating through our platform through our website,
                (a) you have read and understood the agreement;
                (b) you represent that you are the parent or legal guardian of such individual;
                (c) your acceptance of these terms on behalf of the individual will form a binding contract; and
                (d) you accept this agreement on behalf of the individual and agree that the individual is legally bound by its terms.
            </p>
        </>
    )
};
