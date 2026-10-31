import { html } from 'htm/preact';
import { set, sendMsg, sendAccess, speak, dictate, ACCESS } from '../store.js';
import { Icon, SpeakBtn } from '../ui.js';

const QUICK = ['Happy to help — one moment.', 'Refreshments are available at the main lobby area.', 'The next session starts shortly.'];

export function Chat({ s }) {
  const org = s.role === 'organizer';
  const listening = s.listening === 'chat';
  return html`
    <div class="screen slide">
      <div class="chat-banner">
        <${Icon} name="pin" size=${18} color="#C2410C" />
        <span>Nguvu Pad Chat Hub • Live from Two Rivers, Nairobi</span>
      </div>

      <div class="scroll msgs" role="log" aria-live="polite" aria-label="Session chat">
        ${s.typing && html`
          <div class="typing" aria-label="Attendee is typing"><span class="d1"></span><span class="d2"></span><span class="d3"></span></div>`}
        ${s.messages.slice().reverse().map((m) => {
          const curator = m.who === 'curator';
          // Organizers see curator messages as their own; attendees see only their own on the right.
          const mine = org ? curator : !curator && m.mine === true;
          const who = mine ? 'You' : curator ? 'Curator' : 'Attendee';
          const request = org && m.access;
          return html`
            <div class="msg ${mine ? 'mine' : ''}" key=${m.id}>
              <span class="msg-who">${request ? 'Access request · ' + m.access : who}</span>
              <div class="bubble ${curator ? 'bubble-curator' : ''} ${request ? 'bubble-access' : ''}">${m.text}</div>
              <span class="msg-meta">
                <span class="msg-time">${m.time}</span>
                <${SpeakBtn} onClick=${() => speak(who + ' says: ' + m.text)} label=${'Read aloud: ' + m.text} />
              </span>
            </div>`;
        })}
      </div>

      ${org
        ? html`
          <div class="scroll quick">
            ${[...QUICK, ...ACCESS.map((a) => a.reply)].map((t) => html`<button class="tap" onClick=${() => sendMsg(t)}>${t}</button>`)}
          </div>`
        : html`
          <div class="scroll quick" role="group" aria-label="Need support?">
            <span class="quick-label">Need support?</span>
            ${ACCESS.map((a) => html`<button class="tap" onClick=${() => sendAccess(a)}>${a.label}</button>`)}
          </div>`}

      <div class="composer">
        <label for="chat-input" class="sr">Message</label>
        <input id="chat-input" type="text" autocomplete="off" placeholder="Type message to session stream..."
          value=${s.draft} onInput=${(e) => set({ draft: e.target.value })} onKeyDown=${(e) => e.key === 'Enter' && sendMsg()} />
        <button class="tap mic ${listening ? 'mic-on' : ''}" aria-pressed=${listening} aria-label=${listening ? 'Stop voice typing' : 'Voice typing'} onClick=${() => dictate('chat')}>
          <${Icon} name="mic" sw=${2.2} />
        </button>
        <button class="tap btn-pri send" aria-label="Send message" onClick=${() => sendMsg()}><${Icon} name="send" sw=${2.2} /></button>
      </div>
    </div>`;
}
