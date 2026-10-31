import { html } from 'htm/preact';
import { set, sendMsg } from '../store.js';
import { Icon } from '../ui.js';

const QUICK = ['Happy to help — one moment.', 'Refreshments are available at the main lobby area.', 'The next session starts shortly.'];

export function Chat({ s }) {
  const org = s.role === 'organizer';
  return html`
    <div class="screen slide">
      <div class="chat-banner">
        <${Icon} name="pin" size=${18} color="#C2410C" />
        <span>Oxygène Chat Hub • Live from Two Rivers, Nairobi</span>
      </div>

      <div class="scroll msgs" aria-live="polite">
        ${s.typing && html`
          <div class="typing" aria-label="Attendee is typing"><span class="d1"></span><span class="d2"></span><span class="d3"></span></div>`}
        ${s.messages.slice().reverse().map((m) => {
          const curator = m.who === 'curator';
          // Organizers see curator messages as their own; attendees see only their own on the right.
          const mine = org ? curator : !curator && m.mine === true;
          return html`
            <div class="msg ${mine ? 'mine' : ''}" key=${m.id}>
              <span class="msg-who">${mine ? 'You' : curator ? 'Curator' : 'Attendee'}</span>
              <div class="bubble ${curator ? 'bubble-curator' : ''}">${m.text}</div>
              <span class="msg-time">${m.time}</span>
            </div>`;
        })}
      </div>

      ${org && html`
        <div class="scroll quick">
          ${QUICK.map((t) => html`<button class="tap" onClick=${() => sendMsg(t)}>${t}</button>`)}
        </div>`}

      <div class="composer">
        <label for="chat-input" class="sr">Message</label>
        <input id="chat-input" type="text" autocomplete="off" placeholder="Type message to session stream..."
          value=${s.draft} onInput=${(e) => set({ draft: e.target.value })} onKeyDown=${(e) => e.key === 'Enter' && sendMsg()} />
        <button class="tap btn-pri send" aria-label="Send message" onClick=${() => sendMsg()}><${Icon} name="send" sw=${2.2} /></button>
      </div>
    </div>`;
}
