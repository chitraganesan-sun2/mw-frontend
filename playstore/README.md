# MelodyWings — Play Store submission packet

Everything needed to publish **MelodyWings** (`org.melodywings.app`) to Google Play,
version **1.0.0 / versionCode 1** (first upload).

The top-level [`../PLAYSTORE-RELEASE-CHECKLIST.md`](../PLAYSTORE-RELEASE-CHECKLIST.md)
is the short status board. This folder is the detail: copy-paste-ready text for each
Play Console screen, plus the build runbook.

## Files

| # | File | Play Console area |
|---|---|---|
| 01 | [`01-store-listing.md`](01-store-listing.md) | Store presence → Main store listing |
| 02 | [`02-graphic-assets-spec.md`](02-graphic-assets-spec.md) | Store listing → Graphics (what the designer must produce) |
| 03 | [`03-data-safety.md`](03-data-safety.md) | Policy → App content → Data safety |
| 04 | [`04-content-rating.md`](04-content-rating.md) | Policy → App content → Content ratings (IARC) |
| 05 | [`05-app-content-declarations.md`](05-app-content-declarations.md) | Policy → App content (all other declarations) |
| 06 | [`06-release-notes.md`](06-release-notes.md) | Release → Production → "What's new" |
| 07 | [`07-testing-instructions.md`](07-testing-instructions.md) | Release → Testing instructions / reviewer notes |
| 08 | [`08-build-and-sign-runbook.md`](08-build-and-sign-runbook.md) | How to produce the signed `.aab` |
| 09 | [`09-pre-submission-checklist.md`](09-pre-submission-checklist.md) | Final gate before hitting "Send for review" |
| 10 | [`10-privacy-policy-review.md`](10-privacy-policy-review.md) | Cross-check the hosted privacy policy vs. what we declare |

## Suggested order

1. **Build side** — work through `09` and `08`: release SHA-1 → OAuth client →
   backend env → signed AAB → device smoke test.
2. **Console side** — create the app, then fill `01` → `02` → `05` → `03` → `04`.
3. Upload the AAB to the **internal testing** track first; run `07` end-to-end.
4. Promote to **production**, paste `06`, send for review.

## Human-only steps (cannot be done from the repo)

- Provide `KEYSTORE_PASSWORD` / `KEY_PASSWORD` and run `gradlew bundleRelease` (`08`).
- Add the release **SHA-1** to Firebase + create the Android OAuth client (`09`).
- Set `GOOGLE_OAUTH_CLIENT_ID` on the Cloud Run backend (`09`).
- Confirm an **off-machine backup** of `keystores/melodywings-release.keystore`.
- Produce the real PNG **graphic assets + screenshots** (`02`).
- Enter everything into Play Console and complete the IARC questionnaire (`03`, `04`, `05`).

## What changed in the repo for Play Store readiness (2026-09-02)

- `cap sync android` re-run so the native bundle carries every feature merged since
  the Aug 21 sync (instant sessions, matching, community video, chat, security pass).
- `scripts/use-mobile-config.js` / `restore-web-config.js` now also:
  - **exclude `src/app/dev-login`** from the mobile export, and
  - swap a developer's `.env.local` for the tracked **`.env.mobile`** during the build,
  so the store bundle can never inherit `NEXT_PUBLIC_ENABLE_DEV_LOGIN=true` or a
  localhost API URL. Verified: no `dev-login` / `localhost` strings in
  `android/app/src/main/assets/public/`.
- `capacitor.config.json` synced with `webContentsDebuggingEnabled: false`.
