// Shared bits: icons, logo, segmented control.
import { html } from 'htm/preact';

const thumb = () => html`<path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />`;

const ICONS = {
  check: () => html`<path d="M20 6 9 17l-5-5" />`,
  chevronRight: () => html`<path d="m9 18 6-6-6-6" />`,
  chevronLeft: () => html`<path d="m15 18-6-6 6-6" />`,
  chevronUp: () => html`<path d="m18 15-6-6-6 6" />`,
  close: () => html`<path d="M18 6 6 18M6 6l12 12" />`,
  plus: () => html`<path d="M12 5v14M5 12h14" />`,
  search: () => html`<circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />`,
  staff: () => html`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m16 11 2 2 4-4" />`,
  upload: () => html`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" />`,
  image: () => html`<rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />`,
  pin: () => html`<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />`,
  send: () => html`<path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" />`,
  sparkle: () => html`<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />`,
  volume: () => html`<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" /><path d="M16 9a5 5 0 0 1 0 6" /><path d="M19.364 18.364a9 9 0 0 0 0-12.728" />`,
  mic: () => html`<path d="M12 19v3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><rect x="9" y="2" width="6" height="13" rx="3" />`,
  access: () => html`<circle cx="16" cy="4" r="1" /><path d="m18 19 1-7-6 1" /><path d="m5 8 3-3 5.5 3-2.36 3.5" /><path d="M4.24 14.5a5 5 0 0 0 6.88 6" /><path d="M13.76 17.5a5 5 0 0 0-6.88-6" />`,
  thumbUp: thumb,
  thumbDown: thumb,
  // Tab bar
  checkin: () => html`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM16 11l2 2 4-4" />`,
  poll: () => html`<path d="M18 20V10M12 20V4M6 20v-6" />`,
  dash: () => html`<path d="M22 12h-4l-3 9L9 3l-3 9H2" />`,
  chat: () => html`<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />`,
  ideas: () => html`<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />`,
  cop: () => html`<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />`,
};

export const Icon = ({ name, size = 20, sw = 2, color = 'currentColor' }) => html`
  <svg aria-hidden="true" width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke=${color} stroke-width=${sw}
    stroke-linecap="round" stroke-linejoin="round" style=${name === 'thumbDown' ? 'transform: rotate(180deg)' : undefined}>${ICONS[name]()}</svg>`;

// "nguvu PAD" wordmark with the "by oxygène MCL" line under it. large = sign-in screen.
export const Logo = ({ large }) => html`
  <div class="logo ${large ? 'logo-lg' : ''}">
    <svg role="img" aria-label="Nguvu Pad" width=${large ? 153 : 120} height=${large ? 33 : 26} viewBox="0 0 120 26" overflow="visible">
      <text x="0" y="20" font-family="Inter, system-ui, sans-serif" font-size="22" letter-spacing="-0.4"><tspan fill="#FFFFFF" font-weight="500">nguvu</tspan><tspan dx="6" fill="#F97316" font-weight="800" letter-spacing="0.8">PAD</tspan></text>
    </svg>
    <span class="logo-by">by oxygène <b>MCL</b></span>
  </div>`;

export const Badge = ({ text }) => html`<span class="lp-badge">${text}</span>`;

// Pill "Listen" button that reads text aloud.
export const Listen = ({ onClick, label }) => html`
  <button class="tap listen" onClick=${onClick} aria-label=${label}><${Icon} name="volume" size=${16} sw=${2.2} />Listen</button>`;

// Small speaker icon button (chat messages, idea rows).
export const SpeakBtn = ({ onClick, label }) => html`
  <button class="tap speak-btn" onClick=${onClick} aria-label=${label}><${Icon} name="volume" size=${16} sw=${2.2} /></button>`;

// Voice-over on/off pill used on the Suggest and Suggestions screens.
export const VoToggle = ({ on, onClick }) => html`
  <button class="tap listen vo-toggle" aria-pressed=${!!on} onClick=${onClick}><${Icon} name="volume" size=${16} sw=${2.2} />Voice-over ${on ? 'on' : 'off'}</button>`;

export const Switch = ({ on, label, onClick }) => html`
  <button class="tap switch" role="switch" aria-checked=${!!on} aria-label=${label} onClick=${onClick}>
    <span class="switch-track"><span class="switch-knob"></span></span>
  </button>`;

export const Tribal = ({ class: cls = '' }) => html`<div class="tribal ${cls}" aria-hidden="true"></div>`;

// items: [[value, label], ...]
export const Seg = ({ label, items, value, onPick }) => html`
  <div class="seg" role="group" aria-label=${label} style=${'grid-template-columns: repeat(' + items.length + ', minmax(0, 1fr))'}>
    ${items.map(([id, text]) => html`<button class="tap" aria-pressed=${value === id} onClick=${() => onPick(id)}>${text}</button>`)}
  </div>`;
