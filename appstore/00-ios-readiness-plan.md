# MelodyWings on iOS - readiness plan (2026-10-09)

Written from a read-through of the code (frontend, backend, Capacitor config). **Nothing here was built or run
on iOS - this machine is Windows.** Apple's rules change; items marked *(verify)* should be re-checked in
App Store Connect / the current App Review Guidelines before you rely on them.

## 1. Where we stand

The app is a Next.js static export wrapped by **Capacitor 8**, already structured for multiple platforms:
`src/utils/platform.ts` has `isIOS()` / `getPlatformName()`, the backend push endpoint already accepts
`platform: "ios"`, and `definitions.ts` already has `GOOGLE_IOS_CLIENT_ID` / `GOOGLE_IOS_URL_SCHEME`
placeholders. But **there is no `ios/` project, no `@capacitor/ios` dependency, and no iOS OAuth client,
Apple Developer account, APNs key or Sign in with Apple.**

### Changes made in this branch (`feat/ios-prep`, safe on Android and web)
| File | Change |
|---|---|
| `src/services/push-notifications.ts` | Registers the real platform (`ios` or `android`) instead of a hardcoded `android` |
| `src/services/native-auth.ts` | Passes `iOSClientId` / `iOSServerClientId` to Google sign-in **only on iOS and only when the client id is set** |
| `Header/index.tsx`, `DonationHistorySection` | Donate is hidden **on iOS only** (see 3.4) |

No behaviour changes on Android or web.

## 2. What you need before any iOS work

| Need | Notes |
|---|---|
| **Apple Developer Program** | $99/year. As a nonprofit, **apply for the fee waiver** (developer.apple.com, "Apple Developer Program Fee Waiver"). An *organization* account needs a legal entity and a **D-U-N-S number**; approval can take days to weeks, so start now. *(verify)* |
| **A Mac with current Xcode** | Required to build and sign. No Mac: a **cloud Mac** (MacinCloud, AWS EC2 Mac), or a CI service with macOS runners (GitHub Actions `macos-*`, Codemagic, Bitrise). Apple raises the minimum Xcode/SDK each year - check the current requirement before submitting *(verify)*. |
| **Firebase iOS app** | Add an iOS app (bundle id `org.melodywings.app`) to the existing Firebase project; download `GoogleService-Info.plist`. |
| **APNs authentication key (.p8)** | Apple Developer -> Keys -> Apple Push Notifications service. Upload it to Firebase -> Cloud Messaging. |
| **Google OAuth "iOS" client** | Google Cloud Console (project 781782361175) -> Credentials -> OAuth client ID -> type **iOS**, bundle id `org.melodywings.app`. Its client id goes into `NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID`, its reversed form into the URL scheme, **and the client id must be added to the backend's `GOOGLE_OAUTH_CLIENT_ID` list** (same lesson as Android: forgetting it makes every iOS sign-in a 401). |
| **App Store Connect app record** | Name, bundle id, primary language, SKU. |

## 3. Engineering gaps (ordered by risk)

### 3.1 Sign in with Apple - **blocker** (App Review 4.8) *(verify)*
We sign in only with Google. Apps that offer a third-party login must also offer an equivalent login that limits
data collection (Sign in with Apple is the usual answer). Needed:
- iOS: add the Apple provider (`@capgo/capacitor-social-login` supports Apple) and the *Sign in with Apple* capability.
- Backend: new endpoint that verifies Apple's identity token (Apple public keys, audience = bundle id) and maps it to an account.
- **Account linking is the hard part:** Apple can hide the real email behind a relay address, but our accounts are keyed by email. Decide how an Apple user is matched to (or onboarded as) a learner/volunteer, and how a user who already signed up with Google links their Apple sign-in. Needs a design decision, not just code.
- Apple also requires **in-app account deletion** - already done (Settings -> Delete Account) - and, for Sign in with Apple, revoking the Apple token on deletion *(verify)*.
Effort: large (design + backend + tests + frontend).

### 3.2 User-generated content: no way to block users (App Review 1.2) *(verify)*
Community posts and chat are user-generated content. Apple expects: a **report** mechanism (exists for posts), content
filtering, a way to **block abusive users** (**missing**), and published contact information (support email exists).
Needed: block/unblock a user (backend model + enforcement in chat, community and matching, and UI).
Effort: medium-large. Relevant for Android too, but Apple enforces it.

### 3.3 Push notifications
The backend sends **FCM tokens** (`firebase_admin`). The stock Capacitor push plugin on iOS returns an **APNs**
token unless Firebase is wired into the native app. Do one of:
- Follow Capacitor's "FCM on iOS" recipe (add the Firebase iOS SDK, `FirebaseApp.configure()` in `AppDelegate`, forward the FCM token to the plugin), or
- Use `@capacitor-firebase/messaging`.
Also backend: `send_push_to_user` does `find_one({"user_id"})`, so a user with both an Android and an iOS token gets pushes on **one arbitrary device**; send to every platform token and add an `apns` block (badge/sound) to the message.
Effort: medium. Test on a real device (the simulator cannot receive push).

### 3.3b Google sign-in on iOS
Done in code (client-id plumbing); needs the iOS OAuth client, the URL scheme in `Info.plist`
(`CFBundleURLTypes` -> reversed client id) and the backend allow-list entry (section 2).

### 3.4 In-app donations (App Review 3.2.1) *(verify)*
Apple limits in-app fundraising: nonprofits may fundraise in their own app only if the app supports **Apple Pay** and the
organization is an **approved nonprofit** with Apple. The Donate page (Stripe on the web) would likely be rejected.
**Done now:** Donate and "Your Donation History" are hidden on iOS only. Later option: apply for Apple's nonprofit
approval and add Apple Pay. Donations stay available on the website and Android.

### 3.5 Web-view specifics to test on a device
- **Safe areas / notch / home indicator:** the app has no `safe-area-inset` handling and no `viewport-fit=cover`. Decide
  between Capacitor's `ios.contentInset` and CSS `env(safe-area-inset-*)`, then check every header and bottom bar.
- **Cookies:** the app origin is `capacitor://localhost` (iOS cannot use an `https` scheme for the web view), not
  `https://localhost` as on Android. Cookies set with the `Secure` flag may not persist there. The app already keeps an
  `mw_auth_backup` copy for this kind of case, but **sign-in persistence across app restarts must be tested**.
- **Keyboard / viewport units (`100vh`), camera and photo picker, video upload, `.ics` download** (Android uses the
  Filesystem plugin; on iOS a share sheet is usually needed), the date/time pickers, and swipe-back gestures.
- Content-Security-Policy and `allowNavigation` currently name only the Android-style origin; check `capacitor://localhost`.

### 3.6 Minimum functionality (App Review 4.2) *(verify)*
A thin web wrapper can be rejected. MelodyWings has real native features: push notifications, Google/Apple sign-in,
camera and photo access, native HTTP, haptics. Say so in the review notes.

### 3.7 Kids and privacy
Many learners are minors and the app is for people with disabilities. We are **not** targeting the Kids Category
(which has strict rules); keep age rating and positioning consistent with Android (13+). Add a privacy manifest
(`PrivacyInfo.xcprivacy`). Capacitor and Sentry are expected to ship their own; ours must declare any required-reason
APIs we use and the collected-data types *(verify what the generated project already includes)*.

## 4. Steps on the Mac (first day)

```bash
cd melody-wings-frontend
npm i @capacitor/ios@^8                       # same major as the other Capacitor packages
node scripts/use-mobile-config.js && npx next build && node scripts/restore-web-config.js
npx cap add ios                               # creates ios/ (Capacitor 8 should use Swift Package Manager; if it asks for CocoaPods, install them - verify)
npx cap sync ios
npx cap open ios                              # opens Xcode
```
In Xcode: set the **Team**, bundle id `org.melodywings.app`, **iPhone only** (avoids iPad screenshot requirements),
minimum iOS version, version `1.0.0` / build `1`. Add capabilities **Push Notifications**, **Sign in with Apple**
(after 3.1), and **Background Modes -> Remote notifications**. Add `GoogleService-Info.plist`. Add to `Info.plist`:
`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSMicrophoneUsageDescription` (video), the Google URL
scheme, and leave `ITSAppUsesNonExemptEncryption` = `NO` (HTTPS only). Set the app icon (1024x1024, no alpha) and launch screen.
Run on a real iPhone first; then **Product -> Archive -> Distribute App -> App Store Connect**, test in **TestFlight**.

**Do not run `npm i` for iOS on the Windows machine under OneDrive** - an earlier install there corrupted `node_modules`
and broke native builds. Do the iOS install on the Mac (or in CI).

## 5. App Store Connect listing (reuse the Play work)

| Item | Source |
|---|---|
| Name, subtitle, description, keywords | `playstore/01-store-listing.md` (subtitle 30 chars, keywords 100 chars) |
| Screenshots | **6.9-inch iPhone** is the largest required size (1320 x 2868) *(verify current sizes)*; others derive. Retake on an iPhone/simulator - our Android shots are 1080 x 2040 and will not be accepted as-is |
| Privacy policy URL | `https://melodywings.org/privacy-policy` |
| Support URL | a page or `mailto:` for support@melodywings.org |
| **App Privacy ("nutrition labels")** | Map from `playstore/03-data-safety.md`: Contact info, Health & Fitness (learner disability details - declare), Sensitive info, User content (photos, videos, messages), Identifiers (user id, device id), Diagnostics (Sentry). Declare "linked to the user"; **not** used for tracking |
| Age rating | New questionnaire; user-generated content = yes; target consistent with 13+ |
| Review notes + demo account | Same two Google review accounts as `playstore/11-app-access-instructions.md`; add the Sign in with Apple path once it exists |
| Export compliance | Standard HTTPS only -> exempt |

## 6. Suggested order and rough effort

| # | Work | Who | Size |
|---|---|---|---|
| 1 | Apple Developer account (fee waiver, D-U-N-S) | Org owner | start now - slow |
| 2 | Decide Sign in with Apple account-linking design | Product + dev | design |
| 3 | Sign in with Apple (backend + frontend) | Dev | large |
| 4 | Block-user feature (backend + UI) | Dev | medium-large |
| 5 | Firebase iOS app + APNs key + Google iOS client | Console work | small |
| 6 | Generate `ios/`, wire capabilities, FCM, Info.plist | Dev on Mac | medium |
| 7 | Safe-area / cookie / viewport fixes from device testing | Dev | medium |
| 8 | Backend push to every platform token + apns block | Dev | small |
| 9 | Listing, screenshots, privacy labels, TestFlight, submit | Team | medium |

The two items most likely to cause a rejection are **3.1 (Sign in with Apple)** and **3.2 (block users)**.
Both also take the longest, so they are worth starting before the Mac work.
