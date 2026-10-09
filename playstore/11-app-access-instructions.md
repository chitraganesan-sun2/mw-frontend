# App access instructions (Play Console -> App content -> App access)

MelodyWings signs users in with **Google only** (no username / password of our own), and every
feature is behind sign-in. Google's reviewers therefore need two ready-made Google accounts.
Rejections for "reviewer cannot sign in" are common, so prepare these carefully.

## 1. In Play Console
Choose **All or some functionality is restricted**, then **Add new instructions** - twice (one learner, one volunteer).

### Instruction set 1 - Learner
- **Instruction name:** MelodyWings - Learner review account
- **Username:** `<REVIEWER_LEARNER_GMAIL>`
- **Password:** `<set in the Console form only - never commit it>`
- **Any other information required to access your app** (784 characters, limit 1,000):

```
MelodyWings has NO username/password login: it uses "Sign in with Google" only.
1) Tap Log In > Sign in with Google and pick the account above (2-step verification is OFF). You land on the LEARNER dashboard (My Schedule). The account is already onboarded and approved, in the United States.
2) For the VOLUNTEER side, use the second instruction set.
Learners only see volunteers from their own country; both review accounts are US, so Volunteers > Schedule a Session / Start Chat work, and sample sessions, chats and posts already exist.
Delete Account: menu > Settings > Danger Zone > type DELETE. Web: melodywings.org/delete-account. Please do not delete the review accounts until review is finished.
Donate is an optional one-time charitable donation page (not a digital purchase).
```

### Instruction set 2 - Volunteer
- **Instruction name:** MelodyWings - Volunteer review account
- **Username:** `<REVIEWER_VOLUNTEER_GMAIL>`
- **Password:** `<set in the Console form only>`
- **Any other information** (519 characters):

```
Same sign-in: Log In > Sign in with Google > use the account above (2-step verification OFF). You land on the VOLUNTEER dashboard (My Schedule). The account is onboarded and approved, in the United States, with availability set.
Try: Learners (browse, Start Chat), Instant Sessions (Start a New Session), My Schedule (accept a request, Reschedule), Community.
This account has sample learners, sessions and chats shared with the learner review account.
Please do not delete the review accounts until review is finished.
```

## 2. Prepare the two accounts (nobody but you can do this)
1. **Create two new Gmail accounts** owned by MelodyWings (not personal ones). **Turn 2-step
   verification OFF** on both - a reviewer cannot receive a code. Keep the recovery email/phone on a
   team mailbox in case Google asks to verify.
2. **Onboard both on the live app** (Android build or the website), using **Sign in with Google**:
   - **Learner:** country **United States**, time zone Eastern, date of birth that passes the age rule,
     a profile photo (required at the final step), learning goals, and the required special-needs section.
   - **Volunteer:** adult (18+), same country and time zone, skills and subjects, **availability slots**,
     profile photo, background-check answers and consent.
3. **Approve both in the admin console** so each reaches `verification_completed`. Until then the
   learner cannot see volunteers and nothing in the app works.
4. **Create sample data between the two review accounts only** (emails go to your two Gmail inboxes,
   so no real person is affected): the learner books a session with the volunteer and the volunteer
   accepts it; the volunteer posts an Instant Session; exchange a few chat messages; make a community
   post from each; leave a rating if a past session exists. Reviewers should never see empty screens.
5. **Prove it works from scratch:** on a phone that has never used these accounts, install the app from
   the Internal-testing track and sign in using **only the written instructions**. Google often shows a
   "verify it's you" prompt on a new device - sign in once from the same network the reviewers are
   unlikely to use, answer the prompt, and confirm it does not reappear.
6. **Backup (recommended):** record a 3-5 minute screen video of a full learner + volunteer
   walkthrough, upload it as **unlisted**, and add the link to "Any other information" (shorten the
   text above if needed to stay under 1,000 characters). Play accepts a video instead of credentials.
7. **Do not delete or change the review accounts** until the app is approved, and keep the app
   signed-out state tested (no leftover local sessions).
8. Store the passwords in the team password manager, and change them after approval.

## 3. Facts reviewers may check (all verified in the code)
- **Region:** the service is for use **outside the European Union** (privacy policy, "Territorial
  Restriction"). Use US accounts as above.
- **Same-country rule:** a learner only sees and can message volunteers from their own country, which is
  why both review accounts must share a country.
- **Account deletion:** in-app (Settings -> Danger Zone -> Delete Account -> type DELETE) and on the web
  at `https://melodywings.org/delete-account`. It hard-deletes the account and the user's uploaded files.
- **Donate** is a page inside the app for optional one-time charitable donations (Stripe). It is not a
  purchase of digital goods and does not use Play Billing. *(Confirm with the team that the
  organisation's nonprofit status is documented, in case Play asks.)*
- **Content:** learners may be minors; chat is one-to-one between a matched learner and volunteer, with
  reporting available on community posts. Target audience is 13+ (see `05`).
- `/dev-login` is excluded from the release build.
