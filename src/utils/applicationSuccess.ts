// Self-contained (no imports) so the node unit tests can load it directly.

/** The join-us flow has really finished only when the API gave us an application id AND step 3
 *  was submitted; anything else reaching /join-us/success (typed URL, old bookmark) is not a
 *  submitted application. */
export function hasSubmittedApplication(state: { applicationId?: string | null; step3Submitted?: boolean } | null | undefined): boolean {
    return !!state && typeof state.applicationId === "string" && state.applicationId.length > 0 && state.step3Submitted === true;
}
