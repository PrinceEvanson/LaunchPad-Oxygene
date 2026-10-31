// Accessibility settings, opened from the ♿ button in the header.
import { html } from 'htm/preact';
import { set, setA11y, speak } from '../store.js';
import { Icon, Switch, Tribal } from '../ui.js';

const SETTINGS = [
  { key: 'readAloud', title: 'Read new messages aloud', sub: 'Speaks each new chat message' },
  { key: 'vibrate', title: 'Vibrate on new messages', sub: 'A short buzz when a message arrives' },
  { key: 'transcripts', title: 'Show transcripts automatically', sub: 'Opens video transcripts in polls' },
  { key: 'vo', title: 'Voice-over for polls and suggestions', sub: 'Reads questions, answers and ideas aloud' },
];

export function A11yPanel({ s }) {
  const toggle = (key, title) => {
    const on = setA11y(key);
    if (key === 'vo' && on) speak('Voice-over on');
    else if (key === 'readAloud' && on) speak(title + ' on');
  };
  return html`
    <div class="sheet slide" role="dialog" aria-modal="true" aria-label="Accessibility">
      <div class="sheet-head">
        <span class="sheet-title">Accessibility</span>
        <button class="tap icon-btn" onClick=${() => set({ a11yOpen: false })} aria-label="Close"><${Icon} name="close" sw=${2.2} /></button>
      </div>
      <${Tribal} />
      <div class="scroll sheet-body stack-10">
        ${SETTINGS.map((x) => html`
          <div class="card sim-card" key=${x.key}>
            <div class="stack-2">
              <span class="sim-title">${x.title}</span>
              <span class="sim-sub">${x.sub}</span>
            </div>
            <${Switch} on=${s.a11y[x.key]} label=${x.title} onClick=${() => toggle(x.key, x.title)} />
          </div>`)}
        <p class="note">Voice typing (the mic buttons) needs Chrome or Edge with microphone permission.</p>
      </div>
    </div>`;
}
