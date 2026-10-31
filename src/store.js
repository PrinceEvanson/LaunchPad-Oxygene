// LaunchPad state: one object, saved to localStorage, plus every action the UI calls.
import { useEffect, useReducer } from 'preact/hooks';

const KEY = 'launchpad_oxygene_v1';
const SAVED = ['tab', 'checked', 'selected', 'voted', 'votes', 'messages', 'rewards', 'role', 'guestName', 'email', 'activePoll', 'myVotes', 'ideas', 'myIdeaVotes', 'customPolls'];

// ---- Mock data (seeded, so every device gets the same 200 guests) ----
function rng(seed) {
  let x = seed;
  return () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

export const GUESTS = (() => {
  const F = ['Amina','Brian','Catherine','Daniel','Esther','Felix','Grace','Hassan','Irene','James','Kevin','Lucy','Moses','Naomi','Oscar','Peter','Rose','Samuel','Tabitha','Umar','Vivian','Wanjiru','Yusuf','Zawadi','Chipo','Tendai','Thoko','Kondwani','Mwila','Faith','Collins','Joy','Dennis','Mercy','Allan','Linet','Victor','Sharon','Ian','Diana'];
  const L = ['Otieno','Kamau','Mwangi','Njoroge','Wekesa','Achieng','Kiptoo','Chebet','Mutua','Omondi','Banda','Phiri','Mwale','Tembo','Wafula','Mbugua','Kariuki','Nyambura','Odhiambo','Kilonzo','Maina','Kimani','Chirwa','Moyo','Gitau','Rotich','Ochieng','Wanjiku','Kiprono','Njeri','Mumbi','Barasa','Atieno','Langat','Korir','Muthoni','Nduta','Okoth','Wambui','Simiyu'];
  const O = ['Apex Tech Corp','Savannah Capital','Kilimani Legal','Riverside Media','Nairobi Telecom','Baobab Foods','Lakeview Health','Twiga Logistics','Acacia Energy','Mara Hospitality','Zuri Fashion House','Highland Insurance','Pinnacle Consulting','Sunrise Education','Delta Ventures','Orbit Digital','Harambee Bank','Umoja Foundation','Crest Advisory','Equator Mining','Oxygène PR Agency'];
  const r = rng(20261031);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const names = new Set(['Sarah Jenkins', 'Michael Vance']);
  const codes = new Set(['4821', '7305']);
  const list = [
    { id: 0, name: 'Sarah Jenkins', org: 'Oxygène PR Agency', tier: 'VIP Guest', code: '4821' },
    { id: 1, name: 'Michael Vance', org: 'Apex Tech Corp', tier: 'General Admission', code: '7305' },
  ];
  while (list.length < 200) {
    const name = pick(F) + ' ' + pick(L);
    if (names.has(name)) continue;
    let code;
    do code = String(1000 + Math.floor(r() * 9000)); while (codes.has(code));
    names.add(name); codes.add(code);
    const t = r();
    list.push({ id: list.length, name, org: pick(O), tier: t < 0.14 ? 'VIP Guest' : t < 0.22 ? 'Media Pass' : 'General Admission', code });
  }
  return list;
})();

function baseChecked() {
  const r = rng(777);
  const ids = [];
  for (let i = 2; i < 200; i++) ids.push(i);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const m = { 1: true };
  ids.slice(0, 123).forEach((i) => (m[i] = true));
  return m;
}

function defaults() {
  return {
    tab: 'checkin', query: '', filter: 'all', code: '', toast: null, shake: 0, checked: baseChecked(),
    selected: 'b', voted: false, votes: { a: 60, b: 85, c: 25 },
    messages: [
      { id: 1, who: 'guest', text: 'The setup at the South Tower conference room looks amazing!', time: '10:14 AM' },
      { id: 2, who: 'curator', text: 'Thank you! Refreshments are available at the main lobby area.', time: '10:15 AM' },
    ],
    draft: '', typing: false, sim: false, rewards: {},
    ideas: [
      { id: 'i1', text: 'Share the slides on WhatsApp after the talk', author: 'Faith', votes: 14, time: '10:21 AM', noted: false },
      { id: 'i2', text: 'More time for Q&A with the panel', author: 'Anonymous', votes: 9, time: '10:26 AM', noted: true },
      { id: 'i3', text: 'A live demo of the AI newsletter tool', author: 'Brian', votes: 6, time: '10:33 AM', noted: false },
    ],
    myIdeaVotes: {}, ideaDraft: '', ideaAnon: false,
    customPolls: [], activePoll: 'q1', myVotes: {}, customSel: {}, builder: null,
    role: null, loginMode: 'choose', email: '', pin: '', guestName: '', loginError: '', loginTries: 0,
  };
}

// ---- Store ----
function load() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY));
    if (p && typeof p === 'object') return { ...defaults(), ...p };
  } catch (e) {}
  return defaults();
}

let state = load();
const subs = new Set();

export const get = () => state;

export function set(patch) {
  state = { ...state, ...patch };
  try {
    const keep = {};
    SAVED.forEach((k) => (keep[k] = state[k]));
    // Video blob URLs die with the page, so don't save them.
    keep.customPolls = state.customPolls.map((p) => (p.mediaType === 'video' ? { ...p, mediaSrc: null } : p));
    localStorage.setItem(KEY, JSON.stringify(keep));
  } catch (e) {}
  subs.forEach((f) => f());
}

export function useStore() {
  const [, rerender] = useReducer((n) => n + 1, 0);
  useEffect(() => {
    subs.add(rerender);
    return () => subs.delete(rerender);
  }, []);
  return state;
}

const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// ---- Toast ----
let toastTimer;
export function flash(text, kind, undoId = null) {
  clearTimeout(toastTimer);
  set({ toast: { text, kind, undoId } });
  toastTimer = setTimeout(() => set({ toast: null }), 3800);
}

// ---- Check-in ----
export function checkIn(id) {
  const g = GUESTS[id];
  if (state.checked[id]) return flash(g.name + ' is already checked in', 'info');
  set({ checked: { ...state.checked, [id]: true } });
  flash(g.name + ' checked in', 'ok', id);
}

export function undo() {
  const id = state.toast && state.toast.undoId;
  if (id == null) return;
  const checked = { ...state.checked };
  delete checked[id];
  clearTimeout(toastTimer);
  set({ checked, toast: null });
}

export function submitCode() {
  const c = state.code;
  if (c.length < 4) {
    set({ shake: state.shake + 1 });
    return flash('Enter all 4 digits', 'err');
  }
  const g = GUESTS.find((x) => x.code === c);
  if (!g) {
    set({ shake: state.shake + 1, code: '' });
    return flash('Code ' + c + ' not recognized', 'err');
  }
  set({ code: '' });
  checkIn(g.id);
}

// ---- Polls ----
const BUILTIN = {
  id: 'q1', question: 'Which communication channel will dominate corporate strategy by 2027?',
  mediaType: 'none', mediaSrc: null, answerStyle: 'text',
  options: [
    { id: 'a', label: 'Short-form Vertical Video', short: 'Short-form Video' },
    { id: 'b', label: 'AI-Driven Hyper-Personalized Newsletters', short: 'AI-Driven Newsletters' },
    { id: 'c', label: 'Immersive AR/VR Corporate Spaces', short: 'Immersive AR/VR Spaces' },
  ],
};

export const allPolls = (s) => [{ ...BUILTIN, votes: s.votes }, ...s.customPolls];
export const activePoll = (s) => allPolls(s).find((p) => p.id === s.activePoll) || allPolls(s)[0];
export const totalVotes = (p) => p.options.reduce((a, o) => a + (p.votes[o.id] || 0), 0);

export function leaderOf(p) {
  return p.options.reduce((best, o) => ((p.votes[o.id] || 0) > (p.votes[best.id] || 0) ? o : best), p.options[0]);
}

// What this device picked / whether it voted on poll p.
export function myChoice(s, p) {
  if (p.id === 'q1') return { sel: s.selected, voted: !!s.voted };
  const mine = s.myVotes[p.id];
  return { sel: mine != null ? mine : s.customSel[p.id] || null, voted: mine != null };
}

export function pickAnswer(p, id) {
  if (p.id === 'q1') {
    if (!state.voted) set({ selected: id });
    return;
  }
  if (state.myVotes[p.id] != null) return;
  set({ customSel: { ...state.customSel, [p.id]: id } });
}

export function submitVote(p) {
  if (p.id === 'q1') {
    if (state.voted || !state.selected) return;
    return set({ voted: true, votes: { ...state.votes, [state.selected]: state.votes[state.selected] + 1 } });
  }
  const pick = state.customSel[p.id];
  if (!pick) return flash('Pick an answer first', 'err');
  if (state.myVotes[p.id] != null) return;
  set({
    myVotes: { ...state.myVotes, [p.id]: pick },
    customPolls: state.customPolls.map((x) => (x.id === p.id ? { ...x, votes: { ...x.votes, [pick]: (x.votes[pick] || 0) + 1 } } : x)),
  });
}

export function makeLive(id) {
  set({ activePoll: id });
  flash('Question is live on attendee phones', 'ok');
}

// ---- Question builder ----
export const openBuilder = () => set({ builder: { question: '', mediaType: 'none', mediaSrc: null, answerStyle: 'text', options: [{ label: '', img: null }, { label: '', img: null }], error: '' } });
export const closeBuilder = () => set({ builder: null });

export function setB(patch) {
  if (state.builder) set({ builder: { ...state.builder, ...patch, error: '' } });
}

export function setAnswer(i, patch) {
  const b = state.builder;
  if (b) setB({ options: b.options.map((o, j) => (j === i ? { ...o, ...patch } : o)) });
}

// Resize a photo to maxDim and return a JPEG data URL (null if unreadable).
export function readImage(file, maxDim) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const sc = Math.min(1, maxDim / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * sc);
        c.height = Math.round(img.height * sc);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.8));
      } catch (e) { resolve(url); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

export function publishQuestion() {
  const b = state.builder;
  if (!b) return;
  const fail = (error) => set({ builder: { ...b, error } });
  const q = b.question.trim();
  if (!q) return fail('Write the question first.');
  if (b.mediaType !== 'none' && !b.mediaSrc) return fail('Choose a ' + b.mediaType + ', or set media to None.');
  if (b.options.length < 2) return fail('Add at least 2 answers.');
  for (let i = 0; i < b.options.length; i++) {
    const o = b.options[i];
    if (b.answerStyle === 'image' && !o.img) return fail('Add a picture for answer ' + 'ABCD'[i] + '.');
    if (b.answerStyle === 'text' && !o.label.trim()) return fail('Write answer ' + 'ABCD'[i] + '.');
  }
  const id = 'p' + Date.now();
  const options = b.options.map((o, i) => ({ id: 'o' + i, label: o.label.trim() || 'Answer ' + 'ABCD'[i], img: b.answerStyle === 'image' ? o.img : null }));
  const votes = Object.fromEntries(options.map((o) => [o.id, 0]));
  const poll = { id, question: q, mediaType: b.mediaType, mediaSrc: b.mediaType === 'none' ? null : b.mediaSrc, answerStyle: b.answerStyle, options, votes };
  set({ customPolls: [...state.customPolls, poll], activePoll: id, builder: null });
  flash('Question is live on attendee phones', 'ok');
}

// ---- Dashboard ----
// Demo traffic: one vote, maybe a check-in, maybe an idea upvote per tick.
export function tick() {
  const s = state;
  if (!s.sim) return;
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const patch = {};
  const custom = s.customPolls.find((p) => p.id === s.activePoll);
  if (custom) {
    if (totalVotes(custom) < 200) {
      const k = rand(custom.options).id;
      patch.customPolls = s.customPolls.map((p) => (p === custom ? { ...p, votes: { ...p.votes, [k]: (p.votes[k] || 0) + 1 } } : p));
    }
  } else if (s.votes.a + s.votes.b + s.votes.c < 200) {
    const x = Math.random();
    const k = x < 0.36 ? 'a' : x < 0.84 ? 'b' : 'c';
    patch.votes = { ...s.votes, [k]: s.votes[k] + 1 };
  }
  if (Math.random() < 0.45) {
    const pending = GUESTS.filter((g) => !s.checked[g.id]);
    if (pending.length) patch.checked = { ...s.checked, [rand(pending).id]: true };
  }
  if (Math.random() < 0.25 && s.ideas.length) {
    const i = Math.floor(Math.random() * s.ideas.length);
    patch.ideas = s.ideas.map((it, j) => (j === i ? { ...it, votes: it.votes + 1 } : it));
  }
  if (Object.keys(patch).length) set(patch);
}

let replyTimer;
export function resetDemo() {
  clearTimeout(replyTimer);
  const { tab, role, guestName, email } = state;
  set({ ...defaults(), tab, role, guestName, email });
  flash('Demo data reset', 'info');
}

// ---- Chat ----
const GUEST_REPLIES = ['Thank you, that helps!', 'Which room is the next session in?', 'Will the slides be shared after the session?', 'Great, heading there now.', 'Is there a networking break after this talk?'];
const CURATOR_REPLIES = ['Thanks for your message! A curator will be right with you.', 'Refreshments are available at the main lobby area.', 'Yes, the slides will be shared after the session.', 'The next session starts shortly in the South Tower conference room.'];

export function sendMsg(text = state.draft) {
  const t = String(text).trim();
  if (!t) return;
  const org = state.role === 'organizer';
  set({ messages: [...state.messages, { id: Date.now(), who: org ? 'curator' : 'guest', mine: true, text: t, time: now() }], draft: '', typing: true });
  clearTimeout(replyTimer);
  replyTimer = setTimeout(() => {
    const pool = org ? GUEST_REPLIES : CURATOR_REPLIES;
    const reply = { id: Date.now() + 1, who: org ? 'guest' : 'curator', mine: false, text: pool[state.messages.length % pool.length], time: now() };
    set({ messages: [...state.messages, reply], typing: false });
  }, 1700);
}

// ---- Suggestions ----
export function setReward(id, v) {
  set({ rewards: { ...state.rewards, [id]: state.rewards[id] === v ? 0 : v } });
}

export function postIdea() {
  const text = state.ideaDraft.trim();
  if (!text) return;
  const author = state.ideaAnon ? 'Anonymous' : state.guestName.trim() || 'Attendee';
  const idea = { id: 'i' + Date.now(), text: text.slice(0, 200), author, votes: 0, time: now(), noted: false, mine: true };
  set({ ideas: [...state.ideas, idea], ideaDraft: '' });
  flash('Thanks! Your suggestion is posted', 'ok');
}

export function upvoteIdea(id) {
  const mv = { ...state.myIdeaVotes };
  const had = !!mv[id];
  if (had) delete mv[id]; else mv[id] = true;
  set({ myIdeaVotes: mv, ideas: state.ideas.map((it) => (it.id === id ? { ...it, votes: Math.max(0, it.votes + (had ? -1 : 1)) } : it)) });
}

export function toggleNoted(id) {
  set({ ideas: state.ideas.map((it) => (it.id === id ? { ...it, noted: !it.noted } : it)) });
}

// ---- Sign-in ----
export function signInOrganizer() {
  const email = state.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return set({ loginError: 'Enter a valid work email', loginTries: state.loginTries + 1 });
  // ponytail: front-end demo PIN, swap for real auth (see docs/HANDOFF.md → Next steps)
  if (state.pin !== '2026') return set({ loginError: 'Incorrect PIN. Use 2026 for the demo.', loginTries: state.loginTries + 1, pin: '' });
  set({ role: 'organizer', tab: 'dash', email, pin: '', loginError: '', loginMode: 'choose' });
  flash('Signed in as organizer', 'ok');
}

export function joinAttendee() {
  const name = state.guestName.trim();
  set({ role: 'attendee', tab: 'poll', guestName: name, loginMode: 'choose' });
  flash(name ? 'Welcome, ' + name + '!' : 'Welcome to the launch!', 'ok');
}

export function signOut() {
  clearTimeout(toastTimer);
  set({ role: null, loginMode: 'choose', pin: '', loginError: '', toast: null });
}
