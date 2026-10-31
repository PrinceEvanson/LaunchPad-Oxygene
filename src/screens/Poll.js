import { html } from 'htm/preact';
import { allPolls, activePoll, myChoice, pickAnswer, submitVote, makeLive, openBuilder } from '../store.js';
import { Icon } from '../ui.js';

export function Poll({ s }) {
  const active = activePoll(s);
  const { sel, voted } = myChoice(s, active);
  const pictures = active.answerStyle === 'image';

  return html`
    <div class="screen slide">
      <div class="scroll poll-body">
        ${s.role === 'organizer' && html`
          <${QuestionList} s=${s} activeId=${active.id} />
          <span class="eyebrow preview-label">What attendees see</span>`}

        <div class="card qcard">
          <span class="chip-live"><span class="dot live-dot"></span>Live poll</span>
          ${active.mediaType === 'image' && active.mediaSrc && html`<img class="qmedia" src=${active.mediaSrc} alt="Question image" />`}
          ${active.mediaType === 'video' && (active.mediaSrc
            ? html`<video class="qmedia-video" src=${active.mediaSrc} controls playsinline preload="metadata" aria-label="Question video"></video>`
            : html`<div class="qmedia-missing">Video plays on the device that added it</div>`)}
          <h2 id="poll-q">${active.question}</h2>
        </div>

        <div role="radiogroup" aria-labelledby="poll-q" class=${pictures ? 'answers-grid' : 'answers'}>
          ${active.options.map((o) => {
            const on = sel === o.id;
            return html`
              <label class="opt ${pictures ? 'opt-card' : ''} ${on ? 'on' : ''} ${voted && !on ? 'dim' : ''}">
                <input class="radio" type="radio" name="vote" value=${o.id} checked=${on} disabled=${voted} onChange=${() => pickAnswer(active, o.id)} />
                ${pictures
                  ? html`
                    ${o.img && html`<img src=${o.img} alt=${o.label} />`}
                    <div class="opt-card-row"><span class="ring"></span><span class="opt-card-label">${o.label}</span></div>`
                  : html`<span class="ring"></span><span class="opt-label">${o.label}</span>`}
              </label>`;
          })}
        </div>
      </div>

      <div class="vote-bar">
        ${voted
          ? html`
            <div class="voted pop" role="status">
              <span class="voted-tick"><${Icon} name="check" size=${16} sw=${3} /></span>
              Vote Submitted! Awaiting next question...
            </div>`
          : html`<button class="tap btn-pri btn-lg btn-block" onClick=${() => submitVote(active)}>Submit Vote</button>`}
      </div>
    </div>`;
}

function QuestionList({ s, activeId }) {
  return html`
    <div class="qpanel">
      <div class="qpanel-head">
        <div class="stack-2">
          <span class="qpanel-title">Questions</span>
          <span class="qpanel-sub">Pick which one attendees see</span>
        </div>
        <button class="tap btn-pri btn-new" onClick=${openBuilder}><${Icon} name="plus" size=${18} sw=${2.6} />New question</button>
      </div>
      ${allPolls(s).map((p) => {
        const tags = (p.mediaType === 'image' ? 'Image' : p.mediaType === 'video' ? 'Video' : 'Text') + ' · ' +
          (p.answerStyle === 'image' ? 'Picture answers' : p.options.length + ' answers');
        return html`
          <div class="qitem" key=${p.id}>
            <div class="qitem-text">
              <span class="qitem-q">${p.question}</span>
              <span class="qitem-tags">${tags}</span>
            </div>
            ${p.id === activeId
              ? html`<span class="live-tag"><span class="dot live-dot"></span>Live</span>`
              : html`<button class="tap make-live" onClick=${() => makeLive(p.id)} aria-label=${'Make live: ' + p.question}>Make live</button>`}
          </div>`;
      })}
    </div>`;
}
