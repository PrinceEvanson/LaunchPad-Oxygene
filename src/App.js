// Nguvu Pad. App shell: header, current screen, toast, tab bar, screen-reader live region.
import { html } from 'htm/preact';
import { useEffect } from 'preact/hooks';
import { useStore, set, tick, signOut, undo } from './store.js';
import { Icon, Logo, Tribal } from './ui.js';
import { Login } from './screens/Login.js';
import { Checkin } from './screens/Checkin.js';
import { Poll } from './screens/Poll.js';
import { Builder } from './screens/Builder.js';
import { Dash } from './screens/Dash.js';
import { Chat } from './screens/Chat.js';
import { Suggestions } from './screens/Suggestions.js';
import { Ideas } from './screens/Ideas.js';
import { A11yPanel } from './screens/A11yPanel.js';

const TABS = {
  checkin: { label: 'Check-in', Screen: Checkin },
  poll: { label: 'Poll', Screen: Poll },
  dash: { label: 'Live', Screen: Dash },
  chat: { label: 'Chat', Screen: Chat },
  ideas: { label: 'Suggest', Screen: Ideas },
  // `short` replaces the label on the tab bar of small phones, where the full word would overlap its neighbours.
  cop: { label: 'Suggestions', short: 'Suggest', Screen: Suggestions },
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
  const live = html`<div class="sr" role="status" aria-live="polite">${s.announcement}</div>`;
  if (!tabs) return html`<div class="app app-auth"><${Login} s=${s} /><${Toast} t=${s.toast} />${live}</div>`;

  const tab = tabs.includes(s.tab) ? s.tab : tabs[0];
  const { Screen } = TABS[tab];
  // data-tab / data-role let styles.css size each screen for wider viewports.
  return html`
    <div class="app app-shell" data-tab=${tab} data-role=${s.role}>
      <${Header} s=${s} tab=${tab} />
      <${Screen} s=${s} />
      ${s.builder && html`<div class="backdrop" aria-hidden="true"></div><${Builder} b=${s.builder} />`}
      ${s.a11yOpen && html`<${A11yPanel} s=${s} />`}
      <${Toast} t=${s.toast} />
      <${Tribal} class="tribal-nav" />
      <nav class="nav" aria-label="Nguvu Pad sections">
        ${tabs.map((id) => html`
          <button class="tap" aria-current=${id === tab ? 'page' : undefined} onClick=${() => set(id === 'chat' ? { tab: id, unread: 0 } : { tab: id })}>
            <span class="nav-bar"></span>
            <${Icon} name=${id} size=${22} />
            ${TABS[id].short
              ? html`<span class="nav-label"><span class="nav-full">${TABS[id].label}</span><span class="nav-short">${TABS[id].short}</span></span>`
              : html`<span class="nav-label">${TABS[id].label}</span>`}
            ${id === 'chat' && s.unread > 0 && tab !== 'chat' && html`<span class="nav-badge">${s.unread}<span class="sr"> unread</span></span>`}
          </button>`)}
      </nav>
      ${live}
    </div>`;
}

function Header({ s, tab }) {
  const org = s.role === 'organizer';
  const initial = ((org ? s.email : s.guestName).trim().charAt(0) || (org ? 'O' : 'A')).toUpperCase();
  return html`
    <header class="top">
      <div class="top-row">
        <${Logo} />
        <div class="top-actions">
          <button class="tap icon-btn a11y-btn" onClick=${() => set({ a11yOpen: true })} aria-label="Accessibility settings">
            <${Icon} name="access" size=${22} />
          </button>
          <button class="tap avatar-btn" onClick=${signOut} aria-label=${'Sign out (' + (org ? 'organizer' : 'attendee') + ')'}>
            <span class="dot dot-lg live-dot"></span>
            <span class="avatar">${initial}</span>
          </button>
        </div>
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
