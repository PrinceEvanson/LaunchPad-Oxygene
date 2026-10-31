import { html } from 'htm/preact';
import { get, setB, setAnswer, readImage, flash, closeBuilder, publishQuestion } from '../store.js';
import { Icon, Seg, Tribal } from '../ui.js';

const firstFile = (e) => e.target.files && e.target.files[0];

export function Builder({ b }) {
  const video = b.mediaType === 'video';

  const onMedia = async (e) => {
    const f = firstFile(e);
    if (!f) return;
    if (video) return setB({ mediaSrc: URL.createObjectURL(f) });
    const src = await readImage(f, 960);
    if (src) setB({ mediaSrc: src });
    else flash('That image could not be read', 'err');
  };

  const onAnswerImg = async (i, e) => {
    const f = firstFile(e);
    const src = f && (await readImage(f, 480));
    if (src) setAnswer(i, { img: src });
  };

  const addAnswer = () => {
    const opts = get().builder.options;
    if (opts.length < 4) setB({ options: [...opts, { label: '', img: null }] });
  };

  return html`
    <div class="sheet slide" role="dialog" aria-modal="true" aria-label="New question">
      <div class="sheet-head">
        <span class="sheet-title">New question</span>
        <button class="tap icon-btn" onClick=${closeBuilder} aria-label="Close"><${Icon} name="close" sw=${2.2} /></button>
      </div>
      <${Tribal} />

      <div class="scroll sheet-body">
        <div class="stack-8">
          <label for="b-question" class="flabel">Question</label>
          <textarea id="b-question" class="textarea" rows="2" maxlength="160" placeholder="e.g. Which launch moment did you enjoy most?"
            value=${b.question} onInput=${(e) => setB({ question: e.target.value })}></textarea>
        </div>

        <div class="stack-8">
          <span class="flabel">Add media <em>(optional)</em></span>
          <${Seg} label="Media type" value=${b.mediaType} onPick=${(m) => setB({ mediaType: m, mediaSrc: null })}
            items=${[['none', 'None'], ['image', 'Image'], ['video', 'Video']]} />
          ${b.mediaType !== 'none' && html`
            <div class="stack-10">
              ${b.mediaSrc && (video
                ? html`<video class="bmedia-video" src=${b.mediaSrc} controls playsinline preload="metadata" aria-label="Selected video"></video>`
                : html`<img class="bmedia" src=${b.mediaSrc} alt="Selected image" />`)}
              <label class="tap upload">
                <input class="file" type="file" accept=${video ? 'video/*' : 'image/*'} onChange=${onMedia} />
                <${Icon} name="upload" size=${18} />${(b.mediaSrc ? 'Replace ' : 'Choose ') + b.mediaType}
              </label>
              <span class="note">${video
                ? 'Short clips work best (under 30 seconds). Videos play on this device for the demo.'
                : 'Photos are resized automatically for fast loading on phones.'}</span>
              ${video
                ? html`
                  <label for="b-transcript" class="flabel">Transcript <em>(required)</em></label>
                  <textarea id="b-transcript" class="textarea" rows="3" placeholder="What is said and shown in the video"
                    value=${b.transcript} onInput=${(e) => setB({ transcript: e.target.value })}></textarea>`
                : html`
                  <label for="b-alt" class="flabel">Image description <em>(for screen readers)</em></label>
                  <input id="b-alt" class="field" type="text" maxlength="160" placeholder="e.g. The new product on stage under orange lights"
                    value=${b.mediaAlt} onInput=${(e) => setB({ mediaAlt: e.target.value })} />`}
            </div>`}
        </div>

        <div class="stack-8">
          <span class="flabel">Answer style</span>
          <${Seg} label="Answer style" value=${b.answerStyle} onPick=${(a) => setB({ answerStyle: a })}
            items=${[['text', 'Text'], ['image', 'Pictures']]} />
        </div>

        <div class="stack-10">
          <span class="flabel">Answers <em>(2 to 4)</em></span>
          ${b.options.map((o, i) => {
            const L = 'ABCD'[i];
            const placeholder = b.answerStyle === 'image' ? 'Caption ' + L + ' (optional)' : 'Answer ' + L;
            return html`
              <div class="answer-row">
                <span class="letter">${L}</span>
                ${b.answerStyle === 'image' && html`
                  <label class="tap answer-thumb" aria-label=${'Picture for answer ' + L}>
                    <input class="file" type="file" accept="image/*" onChange=${(e) => onAnswerImg(i, e)} />
                    ${o.img ? html`<img src=${o.img} alt="" />` : html`<${Icon} name="image" color="#475569" />`}
                  </label>`}
                <input class="answer-input" type="text" maxlength="60" aria-label=${placeholder} placeholder=${placeholder}
                  value=${o.label} onInput=${(e) => setAnswer(i, { label: e.target.value })} />
                ${b.options.length > 2 && html`
                  <button class="tap answer-remove" aria-label=${'Remove answer ' + L}
                    onClick=${() => setB({ options: get().builder.options.filter((_, j) => j !== i) })}>
                    <${Icon} name="close" size=${18} sw=${2.2} />
                  </button>`}
              </div>`;
          })}
          ${b.options.length < 4 && html`<button class="tap add-answer" onClick=${addAnswer}>+ Add answer</button>`}
        </div>
        ${b.error && html`<p role="alert" class="error">${b.error}</p>`}
      </div>

      <div class="sheet-foot">
        <button class="tap btn-pri btn-lg btn-block" onClick=${publishQuestion}>Publish & make live</button>
      </div>
    </div>`;
}
