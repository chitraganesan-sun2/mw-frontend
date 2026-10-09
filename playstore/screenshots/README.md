# Play Store phone screenshots - v1.3.0 UI (retaken 2026-10-09)

8 PNGs, 1080 x 2040, 24-bit RGB (no alpha), ratio 1.89 (within Play's 2:1 limit). Upload in this order:

| # | File | Shows |
|---|---|---|
| 1 | `01-my-schedule.png` | My Schedule: next-session banner, search + status filter, Reschedule on a session |
| 2 | `02-reschedule.png` | Reschedule form: volunteer locked, title and details carried over |
| 3 | `03-seek-volunteer.png` | Volunteers list with ratings, skills, Schedule a Session / Start Chat |
| 4 | `04-volunteer-profile.png` | A volunteer profile: bio, subjects, skills, languages |
| 5 | `05-messages.png` | A learner-volunteer conversation |
| 6 | `06-instant-sessions.png` | Instant Sessions posted by volunteers |
| 7 | `07-community.png` | Community feed |
| 8 | `08-landing.png` | Landing screen (Enroll as Learner / Become a Volunteer) |

## How they were made
Captured on a real phone (vivo V2511, 1080 x 2392) with `adb screencap`, from a **production build** of the
web app served from the dev stack (the installed 1.3.0 app talks to production, which has no sample data).
The status bar, Chrome toolbar and system navigation bar were cropped off, so only app UI is visible.
Do Not Disturb was on and every image was checked for notifications / personal data.

Test data: learner `bulk.learner223@dev.local` (6 upcoming sessions) plus a short chat with a volunteer and nicer
session descriptions, all dev-database only. Some seeded people have placeholder surnames (e.g. "Val Completed").
Retake with real-looking names if a reviewer might object.

## Not included
Tablet screenshots (7-inch / 10-inch) - this release targets phones only (see `02-graphic-assets-spec.md`).
