# Build & sign the release AAB

Produces `app-release.aab` for upload to Play. Run on a **networked machine**
(`next/font` fetches Google Fonts at build time) that has the Android SDK.

All paths are relative to `melody-wings-frontend/`.

---

## 0. Prerequisites (one-time)

- **Node 22.x** (`package.json` `engines`).
- **JDK 21** — *recommended over the newer JDKs.* Capacitor 8 / Android Gradle Plugin
  8.7 target JDK 17–21. If `java -version` shows 22+, point Gradle at 21:
  ```bash
  # in this shell only, for the gradle step:
  export JAVA_HOME="/c/Program Files/Java/jdk-21.0.12"   # adjust to your install
  ```
  (Or add `org.gradle.java.home=C:\\Path\\To\\jdk-21` to `android/gradle.properties`
  locally — do **not** commit a machine-specific path.)
- **Android SDK** with the API 36 platform + build-tools (matches
  `android/variables.gradle` `compileSdkVersion = 36`):
  ```bash
  sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
  ```
- `android/local.properties` points `sdk.dir` at that SDK (already present on the
  dev machine).
- **Keystore** present at `keystores/melodywings-release.keystore` (alias
  `melodywings`), and its passwords from `keystores/release-keystore-credentials.txt`.
  ⚠️ **Confirm an off-machine backup of the keystore exists** — losing it means you
  can never update this app.

## 1. Fill the production OAuth client id

Edit `.env.mobile` and replace the placeholder:

```
NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=<the production Web OAuth client id>
```

(The build script warns if it is still `REPLACE_WITH_PROD_WEB_OAUTH_CLIENT_ID`.)
See `09-pre-submission-checklist.md` step 1 for how the OAuth client + release SHA-1
are set up.

## 2. Clean checkout & deps

```bash
git checkout main && git pull
npm ci
```

## 3. Build the web bundle + sync native

```bash
npm run mobile:build
```

This runs: `scripts/use-mobile-config.js` (swap in `next.config.mobile.mjs`, swap
`.env.local`→`.env.mobile`, pull `src/app/dev-login` out) → `next build`
(`output: 'export'` → `out/`) → `scripts/restore-web-config.js` (undo all of that) →
`npx cap sync android` (copy `out/` into `android/app/src/main/assets/public/`,
refresh plugins, write `capacitor.config.json` with
`webContentsDebuggingEnabled:false`).

> If `npm run mobile:build` produces no output in your terminal (seen with nested
> `npm` under Git Bash on Windows), run the four steps by hand:
> ```bash
> node scripts/use-mobile-config.js
> npx next build
> node scripts/restore-web-config.js
> npx cap sync android
> ```
> If `next build` fails, still run `node scripts/restore-web-config.js` before retrying.

**Sanity check the bundle before building the APK:**
```bash
grep -rl "dev-login\|localhost:80" android/app/src/main/assets/public/   # → no matches
test ! -e out/dev-login && echo "dev-login excluded OK"
grep webContentsDebuggingEnabled android/app/src/main/assets/capacitor.config.json  # → false
```

## 4. Bump the version (every upload after the first)

Edit `android/app/build.gradle`:
```gradle
versionCode 2          // +1 every upload to any track
versionName "1.0.1"
```
Keep `NEXT_PUBLIC_CURRENT_VERSION` in `.env.mobile` in sync. *(First upload: leave
`versionCode 1` / `versionName "1.0.0"`.)*

## 5. Build the signed AAB

```bash
cd android

export KEYSTORE_PASSWORD='...'   # from keystores/release-keystore-credentials.txt
export KEY_PASSWORD='...'
export JAVA_HOME="/c/Program Files/Java/jdk-21.0.12"   # if needed (step 0)

./gradlew clean bundleRelease
```

Output:
- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`  ← upload this
- **ProGuard mapping:** `android/app/build/outputs/mapping/release/mapping.txt`
  ← upload to Play (Release → App bundle → upload deobfuscation file) for readable
  crash traces
- **Native debug symbols:** `android/app/build/outputs/native-debug-symbols/release/`
  if generated

Also build a signed APK for local device testing if you want one:
```bash
./gradlew assembleRelease
# android/app/build/outputs/apk/release/app-release.apk
```

## 6. Verify the artifact

```bash
# signature / alias / SHA-256 of the signing cert:
keytool -printcert -jarfile app/build/outputs/apk/release/app-release.apk

# install the AAB the way Play will, on a real device:
bundletool build-apks --bundle=app/build/outputs/bundle/release/app-release.aab \
  --output=mw.apks --mode=universal \
  --ks=../keystores/melodywings-release.keystore --ks-key-alias=melodywings
bundletool install-apks --apks=mw.apks
```

Then run the **release-build checks** in `07-testing-instructions.md` (Google Sign-In
on the release cert is the critical one).

## 7. Upload

- Play Console → Testing → **Internal testing** → Create release → upload
  `app-release.aab` → add release notes from `06` → roll out to internal testers.
- After `07` passes on the internal build, **promote the same release** to
  Production (or create a Production release with the same AAB).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Unable to establish loopback connection` / socket errors starting Gradle | JDK/sandbox issue — use JDK 21 (step 0); ensure no security tool is blocking localhost sockets. |
| `Failed to find Build Tools revision 36.0.0` / `platform android-36` | `sdkmanager` install (step 0). |
| `keystore password was incorrect` | `KEYSTORE_PASSWORD` / `KEY_PASSWORD` not exported in the same shell, or wrong values. |
| Fonts fail / build hangs on "Collecting page data" | No internet — `next/font/google` needs network at build time. |
| Google Sign-In works in debug, fails in release | Release SHA-1 not on the OAuth client, or `google-services.json` not refreshed — `09` step 1. |
| Play rejects: "app requests AD_ID" | add the `tools:node="remove"` line from `05-app-content-declarations.md`. |
