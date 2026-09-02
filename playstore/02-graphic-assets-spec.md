# Graphic assets — spec for the designer

Play Console **Store listing → Graphics**. None of these can be generated from the
repo; this is the brief. All PNG or JPEG, no alpha on the feature graphic, sRGB.

---

## Required

### 1. App icon — 512 × 512 PNG (32-bit, with alpha)

- Source of truth for the mark: `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp`
  (192 px) and `ic_launcher_foreground.webp`. Re-export the vector/master at 512.
- No rounded-corner mask, no drop shadow — Play applies its own mask.
- Must visually match the installed launcher icon (adaptive icon is at
  `res/mipmap-anydpi-v26/`).

### 2. Feature graphic — 1024 × 500 PNG/JPEG (no transparency)

- Shown at the top of the listing and in promo spots.
- Content brief: MelodyWings wordmark + logo left-of-centre; short line
  "Free 1:1 tutoring, powered by volunteers"; warm, optimistic palette pulled from
  the app (`tailwind.config.ts` brand colours). Keep the right third clear — Play
  overlays a play button when a promo video is set.
- No screenshots-inside-graphic, no claims like "#1" / "Best".

### 3. Phone screenshots — 2 to 8, PNG/JPEG

- 16:9 or 9:16, min dimension 1080 px. Recommended **1080 × 1920** portrait.
- Capture on a device/emulator from a **seeded reviewer account with no real PII**
  (see `07-testing-instructions.md`). Blur or fake any names/photos.
- Capture the release-candidate build so the UI matches what reviewers see.

Recommended set (8), in this order:

| # | Screen | Route | Why |
|---|---|---|---|
| 1 | Landing / value prop | `/` | First impression |
| 2 | Volunteer discovery / tiered search | `/learner/volunteer` | Core learner action |
| 3 | Match results | `/learner/my-volunteers` | The matching feature |
| 4 | Schedule / calendar | `/learner/schedule` | Booking a session |
| 5 | Instant Sessions | `/learner/instant-sessions` | Differentiator |
| 6 | Community feed | `/learner/community` | Engagement |
| 7 | Messages / chat | `/learner/messages` | Communication |
| 8 | Profile with skills | `/volunteer/profile` | Trust / completeness |

Optional captions (short, benefit-led) can be added as a banded overlay — keep them
out of the top and bottom 100 px (system bars).

---

## Optional (improves placement, not required for approval)

- **7-inch tablet screenshots** — 1–8, min 1080 px.
- **10-inch tablet screenshots** — 1–8, min 1080 px.
- **Promo video** — a YouTube URL (the learner demo above can be reused).

---

## Not needed

- TV banner, Wear, Auto, Chromebook assets — this release targets phones/tablets only.
