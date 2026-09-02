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
