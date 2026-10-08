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

export const PrivacyPolicyElement = ({ enrolled_by }: { enrolled_by: string }) => {
    return (
        <>
            {enrolled_by === "parent" ? (
                <p>
                    I verify that I am the parent and/or legal guardian of the Category I Learner and I consent to MW collecting, using and/or sharing certain personal information from the Category I Learner as mentioned in the <PrivacyPolicyLink />.
                </p>
            ) : (
                <p>
                    I consent to MW collecting, using and/or sharing my personal information as mentioned in the <PrivacyPolicyLink />.
                </p>
            )
            }
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
                (b) you represent that you are at least 18 years old;
                (c) you can form a binding contract; and
                (d) you accept this agreement and agree that you are legally bound by its terms.
                Individuals under the age of 18 or those with mental developmental disabilities of any age may access the services only when accompanied by a parent or legal guardian.
                Parents or guardians accompanying such users, by accepting the <TermsAndConditionsLink />,
                either by clicking a box indicating your acceptance or by using and navigating through our platform through our website,
                (a) you have read and understood the agreement;
                (b) you represent that you are at the parent or legal guardian of such individual
                (c) your acceptance of these terms on behalf of the individual will form a binding contract; and
                (d) you accept this agreement on behalf of the individual and agree that the individual is legally bound by its terms”
            </p>
        </>
    )
};
