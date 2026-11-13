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

export type RecordingConsentProps = { wingtimeRecording: boolean; sessionTranscripts: boolean };

/**
 * The Guardian's (or a self-enrolled learner's) understanding that sessions are recorded and/or transcribed.
 * It is part of the Privacy Policy checkbox (the consent step never has more than two boxes), and it only
 * describes what is switched on right now (see useRecordingNotices), so it never claims more than the system
 * does. Working draft wording for the owner's lawyer - RECORDING-CONSENT-AND-MEET-SETTINGS-2026-11-13.md
 * section C3.
 */
const RecordingConsentText = ({
    enrolled_by,
    wingtimeRecording,
    sessionTranscripts,
}: RecordingConsentProps & { enrolled_by: string }) => {
    const who = enrolled_by === "parent" ? "my child joins" : "I join";
    const what =
        wingtimeRecording && sessionTranscripts
            ? `WingTime sessions ${who} are recorded and transcribed, and one-to-one sessions are transcribed (not recorded)`
            : wingtimeRecording
              ? `WingTime sessions ${who} are recorded and transcribed`
              : `one-to-one sessions ${who} are transcribed (not recorded)`;
    return (
        <span className="block mt-2">
            I also understand that {what}, for safety
            {wingtimeRecording ? " and so that recordings can be shared with MelodyWings members after our team has reviewed them" : ""}.
            Transcripts are checked for safety and seen only by authorised staff. If you need to, please read the{" "}
            <TermsAndConditionsLink /> and the <PrivacyPolicyLink /> before you accept.
        </span>
    );
};

/** The old "Photo/Video Consent" question, now part of the Privacy Policy tick-box. */
const PhotoVideoConsentText = ({ enrolled_by }: { enrolled_by: string }) => (
    <span className="block mt-2">
        {enrolled_by === "parent"
            ? "I also consent to MelodyWings using photos or videos of the learner in program materials and promotional content."
            : "I also consent to MelodyWings using my photos or videos in program materials and promotional content."}{" "}
        To withdraw this consent, <Link href="/contact" target="_blank" className="text-black underline hover:underline font-medium">contact us</Link>.
    </span>
);

export const PrivacyPolicyElement = ({
    enrolled_by,
    recording,
}: {
    enrolled_by: string;
    /** Set only while recording / transcription is switched on and the person is a learner. */
    recording?: RecordingConsentProps;
}) => {
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
            <PhotoVideoConsentText enrolled_by={enrolled_by} />
            {recording && <RecordingConsentText enrolled_by={enrolled_by} {...recording} />}
        </>
    )
}

/** The old "Share Learning Goals Anonymously" and "Also Show the Type of Disability" questions, learners only. */
const ShowcaseConsentText = ({ enrolled_by }: { enrolled_by: string }) => (
    <span className="block mt-2">
        I also agree that MelodyWings may show the learner&apos;s age, the skills they want to
        learn and the type of developmental disability entered in the profile, anonymously, on our public website. No name, photo or contact
        details are ever shown. {enrolled_by === "parent" ? "As a parent or legal guardian I decide this for a learner under 18. " : ""}
        You can change this any time in Settings.
    </span>
);

export const TermsAndConditionElement = ({ showcase = false, enrolled_by = "self" }: { showcase?: boolean; enrolled_by?: string }) => {
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
            {showcase && <ShowcaseConsentText enrolled_by={enrolled_by} />}
        </>
    )
};
