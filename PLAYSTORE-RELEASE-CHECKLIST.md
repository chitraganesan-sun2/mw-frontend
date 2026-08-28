# MelodyWings Play Store Release Checklist

**Build from**: `main` (has the full security-audit pass — Aug 2026)
**Version**: 1.0.0 (versionCode: 1) — never uploaded to Play, so no bump needed for the first AAB
**Updated**: 28 Aug 2026

> Build the release from `main`, not from a `release/*` branch. `main` carries
> every backend + frontend security fix; there is no separate release branch to
> maintain.

---

## ✅ Done (code / project)

- [x] API URL → production (mobile uses the Cloud Run URL directly; `api.melodywings.org` has no DNS record — see `src/definitions.ts`)
- [x] Cleartext traffic disabled (`AndroidManifest.xml` `usesCleartextTraffic="false"` + `res/xml/network_security_config.xml`; cleartext allowed only for `10.0.2.2` / `localhost` emulator)
- [x] Release signing config in `android/app/build.gradle` — reads `KEYSTORE_PASSWORD` / `KEY_PASSWORD` from the environment
- [x] ProGuard: `minifyEnabled` + `shrinkResources` + `proguard-rules.pro` (Capacitor / Firebase / WebView)
- [x] `versionCode 1` / `versionName "1.0.0"` in `package.json` + `android/app/build.gradle`
- [x] **Release keystore generated** — `keystores/melodywings-release.keystore` (+ `release-keystore-credentials.txt`). Both gitignored; not committed. **Verify you have an off-machine backup.**
- [x] `android/app/google-services.json` in place
- [x] Account deletion (Play requirement) — `Settings → Delete Account` → `DELETE /api/v1/auth/delete-account` → soft-delete + sign-in block. Works end to end (the endpoint was added/fixed in the profile-account audit, commit `6ec8677`).
- [x] Custom app icons (webp, all densities)
- [x] **Remote WebView debugging disabled for release** — `capacitor.config.ts` `webContentsDebuggingEnabled` is now `process.env.CAP_DEBUG === 'true'` (was hard `true`). Takes effect on the next `cap sync`. Local debugging: `CAP_DEBUG=true npx cap run android`.
- [x] Security audit landed on `main` — CSP is web-only (static export can't emit headers; mobile relies on the Capacitor `allowNavigation` allowlist + `cleartext:false`), but the bundle fixes apply: `safeHref()` on user-supplied links, and the Google access token is no longer logged to logcat in `src/services/native-auth.ts`.

---

## 🔴 Before building the AAB

### 1. Release SHA-1 → OAuth client  *(also closes the backend `GOOGLE_OAUTH_CLIENT_ID` gap)*

```bash
keytool -list -v -keystore keystores/melodywings-release.keystore -alias melodywings
```

- [ ] Firebase Console → Project Settings → Android app → add the **release SHA-1**
- [ ] Google Cloud Console → Credentials → **Android OAuth client** for package `org.melodywings.app` + that SHA-1
- [ ] Re-download `google-services.json` → `android/app/`
- [ ] Set that OAuth **Web client id** as `GOOGLE_OAUTH_CLIENT_ID` on the Cloud Run backend service (the token-audience check is a no-op until this is set — see backend memory `auth-jwt-audit-2026-08-28`):
  ```bash
  gcloud run services update melodywings-backend --region us-central1 \
    --update-env-vars GOOGLE_OAUTH_CLIENT_ID=<web client id>[,<android client id>]
  ```
  Then confirm normal Google login still works on web + mobile.

### 2. Build the signed AAB (on a machine with internet — `next/font` fetches Google Fonts at build time)

```bash
cd melody-wings-frontend
git checkout main && git pull

set KEYSTORE_PASSWORD=...        # from keystores/release-keystore-credentials.txt
set KEY_PASSWORD=...

npm run mobile:build            # next build (mobile static config) + cap sync android
cd android
gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🟡 Google Play Console

### Store listing
- [ ] App name: **MelodyWings**
- [ ] Short description (≤80): "Connect learners with volunteer music teachers for free online lessons"
- [ ] Full description (≤4000)
- [ ] App icon: 512×512 PNG
- [ ] Feature graphic: 1024×500 PNG
- [ ] Screenshots: 2 min, 5–8 recommended (phone 1080×1920)
- [ ] Category: **Education**
- [ ] Contact email
- [ ] Privacy policy URL: `https://melodywings.org/privacy-policy`

### Content rating
- [ ] IARC questionnaire — Education, no violence / mature content, target 13+

### Data safety form
- [ ] Personal info: name, email (Google Sign-In)
- [ ] Photos: profile pictures (Cloudinary)
- [ ] Device IDs: FCM push token
- [ ] App activity: analytics — **Firebase Analytics on native** (PostHog is web-only; `PostHogProvider` no-ops on Capacitor)
- [ ] Encrypted in transit: Yes
- [ ] Data deletion available: **Yes** — Settings → Delete Account
- [ ] Third parties: Google (auth), Cloudinary (images), Firebase (analytics/push)

---

## 🟡 Device testing (release build)

Phones: budget (Android 7–8), mid (11–12), flagship (13–14).

- [ ] Fresh install → **Google Sign-In on the RELEASE build (production OAuth)** → onboarding
- [ ] Session persists after kill / reopen
- [ ] Airplane mode → offline banner → recovery
- [ ] Profile photo upload (camera + gallery)
- [ ] Push notification receive + tap
- [ ] Back-button navigation + app exit
- [ ] **Delete Account** (Settings → Delete → Confirm → sign-in blocked afterward)

---

## Timeline (est.)

| Task | Duration |
|---|---|
| Release SHA-1 + OAuth client + backend env | 0.5 day |
| Signed AAB + device testing | 2–3 days |
| Store listing (screenshots, copy) | 1 day |
| Submit | 1 day |
| Google review | 3–7 days (up to 14 for a new account) |
| **Total** | **~7–12 days** |

---

## Notes

- Common rejection reasons: broken OAuth on the release build, incomplete data-safety form, no working account deletion — all three are addressed above; verify OAuth on a real release build.
- After approval, no branch merge-back is needed — the mobile project tracks `main`.
