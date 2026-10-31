# LaunchPad — Progress / Context Reference

Auto-generated context snapshot for the LaunchPad (Oxygène MCL) event app. No chat text beyond this file.

## Recent progress

**2026-10-31 — Merged `feature/responsive-ui` into `Matthew-Branch`**

- Fetched `origin/feature/responsive-ui` from `https://github.com/PrinceEvanson/LaunchPad-Oxygene` and merged it into the local `Matthew-Branch` branch.
- Merge base: `a9ba279` ("Rebuild LaunchPad as clean, mobile-first Preact app"). Both branches had diverged: Matthew-Branch added the Dockerfile + Nguvu Pad rename + accessibility/voice-over; `feature/responsive-ui` added responsive layout improvements.
- Conflicts resolved in 4 files by combining both sides (kept Nguvu Pad a11y/voice-over features AND responsive wrappers/classes):
  - `src/App.js` — login shell (`app-auth` + live announcer), builder backdrop + A11yPanel, tab labels (`nav-full`/`nav-short`) + unread chat badge
  - `src/styles.css` — responsive `.nav-label`/`.nav-short` + `.nav-badge`, toast positioning via `--nav-clear`, composer padding via `--nav-clear`
  - `src/screens/Ideas.js` — `page page-split`/`page-col` wrapper + VoToggle + Listen + SpeakBtn
  - `src/screens/Suggestions.js` — `page page-split`/`page-col` + VoToggle + Listen/SpeakBtn + responsive ranked/idea lists
- `src/Poll.js` and the remaining 17 files auto-merged cleanly.
- Production build (`npm run build`) passes: `dist/` built, 63.6 kB JS / 34.1 kB CSS.
- Merge commit: `2a81d36` on `Matthew-Branch`. Working tree clean (only untracked: `CHANGES (2).md`, `progres.md`).


## Project identity

- **Product:** LaunchPad — phone-first event app for the Oxygène MCL product launch at Two Rivers Business Park, South Tower, 5th floor, Nairobi.
- **App root:** `C:\Users\matew\OneDrive\Documents\simba\launchpad-app`
- **Package name:** `launchpad-oxygene` (version 1.0.0, private)
- **Description:** Usher check-in, live polls, chat, suggestions and organizer dashboard. One app, two roles.
- **Repo state:** Root `simba` git repo exists on branch `main` with **no commits yet**. `launchpad-app/` contains its own `.git/`, `node_modules/`, `dist/`.
- **Archive present:** `launchpad-app.zip` at repo root.

## Stack & scripts

- **Build tool:** Vite 6 (`vite.config.js`, port 5173, build outDir `dist`, sourcemaps on)
- **UI framework:** Preact 10.29.8 + `htm` tagged templates (no JSX plugin, no JSX build step)
- **Styling:** Plain CSS in `src/styles.css`, mobile-first, CSS custom property tokens on `:root`
- **Dependencies:** `htm ^3.1.1`, `preact ^10.29.8`
- **Dev dependencies:** `vite ^6.4.5`
- **Scripts:** `npm run dev` (vite --host), `npm run build`, `npm run preview` (--host)
- **Docker:** `Dockerfile` present; `docker build -t launchpad .` then `docker run --rm -p 8080:80 launchpad`
- **Deploy:** static host of `dist/` (Vercel, Netlify, GitHub Pages)

## Runtime model (key architectural fact)

- **No backend.** Everything persists in `localStorage` under key `launchpad_oxygene_v1`.
- **Single state object** in `src/store.js` (`load()` / `set(patch)` / `useStore()` / `get()`).
- `SAVED` keys persisted: `tab, checked, selected, voted, votes, messages, rewards, role, guestName, email, activePoll, myVotes, ideas, myIdeaVotes, customPolls`.
- Anything not in `SAVED` (drafts, open builder, toasts) is lost on refresh.
- `set()` also strips video `mediaSrc` from `customPolls` before saving (video blob URLs die with the page).
- `App.js` runs `tick()` every 1.8s for "Simulate live traffic" demo traffic.

## Roles & tabs

| Role | Sign in | Tabs |
| --- | --- | --- |
| Attendee | One tap, first name optional | Poll · Chat · Suggest (`ideas`) |
| Organizer | Work email + staff PIN (demo `2026`) | Check-in · Poll · Live · Chat · Suggestions (`cop`) |

`TABS` / `ROLE_TABS` live in `src/App.js`. Role `null` shows `screens/Login.js`.

## Features (per README)

**Usher check-in** — search by name or organisation (accents ignored via `fold()` NFD strip), check in by tap or 4-digit code, "Already checked in" guard, 10-second Undo, All / Pending / In filters, 40-result list cap with "keep typing to narrow".

**Live polls** — attendees: one question per screen, big tap targets, one vote per question per device. Organizers: create questions with optional image or video, text or picture answers (2–4), switch which question is live (`makeLive`).

**Live dashboard (organizer)** — attendance progress, votes received, live results bars with leader in orange, "Simulate live traffic" switch, "Reset demo data".

**Chat** — attendees and organizers (as Curator) in one stream; organizers get quick replies; auto-reply after 1.7s.

**Suggestions** — attendees post ideas (optionally anonymous, max 200 chars) and upvote; organizers see ideas ranked by votes and mark **Noted**; "Top suggestion" driven by poll results with Helpful / Not helpful feedback (`setReward`) that re-ranks the list.

**Design tokens** (`docs/HANDOFF.md §3`, also top of `styles.css`): navy `#0F172A` + Oxygène orange `#F97316`, tribal print bands (`public/tribal.svg`), 48 px touch targets (44 px min), 4.5:1 contrast, Inter font, inputs ≥16 px (stops iOS zoom), motion 150–350 ms, disabled under `prefers-reduced-motion`.

## Source layout

```
launchpad-app/
├── index.html            Page shell, viewport meta, Inter font
├── package.json
├── vite.config.js
├── public/
│   ├── tribal.svg
│   └── icons/
├── src/
│   ├── main.js           render <App /> into #app
│   ├── App.js            Shell: header, current screen, toast, tab bar, TABS/ROLE_TABS
│   ├── store.js          State + every action + mock data (see below)
│   ├── ui.js             Icon, Logo, Badge, Tribal
│   ├── styles.css        All styles, tokens as CSS variables
│   └── screens/
│       ├── Login.js      Choose role / attendee form / organizer form (PIN 2026)
│       ├── Checkin.js    Search + code bar + guest list
│       ├── Poll.js       Vote screen / live question
│       ├── Builder.js    Question builder sheet (modal)
│       ├── Dash.js       Organizer live dashboard
│       ├── Chat.js       Message stream + composer + quick replies
│       ├── Suggestions.js Organizer suggestions (mark noted, rate helpful)
│       └── Ideas.js      Attendee post/upvote ideas
├── docs/
│   ├── STORIES.md        User stories + acceptance criteria + schedule + curveballs
│   ├── HANDOFF.md        Developer handoff: tokens, components, state, extend, backend next steps, QA checklist
│   └── PITCH.md          UI/UX pitch talking points + demo script
├── .vscode/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── CHANGES (2).md
└── README.md
```

## store.js — state shape (`defaults()`)

```js
{
  tab: 'checkin', query: '', filter: 'all', code: '', toast: null, shake: 0,
  checked: baseChecked(),            // {guestIndex: true}, 124 pre-checked in demo
  selected: 'b', voted: false, votes: { a: 60, b: 85, c: 25 },
  messages: [{id, who:'guest'|'curator', text, time}, ...],
  draft: '', typing: false, sim: false, rewards: {},
  ideas: [{id, text, author, votes, time, noted, mine}, ...],
  myIdeaVotes: {}, ideaDraft: '', ideaAnon: false,
  customPolls: [], activePoll: 'q1', myVotes: {}, customSel: {}, builder: null,
  role: null, loginMode: 'choose', email: '', pin: '', guestName: '', loginError: '', loginTries: 0
}
```

**Mock data:** deterministic `GUESTS` (seed `20261031`), 200 guests; Sarah Jenkins / Oxygène PR Agency / VIP / code `4821`; Michael Vance / Apex Tech Corp / General / code `7305`. `baseChecked()` pre-checks id 1 + 123 of ids 2–199 (124 total).

**Built-in poll `q1`:** "Which communication channel will dominate corporate strategy by 2027?" — options a: Short-form Vertical Video (60), b: AI-Driven Hyper-Personalized Newsletters (85, leader), c: Immersive AR/VR Corporate Spaces (25).

**Key store actions:** `checkIn(id)`, `undo()`, `submitCode()`, `pickAnswer(p,id)`, `submitVote(p)`, `makeLive(id)`, `openBuilder()`/`closeBuilder()`/`setB()`/`setAnswer()`/`readImage(file,maxDim)`/`publishQuestion()`, `tick()`, `resetDemo()`, `sendMsg()`, `setReward(id,v)`, `postIdea()`, `upvoteIdea(id)`, `toggleNoted(id)`, `signInOrganizer()`, `joinAttendee()`, `signOut()`, `flash(text,kind,undoId)`.

## Data contract (from docs/STORIES.md) — if real guest file arrives

- Drop guest JSON at `data/guests.json` (HANDOFF.md says `src/guests.json`); fields: `name`, `organization`, `ticketType`, `checkInCode` (text, keep leading zeros).
- Missing fields show `-`; never key on name; key = `checkInCode` when unique else `row-<index>`.
- Search: lower-case, accents removed ("oxygene" finds "Oxygène").
- `normalizeGuest()` mapping function in one place if field names differ.
- `fetch()` fails on `file://`; use a local dev server.

## Known limitations (README)

- One browser only — `localStorage` doesn't sync between phones; several ushers need a shared backend (see HANDOFF.md → Next steps).
- Videos in poll questions play only in the browser that added them and are gone after refresh; photos are resized and saved.
- Demo sign-in: staff PIN is a front-end check, not real security.
- Mock data: 200 generated guests; swap in the real guest list per HANDOFF.md.
- Clear all: browser console `localStorage.removeItem('launchpad_oxygene_v1')`, or organizer **Reset demo data**.

## Demo script (2 min, from README)

1. Sign in Organizer (any email, PIN `2026`). On **Live**, tap **Reset demo data**.
2. **Check-in**: search "oxyg", tap Sarah Jenkins (green banner). Enter `4821` again → "Already checked in". Enter `9999` → error.
3. **Poll**: **New question**, add a photo, pick **Pictures** answers, add 2 photos, **Publish & make live**.
4. Sign out (tap initial), sign in as Attendee: vote on the new question, post a suggestion, upvote one.
5. Sign back in as Organizer: **Live** shows new results; **Suggestions → From attendees** shows the idea; tap **Mark noted**.
6. Refresh: nothing is lost.

## QA checklist (docs/HANDOFF.md §6)

- Sign-in: attendee one tap; organizer rejects bad email / wrong PIN; `2026` works; tapping initial signs out.
- Check-in: search, tap, code, already-in, invalid code, undo; count updates.
- Poll: vote once; create question with image + picture answers; Make live switches attendee view.
- Dashboard: numbers move after check-ins and votes; Simulate live traffic; Reset demo data.
- Chat: attendee messages right in navy, curator replies orange.
- Suggest: post (anonymous on/off), upvote/un-upvote, can't upvote own; organizer Mark noted shows badge to attendees.
- No horizontal scroll at 360 px; refresh keeps everything; no console errors.

## Backend next steps (separate Next.js + Supabase repo)

| localStorage | Supabase equivalent |
| --- | --- |
| `checked` | `guests.checked_in_at` + `check_in_guest()` RPC |
| `votes` / `customPolls` | `polls`, `poll_options`, `votes` (one vote per user in SQL) |
| `messages` | `messages` + realtime |
| `ideas` | `ideas` table + `idea_votes` |
| Videos / images | Supabase Storage bucket |
| Demo PIN | Supabase Auth (magic link) + `staff` table |

## Open items / decisions

- STORIES.md open question: for O1 check-in count "X of N", is N the guest list (~150) or venue capacity (~200)? Pending client answer, N = number of guests in the file.
- STORIES.md curveballs: walk-in guest form, VIP flag, big-screen results, release questions one at a time, multi-usher (needs backend), second language.
- docs/STORIES.md schedule: hand-in by 13:50 on 31 Oct 2026; musts by 13:20; cut order O3 → D3 → U4 → A2; never cut U1–U3, A1, O1, D1, D2.
