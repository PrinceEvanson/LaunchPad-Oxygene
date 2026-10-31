# Changes — Nguvu Pad

Every change made to the app during the build on 31 Oct 2026, newest first.
Each entry says what changed and where to find it.

---

## 13:33 — "by oxygène MCL" under the logo
- A small **by oxygène MCL** line now sits under the **nguvu PAD** logo in the header and on the sign-in screen.
- The pitch deck cover and its three phone mockups show it too.
- *Where:* logo block in `src/App.js` (header and sign-in screen).

## 13:31 — Logo changed to nguvu PAD
- The **oxygène MCL** wordmark is replaced by **nguvu PAD**: "nguvu" in white, "PAD" in bold orange.
- The repeated name pill next to the header logo is removed. On the sign-in screen the pill now says "Event app".
- The chat banner reads "Nguvu Pad Chat Hub • Live from Two Rivers, Nairobi".
- The page title is "Nguvu Pad". Oxygène is removed from two placeholders (email field, image-description example).
- Oxygène still appears where it names the **client** (for example the guest organisation "Oxygène PR Agency").

## 13:29 — Product renamed LaunchPad → Nguvu Pad
- Renamed in the app, README, `docs/`, `package.json` (`nguvu-pad`) and the pitch deck.
- The internal save key stays `launchpad_oxygene_v1`, so existing check-ins and votes are kept.

## 13:12 — Voice-over switch and spoken ideas on the suggestion screens
- A **Voice-over on/off** button sits on the attendee **Suggest** screen and the organizer **Suggestions** screen. Turning it on reads the screen straight away.
- **Speak your idea**: a mic button under the suggestion box dictates the idea (up to 200 characters).
- *Where:* `toggleVO`, `dictateIdea`; `dictate(target)` now fills either the chat box or the idea box.

## 13:04 — Voice-over for polls and suggestions
- New Accessibility setting: **Voice-over for polls and suggestions** (off by default). When on, it reads aloud:
  - the question and answers when Poll opens, or when a new question goes live
  - "Selected B, …" when you pick an answer, and "Vote submitted" when you submit
  - the top 5 ideas when Suggest opens; posts and upvotes are confirmed by voice
  - the top suggestion when an organizer opens Suggestions, and "Marked helpful / not helpful"
- **Listen** buttons on the poll question, live results (dashboard), top suggestion, all suggestions and attendee ideas, plus a speaker button on every idea.
- *Where:* `vo()`, `readResults()`, `readIdeaList()`, `componentDidUpdate()`.

## 12:55 — Accessibility for blind and deaf guests
- **Accessibility panel:** a new ♿ button in the header, with switches for read new messages aloud, vibrate on new messages (on by default) and show transcripts automatically.
- **Chat:**
  - a read-aloud speaker on every message
  - screen-reader announcements for new messages; the chat is marked as a live log
  - a **mic button** for voice typing
  - vibration and an orange **unread badge** on the Chat tab
  - **Need support?** chips for attendees: live captions, Kenyan Sign Language (KSL) interpreter, front seat, describe the slides
  - organizers see these as highlighted **Access request** messages and have matching quick replies
- **Polls:**
  - a **Listen** button on every question
  - images take an **image description** for screen readers
  - videos **can't be published without a transcript**; attendees tap **Show transcript**
- *Where:* `speak()`, `announce()`, `announceIncoming()`, `dictate()`, `readPoll()`, setting `a11y`.

## 12:31 — Suggestions from attendees
- A new attendee tab, **Suggest**: post an idea (200 characters, optionally anonymous) and upvote others' ideas (one each, tap again to remove, you can't upvote your own).
- Organizers see the ideas under **Suggestions → From attendees**, ranked by votes, and can **Mark noted**. Attendees then see "Noted by organizers".
- Three sample ideas start the list. "Simulate live traffic" also adds upvotes.
- *Where:* `postIdea()`, `upvoteIdea()`, `toggleNoted()`, state `ideas`, `myIdeaVotes`.

## 12:24 — Organizers create poll questions with images, video and picture answers
- Poll tab (organizer): a **Questions** panel listing every question with a **Live** badge or **Make live** button.
- The **New question** builder takes:
  - question text
  - media: None / Image / Video
  - answer style: **Text** or **Pictures** (2-column photo cards)
  - 2–4 answers
- Publishing checks for missing pieces, then makes the question live.
- The dashboard results and the top suggestion follow whichever question is live.
- Photos are resized and saved. Videos play only on the device that added them.
- *Where:* `publishQuestion()`, `readImage()`, `setB()`, state `customPolls`, `activePoll`, `myVotes`.

## 12:21 — "RL" renamed to Suggestions
- The **Co-Pilot** tab is now **Suggestions**.
- Wording changes:
  - "Reinforcement loop" → **Session suggestions**
  - "Adaptive insight" → **Top suggestion**
  - "+1.0 Reward / −1.0 Penalty" → **Helpful / Not helpful**
  - "reward score" → **Score**
  - "Collective ranking queue" → **All suggestions**

## 12:14 — Sign-in with two roles
- The first screen asks **How are you joining?**
  - **Attendee:** one tap, first name optional. Tabs: Poll, Chat (and Suggest, added later).
  - **Organizer:** work email + staff PIN (**2026** for the demo). Tabs: Check-in, Poll, Live, Chat, Suggestions.
- Tap your initial in the header to sign out. The role survives a refresh.
- Chat: attendee messages show on the right in navy; Curator replies are orange.
- *Where:* `signInOrganizer()`, `joinAttendee()`, `signOut()`, state `role`.

## 12:36 — Moved to a VS Code project
- The design is converted into a **Vite + Preact + htm** project (`npm install`, `npm run dev`).
- The layout is responsive: full width on phones, up to 480 px on laptops.
- Added `README.md`, `docs/STORIES.md`, `docs/HANDOFF.md`, `docs/PITCH.md` and `.vscode/` recommendations.

## 10:42 — Tribal print bands
- Navy-and-orange tribal print strips sit under the header and above the tab bar (`public/tribal.svg`).

## 10:35 — First design
- Five screens from the brief: **usher check-in**, **live poll**, **organizer dashboard**, **concierge chat**, **suggestions** (originally the AI Co-Pilot).
- Navy `#0F172A` and orange `#F97316` palette, 48 px touch targets, check-in by code or tap with Undo, live results, demo traffic simulation and reset.
- Everything saves to `localStorage`.

---

## Known limitations (unchanged)
- **One browser:** `localStorage` doesn't sync between phones; that needs a shared backend.
- **Videos:** poll videos aren't saved after a refresh (their transcripts are).
- **Demo sign-in:** the staff PIN is a front-end check, not real security.
- **Voice typing:** needs Chrome or Edge with microphone permission.
