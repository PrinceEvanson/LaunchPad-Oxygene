import { html } from 'htm/preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import { get, set, sendMsg, sendAccess, speak, ACCESS } from '../store.js';
import { Icon, SpeakBtn } from '../ui.js';

const QUICK = ['Happy to help — one moment.', 'Refreshments are available at the main lobby area.', 'The next session starts shortly.'];

// Browser speech-to-text (Chrome / Edge / Safari). Undefined in Firefox.
const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

const MIC_ERRORS = {
  'not-allowed': 'Microphone access was blocked. Allow it in your browser settings and try again.',
  'service-not-allowed': 'Microphone access was blocked. Allow it in your browser settings and try again.',
  'no-speech': "Didn't hear anything. Tap the mic and try again.",
  'audio-capture': 'No microphone found.',
  'network': 'Voice typing needs an internet connection.',
};

export function Chat({ s }) {
  const org = s.role === 'organizer';
  const [listening, setListening] = useState(false);
  const [micMsg, setMicMsg] = useState('');
  const rec = useRef(null);

  // Stop the microphone if the user leaves the chat screen.
  useEffect(() => () => {
    try { rec.current && rec.current.abort(); } catch (e) {}
  }, []);

  function toggleMic() {
    if (listening) {
      try { rec.current && rec.current.stop(); } catch (e) {}
      return;
    }
    if (!SR) {
      setMicMsg('Voice typing is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    setMicMsg('');
    const r = new SR();
    r.lang = navigator.language || 'en-US';
    r.continuous = true;
    r.interimResults = true;

    // Anything already typed stays; the spoken words are added after it.
    const typed = get().draft.trim();

    r.onstart = () => setListening(true);
    r.onresult = (e) => {
      // Rebuild the full transcript each time so nothing is duplicated.
      let spoken = '';
      for (let i = 0; i < e.results.length; i++) spoken += e.results[i][0].transcript;
      set({ draft: [typed, spoken.trim()].filter(Boolean).join(' ') });
    };
    r.onerror = (e) => {
      if (e.error !== 'aborted') setMicMsg(MIC_ERRORS[e.error] || 'Voice typing stopped (' + e.error + ').');
    };
    r.onend = () => {
      setListening(false);
      rec.current = null;
    };

    rec.current = r;
    try {
      r.start();
    } catch (err) {
      setMicMsg('Could not start the microphone.');
      rec.current = null;
    }
  }

  function send() {
    // abort() drops any late transcript so it can't refill the box after sending.
    try { rec.current && rec.current.abort(); } catch (e) {}
    sendMsg();
  }

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

      <div role="status" class="muted-13" style="padding:0 16px;min-height:0;">
        ${listening ? 'Listening… speak now, tap the mic again to stop.' : micMsg}
      </div>

      <div class="composer">
        <label for="chat-input" class="sr">Message</label>
        <input id="chat-input" type="text" autocomplete="off" placeholder=${listening ? 'Listening…' : 'Type message to session stream...'}
          value=${s.draft} onInput=${(e) => set({ draft: e.target.value })} onKeyDown=${(e) => e.key === 'Enter' && send()} />
        <button class="tap mic ${listening ? 'mic-on' : ''}" aria-pressed=${listening} aria-label=${listening ? 'Stop voice typing' : 'Voice typing'} onClick=${toggleMic}>
          <${Icon} name="mic" sw=${2.2} />
        </button>
        <button class="tap btn-pri send" aria-label="Send message" onClick=${send}><${Icon} name="send" sw=${2.2} /></button>
      </div>
    </div>`;
}