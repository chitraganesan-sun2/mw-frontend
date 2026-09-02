/**
 * Pre-build script for mobile: swaps next.config.mjs with next.config.mobile.mjs
 * and removes incompatible dynamic route configs for static export.
 *
 * It also makes the build production-safe for the Play Store:
 *   - excludes the /dev-login helper route from the export entirely
 *   - swaps a developer's .env.local for the tracked .env.mobile so no local
 *     override (dev-login flag, localhost URLs, ...) leaks into the AAB
 * restore-web-config.js reverses all of this.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const webConfig = path.join(root, 'next.config.mjs');
const webConfigJs = path.join(root, 'next.config.js');
const mobileConfig = path.join(root, 'next.config.mobile.mjs');
const backupConfig = path.join(root, 'next.config.web-backup.mjs');
const backupConfigJs = path.join(root, 'next.config.web-backup.js');
const layoutFile = path.join(root, 'src', 'app', 'layout.tsx');
const layoutBackup = path.join(root, 'src', 'app', 'layout.tsx.web-backup');
const middlewareFile = path.join(root, 'src', 'middleware.ts');
const middlewareBackup = path.join(root, 'src', 'middleware.ts.web-backup');
const devLoginDir = path.join(root, 'src', 'app', 'dev-login');
// Keep the backup OUTSIDE src/app/ — anything under src/app/ becomes a route,
// so `src/app/dev-login.web-backup` would ship as `/dev-login.web-backup`.
const devLoginBackup = path.join(root, '.dev-login.web-backup');
const envLocal = path.join(root, '.env.local');
const envLocalBackup = path.join(root, '.env.local.web-backup');
const envLocalAbsentMarker = path.join(root, '.env.local.web-absent');
const envMobile = path.join(root, '.env.mobile');

// Backup and remove next.config.js (it takes precedence over .mjs)
if (fs.existsSync(webConfigJs)) {
  fs.renameSync(webConfigJs, backupConfigJs);
  console.log('✓ Moved next.config.js → next.config.web-backup.js (would override .mjs)');
}

// Backup the web config .mjs
if (fs.existsSync(webConfig)) {
  fs.copyFileSync(webConfig, backupConfig);
  console.log('✓ Backed up next.config.mjs → next.config.web-backup.mjs');
}

// Copy mobile config in place
if (fs.existsSync(mobileConfig)) {
  fs.copyFileSync(mobileConfig, webConfig);
  console.log('✓ Replaced next.config.mjs with mobile config (static export enabled)');
} else {
  console.error('✗ next.config.mobile.mjs not found!');
  process.exit(1);
}

// Remove 'force-dynamic' from layout.tsx (incompatible with output: 'export')
if (fs.existsSync(layoutFile)) {
  fs.copyFileSync(layoutFile, layoutBackup);
  let content = fs.readFileSync(layoutFile, 'utf8');
  content = content.replace(/\/\/ Force dynamic rendering.*\n/g, '');
  content = content.replace(/export const dynamic = ['"]force-dynamic['"];\n?/g, '');
  fs.writeFileSync(layoutFile, content, 'utf8');
  console.log('✓ Removed force-dynamic from layout.tsx for static export');
}

// Temporarily rename middleware.ts (incompatible with static export)
if (fs.existsSync(middlewareFile)) {
  fs.renameSync(middlewareFile, middlewareBackup);
  console.log('✓ Disabled middleware.ts for static export (moved to .web-backup)');
}

// Exclude the /dev-login helper route from the mobile export. It is only meant
// for the local docker stack (calls the backend's ENVIRONMENT=dev-only
// POST /api/v1/dev/login). Belt-and-suspenders alongside the env swap below.
if (fs.existsSync(devLoginDir)) {
  fs.renameSync(devLoginDir, devLoginBackup);
  console.log('✓ Excluded src/app/dev-login from the mobile export (moved to .web-backup)');
}

// Swap in the tracked mobile env so the export never inherits a developer's
// .env.local (dev-login flag, localhost API URL, web-only analytics keys, ...).
if (!fs.existsSync(envMobile)) {
  console.error('✗ .env.mobile not found! Cannot guarantee a production-safe env.');
  process.exit(1);
}
if (fs.existsSync(envLocal)) {
  fs.renameSync(envLocal, envLocalBackup);
  console.log('✓ Backed up .env.local → .env.local.web-backup');
} else {
  // Record that there was no .env.local so restore can delete the one we write.
  fs.writeFileSync(envLocalAbsentMarker, '', 'utf8');
}
fs.copyFileSync(envMobile, envLocal);
console.log('✓ Copied .env.mobile → .env.local for the mobile build');

const envMobileText = fs.readFileSync(envMobile, 'utf8');
if (/REPLACE_WITH_PROD_WEB_OAUTH_CLIENT_ID/.test(envMobileText)) {
  console.warn(
    '⚠ .env.mobile still has the placeholder NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID — ' +
      'Google Sign-In will not work on a real release build. See ' +
      'playstore/09-pre-submission-checklist.md.'
  );
}
