// The organisation's official contact details, shown on /contact and the footer.
//
// Email: the support address MelodyWings already uses site-wide (privacy policy, delete-account
// page, every outgoing email). Override with NEXT_PUBLIC_SUPPORT_EMAIL.
//
// Phone: NOT hardcoded - no official number exists anywhere in the codebase or site content, and
// a placeholder would send callers to a wrong number. It is a REQUIRED configuration value:
// set NEXT_PUBLIC_SUPPORT_PHONE (e.g. "+1 916 555 0100") in the web host's environment and in
// .env.mobile. Until it is set the Contact page shows the email only.
export const SUPPORT_EMAIL = (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@melodywings.org").trim();

export const SUPPORT_PHONE = (process.env.NEXT_PUBLIC_SUPPORT_PHONE || "").trim();

/** `tel:` URI for a phone number written for people ("+1 (916) 555-0100" -> "tel:+19165550100").
 *  Keeps a leading "+" and the digits only, which dials correctly on desktop, Android and iOS. */
export const phoneToTelHref = (phone: string): string => {
    const trimmed = phone.trim();
    const digits = trimmed.replace(/\D/g, "");
    return `tel:${trimmed.startsWith("+") ? "+" : ""}${digits}`;
};

export const hasSupportPhone = (phone: string): boolean => phone.replace(/\D/g, "").length >= 7;
