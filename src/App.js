// LaunchPad — Oxygène MCL. App shell: header, current screen, toast, tab bar.
import { html } from 'htm/preact';
import { useEffect } from 'preact/hooks';
import { useStore, set, tick, signOut, undo } from './store.js';
import { Icon, Logo, Badge, Tribal } from './ui.js';
import { Login } from './screens/Login.js';
import { Checkin } from './screens/Checkin.js';
import { Poll } from './screens/Poll.js';
import { Builder } from './screens/Builder.js';
import { Dash } from './screens/Dash.js';
import { Chat } from './screens/Chat.js';
import { Suggestions } from './screens/Suggestions.js';
import { Ideas } from './screens/Ideas.js';

const TABS = {
  checkin: { label: 'Check-in', Screen: Checkin },
  poll: { label: 'Poll', Screen: Poll },
  dash: { label: 'Live', Screen: Dash },
  chat: { label: 'Chat', Screen: Chat },
  ideas: { label: 'Suggest', Screen: Ideas },
  cop: { label: 'Suggestions', Screen: Suggestions },
};
const ROLE_TABS = {
  organizer: ['checkin', 'poll', 'dash', 'chat', 'cop'],
  attendee: ['poll', 'chat', 'ideas'],
};

export function App() {
  const s = useStore();
  useEffect(() => {
    const id = setInterval(tick, 1800);
    return () => clearInterval(id);
  }, []);

  const tabs = ROLE_TABS[s.role];
  if (!tabs) return html`<div class="app"><${Login} s=${s} /><${Toast} t=${s.toast} /></div>`;

  const tab = tabs.includes(s.tab) ? s.tab : tabs[0];
  const { Screen } = TABS[tab];
  return html`
    <div class="app">
      <${Header} s=${s} tab=${tab} />
      <${Screen} s=${s} />
      ${s.builder && html`<${Builder} b=${s.builder} />`}
      <${Toast} t=${s.toast} />
      <${Tribal} class="tribal-nav" />
      <nav class="nav" aria-label="LaunchPad sections">
        ${tabs.map((id) => html`
          <button class="tap" aria-current=${id === tab ? 'page' : undefined} onClick=${() => set({ tab: id })}>
            <span class="nav-bar"></span>
            <${Icon} name=${id} size=${22} />
            <span class="nav-label">${TABS[id].label}</span>
          </button>`)}
      </nav>
    </div>`;
}

function Header({ s, tab }) {
  const org = s.role === 'organizer';
  const initial = ((org ? s.email : s.guestName).trim().charAt(0) || (org ? 'O' : 'A')).toUpperCase();
  return html`
    <header class="top">
      <div class="top-row">
        <div class="brand">
          <${Logo} />
          <span class="divider"></span>
          <${Badge} />
        </div>
        <button class="tap avatar-btn" onClick=${signOut} aria-label=${'Sign out (' + (org ? 'organizer' : 'attendee') + ')'}>
          <span class="dot dot-lg live-dot"></span>
          <span class="avatar">${initial}</span>
        </button>
      </div>

      ${tab === 'checkin' && html`
        <div class="search">
          <label for="guest-search" class="sr">Search guests</label>
          <${Icon} name="search" color="#64748B" />
          <input id="guest-search" type="search" autocomplete="off" placeholder="Search guest name or organization..."
            value=${s.query} onInput=${(e) => set({ query: e.target.value })} />
          ${s.query && html`
            <button class="tap search-clear" aria-label="Clear search" onClick=${() => set({ query: '' })}>
              <${Icon} name="close" size=${18} sw=${2.2} />
            </button>`}
        </div>`}

      ${tab === 'poll' && html`
        <div class="top-title">
          <span class="eyebrow">Now in session</span>
          <span class="top-heading" style="line-height: 1.3">The Future of Corporate Communications</span>
        </div>`}

      ${tab === 'dash' && html`
        <div class="top-title">
          <span class="eyebrow">Organizer</span>
          <span class="top-heading">Live Dashboard</span>
        </div>`}

      <${Tribal} class="tribal-top" />
    </header>`;
}

function Toast({ t }) {
  if (!t) return null;
  return html`
    <div class="toast slide ${t.kind}" role="status">
      <span class="toast-text">${t.text}</span>
      ${t.undoId != null && html`<button class="tap toast-undo" onClick=${undo}>Undo</button>`}
    </div>`;
}
