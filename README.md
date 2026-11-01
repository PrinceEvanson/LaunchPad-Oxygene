# Nguvu Pad — event app by Oxygène MCL

Phone-first event app for the Oxygène MCL product launch at Two Rivers Business Park, Nairobi.
One app, two roles:
Here's a Markdown table you can paste into the README:

```markdown
## Team

| Member | Role | Contributions |
| --- | --- | --- |
| **Mathews Machanje (Mat)** | Lead / PM and Frontend | Brief questions, user stories and scope cuts; kept the team on schedule; wrote the stories, developer handoff and pitch; frontend development |
| **Tracy Mboya** | UI/UX Designer and Documentation| User journeys and design principles; all screens and their states; visual system (colours, type, touch targets, tribal band, branding); inclusive design for blind and deaf guests |
| **Clyde Penda** | Frontend Developer | Check-in, polls and question builder, organizer dashboard, chat and suggestions, role-based sign-in, accessibility features, testing |
| **Prince Evanson** | Deployment and Frontend | Hosting and production build, GitHub repository and live link, frontend features and fixes, testing on real phones |

Built for **Oxygène MCL** · Nairobi · October 2026
```

Replace the existing **Team** section at the bottom of the README with it, and put in Prince's surname. Trim any contribution a member didn't make.
| Role | Signs in with | Tabs |
| --- | --- | --- |
| **Attendee** | One tap (first name optional) | Poll · Chat · Suggest |
| **Organizer** | Work email + staff PIN (demo PIN **2026**) | Check-in · Poll · Live · Chat · Suggestions |

Everything is saved in the browser (`localStorage`), so it works with no backend. That matches the brief.

---

## Quick start (VS Code)

You need **Node.js 18+** ([nodejs.org](https://nodejs.org), LTS).

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).
To test on your phone, connect it to the same Wi-Fi and open the **Network** URL Vite prints (`npm run dev` already uses `--host`).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages).

### Run with Docker (no Node needed)

```bash
docker build -t nguvu-pad .
docker run --rm -p 8080:80 nguvu-pad
```

Open http://localhost:8080.

---

## Project structure

```
nguvu-pad/
├── index.html            Page shell, viewport meta, Inter font
├── package.json          Scripts and dependencies (Preact, htm, Vite)
├── vite.config.js
├── public/
│   ├── tribal.svg        Tribal print tile used above/below the navy bars
│   └── icons/            App icons
├── src/
│   ├── main.js           Mounts <App /> into #app
│   ├── App.js            Shell: header, current screen, toast, tab bar
│   ├── store.js          State (saved to localStorage), mock data and every action
│   ├── ui.js             Icons, logo, segmented control
│   ├── screens/          Login, Checkin, Poll, Builder, Dash, Chat, Suggestions, Ideas
│   └── styles.css        All styles, mobile-first, tokens as CSS variables
├── docs/
│   ├── STORIES.md        User stories + acceptance criteria
│   ├── HANDOFF.md        Developer handoff: tokens, components, state, how to extend
│   └── PITCH.md          UI/UX pitch talking points + demo script
└── .vscode/              Recommended extensions and settings
```

Screens read state with `useStore()` and call actions exported from `store.js`. No inline styles: every look lives in `styles.css`.

---

## Features

**Usher check-in (organizer)**: search by name or organisation (accents ignored), check in by tap or 4-digit code, "Already checked in" guard, Undo for 10 seconds, All / Pending / In filters.

**Live polls**
- Attendees: one question per screen, big tap targets, one vote per question per device.
- Organizers: **create questions** with an optional **image or video**, and **text or picture answers** (2–4). Switch which question is live.

**Live dashboard (organizer)**: attendance progress, votes received, live results bars with the leader in orange, "Simulate live traffic" switch for demos, and "Reset demo data".

**Chat**: attendees and organizers (as Curator) in one stream; organizers get quick replies.

**Suggestions**
- Attendees post ideas (optionally anonymous) and upvote others'.
- Organizers see those ideas ranked by votes and mark them **Noted**. They also get a "Top suggestion" driven by poll results, with Helpful / Not helpful feedback that re-ranks the list.

**Accessibility (♿ in the header)**: read new messages aloud, vibrate on new messages (on by default), show video transcripts automatically, and voice-over for polls and suggestions.
- Chat: a speaker on every message, screen-reader announcements, voice typing (mic), an unread badge on the Chat tab, and **Need support?** chips for attendees (live captions, KSL interpreter, front seat, describe the slides). Organizers see these as **Access request** messages with matching quick replies.
- Polls: **Listen** on every question, image descriptions for screen readers, and videos can't be published without a transcript.
- Suggest / Suggestions: a **Voice-over on/off** switch, **Speak your idea** (mic), and **Listen** buttons on lists and ideas.
- Voice typing needs Chrome or Edge with microphone permission.

**Design**: navy `#0F172A` + Oxygène orange `#F97316`, tribal print bands, 48 px touch targets, 4.5:1 contrast, reduced-motion support.

---

## Demo script (2 minutes)

1. Sign in as **Organizer** (any email, PIN `2026`). On **Live**, tap **Reset demo data**.
2. **Check-in**: search "oxyg", tap Sarah Jenkins (green banner). Enter `4821` again → "Already checked in". Enter `9999` → error.
3. **Poll**: tap **New question**, add a photo, pick **Pictures** answers, add 2 photos, then **Publish & make live**.
4. Tap your initial (top right) to sign out, then sign in as **Attendee**: vote on the new question, post a suggestion, upvote one.
5. Sign back in as Organizer: **Live** shows the new results; **Suggestions → From attendees** shows the idea. Tap **Mark noted**.
6. Refresh the page: nothing is lost.

---

## Known limitations

- **One browser only.** `localStorage` doesn't sync between phones; several ushers need a shared backend (see `docs/HANDOFF.md` → Next steps).
- **Videos** in poll questions play only in the browser that added them and are gone after a refresh. Photos are resized and saved.
- **Demo sign-in.** The staff PIN is a front-end check for the demo, not real security.
- **Mock data.** 200 generated guests. Swap in the real guest list as described in `docs/HANDOFF.md`.

To clear everything: in the browser console run `localStorage.removeItem('launchpad_oxygene_v1')`, or use **Reset demo data**.
# Nguvu Pad — Developer Handoff

How the codebase works, the design tokens it uses, and how to change or extend it.
For what each feature must do, see [STORIES.md](STORIES.md).

---

## 1. Architecture

- **Vite + Preact + htm.** No JSX build step: the UI is an `html\`...\`` tagged template inside `App.render()`.
- **One component, one state object.** `App` (in `src/App.js`) holds all state. `renderVals()` turns state into plain values and handlers; `render()` only reads `v.*`.
- **Persistence.** `upd(patch)` = `setState(patch)` + save to `localStorage` key **`launchpad_oxygene_v1`**. Use `setState` for things that shouldn't survive a refresh (drafts, open dialogs, toasts).
- **Inline styles** for component looks (they mirror the design canvas exactly). `src/styles.css` only holds animations, focus rings, hover states and the tribal band.

```
state ──renderVals()──▶ v (values + handlers) ──render()──▶ DOM
  ▲                                                        │
  └───────────── upd(patch) / setState(patch) ◀──── events ┘
```

### Where things live in `App.js`

| Area | Look for |
| --- | --- |
| Default state and sample data | `defaults()` |
| Mock guest list (200) | `guests()`, `baseChecked()` |
| Save / load | `upd()`, `componentDidMount()` |
| Check-in | `checkIn()`, `undo()`, `submitCode()` |
| Live traffic simulation | `tick()` |
| Chat | `sendMsg()` |
| Suggestions feedback | `setReward()` |
| Attendee ideas | `postIdea()`, `upvoteIdea()`, `toggleNoted()` |
| Question builder | `readImage()`, `setB()`, `publishQuestion()` |
| Accessibility | `speak()`, `vo()` (speaks only when voice-over is on), `announce()`, `announceIncoming()`, `dictate()`, `readPoll()`, `readResults()`, `readIdeaList()`, `componentDidUpdate()` (auto voice-over on screen change); settings in `a11y` |
| Sign-in | `signInOrganizer()`, `joinAttendee()`, `signOut()` |
| Everything the screen reads | `renderVals()` (sections marked `// ---- … ----`) |
| Markup | `render()`; screens are marked by `isLogin`, `isCheckin`, `isPoll`, `isDash`, `isChat`, `isCop`, `isIdeas`, `builderOpen` |

---

## 2. Saved state (`launchpad_oxygene_v1`)

| Key | Shape | Notes |
| --- | --- | --- |
| `role` | `null` \| `"organizer"` \| `"attendee"` | `null` shows the sign-in screen |
| `email`, `guestName` | string | Used for the header initial and idea author |
| `tab` | `checkin` \| `poll` \| `dash` \| `chat` \| `cop` \| `ideas` | Falls back to the role's first tab |
| `checked` | `{ guestIndex: true }` | 124 pre-checked in the demo |
| `votes`, `selected`, `voted` | built-in question `q1` | Counts per option `a`, `b`, `c` |
| `customPolls` | `[{ id, question, mediaType, mediaSrc, answerStyle, options:[{id,label,img}], votes }]` | Videos are not saved (`mediaSrc: null`) |
| `activePoll` | poll id | Which question attendees see |
| `myVotes` | `{ pollId: optionId }` | One vote per custom question per device |
| `messages` | `[{ id, who:"guest"\|"curator", mine, text, time }]` | |
| `rewards` | `{ suggestionId: -1 \| 0 \| 1 }` | Helpful / Not helpful |
| `a11y` | `{ voiceOver, readAloud, vibrate, transcripts }` | Accessibility settings (vibrate on by default) |
| `ideas`, `myIdeaVotes` | `[{ id, text, author, votes, time, noted, mine }]`, `{ id: true }` | Attendee suggestions |

---

## 3. Design tokens

| Token | Value | Use |
| --- | --- | --- |
| Navy | `#0F172A` | Header, tab bar, primary text |
| Navy 2 | `#1E293B` | Cards on navy |
| Slate | `#334155` | Non-leading bars, secondary text |
| Muted | `#475569` | Sub-labels (passes 4.5:1 on white) |
| Line | `#E2E8F0` / `#CBD5E1` | Borders, tracks / input borders |
| Canvas | `#F8FAFC` | Page background |
| Orange | `#F97316` | Buttons, selection, poll leader (**navy text on it**) |
| Orange text | `#C2410C` | Orange used as text on white |
| Orange soft | `#FFEDD5` | VIP badge, Live tag |
| Green | `#10B981` | "Checked In" badge (text `#022C22`) |
| Green dark | `#064E3B` | Success banner (white text) |
| Error | `#B91C1C` text / `#7C2D12` banner | |

- **Type:** Inter, falling back to system fonts. Sizes 11 / 12 / 13 / 14 / 15 / 16 / 18 / 20 / 22 / 30 / 56 px. Inputs are always 16 px or more (stops iOS zoom).
- **Shape:** radius 10 / 12 / 14 / 18 px, pills 999 px.
- **Touch:** every tappable thing is at least 44 px; most are 48 px.
- **Motion:** 150–350 ms; everything is disabled under `prefers-reduced-motion`.

---

## 4. Accessibility rules (keep these when you change things)

- Every icon-only button has an `aria-label`; toggles use `role="switch"` + `aria-checked`; the transcript button uses `aria-expanded`.
- Chat is `role="log"` with `aria-live="polite"`; every incoming message is also announced through the hidden `srMsg` live region.
- Images in questions need alt text (`alt`); videos **cannot be published without a transcript** (`publishQuestion()`).
- Status never relies on colour alone: colour + icon + words.
- Sounds are never the only signal: vibration + badge + on-screen text.
- Access requests carry `access: true` on the message and are highlighted for organizers.

## 5. Common changes

**Use the real guest list.** Put the client file at `public/data/guests.json` and replace `guests()` with a loader (keep codes as text so leading zeros survive):

```js
async componentDidMount() {
  const res = await fetch('/data/guests.json');
  const raw = await res.json();
  this._g = raw.map((g, i) => ({
    id: i,
    name: g.name || '-',
    org: g.organization || '-',
    tier: g.ticketType || '-',
    code: g.checkInCode ? String(g.checkInCode).trim() : null,
  }));
  this.forceUpdate();
  // …keep the existing localStorage load + setInterval below
}
```

Also replace `baseChecked()` with `() => ({})` so nobody starts checked in.

**Change the staff PIN.** Search `'2026'` in `signInOrganizer()`.

**Add a tab.** Add it to `TABS` and to `allowedTabs` (per role) in `renderVals()`, add an `isX` flag, then add a `${v.isX && html\`…\`}` block in `render()`.

**Change colours.** Search and replace the hex values in `App.js` (they're inline to match the design 1:1).

---

## 6. Next steps (backend)

The Next.js + Supabase version (separate repo) already has the database schema, row-level security, realtime sync and an offline check-in queue. Moving to it fixes the one-browser limit:

| Here (localStorage) | With Supabase |
| --- | --- |
| `checked` | `guests.checked_in_at` + `check_in_guest()` RPC |
| `votes` / `customPolls` | `polls`, `poll_options`, `votes` (one vote per user enforced in SQL) |
| `messages` | `messages` + realtime |
| `ideas` | add an `ideas` table + `idea_votes` |
| Videos / images | Supabase Storage bucket |
| Demo PIN | Supabase Auth (magic link) + `staff` table |

---

## 7. QA checklist

- [ ] Sign-in: attendee one tap; organizer rejects bad email / wrong PIN; `2026` works; tapping the initial signs out
- [ ] Check-in: search, tap, code, already-in, invalid code, undo; count updates
- [ ] Poll: vote once; create a question with an image + picture answers; Make live switches attendee view
- [ ] Dashboard: numbers move after check-ins and votes; Simulate live traffic; Reset demo data
- [ ] Chat: attendee messages right in navy, curator replies orange
- [ ] Suggest: post (anonymous on/off), upvote/un-upvote, can't upvote own; organizer Mark noted shows a badge to attendees
- [ ] Accessibility: VoiceOver/TalkBack reads tabs, buttons and new chat messages; Listen reads the poll; read-aloud and vibrate toggles work; a video question can't be published without a transcript; access requests are highlighted for organizers
- [ ] No horizontal scroll at 360 px; refresh keeps everything; no console errors
