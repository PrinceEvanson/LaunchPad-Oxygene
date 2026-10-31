# Nguvu Pad — Developer Handoff

How the codebase works, the design tokens it uses, and how to change or extend it.
For what each feature must do, see [STORIES.md](STORIES.md).

---

## 1. Architecture

- **Vite + Preact + htm.** No JSX build step: components return `html\`...\`` tagged templates.
- **One state object, one store.** `src/store.js` holds the state, saves it to `localStorage` key **`launchpad_oxygene_v1`**, and exports every action. Components call `useStore()` to read it and re-render on change.
- **`set(patch)`** merges into state and saves the keys listed in `SAVED`. Anything not in that list (drafts, open dialogs, toasts) is lost on refresh.
- **Styles** are all in `src/styles.css`: mobile-first, tokens as CSS variables on `:root`, state shown with `aria-pressed` / `aria-current` / `.on` selectors. No inline styles except progress-bar widths.

```
store.js state ──useStore()──▶ screens/*.js ──render──▶ DOM
      ▲                                                 │
      └──────────── actions → set(patch) ◀──── events ──┘
```

### Where things live

| Area | Look for |
| --- | --- |
| Default state and sample data | `defaults()` in `store.js` |
| Mock guest list (200) | `GUESTS`, `baseChecked()` in `store.js` |
| Save / load | `set()`, `load()`, `SAVED` |
| Check-in | `checkIn()`, `undo()`, `submitCode()`; UI in `screens/Checkin.js` |
| Polls | `activePoll()`, `pickAnswer()`, `submitVote()`, `makeLive()`; UI in `screens/Poll.js` |
| Question builder | `setB()`, `setAnswer()`, `readImage()`, `publishQuestion()`; UI in `screens/Builder.js` |
| Live traffic simulation | `tick()` (run every 1.8 s from `App.js`) |
| Chat | `sendMsg()`; UI in `screens/Chat.js` |
| Suggestions feedback | `setReward()`; UI in `screens/Suggestions.js` |
| Attendee ideas | `postIdea()`, `upvoteIdea()`, `toggleNoted()`; UI in `screens/Ideas.js` |
| Sign-in | `signInOrganizer()`, `joinAttendee()`, `signOut()`; UI in `screens/Login.js` |
| Header, tab bar, toast | `App.js` (`TABS`, `ROLE_TABS`) |
| Accessibility | `speak()`, `vo()`, `announce()`, `dictate()`, `setA11y()`, `toggleVO()`, `ACCESS`; panel in `screens/A11yPanel.js` |
| Text read aloud | `readPoll()`, `readResults()`, `readIdeaList()` |

---

## 2. Saved state (`launchpad_oxygene_v1`)

| Key | Shape | Notes |
| --- | --- | --- |
| `role` | `null` \| `"organizer"` \| `"attendee"` | `null` shows the sign-in screen |
| `email`, `guestName` | string | Used for the header initial and idea author |
| `tab` | `checkin` \| `poll` \| `dash` \| `chat` \| `cop` \| `ideas` | Falls back to the role's first tab |
| `checked` | `{ guestIndex: true }` | 124 pre-checked in the demo |
| `votes`, `selected`, `voted` | built-in question `q1` | Counts per option `a`, `b`, `c` |
| `customPolls` | `[{ id, question, mediaType, mediaSrc, answerStyle, options:[{id,label,img}], votes }]` | Also `mediaAlt`, `transcript`. Videos are not saved (`mediaSrc: null`); transcripts are |
| `activePoll` | poll id | Which question attendees see |
| `myVotes` | `{ pollId: optionId }` | One vote per custom question per device |
| `messages` | `[{ id, who:"guest"\|"curator", mine, text, time, access }]` | `access` = support label on access requests |
| `rewards` | `{ suggestionId: -1 \| 0 \| 1 }` | Helpful / Not helpful |
| `ideas`, `myIdeaVotes` | `[{ id, text, author, votes, time, noted, mine }]`, `{ id: true }` | Attendee suggestions |
| `a11y` | `{ readAloud, vibrate, transcripts, vo }` | Accessibility switches (`vibrate` on by default) |

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

## 4. Common changes

**Use the real guest list.** Put the client file at `src/guests.json` and replace the `GUESTS` block in `store.js` (keep codes as text so leading zeros survive):

```js
import raw from './guests.json';
export const GUESTS = raw.map((g, i) => ({
  id: i,
  name: g.name || '-',
  org: g.organization || '-',
  tier: g.ticketType || '-',
  code: g.checkInCode ? String(g.checkInCode).trim() : null,
}));
```

Also make `baseChecked()` return `{}` so nobody starts checked in.

**Change the staff PIN.** Search `'2026'` in `signInOrganizer()` (`store.js`).

**Add a tab.** Create `src/screens/X.js`, add it to `TABS` and `ROLE_TABS` in `App.js`, and add its icon path to `ICONS` in `ui.js` under the same id.

**Change colours.** Edit the CSS variables at the top of `src/styles.css`.

---

## 5. Next steps (backend)

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

## 6. QA checklist

- [ ] Sign-in: attendee one tap; organizer rejects bad email / wrong PIN; `2026` works; tapping the initial signs out
- [ ] Check-in: search, tap, code, already-in, invalid code, undo; count updates
- [ ] Poll: vote once; create a question with an image + picture answers; Make live switches attendee view
- [ ] Dashboard: numbers move after check-ins and votes; Simulate live traffic; Reset demo data
- [ ] Chat: attendee messages right in navy, curator replies orange
- [ ] Suggest: post (anonymous on/off), upvote/un-upvote, can't upvote own; organizer Mark noted shows a badge to attendees
- [ ] No horizontal scroll at 360 px; refresh keeps everything; no console errors
