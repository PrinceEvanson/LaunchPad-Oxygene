import { html } from 'htm/preact';
import { GUESTS, set, activePoll, totalVotes, leaderOf, resetDemo, readResults, speak } from '../store.js';
import { Listen, Switch } from '../ui.js';

export function Dash({ s }) {
  const total = GUESTS.length;
  const inCount = Object.keys(s.checked).length;
  const checkPct = Math.round((inCount / total) * 100);
  const poll = activePoll(s);
  const votes = totalVotes(poll);
  const votePct = Math.round((votes / total) * 100);
  const leader = leaderOf(poll);

  return html`
    <div class="screen scroll slide dash">
      <div class="stats">
        <div class="card stat">
          <span class="kicker">Real-time attendance</span>
          <div class="stat-row">
            <span class="stat-big">Checked In: ${inCount} / ${total}</span>
            <span class="stat-pct">${checkPct}%</span>
          </div>
          <div class="track track-lg" role="progressbar" aria-label="Attendance" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${checkPct}>
            <div class="fill fill-lead" style=${'width: ' + checkPct + '%'}></div>
          </div>
        </div>
        <div class="stat stat-dark">
          <div class="stack-6">
            <span class="kicker">Engagement velocity</span>
            <span class="stat-title">Votes Received</span>
            <span class="stat-sub">${votes} of ${total} attendees</span>
          </div>
          <span class="stat-huge" aria-label=${'Votes Received: ' + votePct + '%'}>${votePct}%</span>
        </div>
      </div>

      <div class="card breakdown">
        <div class="card-head">
          <div class="stack-4">
            <span class="card-title">Live poll breakdown</span>
            <span class="card-sub">${poll.question}</span>
          </div>
          <${Listen} onClick=${() => speak(readResults(poll))} label="Listen to the live results" />
        </div>
        ${poll.options.map((o) => {
          const pct = votes ? Math.round(((poll.votes[o.id] || 0) / votes) * 100) : 0;
          const lead = o === leader && votes > 0;
          return html`
            <div class="stack-8" key=${o.id}>
              <div class="bar-head">
                <span class="bar-label">${o.label}${lead && html`<span class="leading">LEADING</span>`}</span>
                <span class="bar-pct">${pct}%</span>
              </div>
              <div class="track"><div class="fill ${lead ? 'fill-lead' : ''}" style=${'width: ' + pct + '%'}></div></div>
            </div>`;
        })}
      </div>

      <div class="card sim-card">
        <div class="stack-2">
          <span class="sim-title">Simulate live traffic</span>
          <span class="sim-sub">Adds check-ins and votes every few seconds</span>
        </div>
        <${Switch} on=${s.sim} label="Simulate live traffic" onClick=${() => set({ sim: !s.sim })} />
      </div>

      <button class="tap btn-out reset" onClick=${resetDemo}>Reset demo data</button>
    </div>`;
}
