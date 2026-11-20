// Self-contained (no imports) so the node unit tests can load it directly.

/** Shown wherever a member's name is expected but the profile has not loaded / has no name. */
export const NAME_FALLBACK = "MelodyWings member";

/**
 * Display name built from name parts, never "undefined undefined" and never empty:
 * falls back to a neutral label instead of fabricating an identity.
 */
export function displayName(
    first: string | null | undefined,
    last: string | null | undefined,
    fallback: string = NAME_FALLBACK
): string {
    const joined = [first, last]
        .filter((p) => p !== null && p !== undefined && String(p).trim() !== "")
        .map((p) => String(p).trim())
        .join(" ");
    return joined || fallback;
}
