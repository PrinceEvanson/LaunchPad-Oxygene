# LaunchPad — Oxygène MCL

Phone-first event app for the Oxygène MCL product launch at Two Rivers Business Park, Nairobi.
One app, two roles:

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
docker build -t launchpad .
docker run --rm -p 8080:80 launchpad
```

Open http://localhost:8080.

---

## Project structure

```
launchpad-app/
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
