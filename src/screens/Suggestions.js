// Organizer view: poll-driven top suggestion, re-rankable list, and attendee ideas.
import { html } from 'htm/preact';
import { useEffect } from 'preact/hooks';
import { activePoll, leaderOf, setReward, toggleNoted, speak, vo, toggleVO, readIdeaList } from '../store.js';
import { Icon, Listen, SpeakBtn, VoToggle } from '../ui.js';

const ITEMS = [
  { id: 'a', text: 'More focus on Short-form Vertical Video', base: 0 },
  { id: 'b', text: 'More focus on AI-Driven Newsletters', base: 2.5 },
  { id: 'c', text: 'More focus on Immersive AR/VR Spaces', base: -1 },
  { id: 'qa', text: 'Extend the live Q&A by 10 minutes', base: 2 },
  { id: 'net', text: 'Add a networking break after this session', base: 1 },
];
const fmt = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1);

export function Suggestions({ s }) {
  const poll = activePoll(s);
  const leader = leaderOf(poll);
  const currentId = poll.id === 'q1' ? leader.id : 'qa';
  const cur = s.rewards[currentId] || 0;
  const ranked = ITEMS.map((it) => ({ ...it, rw: s.rewards[it.id] || 0, score: it.base + (s.rewards[it.id] || 0) }))
    .sort((x, y) => y.score - x.score);
  const ideas = s.ideas.slice().sort((x, y) => y.votes - x.votes);
  const insight = "Based on real-time polling trends, attendees want more focus on '" + (leader.short || leader.label) + "'.";
  const readRanked = () => 'All suggestions, most helpful first. ' + ranked.map((r, i) => (i + 1) + ': ' + r.text + ', score ' + fmt(r.score) + '.').join(' ');

  // Voice-over reads the top suggestion when this screen opens.
  useEffect(() => vo('Top suggestion. ' + insight), []);

  return html`
    <div class="screen scroll slide page page-split">
      <div class="stack-4 page-head">
        <div class="stack-2">
          <span class="eyebrow eyebrow-orange">Session suggestions</span>
          <h2 class="page-title">Suggestions for this session</h2>
        </div>
        <${VoToggle} on=${s.a11y.vo} onClick=${() => toggleVO('Top suggestion. ' + insight + ' ' + readRanked())} />
      </div>

      <div class="page-col">
        <div class="card insight">
          <div class="qcard-top">
            <span class="tag-dark"><${Icon} name="sparkle" size=${13} sw=${2.4} color="#F97316" />Top suggestion</span>
            <${Listen} onClick=${() => speak('Top suggestion. ' + insight)} label="Listen to the top suggestion" />
          </div>
          <p class="insight-text">${insight}</p>
          <div class="hr"></div>
          <span class="insight-q">Was this suggestion helpful?</span>
          <div class="grid-2">
            <button class="tap rate rate-up" aria-pressed=${cur === 1} onClick=${() => setReward(currentId, 1)}><${Icon} name="thumbUp" />Helpful</button>
            <button class="tap rate rate-down" aria-pressed=${cur === -1} onClick=${() => setReward(currentId, -1)}><${Icon} name="thumbDown" />Not helpful</button>
          </div>
          <span role="status" class="muted-13">${cur === 1
            ? 'Marked helpful. The list below re-ranks instantly.'
            : cur === -1 ? 'Marked not helpful. The list below re-ranks instantly.' : 'Your feedback shapes the next suggestion.'}</span>
        </div>

        <div class="sec-head">
          <span class="sec-title">All suggestions</span>
          <span class="sec-sub">Most helpful first</span>
        </div>
        <div class="stack-10">
          ${ranked.map((r, i) => html`
            <div class="item" key=${r.id}>
              <span class="rank ${i === 0 ? 'rank-top' : ''}">${i + 1}</span>
              <div class="item-text stack-4">
                <span class="item-title">${r.text}</span>
                <span class="score ${r.score < 0 ? 'score-neg' : ''}">Score ${fmt(r.score)}</span>
              </div>
              <button class="tap vote-btn vote-up" aria-label=${'Helpful: ' + r.text} aria-pressed=${r.rw === 1} onClick=${() => setReward(r.id, 1)}>
                <${Icon} name="thumbUp" size=${18} sw=${2.2} />
              </button>
              <button class="tap vote-btn vote-down" aria-label=${'Not helpful: ' + r.text} aria-pressed=${r.rw === -1} onClick=${() => setReward(r.id, -1)}>
                <${Icon} name="thumbDown" size=${18} sw=${2.2} />
              </button>
            </div>`)}
        </div>

        <div class="sec-head mt-8">
          <div class="stack-2">
            <span class="sec-title">From attendees</span>
            <span class="sec-sub">${s.ideas.length} ideas · most upvoted first</span>
          </div>
          <${Listen} onClick=${() => speak(readIdeaList(s.ideas))} label="Listen to attendee ideas" />
        </div>
        <div class="stack-10">
          ${ideas.map((it) => html`
            <div class="item" key=${it.id}>
              <span class="idea-votes">
                <${Icon} name="chevronUp" size=${14} sw=${2.6} />
                <span>${it.votes}</span>
              </span>
              <div class="item-text stack-3">
                <span class="item-title lh-135">${it.text}</span>
                <span class="idea-line">
                  <span class="sec-sub">${it.author} · ${it.time}</span>
                  <${SpeakBtn} onClick=${() => speak(it.text + '. ' + it.votes + ' upvotes.')} label=${'Read aloud: ' + it.text} />
                </span>
              </div>
              <button class="tap noted-btn" onClick=${() => toggleNoted(it.id)} aria-pressed=${!!it.noted}
                aria-label=${(it.noted ? 'Unmark: ' : 'Mark noted: ') + it.text}>${it.noted ? 'Noted' : 'Mark noted'}</button>
            </div>`)}
        </div>
      </div>
    </div>`;
}
