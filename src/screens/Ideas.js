// Attendee view: post a suggestion and upvote others'.
import { html } from 'htm/preact';
import { set, postIdea, upvoteIdea } from '../store.js';
import { Icon } from '../ui.js';

export function Ideas({ s }) {
  const ideas = s.ideas.slice().sort((x, y) => y.votes - x.votes);
  return html`
    <div class="screen scroll slide page">
      <div class="stack-4">
        <span class="eyebrow eyebrow-orange">Your ideas</span>
        <h2 class="page-title">Suggest something for this session</h2>
        <p class="lead">The organizers see every idea live. Upvote the ones you agree with.</p>
      </div>

      <div class="card compose">
        <label for="idea-text" class="flabel">Your suggestion</label>
        <textarea id="idea-text" class="textarea textarea-soft" rows="3" maxlength="200" placeholder="e.g. Share the slides on WhatsApp after the talk"
          value=${s.ideaDraft} onInput=${(e) => set({ ideaDraft: e.target.value.slice(0, 200) })}></textarea>
        <div class="compose-row">
          <label class="check">
            <input type="checkbox" checked=${s.ideaAnon} onChange=${() => set({ ideaAnon: !s.ideaAnon })} />
            Post anonymously
          </label>
          <span class="counter">${s.ideaDraft.length} / 200</span>
        </div>
        <button class="tap btn-pri post" onClick=${postIdea} disabled=${!s.ideaDraft.trim()}>Post suggestion</button>
      </div>

      <div class="sec-head">
        <span class="sec-title">Ideas from the room</span>
        <span class="sec-sub">Most upvoted first</span>
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
    </div>`;
}
