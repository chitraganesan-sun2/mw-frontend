# App content declarations

Play Console **Policy → App content**. Every sub-section, with the answer for
MelodyWings v1.0.0. (Data safety and Content ratings have their own files — `03`, `04`.)

---

## Privacy policy

- URL: **`https://melodywings.org/privacy-policy`**
- The page exists in this app too (`src/app/(landingpage)/privacy-policy/`) and is
  publicly reachable without login. Confirm the production domain serves it at that
  exact path before submitting. See `10-privacy-policy-review.md` for the content
  cross-check.

## Ads

- **Does your app contain ads?** → **No**
- No ad SDKs in `package.json`; no AdMob; `google-services.json` is for Auth/FCM/Analytics only.

## App access (for review)

- **All functionality is restricted / requires sign-in** → **Yes, some functionality is restricted.**
- Provide reviewer credentials + steps — see `07-testing-instructions.md`. Google
  Sign-In is required; supply a working test Google account or a walkthrough of how
  the reviewer can create learner and volunteer accounts.

## Content ratings

- Complete the IARC questionnaire using `04-content-rating.md`.

## Target audience and content

- **Target age groups:** **13–15, 16–17, 18+** (i.e. 13 and older). Do **not** tick
  any under-13 band.
- **Designed for Families / "appeal to children":** **No.** The app's store listing,
  icon, and content are not directed at children under 13.
- **Unknown-age users:** standard experience (no neutral age screen needed beyond the
  DOB collected at onboarding, which enforces 13+).

## News app

- **Is your app a news app?** → **No.**

## COVID-19 contact tracing / status apps

- **No.**

## Data safety

- Complete using `03-data-safety.md`.

## Government apps

- **Is your app a government app?** → **No.**

## Financial features

- **Does your app provide financial features?** → **No.**
- Donations: the "Donate" flow opens an **external web page** in the system browser
  (`@capacitor/browser`); there is no in-app payment, wallet, lending, or crypto.
  If the Console asks specifically about "facilitating donations", answer per its
  wording and note it is an external, third-party-processed charitable donation with
  no digital goods exchanged.

## Health apps / Health Connect

- Not a health app. **Do not** request Health Connect.
- ⚠️ If onboarding's special-needs fields are treated as health data in `03`, there
  is still no Health Connect integration — this section stays **No**.

## Advertising ID permission (Android 13+)

- The app does **not** declare `com.google.android.gms.permission.AD_ID` and uses no
  advertising ID. If Play's automated check flags a transitive dependency requesting
  it, add to `AndroidManifest.xml`:
  ```xml
  <uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove" />
  ```

---

## Permissions declared in the app — rationale (for the "Sensitive app permissions" / review notes)

From `android/app/src/main/AndroidManifest.xml`:

| Permission | Why | Notes |
|---|---|---|
| `INTERNET`, `ACCESS_NETWORK_STATE` | Core — the app talks to the Cloud Run backend; offline banner | standard |
| `CAMERA` | Take a profile photo / attach a photo to a community post | via `@capacitor/camera`; runtime-prompted |
| `READ_EXTERNAL_STORAGE` | Pick an existing photo/video from the gallery | runtime-prompted on API ≤ 32 |
| `WRITE_EXTERNAL_STORAGE` | Legacy media save | ⚠️ **no `android:maxSdkVersion="32"`** — Play may query this. Recommend adding `android:maxSdkVersion="32"` (scoped storage makes it unnecessary on 33+). Low risk, but tidy before or right after launch. |
| `POST_NOTIFICATIONS` | Show push notifications (sessions, chat, matches) | Android 13+ runtime prompt; via `@capacitor/push-notifications` + FCM |
| `VIBRATE` | Haptics + notification vibration | via `@capacitor/haptics` |
| `RECEIVE_BOOT_COMPLETED` | Re-register scheduled local notifications after reboot | via `@capacitor/local-notifications` |

No SMS, no call log, no background location, no `QUERY_ALL_PACKAGES`, no
`MANAGE_EXTERNAL_STORAGE`, no accessibility service — so none of the
"Permissions Declaration Form" high-risk categories apply.
