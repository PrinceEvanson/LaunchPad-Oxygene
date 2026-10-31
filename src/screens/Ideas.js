// Attendee view: post a suggestion and upvote others'.
import { html } from 'htm/preact';
import { useEffect } from 'preact/hooks';
import { set, postIdea, upvoteIdea, speak, vo, toggleVO, dictate, readIdeaList } from '../store.js';
import { Icon, Listen, SpeakBtn, VoToggle } from '../ui.js';

export function Ideas({ s }) {
  const ideas = s.ideas.slice().sort((x, y) => y.votes - x.votes);
  const listening = s.listening === 'idea';

  // Voice-over reads the top 5 ideas when this screen opens.
  useEffect(() => vo(readIdeaList(s.ideas)), []);
  return html`
    <div class="screen scroll slide page page-split">
      <div class="stack-4 page-head">
        <span class="eyebrow eyebrow-orange">Your ideas</span>
        <${VoToggle} on=${s.a11y.vo} onClick=${() => toggleVO('Suggest something for this session. ' + readIdeaList(s.ideas))} />
        <h2 class="page-title">Suggest something for this session</h2>
        <p class="lead">The organizers see every idea live. Upvote the ones you agree with.</p>
      </div>

      <div class="card compose page-sticky">
        <label for="idea-text" class="flabel">Your suggestion</label>
        <textarea id="idea-text" class="textarea textarea-soft" rows="3" maxlength="200" placeholder="e.g. Share the slides on WhatsApp after the talk"
          value=${s.ideaDraft} onInput=${(e) => set({ ideaDraft: e.target.value.slice(0, 200) })}></textarea>
        <button class="tap btn-ghost ${listening ? 'mic-on' : ''}" aria-pressed=${listening} onClick=${() => dictate('idea')}>
          <${Icon} name="mic" size=${18} sw=${2.2} />${listening ? 'Listening… tap to stop' : 'Speak your idea'}
        </button>
        <div class="compose-row">
          <label class="check">
            <input type="checkbox" checked=${s.ideaAnon} onChange=${() => set({ ideaAnon: !s.ideaAnon })} />
            Post anonymously
          </label>
          <span class="counter">${s.ideaDraft.length} / 200</span>
        </div>
        <button class="tap btn-pri post" onClick=${postIdea} disabled=${!s.ideaDraft.trim()}>Post suggestion</button>
      </div>

      <div class="page-col">
        <div class="sec-head">
          <div class="stack-2">
            <span class="sec-title">Ideas from the room</span>
            <span class="sec-sub">Most upvoted first</span>
          </div>
          <${Listen} onClick=${() => speak(readIdeaList(s.ideas))} label="Listen to the top ideas" />
        </div>
        <div class="stack-10">
          ${ideas.map((it) => {
            const voted = !!s.myIdeaVotes[it.id];
            return html`
              <div class="idea slide" key=${it.id}>
                <div class="idea-body">
                  <span class="idea-text">${it.text}</span>
                  <div class="idea-meta">
                    <span class="sec-sub">${it.mine ? 'You' : it.author} · ${it.time}</span>
                    <${SpeakBtn} onClick=${() => speak(it.text + '. ' + it.votes + ' upvotes.')} label=${'Read aloud: ' + it.text} />
                    ${it.noted && html`<span class="noted-badge"><${Icon} name="check" size=${12} sw=${3} />Noted by organizers</span>`}
                  </div>
                </div>
                <button class="tap upvote" onClick=${() => upvoteIdea(it.id)} disabled=${!!it.mine} aria-pressed=${voted}
                  aria-label=${it.mine ? 'Your suggestion, ' + it.votes + ' upvotes' : (voted ? 'Remove upvote, ' : 'Upvote, ') + it.votes + ' upvotes'}>
                  <${Icon} name="chevronUp" size=${18} sw=${2.4} />
                  <span class="upvote-n">${it.votes}</span>
                </button>
              </div>`;
          })}
        </div>
      </div>
    </div>`;
}
