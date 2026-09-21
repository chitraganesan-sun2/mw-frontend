# Release notes — v1.1.0 (versionCode 3)

## "What's new" text  *(Play limit: 500 chars per language)*

```
What's new in 1.1

• See why you were matched — a new "Why You Matched" panel on profiles
• Add any accepted session straight to your calendar
• Download your volunteer hours certificate
• Download a copy of your own data from Settings
• All your notification settings now in one place
• View your donation history
• Accessibility improvements across cards, modals and forms
• Updated core libraries and added crash reporting
```

*(~420 chars.)*

---

## Internal changelog — what 1.1.0 contains

Covers everything since versionCode 1. **versionCode 2 (1.0.1)** was cut for the AD_ID
permission fix (`18ddd79`); if it never reached a Play track, that is fine — Play only
requires versionCode to *increase*, gaps are allowed.

**New features**
- "Why You Matched" panel on volunteer/learner profile views
- "Add to calendar" `.ics` export on accepted sessions
- "Download my data" self-export in Settings
- "Download certificate" for volunteer hours
- Unified "Notification Preferences" section in Settings
- Donation history page + account linkage for logged-in donors
- `session_reminder` notifications now deep-link to /schedule

**Fixes**
- Volunteer discovery page crashed on a null profile picture
- Push token is now unregistered on logout, closing a cross-account leak window
- A 403 no longer force-logs-you-out; it shows a toast instead
- Stripped the transitively-merged `AD_ID` permission — the app does not use advertising ID
- Accessibility: form labels now associated with their controls; clickable cards and
  modal icons are keyboard-reachable and labelled

**Security / dependencies**
- Next.js 14.2.21 → 15.5.25 (critical RCE advisories)
- axios (SSRF bypass, prototype pollution, cookie ReDoS), js-cookie (prototype hijack),
  sharp/libvips/libheif, postcss, @capacitor/cli (tar DoS); removed unused lodash
- Sentry native plugin registered — the app had no native crash reporting before

**Privacy**
- Privacy-policy third-party list corrected (Cloud Run / Firebase / Gemini; Render removed)

---

# Release notes — v1.0.0 (versionCode 1)

## "What's new" text  *(Play limit: 500 chars per language)*

```
Welcome to MelodyWings 1.0 — free 1:1 online tutoring that connects learners with volunteer teachers.

• Get matched with a tutor who fits your goals and schedule
• Book sessions on a shared calendar, or start an Instant Session now
• Message your tutor directly
• Share and follow along in the community feed
• Sign in with Google; your contact details stay private
• Delete your account and data anytime from Settings
```

*(~430 chars.)*

For a first release you may also just use: `First public release of MelodyWings.`

---

## Internal changelog — what 1.0.0 contains

Not shown on the store. For the release record / internal testers.

**Accounts & onboarding**
- Google Sign-In (native via `@capgo/capacitor-social-login`)
- Learner and volunteer onboarding + verification flow; DOB (13+), profile photo
- Email / phone hidden from other users on all profile views

**Matching & discovery**
- Volunteer↔learner matching with an AI-generated shortlist (server-side Gemini)
- Tiered volunteer search; academic / non-academic skill filters

**Sessions**
- Scheduled sessions on a shared calendar with conflict checks
- Instant Sessions (claim / unclaim / withdraw, calendar + notification cleanup)
- Mark-complete time gate; feedback & ratings

**Community & messaging**
- Community feed with text, image, and video posts; comments; reporting & moderation
- 1:1 chat between matched learners and volunteers, with notifications

**Platform**
- Push notifications (FCM) for sessions, chat, matches
- Resources library, donations (external), testimonials
- Full Aug-2026 security pass: authz on all CRUD routes, JWT audience checks,
  `safeHref()` on user links, PII no longer logged
- **Mobile hardening for this release:** `/dev-login` excluded from the build,
  production env pinned via `.env.mobile`, WebView remote debugging off,
  cleartext traffic disabled

---

## Versioning policy going forward

- `versionCode` **must increase by 1** for every upload to any track (internal → prod).
- Bump both `android/app/build.gradle` (`versionCode`, `versionName`) — it is the
  source of truth; `package.json` `version` is informational.
- Keep `NEXT_PUBLIC_CURRENT_VERSION` in `.env.mobile` in sync with `versionName`.
