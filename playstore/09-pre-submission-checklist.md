# Pre-submission checklist

The final gate before **Send for review**. Work top to bottom.

---

## 1. Release SHA-1 → Google OAuth  *(the #1 launch blocker)*

```bash
keytool -list -v -keystore keystores/melodywings-release.keystore -alias melodywings
```

- [x] Copy the **SHA-1** and **SHA-256**. *(verified 2026-09-09: SHA-1 =
      `33:31:8E:24:91:D0:7C:40:6C:02:72:7E:33:BC:ED:D1:92:13:3C:5D`, via
      `keytool -list -v` against `keystores/melodywings-release.keystore` using
      `keystores/release-keystore-credentials.txt`)*
- [x] Firebase Console → Project settings → your Android app (`org.melodywings.app`)
      → **Add fingerprint** → paste the release SHA-1. *(done 2026-09-09 — confirmed the
      registered fingerprint is an exact match for the release keystore's SHA-1 above, not
      a leftover debug one as first suspected. Debug fingerprint not separately added — only
      needed if you plan to test Google Sign-In from debug builds too.)*
- [x] Google Cloud Console → APIs & Services → Credentials → create/confirm an
      **Android OAuth client** for package `org.melodywings.app` + release SHA-1.
      *(auto-created by Firebase when the fingerprint above was added — confirmed present
      in `google-services.json`'s `oauth_client` list as `client_type: 1` with the matching
      `certificate_hash`, client id `781782361175-vj7vahqnqubn995ifalqg8fdt4vma094...`. No
      separate manual step needed.)*
- [x] Note the **Web** OAuth client id (Identity for the token exchange) →
      put it in `.env.mobile` as `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` (runbook step 1). *(done 2026-09-08)*
- [x] Firebase → Download the updated **`google-services.json`** → replace
      `android/app/google-services.json`. *(present and current as of 2026-09-09 — content
      matches what Firebase Console shows now.)*
- [x] Backend: set the token-audience env on Cloud Run (it is a **no-op until set** —
      per backend memory `auth-jwt-audit-2026-08-28`). *(done 2026-09-09, revision
      `melodywings-backend-00123-bcd`)*
- [x] Rebuild the AAB (`08`) **after** `google-services.json` + `.env.mobile` are updated.
      *(done 2026-09-09 via Android Studio Generate Signed Bundle/APK)*
- [x] Smoke-test Google Sign-In on a device running the **release-signed** build. *(done
      2026-09-09 — found and fixed a real bug: the app's access token is minted under the
      Android OAuth client, not just the Web one, so `GOOGLE_OAUTH_CLIENT_ID` needed both ids.
      Now returns 200 on revision `melodywings-backend-00124-hxk`.)*

## 2. Keystore safety

- [ ] `keystores/melodywings-release.keystore` has an **off-machine backup** (password
      manager / secure vault). Losing it = cannot ever update the app.
- [ ] Passwords recorded somewhere other than the build machine.
- [ ] Consider enrolling in **Play App Signing** (recommended) — you still keep the
      upload key; Google manages the app signing key.

## 3. Build hygiene (verified 2026-09-02, re-verify on the real build)

- [x] `cap sync` run against current `main` — native bundle has all latest features.
- [x] `/dev-login` excluded from the mobile export (build script) — no `dev-login`
      string in `android/app/src/main/assets/public/`.
- [x] `.env.mobile` used for the build, not a developer `.env.local` — no
      `localhost` / `ENABLE_DEV_LOGIN=true` in the synced bundle.
- [x] `capacitor.config.json`: `webContentsDebuggingEnabled:false`, `cleartext:false`,
      `allowNavigation` scoped to the Cloud Run host.
- [x] `AndroidManifest.xml`: `usesCleartextTraffic="false"` + `network_security_config.xml`.
- [x] `build.gradle` release: `minifyEnabled`, `shrinkResources`, ProGuard rules, release `signingConfig`.
- [x] `.env.mobile` `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` no longer the placeholder. *(done 2026-09-08)*
- [ ] `versionCode` / `versionName` correct for this upload (`06`).
- [ ] (tidy, optional) add `android:maxSdkVersion="32"` to `WRITE_EXTERNAL_STORAGE`
      in `AndroidManifest.xml` (`05`).
- [ ] (tidy, optional) `AD_ID` removal line if Play flags it (`05` / `08`).

## 4. Store listing & policy (Console)

- [ ] Main store listing complete — `01` (name, short & full description, contact email, category **Education**).
- [ ] Graphics uploaded — `02` (512 icon, 1024×500 feature graphic, ≥2 phone screenshots).
- [ ] Privacy policy URL live at `https://melodywings.org/privacy-policy` and covers
      everything in the Data safety form — `10`.
- [ ] Data safety form submitted — `03`.
- [ ] Content rating (IARC) questionnaire submitted — `04`.
- [ ] App access: reviewer credentials/instructions provided — `07`.
- [ ] Target audience = 13+, not "Designed for Families" — `05`.
- [ ] Ads = No; News = No; Government = No; Financial features = No — `05`.

## 5. Release

- [ ] Upload AAB to **Internal testing** first.
- [ ] Run `07-testing-instructions.md` end to end on the internal build, including the
      release-build-only checks and **Delete Account**.
- [ ] Promote to **Production**, paste "What's new" from `06`.
- [ ] Countries/regions selected.
- [ ] **Send for review.** New-account review can take up to ~14 days.

## 6. Post-approval

- [ ] Tag the release commit (`git tag v1.0.0`).
- [ ] Upload `mapping.txt` for the release if not done at upload time.
- [ ] No branch merge-back needed — the mobile project tracks `main`.
