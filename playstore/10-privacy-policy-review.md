# Privacy policy — cross-check vs. what we declare

Google requires the **privacy policy** (hosted at
`https://melodywings.org/privacy-policy`) to disclose **at least** everything the
**Data safety form** (`03`) declares, and to cover the mobile app — not just the
website. The policy source is `src/components/consents/privacy-policy/data.ts`
(31 sections). This file lists what to reconcile **before** submitting. It does **not**
rewrite the policy — that's for the policy owner / legal (Privacy Officer: Chitra
Ganesan, per the CONTACT US section).

---

## ✅ Already covered by the current policy

- "We do not sell your personal information."
- Information we collect (incl. financial info for donations), how we use it.
- Cookie policy, data-security measures, disclosure of personal information.
- California + other US state privacy rights; CAN-SPAM; DMCA; contact details.
- COPPA section for under-13 and an opt-in section for minors under 16.

## ⚠️ Gaps / mismatches to fix before submission

### 1. Third-party service provider list is out of date for the mobile app
`data.ts` → section **"LIST OF THIRD-PARTY SERVICE PROVIDERS"** currently lists:
Vercel, Render, GitHub, Alphabet, Cloudinary, Cloudflare, Stripe, PayPal.

The mobile app actually relies on:

| Add / correct | Used for |
|---|---|
| **Google Cloud (Cloud Run)** | backend hosting — replaces/【joins】 "Render" for the app backend |
| **Google Firebase (Cloud Messaging + Analytics)** | push notifications, native analytics — **not listed at all** |
| **Google Identity / Sign-In** | authentication — implied by "Alphabet" but should be explicit |
| **Google Gemini API** | generating the volunteer↔learner match shortlist from profile text — **not listed at all** |
| Cloudinary | already listed ✓ (media storage) |
| Stripe / PayPal | donations only, via an external page — keep, but clarify scope |

→ Update the table so the Data safety "processors" (see `03` §4) all appear.

### 2. Device identifiers / push tokens
Confirm the "INFORMATION WE COLLECT" / "HOW DO WE COLLECT INFORMATION?" sections
mention **device identifiers and push notification tokens** (FCM registration token,
Firebase installation ID, Analytics app-instance ID). If not, add them — `03`
declares "Device or other IDs" as collected.

### 3. In-app account & data deletion
Add an explicit line (in "OTHER PRIVACY RIGHTS" or "CHOICES USERS HAVE"):
> "You can permanently delete your account and associated data at any time from
> **Settings → Delete Account** in the app, or by emailing support@melodywings.org.
> Deletion disables the account immediately and removes personal data within
> [X days]; some records may be retained where required by law."

`03` and `05` both assert deletion is available — the policy must say so and give a
retention period.

### 4. Native analytics
The cookie section covers web analytics. Add a sentence that the mobile app uses
**Firebase Analytics** for aggregate usage metrics (PostHog is web-only and disabled
on mobile).

### 5. Special educational needs / disability information
If onboarding collects health-related SEN details (see the warning in `03` §2),
the policy should name this category, its purpose (helping tutors prepare), and that
it is optional and not shared.

### 6. Children — reconcile with the Play target-audience choice  *(decision needed)*
The policy's COPPA section contemplates **under-13** learners with parental consent
("Category I Learners"). For Play you must pick one:

- **(recommended)** Target audience **13+**, younger learners participate through a
  **parent/guardian** account. Keep the COPPA section as-is for the website, but the
  app store entry stays 13+ and out of "Designed for Families". Least friction.
- Target **under-13** on Play → triggers the **Families policy**: stricter ads/SDK
  rules, a separate content review, mandatory "Teacher Approved"/Families data
  requirements. Only choose this deliberately.

`04` / `05` assume the recommended option.

---

## Sign-off

- [ ] Policy owner updates `data.ts` (and the deployed `melodywings.org/privacy-policy`)
      for gaps 1–5.
- [ ] Children/target-audience decision made and reflected consistently in `04`, `05`, `07`.
- [ ] `https://melodywings.org/privacy-policy` loads publicly (no login, no geoblock)
      and matches the deployed content.
- [ ] Final Data safety summary (downloaded from Console after submitting `03`) diffed
      against the updated policy — policy ⊇ form.
