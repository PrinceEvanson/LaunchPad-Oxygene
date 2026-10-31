import { html } from 'htm/preact';
import { GUESTS, set, checkIn, submitCode } from '../store.js';
import { Icon } from '../ui.js';

const LIMIT = 40;
// Lowercase and strip accents, so "oxygene" finds "Oxygène".
const fold = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const HAYSTACK = GUESTS.map((g) => fold(g.name + ' ' + g.org));

export function Checkin({ s }) {
  const total = GUESTS.length;
  const inCount = Object.keys(s.checked).length;
  const q = fold(s.query.trim());
  const list = GUESTS.filter((g) => {
    const c = !!s.checked[g.id];
    if ((s.filter === 'pending' && c) || (s.filter === 'checked' && !c)) return false;
    return !q || HAYSTACK[g.id].includes(q);
  });
  const firstPending = GUESTS.find((g) => !s.checked[g.id]);
  const shake = s.shake ? (s.shake % 2 ? 'shakeA' : 'shakeB') : '';
  const chips = [['all', 'All', total], ['pending', 'Pending', total - inCount], ['checked', 'In', inCount]];

  return html`
    <div class="screen slide">
      <div class="code-bar">
        <label for="code-input" class="label">Enter 4-Digit Check-In Code</label>
        <div class="code-row ${shake}">
          <input id="code-input" class="code-input" type="text" inputmode="numeric" autocomplete="off" maxlength="4"
            placeholder=${firstPending ? firstPending.code : '0000'} value=${s.code}
            onInput=${(e) => set({ code: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            onKeyDown=${(e) => e.key === 'Enter' && submitCode()} />
          <button class="tap btn-pri code-btn" onClick=${submitCode}>Check In</button>
        </div>
      </div>

      <div class="scroll list">
        <div class="seg chips" role="group" aria-label="Filter guests">
          ${chips.map(([id, label, n]) => html`
            <button class="tap" aria-pressed=${s.filter === id} onClick=${() => set({ filter: id })}>${label} <span class="count">${n}</span></button>`)}
        </div>

        ${list.slice(0, LIMIT).map((g) => html`
          <div class="guest" key=${g.id}>
            <button class="row-btn guest-main" onClick=${() => checkIn(g.id)}>
              <span class="guest-name ellipsis">${g.name}</span>
              <span class="guest-org ellipsis">${g.org}</span>
              <span class="tier ${g.tier === 'VIP Guest' ? 'tier-vip' : ''}">${g.tier}</span>
            </button>
            ${s.checked[g.id]
              ? html`<span class="badge-in pop"><${Icon} name="check" size=${16} sw=${3} />Checked In</span>`
              : html`<button class="tap btn-out guest-btn" onClick=${() => checkIn(g.id)} aria-label=${'Check in ' + g.name}>Check In</button>`}
          </div>`)}

        ${list.length === 0 && html`<div class="empty">No guests match your search.</div>`}
        ${list.length > LIMIT && html`<div class="more">Showing ${LIMIT} of ${list.length} — keep typing to narrow the list</div>`}
      </div>
    </div>`;
}
