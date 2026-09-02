# Testing instructions (Google review + internal testers)

Paste the "For the Google reviewer" section into **Play Console → App content →
App access**. The rest is for your own internal-testing track.

---

## For the Google reviewer

> MelodyWings requires a Google account to sign in. All features are behind sign-in.
>
> **Test account:** `melodywings.reviewer@gmail.com` — password provided in the
> App access form's credential fields. This account is pre-onboarded as a **learner**
> with an approved verification status, so the reviewer lands directly on the
> learner dashboard.
>
> To see the **volunteer** side, sign in with `melodywings.reviewer.vol@gmail.com`
> (also pre-onboarded, approved).
>
> There is **no payment** anywhere in the app. The "Donate" button opens an external
> web page in the browser and can be ignored for review.
>
> **Account deletion** (Play requirement) is at: bottom nav → **Settings** →
> "Danger Zone" → **Delete Account** → type `DELETE` → confirm. It deletes the
> account and blocks future sign-in.

*(Create both Gmail accounts before submitting. Do not use a personal account. If you
prefer not to share a Google password, instead provide a short screen-recording of a
full learner + volunteer walkthrough and attach it — Play accepts either.)*

---

## Internal testing track — walkthrough for testers

### Setup
1. Join via the internal-testing opt-in link (Play Console → Testing → Internal testing → testers).
2. Install from Play. Confirm the build is `versionName 1.0.0 (1)` in Settings / app info.

### Learner path
1. **Sign in with Google** (a fresh account is fine).
2. Onboarding: pick **Learner** → fill details (name, DOB — must be 13+, city,
   what you want help with) → upload a profile photo → submit for verification.
   *(For testing, an admin can approve, or use the pre-approved reviewer account.)*
3. Dashboard → **Find a volunteer** (`/learner/volunteer`): search, open a volunteer
   card, view profile.
4. **My volunteers / matches** (`/learner/my-volunteers`): review the AI shortlist.
5. **Schedule** (`/learner/schedule`): book a session; check it appears in the calendar.
6. **Instant Sessions** (`/learner/instant-sessions`): request one.
7. **Messages** (`/learner/messages`): open a chat, send a message, confirm the push
   notification arrives on another device.
8. **Community** (`/learner/community`): create a text post; add an image; add a video;
   comment; report a post.
9. **Settings** (`/learner/settings`): toggle notification preferences.

### Volunteer path
1. Sign in with a second Google account → onboarding → **Volunteer** → pick subjects
   & skills, set availability → submit → (admin approves).
2. **Learners** (`/volunteer/learners`): browse, open a learner, start a chat from the
   profile modal.
3. Accept a scheduled session; create a **New Instant Session**; claim one.
4. Run through mark-complete + leave feedback (needs a past session).
5. Check the tutorial widget / "View Demo" link on the dashboard.

### Cross-cutting checks
- Kill and reopen the app → still signed in.
- Airplane mode → offline banner → restore connectivity → recovers.
- Android back button navigates sensibly and exits from the dashboard root.
- Camera + gallery both work for profile photo and community media.
- `/dev-login` is **not** reachable (should 404 / show nothing) — it is excluded from
  the release build.
- **Delete Account** → sign-in is blocked afterward for that account.

### Release-build-only checks (do these on the signed AAB, not a debug build)
- Google Sign-In works when installed from Play / signed with the **release** key
  (this is the #1 thing that breaks — needs the release SHA-1 on the OAuth client;
  see `09`).
- No cleartext / mixed-content errors in `adb logcat`.
- Push notification received and tapping it deep-links to the right screen.
