# Release notes — v1.3.1 (versionCode 6)

## "What's new" text  *(Play limit: 500 chars per language)*

```
What's new in 1.3.1

• Deleting your account now fully clears your data from the device
• Updated privacy policy inside the app
• Smaller fixes and stability improvements
```

---

## Internal changelog — what 1.3.1 contains

Covers everything since 1.3.0 (`main@c60680f`, bundle of 2026-10-08).

- **Delete Account** uses the same cleanup as a normal log out (cookies plus the stored auth backup and
  persisted store) and does a full page load in the app, so the deleted user's cached data does not stay in
  memory; a confirmation is shown after the reload
- In-app privacy policy matches the website (Mobile App Information, special-needs info is required,
  volunteer background information)
- `.env.mobile` version corrected to 1.3.1 (it still said 1.2.0, so crash reports carried the wrong release)
- Manifest: `READ_/WRITE_EXTERNAL_STORAGE` limited to API 32 and below (they are inert on Android 13+ and
  drew broad-storage scrutiny)

---

# Release notes — v1.3.0 (versionCode 5)

## "What's new" text  *(Play limit: 500 chars per language)*

```
What's new in 1.3

• Reschedule an accepted session from My Sessions or the calendar
• New My Schedule: next-session banner, search, filters and full history
• Join opens 3 minutes before a session starts
• See your session partner's local time when time zones differ
• Softer button colours and one Notifications settings card
• Clearer error messages and many booking and Community fixes
```

*(~430 chars.)*

---

## Internal changelog — what 1.3.0 contains

Covers everything since 1.2.0 (`main@a330bd3`). Server-side changes (reschedule rules,
conflict checks, full Past history, time-zone fields on session lists) are live for every
client through the shared API; the items below are what the app build itself changes.

**New**
- Reschedule an accepted, not-yet-started session (My Sessions, volunteer Availability rows,
  desktop calendar popover and mobile calendar sheet); the original stays booked until accepted
- My Schedule redesign: next-session banner, date groups, search + status filter, Past "Show more",
  other participant's time zone, "meeting link not available" note
- One Notifications settings card (push + instant-session email)
- Dismissible profile-completion reminder (< 80%, hides for a week)

**Fixes / behaviour**
- Join button available only 3 minutes before the start, everywhere (focusable, names its session)
- Global error toast + Sentry report for unhandled failures
- Community / booking race / time-zone Join / cancelled-blocks-slot fixes from the QA click-through
- Consistent wording and headings; softer slate (not black) for common action buttons
- Removed duplicate empty-state buttons; landing header no longer lists For Learners / For Volunteers

**Excluded from the mobile build (verify in the synced bundle)**
- `/dev-login` route and its strings; no localhost API URL

---

# Release notes — v1.2.0 (versionCode 4)

## "What's new" text  *(Play limit: 500 chars per language)*

```
What's new in 1.2

• Time picker OK button now always saves your choice
• Clearer messages when something fails to load or send
• Consistent wording and dates across the app (e.g. 28 Sep 2026)
• Only see sessions and tutors from your own country
• Fixed profile labels, missing avatars and a few crashes
• Faster tutor search, now including skills like Guitar or Piano
• Accessibility improvements for keyboard and screen-reader users
```

*(~440 chars.)*

---

## Internal changelog — what 1.2.0 contains

Bundle synced 2026-09-29 from `main@a330bd3`. Covers everything since 1.1.0 (`482e125`).
Server-side changes (same-country rule, deleted-account session revocation, rate
limits, search/sort) are already live for every client via the shared API; the items
below are what the app build itself changes.

**Fixes**
- MUI time picker OK was silently reverted (schedule + New Instant Session modals)
- Hydration mismatch on every private page (cookies read during render) + follow-ups
- antd button wave threw "reactRender is not a function" on every click
- Learner mobile profile showed volunteer stat labels; avatar fallbacks; "undefined undefined" names
- Chat send feedback / wrong recipient; meeting-modal recipient cache; silent accept failures
- Error states instead of empty lists when a request fails; session-expiry handling
- Adult volunteer age 18 (was 21), matching the backend
- Native `window.confirm` replaced with the app's confirm modal (instant sessions)

**Copy / UX**
- "session" terminology everywhere; one date format (`28 Sep 2026`)
- Production-readiness: unreachable blog/donate pages, SEO metadata, 404/error pages

**Accessibility**
- ~30 click-only div/span targets made keyboard-accessible
- Select / date-picker / contact inputs associated with their labels

**Excluded from the mobile build (verified in the synced bundle)**
- `/dev-login` route and its strings; no localhost API URL

---

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

Covers everything since versionCode 1.

**Play Console state, confirmed 2026-09-21:** versionCode 1 (1.0.0) is *Inactive*;
**versionCode 2 (1.0.1) is live on the Internal testing track**, full roll-out, uploaded
10 Sept 2026. **Production has never been published — it is still a Draft, 0 of 177
countries.** So versionCode 3 is both correct and required (it must exceed 2), and this
upload is still a *first production release*, not an update: the full store-listing /
data-safety / content-rating gate in `09` applies, and new-app review can take ~14 days.

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
