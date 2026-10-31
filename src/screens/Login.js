import { html } from 'htm/preact';
import { set, joinAttendee, signInOrganizer } from '../store.js';
import { Icon, Logo, Badge, Tribal } from '../ui.js';

export function Login({ s }) {
  return html`
    <div class="screen scroll slide login">
      <div class="login-hero">
        <div class="brand brand-lg">
          <${Logo} large />
          <${Badge} text="Event app" />
        </div>
        <h1>Welcome to the launch</h1>
        <p>Two Rivers Business Park · South Tower, 5th floor</p>
      </div>
      <${Tribal} />

      <div class="login-body">
        ${s.loginMode === 'choose' && html`<${Choose} />`}
        ${s.loginMode === 'attendee' && html`<${AttendeeForm} s=${s} />`}
        ${s.loginMode === 'organizer' && html`<${OrganizerForm} s=${s} />`}
      </div>
    </div>`;
}

const RoleButton = ({ icon, iconClass, title, sub, onClick }) => html`
  <button class="tap role-btn" onClick=${onClick}>
    <span class="role-icon ${iconClass}"><${Icon} name=${icon} size=${24} /></span>
    <span class="role-text">
      <span class="role-title">${title}</span>
      <span class="role-sub">${sub}</span>
    </span>
    <${Icon} name="chevronRight" sw=${2.2} color="#475569" />
  </button>`;

const Choose = () => html`
  <div class="stack-14">
    <h2 class="choose-title">How are you joining?</h2>
    <${RoleButton} icon="poll" iconClass="role-icon-att" title="I'm an attendee"
      sub="Vote in live polls and chat with the team. No account needed."
      onClick=${() => set({ loginMode: 'attendee', loginError: '' })} />
    <${RoleButton} icon="staff" iconClass="role-icon-org" title="I'm an organizer"
      sub="Door check-in, live dashboard and session suggestions. Staff sign-in."
      onClick=${() => set({ loginMode: 'organizer', loginError: '' })} />
  </div>`;

const Back = () => html`
  <button class="tap back" onClick=${() => set({ loginMode: 'choose', loginError: '', pin: '' })}>
    <${Icon} name="chevronLeft" size=${18} sw=${2.2} />Back
  </button>`;

const onEnter = (fn) => (e) => e.key === 'Enter' && fn();

const AttendeeForm = ({ s }) => html`
  <div class="form slide">
    <${Back} />
    <h2>Join as an attendee</h2>
    <p class="lead">Just your first name, so the team can greet you. You can skip it.</p>
    <label for="guest-name" class="label">First name (optional)</label>
    <input id="guest-name" class="field" type="text" autocomplete="given-name" placeholder="e.g. Amina"
      value=${s.guestName} onInput=${(e) => set({ guestName: e.target.value.slice(0, 40) })} onKeyDown=${onEnter(joinAttendee)} />
    <button class="tap btn-pri btn-lg mt-8" onClick=${joinAttendee}>Join the event</button>
  </div>`;

function OrganizerForm({ s }) {
  const shake = s.loginTries ? (s.loginTries % 2 ? 'shakeA' : 'shakeB') : '';
  return html`
    <div class="form slide">
      <${Back} />
      <h2>Organizer sign-in</h2>
      <p class="lead">For ushers and event staff.</p>
      <label for="org-email" class="label">Work email</label>
      <input id="org-email" class="field" type="email" autocomplete="email" inputmode="email" placeholder="you@company.com"
        value=${s.email} onInput=${(e) => set({ email: e.target.value, loginError: '' })} />
      <label for="org-pin" class="label mt-4">Staff PIN</label>
      <input id="org-pin" class="field field-pin" type="password" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="4 digits"
        value=${s.pin} onInput=${(e) => set({ pin: e.target.value.replace(/\D/g, '').slice(0, 4), loginError: '' })} onKeyDown=${onEnter(signInOrganizer)} />
      ${s.loginError && html`<p role="alert" class="error ${shake}">${s.loginError}</p>`}
      <button class="tap btn-pri btn-lg mt-8" onClick=${signInOrganizer}>Sign in</button>
      <p class="hint">Demo PIN: 2026</p>
    </div>`;
}
