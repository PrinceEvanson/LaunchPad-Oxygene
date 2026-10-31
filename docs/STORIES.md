# Nguvu Pad — User Stories & Build Spec

31 Oct 2026 · Lead (PM): Mat · Team: Designer, Frontend Dev · Hand-in by 13:50

---

## At a glance

We ship 9 must-have stories by 13:20 on one browser with localStorage; usher check-in comes first, then the poll, then the organizer view. Should and could stories only start once every must above them passes its checks.

| ID | Story | Priority | Owner | Effort | Done by |
| --- | --- | --- | --- | --- | --- |
| D1 | Load guest JSON, missing fields show "-" | Must | Dev | 15 min | 11:00 |
| D2 | State survives refresh (new) | Must | Dev | 10 min | 11:00 |
| U1 | Search guests | Must | Dev | 25 min | 11:20 |
| U2 | Check in by code or tap | Must | Dev | 30 min | 11:50 |
| U3 | No double check-in | Must | Dev | 10 min | 11:50 |
| A1 | Vote on a poll | Must | Dev | 30 min | 12:20 |
| A3 | Phone-first layout | Must | Designer + Dev | Ongoing | Checked 13:20 |
| O1 | Check-in count | Must | Dev | 15 min | 13:00 |
| O2 | Live poll results | Must | Dev | 30 min | 13:20 |
| A2 | One vote per device | Should | Dev | 10 min | 12:20 |
| U4 | Undo a check-in | Should | Dev | 15 min | 13:00 |
| D3 | Reset demo data (new) | Should | Dev | 5 min | 13:20 |
| O3 | Export results as CSV | Could | Dev | 15 min | Only if free at 13:20 |

Two stories are new and need team sign-off. D2 makes localStorage actually useful: without it a refresh wipes the door. D3 gives us a clean slate before the demo.

**Open question for the client:** O1 says "X of N". Is N the guest list (~150) or venue capacity (~200)? Until answered, N = number of guests in the file.

---

## Data contract

The dev builds against this shape now on mock data; when the real file arrives we drop it in at `data/guests.json` and nothing else changes.

**Guest file** (array, ~150 records; any field may be missing):

```json
[
  { "name": "Sarah Jenkins", "organization": "Oxygène PR Agency", "ticketType": "VIP", "checkInCode": "4821" },
  { "name": "Michael Vance", "organization": "Apex Tech Corp", "ticketType": "General" },
  { "organization": "Riverside Media", "ticketType": "Press", "checkInCode": "0193" }
]
```

**Poll file** `data/polls.json` (the 3 sample questions):

```json
[
  { "id": "q1", "question": "…", "options": ["…", "…", "…"] }
]
```

**localStorage keys** (all prefixed `lp.` so Reset can clear them in one go):

| Key | Holds | Example |
| --- | --- | --- |
| `lp.checkins` | Guest key → check-in time (ISO) | `{"4821": "2026-10-31T10:42:05Z"}` |
| `lp.votes` | Question id → vote count per option index | `{"q1": [12, 30, 5]}` |
| `lp.myVotes` | Question id → option this device chose | `{"q1": 1}` |

**Rules the dev must follow**

- Guest key = `checkInCode` when present and unique, otherwise `row-<index>`. Never key on name.
- Treat codes as **text**, not numbers: `"0193"` must keep its leading zero. Trim spaces before comparing.
- Search compares lower-case text with accents removed, so "oxygene" finds "Oxygène".
- Listen for the browser `storage` event so the organizer tab updates when the usher tab writes. Same-tab updates come from app state.
- Load the JSON with a local dev server (e.g. `npx vite` or `npx serve`). `fetch()` fails if the page is opened as a `file://` path.

**Data risk:** if the real file uses different field names (e.g. `ticket_type`), map them in one function, `normalizeGuest()`, not across the code.

---

## Usher stories

The door is the client's biggest risk, so these four stories get built and tested first. Design for one hand, a moving queue and a glance at the screen.

### U1 (Must) Search guests

*As an usher, I want to search the guest list so I don't scroll a printed list.*

**Acceptance criteria**

1. Given fewer than 2 letters typed, when I look at the list, then I see all guests A–Z so I can still tap one.
2. Given 2 or more letters, when I type, then the list filters by name **or** organization as I type, ignoring case and accents.
3. Each result shows name, organization, ticket type, and a "Checked in" badge if already in.
4. Given no match, then the screen shows "No guest found" and keeps the code box visible.
5. Missing name or organization shows "-" and never breaks the list.

**Test it:** "sar" finds Sarah Jenkins · "OXYG" and "oxygene" both find Oxygène staff · "zzz" shows No guest found · "s" still shows the full list.

### U2 (Must) Check in by code or tap

*As an usher, I want to type a guest's code to check them in.*

**Acceptance criteria**

1. Given a valid code, when I press Check In (or Enter), then I see "Checked in: Sarah Jenkins" in green and the count goes up by 1.
2. Given an unknown code, then I see "Code 1234 not found" in red, nothing is saved, and the code stays in the box to fix.
3. Given an empty or short entry, then I see "Enter the 4-digit code" and nothing is saved.
4. Given a search result, when I tap its Check In button, then it behaves exactly like a valid code. No confirm dialog: speed matters.
5. The code box opens the number keypad on phones, clears after a success, and keeps focus for the next guest.

**Edge cases:** leading zeros ("0193") · spaces around the code · two guests with the same code (check in the first, log a warning) · a guest with no code can only be checked in by tap.

**Test it:** valid code · invalid code · "12" · " 4821 " with spaces · tap a result.

### U3 (Must) No double check-in

*As an usher, I want a warning if a guest is already in, so nobody gets in twice on one ticket.*

**Acceptance criteria**

1. Given a guest already checked in, when I enter their code or tap them, then I see "Already checked in at 10:42" in amber.
2. The count does not change and the original time is kept.
3. Their row shows "Checked in 10:42" so I can see it before tapping.

**Test it:** check in Sarah, then enter her code again; the count stays the same.

### U4 (Should) Undo a check-in

*As an usher, I want to undo a mistaken check-in.*

**Acceptance criteria**

1. After a successful check-in, the green banner shows an Undo button for 10 seconds.
2. Tapping Undo removes the check-in, the count goes down by 1, and the organizer view updates.
3. A checked-in guest's row also offers Undo (with an "Are you sure?" step, since that row may be old).

**Cut rule:** if U1–U3 are not solid by 12:00, U4 waits until after the organizer view.

---

## Attendee stories

Attendees vote on their own phones with no login, so the screen has to be obvious in five seconds.

### A1 (Must) Vote on a poll

*As an attendee, I want to answer a poll on my phone.*

**Acceptance criteria**

1. The screen shows one question and its options together, with "Question 1 of 3" above it.
2. Each option is a full-width tappable row; tapping selects it and clearly highlights it.
3. Submit stays disabled until an option is selected.
4. When I tap Submit, then the vote is saved to `lp.votes` and I see "Thanks, vote recorded".
5. After the confirmation, a "Next question" button takes me to the next one; after question 3 I see "All done, thank you".

**Test it:** submit with nothing selected (blocked) · pick an option and submit · move through all 3 questions.

**Assumption to confirm at briefing:** all 3 questions are open at once. If the client wants the organizer to release one at a time, we add an "active question" key; that's about 20 minutes.

### A2 (Should) One vote per question per device

*As the organizer, I want each phone to vote once per question so results aren't stuffed.*

**Acceptance criteria**

1. After voting, coming back to that question shows my choice and "You've already voted", with Submit hidden.
2. A second attempt (e.g. from another tab) is blocked with the same message; the count does not change.

**Known limit:** clearing browser data or using private mode resets this. Fine for the demo; say it out loud when presenting.

### A3 (Must) Phone-first

*As an attendee or usher, I want every screen to work on my phone without zooming or sideways scrolling.*

**Acceptance criteria (applies to every screen)**

1. No horizontal scroll at 360 px wide (Chrome DevTools, 360 × 740).
2. Every button, option row and list action is at least 44 px tall (we're designing to 48 px).
3. Text inputs use at least 16 px text, so iPhones don't zoom in when you tap them.
4. Text contrast is at least 4.5:1, so the screen stays readable in a bright lobby.

**Owner split:** the designer specifies sizes in the mockups; the dev checks at 360 px before every check-in (11:20, 12:20, 13:20).

---

## Organizer stories

The organizer view only reads what the usher and vote screens write, so it is quick to build once those work, which is why it comes last.

### O1 (Must) Check-in count

*As an organizer, I want to see how many guests have arrived.*

**Acceptance criteria**

1. Shows "X of N checked in" in large text, with a progress bar and the percentage.
2. N = number of guests in the file (until the client answers the N question).
3. Updates within 1 second of a check-in or undo, in the same tab **and** in another tab of the same browser (`storage` event).

**Test it:** open Organizer in a second tab, check someone in from the Usher tab, and watch the count change without a refresh.

### O2 (Must) Live poll results

*As an organizer, I want to see how people are voting as it happens.*

**Acceptance criteria**

1. One card per question, with the total number of votes.
2. Each option shows its label, its count, its percentage of that question's votes, and a bar sized to the percentage.
3. The leading option is highlighted in orange.
4. With 0 votes, it shows "No votes yet" and empty bars (no divide-by-zero or "NaN%").
5. Updates within 1 second of a new vote, same rules as O1.

**Test it:** vote on Q1 in one tab and watch its card change in the other · check the percentages add up to about 100%.

### O3 (Could) Export results as CSV

*As an organizer, I want to download the results for the client report.*

**Acceptance criteria**

1. An Export CSV button downloads `nguvu-pad-results.csv` with the columns `question, option, votes, percent`.
2. It opens correctly in Excel and Google Sheets (commas inside text are quoted).

**Cut rule:** start only if all musts pass at 13:20. First to go.

---

## Data and cross-cutting stories

These are built first, in the first 20 minutes of dev time, because every other story depends on them.

### D1 (Must) Missing data doesn't break the app

*As the team, we want the app to read the guest JSON safely, because we haven't seen the real file yet.*

**Acceptance criteria**

1. The app loads `data/guests.json` once at start and runs every record through `normalizeGuest()`.
2. Any missing or empty field shows "-" (name, organization, ticket type).
3. A guest with no `checkInCode` still appears and can be checked in by tap, but not by code.
4. Extra fields in the file are ignored.
5. If the file fails to load or isn't valid JSON, the usher screen shows "Guest list could not be loaded", not a blank page.

**Test it:** the mock file includes one record with no name, one with no code and one with no ticket type.

### D2 (Must, new) State survives a refresh

*As an usher, I want check-ins to still be there if the page reloads or the phone locks.*

**Acceptance criteria**

1. Check-ins, vote counts and this device's votes are read from localStorage on load.
2. Every change is written to localStorage immediately, not on exit.

**Test it:** check in 3 guests, vote once, refresh; everything is still there.

### D3 (Should, new) Reset demo data

*As the presenter, I want a clean start before the demo.*

**Acceptance criteria**

1. The organizer view has a small "Reset demo data" button with an "Are you sure?" step.
2. It clears every `lp.` key; the guest list itself is untouched.

### Navigation (part of A3)

The three views sit on one device, so a bottom tab bar switches Usher / Vote / Organizer. Use hash links (`#usher`, `#vote`, `#organizer`) so each view can be opened directly in its own tab for the demo.

---

## Screens and team plan

Three screens, 15 states. The designer delivers each screen with all of its states, and the dev builds to those states, not just the happy path.

| Screen | States the designer must show | Stories | Design due |
| --- | --- | --- | --- |
| Usher | Full list · filtered results · No guest found · success banner (with Undo) · Already checked in · invalid code · list failed to load | U1–U4, D1 | 11:20 |
| Vote | Nothing selected · option selected · vote recorded · already voted · all done | A1–A3 | 11:50 |
| Organizer | Count + bar · results with votes · No votes yet · reset confirm | O1–O3, D3 | 12:20 |

Shared across all three: header with the "oxygène MCL" logo, a bottom tab bar, and the brand guide colours. Touch targets are 48 px.

**Dev task order** (matches the schedule; each line ends with its own quick test):

| Time | Dev builds | Proves |
| --- | --- | --- |
| 10:40–11:00 | Project, tab bar, `normalizeGuest()`, mock JSON, localStorage helpers | D1, D2 |
| 11:00–11:20 | Search list | U1 |
| 11:20–11:50 | Code box, tap check-in, already-in warning | U2, U3 |
| 11:50–12:20 | Poll screen, submit, one vote per device | A1, A2 |
| 12:20–12:50 | Curveball changes (PM decides scope) | — |
| 12:50–13:20 | Organizer count and results, live `storage` updates | O1, O2 |
| 13:20–13:40 | Undo, reset, 360 px pass, bug fixes; CSV only if free | U4, D3, A3, O3 |
| 13:40–13:50 | Final commit, freeze | — |

**PM at each check-in:** 11:20 the usher search demo works on a phone · 12:20 a check-in and a vote both persist after refresh · 13:20 run the acceptance checklist below and make the cuts.

---

## Hand-in readiness

At 13:20 the PM runs this checklist on a phone-sized screen; anything unticked at 13:30 is cut or listed as a known issue in the hand-in note.

**Acceptance checklist (musts)**

- [ ] U1 — "sar" finds Sarah; "zzz" shows No guest found
- [ ] U2 — valid code checks in; bad code shows an error and changes nothing; tap works
- [ ] U3 — second check-in shows "Already checked in at …"; count unchanged
- [ ] A1 — vote on all 3 questions; "Thanks, vote recorded" each time
- [ ] A3 — no sideways scroll at 360 px; all buttons ≥ 44 px
- [ ] O1 — "X of N checked in" updates from another tab without refresh
- [ ] O2 — bars and % update live; 0 votes shows "No votes yet"
- [ ] D1 — mock records with missing fields show "-"
- [ ] D2 — refresh keeps check-ins and votes

**Cut order if time runs out** (first to go at the top): O3 export → D3 reset → U4 undo → A2 one vote. Never cut U1–U3, A1, O1, D1, D2.

**Two-minute demo script**

1. Reset demo data. Open three tabs: `#usher`, `#vote`, `#organizer`.
2. Usher: search "oxyg", tap Sarah → green banner. Enter her code again → "Already checked in". Enter 9999 → error.
3. Organizer tab: the count went up with no refresh.
4. Vote tab: answer Q1 → confirmation; try again → blocked.
5. Organizer tab: the Q1 bar moved.
6. Refresh everything: nothing is lost. Close with the known limitation: one browser only; a real launch needs a shared backend.

**Curveball prep** (likely twists, rough cost, first response):

| If they ask for… | Affects | Effort | First call |
| --- | --- | --- | --- |
| Add a walk-in guest at the door | U1, U2, data | 20 min | Do now: a small form, saved under `lp.walkins` |
| Flag VIPs on arrival | U2 banner | 10 min | Do now: a gold banner when ticketType is VIP |
| Show results on the big screen | O2 | 15 min | Do now: a full-screen results mode |
| Release questions one at a time | A1, O2 | 20 min | Do if A1 is done; else defer |
| Several ushers on different phones | All | Hours (needs a backend) | Explain the limit; defer |
| Swahili or a second language | All copy | 30+ min | Defer; offer it for the poll screen only |

**Curveball impact note template**

- What changed:
- Stories/screens affected:
- Effort and risk:
- Recommendation: do now / defer / cut something to fit

**Hand-in package:** repo link or zip, screen exports from the designer, this doc, and a 5-line note: what's done, what was cut and why, the curveball decision, the known limitation, and how to run it (`npx serve`).

---

## Added after the core build

These came from team and client feedback after the musts were done.

### L1 (Should) Two-role sign-in

*As an organizer, I want staff screens hidden from attendees.*

1. The first screen asks "How are you joining?" with **I'm an attendee** and **I'm an organizer**.
2. An attendee joins with one tap (first name optional) and sees **Poll · Chat · Suggest**.
3. An organizer enters a work email and the staff PIN (demo `2026`) and sees all organizer tabs. A bad email or PIN shows a clear red error.
4. Tapping the initial in the header signs out. The role survives a refresh.

### P1 (Could) Create questions with media

*As an organizer, I want to add my own questions, with images or video, so the poll matches the launch.*

1. Poll tab → **New question** opens a builder: question text, media (None / Image / Video), answer style (Text / Pictures), 2–4 answers.
2. Publishing validates: question written; chosen media attached; every text answer filled, or every picture answer has a photo.
3. Published questions become live; **Make live** switches between questions; attendees can vote once on each.
4. Photos are resized and saved; videos play on the adding device only (demo limit).

### S1 (Could) Attendee suggestions

*As an attendee, I want to suggest something for the session and back other people's ideas.*

1. Suggest tab: text up to 200 characters, optional "Post anonymously", Post button disabled when empty.
2. The list is sorted by upvotes. One upvote per idea per device (tap again to remove). You can't upvote your own.
3. Organizers see the ideas under **Suggestions → From attendees** and can **Mark noted**; attendees then see "Noted by organizers".
