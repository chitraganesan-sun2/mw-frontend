# Data safety form

Play Console **Policy → App content → Data safety**. This is a wizard; the tables
below give the answer for every question. Re-verify against the live app before
submitting — a wrong Data safety form is a top-3 rejection reason.

> **"Collected"** = leaves the device (goes to our backend / a third party).
> **"Shared"** = transferred to a third party *for their own use*. Sending data to a
> vendor that only processes it on our behalf (Cloudinary storage, Firebase, Cloud
> Run) is **not** "shared" in Play's sense — see the processor note at the bottom.

---

## Section 1 — Overview answers

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS only; `usesCleartextTraffic="false"`, `network_security_config.xml`) |
| Do you provide a way for users to request that their data be deleted? | **Yes** — in-app: Settings → **Delete Account** (type `DELETE` to confirm) → `DELETE /api/v1/auth/delete-account`; soft-deletes the account and blocks future sign-in. Also reachable by emailing `support@melodywings.org`. |
| Deletion URL (if you offer a web deletion request) | `https://melodywings.org/privacy-policy` (documents the in-app route + support email) |

---

## Section 2 — Data types

For every "collected" type below: **Processed ephemerally?** No · **Required or optional?**
see column · Purposes are listed per row.

### Personal info

| Data type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Name | Yes | No | Required | App functionality; Account management |
| Email address | Yes | No | Required (from Google Sign-In) | App functionality; Account management; Security/fraud prevention |
| Phone number | Yes | No | **Optional** (onboarding field) | App functionality; Account management |
| Address (city / region only) | Yes | No | Optional | App functionality (matching by locale/timezone) |
| Date of birth | Yes | No | Required | App functionality; Comply with age policy (13+) |
| Other info — guardian name (for under-18 learners) | Yes | No | Conditionally required | App functionality; Safety |
| Other info — "what I need help with" free text, learning goals | Yes | No | Required | App functionality (matching) |

> ⚠️ **Special-needs / disability details.** Onboarding collects information about a
> learner's disabilities or special educational needs so tutors can prepare. If any
> of these fields capture **health-related** information, also declare **Health and
> fitness → Health info** (Collected, No-share, Optional, purpose: App functionality).
> Confirm with the onboarding schema and, ideally, legal before finalising.

### Photos and videos

| Data type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Photos | Yes | No | Optional | App functionality (profile picture; images in community posts) |
| Videos | Yes | No | Optional | App functionality (video posts in the community feed) |

### Messages

| Data type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Other in-app messages | Yes | No | Optional | App functionality (1:1 chat between learner and volunteer; community posts & comments) |

### App activity

| Data type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| App interactions | Yes | No | (Analytics — see note) | Analytics (Firebase Analytics on native) |
| In-app search history | Yes | No | Optional | App functionality (volunteer / resource search) |
| Other user-generated content | Yes | No | Optional | App functionality (feedback, ratings, testimonials, session notes) |

> PostHog analytics is **web-only** — `PostHogProvider` no-ops on Capacitor, so it
> is not part of the Android data collection. Native analytics is **Firebase
> Analytics** via `google-services.json`.

### App info and performance

| Data type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Crash logs | **Confirm** | No | — | Analytics / stability — declare **only if** Firebase Crashlytics is actually enabled (it is **not** in `package.json` today; Firebase SDK is present via google-services). If not enabled, answer **No**. |
| Diagnostics | Same as above | | | |

### Device or other IDs

| Data type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Device or other IDs | Yes | No | Required for push | App functionality (FCM push registration token; Firebase installation ID); Analytics (Analytics app-instance ID) |

---

## Section 3 — Data NOT collected (answer "No" / leave unticked)

- Financial info (no payments in-app; donations open an external web page)
- Location — precise or approximate GPS (only user-entered city/region, covered above)
- Web browsing history
- Contacts, Calendar, SMS/call log
- Audio recordings
- Health & fitness *(unless the SEN fields above are health info — see the warning)*
- Installed apps, other app performance beyond the crash-log note

---

## Section 4 — Third-party processors (context, not a "sharing" declaration)

These receive data **only to provide a service to MelodyWings**:

| Processor | Data | Role |
|---|---|---|
| Google (Sign-In / Identity) | Name, email, Google account id | Authentication |
| Google Firebase | Device/installation IDs, analytics events, FCM tokens | Push + analytics |
| Google Cloud Run | All backend data in transit/at rest | App backend hosting |
| Cloudinary | Profile & post images/videos | Media storage / CDN |
| Google Gemini API (server-side) | Learner/volunteer **profile text** (skills, goals) — no name/email/contact | Generates the match shortlist. ⚠️ Have legal confirm this counts as processing, not "sharing", under Play's definition and Google's API terms. |

---

## Notes for the person filling the form

- The Console asks the "optional/required" question **per data type**; where a field
  is optional in onboarding, mark it optional even if most users provide it.
- "Is this data collected, shared, or both?" → **Collected** for every row above.
- After submitting, download the generated **Data safety summary** and diff it
  against `10-privacy-policy-review.md` — the privacy policy must disclose at least
  everything the form declares.
