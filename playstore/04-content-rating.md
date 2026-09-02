# Content rating (IARC questionnaire)

Play Console **Policy → App content → Content ratings**. You answer one
questionnaire; IARC issues ratings for every territory (ESRB, PEGI, USK, etc.).
Answers below reflect MelodyWings as of v1.0.0.

---

## Category

**Reference / Education** (or "Education" if offered as a distinct choice).

## Questionnaire answers

| Topic | Answer | Notes |
|---|---|---|
| Violence (cartoon, fantasy, realistic, gore) | **No** | none |
| Sexual content / nudity | **No** | none |
| Profanity or crude humour | **No** | user content is moderated; no built-in profanity |
| Controlled substances (drugs, alcohol, tobacco) | **No** | none |
| Gambling (simulated or real) | **No** | none |
| Fear / horror content | **No** | none |
| Sexual innuendo | **No** | none |
| **Does the app allow users to interact or exchange content?** | **Yes** | 1:1 chat, community feed with posts/comments, video posts |
| — Users can communicate with other users (text/audio/video/images) | **Yes** | text chat + image/video in community posts. No in-app audio/video calling (sessions run on the volunteer's own external link) |
| — Users can share their location with other users | **No** | only a self-entered city/region shown on profile; no live location |
| — User-generated content is shared with other users | **Yes** | community feed |
| Does the app include content moderation / reporting? | **Yes** | report posts/comments/messages/users; moderator review queue; soft-delete |
| In-app purchases | **No** | the app sells nothing. Donations open an **external website** in the browser; no Play Billing, no digital goods |
| Does the app share the user's physical location with anyone? | **No** | |
| Digital purchases of physical goods/services | **No** | |
| Is this a "news" app? | **No** | |

## Interactivity disclosures (Play asks these alongside the rating)

- **Users interact** — Yes
- **Shares user-provided content** — Yes (community feed)
- **Unrestricted internet access** — the app is a WebView pointed at our own backend;
  no in-app browser to arbitrary URLs except external links the user taps (donate,
  volunteer's session link) which open the system browser. Answer per Console wording
  — typically **No** for "provides an unrestricted web browser".

## Expected resulting ratings (indicative — IARC decides)

| Board | Likely |
|---|---|
| ESRB | Everyone (with "Users Interact" interactive element) |
| PEGI | PEGI 3 with "Users interact" notice, or PEGI 12 if the questionnaire weights chat that way |
| Google Play (global age) | Rated for 3+ / Teen depending on interaction weighting |

## Target age

Set in **App content → Target audience and content** (see `05`): **13 and older**.
Do **not** include under-13 age bands and do **not** opt into "Designed for Families".
