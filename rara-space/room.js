(function () {
  function fitTip(tip) {
    const text = tip.querySelector('text');
    const rect = tip.querySelector('rect');
    if (!text || !rect) return false;
    let box;
    try { box = text.getBBox(); } catch (e) { return false; }
    if (!box.width) return false;
    const w = Math.round(box.width + 32);
    rect.setAttribute('width', w);
    rect.setAttribute('x', -w / 2);
    return true;
  }
  function fitAllTips() {
    document.querySelectorAll('.hotspot .tip').forEach(fitTip);
  }
  fitAllTips();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAllTips);
  window.addEventListener('load', fitAllTips);
  document.querySelectorAll('.hotspot').forEach((h) => {
    const tip = h.querySelector('.tip');
    if (!tip) return;
    ['pointerenter', 'focus', 'pointerdown'].forEach((ev) => h.addEventListener(ev, () => fitTip(tip)));
  });
})();

const flash = document.getElementById('flash');
requestAnimationFrame(() => requestAnimationFrame(() => {
  flash.style.transition = 'opacity 1.4s ease-out';
  flash.style.opacity = 0;
}));


const clockH = document.getElementById('clock-h');
const clockM = document.getElementById('clock-m');
const pcTime = document.getElementById('pc-time');
const pcDate = document.getElementById('pc-date');

function tickClock() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  clockH.textContent = hh;
  clockM.textContent = mm;
  document.querySelectorAll('.clock-h-mirror').forEach((n) => { n.textContent = hh; });
  document.querySelectorAll('.clock-m-mirror').forEach((n) => { n.textContent = mm; });
  pcTime.textContent = `${hh}:${mm}`;
  pcDate.textContent = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
tickClock();
setInterval(tickClock, 1000);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const backLink = document.querySelector('.back-btn');
let leaving = false;

backLink.addEventListener('click', (e) => {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  if (leaving) return;
  leaving = true;

  flash.style.transition = reduceMotion ? 'opacity .3s ease-in' : 'opacity 1s ease-in';
  flash.style.opacity = 1;
  if (!reduceMotion) {
    document.getElementById('room').animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }],
      { duration: 1000, easing: 'ease-in', fill: 'forwards' }
    );
  }
  setTimeout(() => { location.href = backLink.href; }, reduceMotion ? 320 : 1050);
});

window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  leaving = false;
  flash.style.transition = 'opacity 1s ease-out';
  flash.style.opacity = 0;
});

const inside = document.getElementById('page2');
const lampSpot = document.querySelector('.hotspot[aria-label="Lampu meja"]');
function toggleNight() {
  const on = inside.classList.toggle('night');
  catAbort();
  lampSpot.setAttribute('aria-pressed', String(on));
}
lampSpot.setAttribute('aria-pressed', 'false');
lampSpot.addEventListener('click', toggleNight);
lampSpot.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleNight(); }
});


const SVG_NS = 'http://www.w3.org/2000/svg';
const catSpot = document.querySelector('.hotspot[aria-label="Kucing"]');
const catGroup = document.querySelector('.cat');
const catAwake = catGroup.querySelector('.cat-awake');
const catTail = catGroup.querySelector('.cat-tail');
const catHead = catGroup.querySelector('.cat-head');
const catEars = catGroup.querySelector('.cat-ears');
const catSleepEars = catGroup.querySelector('.cat-sleep-ears');
const Z_X = 676, Z_Y = 806;
const fx = document.createElementNS(SVG_NS, 'g');
fx.setAttribute('pointer-events', 'none');
catSpot.parentNode.appendChild(fx);

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rot = (...deg) => deg.map((d) => ({ transform: `rotate(${d}deg)` }));

function zzz(n) {
  if (reduceMotion) return;
  for (let i = 0; i < n; i++) {
    const z = document.createElementNS(SVG_NS, 'text');
    z.setAttribute('font-size', 18 + i * 4);
    z.setAttribute('font-weight', 800);
    z.setAttribute('font-family', 'system-ui, sans-serif');
    z.setAttribute('fill', '#dfe6ff');
    z.setAttribute('stroke', '#1b2845');
    z.setAttribute('stroke-width', .8);
    z.setAttribute('paint-order', 'stroke');
    z.setAttribute('opacity', 0);
    z.textContent = i % 2 ? 'Z' : 'z';
    fx.appendChild(z);
    const a = `translate(${Z_X}px, ${Z_Y}px) scale(.7)`;
    const b = `translate(${Z_X + 14 + i * 12}px, ${Z_Y - 50 - i * 16}px) scale(1.1)`;
    z.animate([{ opacity: 0, transform: a }, { opacity: 1, transform: a, offset: .15 }, { opacity: 0, transform: b }],
      { duration: 1900, delay: i * 260, easing: 'ease-out', fill: 'both' }).onfinish = () => z.remove();
  }
}

const moves = {
  tail: () => catTail.animate(rot(0, -30, 24, -26, 20, -12, 0), { duration: 1200, easing: 'ease-in-out' }),
  tilt: () => catHead.animate(rot(0, -11, -11, 8, 0), { duration: 1100, easing: 'ease-in-out' }),
  ears: () => catEars.animate(rot(0, -9, 7, -7, 0), { duration: 450 }),
  hop: () => catAwake.animate([
    { transform: 'translateY(0) scale(1,1)' },
    { transform: 'translateY(2px) scale(1.05,.93)', offset: .2 },
    { transform: 'translateY(-16px) scale(.96,1.06)', offset: .5 },
    { transform: 'translateY(0) scale(1.05,.93)', offset: .8 },
    { transform: 'translateY(0) scale(1,1)' }], { duration: 650, easing: 'ease-out' }),
};
let lastMove = '', tipT;
function petCat() {
  if (inside.classList.contains('night')) {
    zzz(3);
    if (!reduceMotion) catSleepEars.animate(rot(0, -10, 6, 0), { duration: 500 });
    catSpot.classList.add('no-tip');
    clearTimeout(tipT);
    tipT = setTimeout(() => catSpot.classList.remove('no-tip'), 2200);
    return;
  }
  if (reduceMotion) return;
  if (catBusy && catMode === 'horn') return;
  blowHorn();
}
catSpot.addEventListener('click', petCat);
catGroup.addEventListener('click', petCat);
catSpot.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); petCat(); }
});


const thumbsEl = document.getElementById('thumbs');
const thumbEls = [...thumbsEl.querySelectorAll('.thumb')];
const NOTES = thumbEls.map((t) => {
  const nm = t.querySelector('.nm');
  const body = t.querySelector('.pnote');
  return { title: nm ? nm.textContent.trim() : '', text: body ? body.textContent : '' };
});
function makePic(p) {
  const box = document.createElement('div');
  box.className = 'sheet';
  const h = document.createElement('div');
  h.className = 'sheet-title';
  h.textContent = p.title;
  const t = document.createElement('div');
  t.className = 'sheet-text';
  t.textContent = p.text;
  box.append(h, t);
  return box;
}

const pc = document.getElementById('pc');
const pcScreen = document.getElementById('pc-screen');
const desk = document.getElementById('desk');
const startMenu = document.getElementById('start-menu');
const tbStart = document.getElementById('tb-start');
const wins = {
  files: document.getElementById('win-files'),
  notes: document.getElementById('win-notes'),
  viewer: document.getElementById('win-viewer'),
  music: document.getElementById('win-music'),
  player: document.getElementById('win-player'),
};
const tbBtns = [...document.querySelectorAll('.tb-btn[data-app]')];
const deskIcons = [...document.querySelectorAll('.desk-icon')];
const monitorSpot = document.querySelector('.hotspot[aria-label="Layar komputer"]');
const monitorScreen = document.querySelector('.monitor-glow').parentNode;
const isSmall = () => window.matchMedia('(max-width: 640px)').matches;
const isCoarse = () => window.matchMedia('(pointer: coarse)').matches;
let activeApp = null, zTop = 10, viewerIdx = 0, pcOpen = false, pcPushed = false;

const winVisible = (a) => !wins[a].hidden && !wins[a].classList.contains('min');
function topVisible() {
  return Object.keys(wins).filter(winVisible)
    .sort((x, y) => (+wins[y].style.zIndex || 0) - (+wins[x].style.zIndex || 0))[0] || null;
}
function updateTb() {
  tbBtns.forEach((b) => {
    const a = b.dataset.app;
    if (a === 'viewer' || a === 'player') b.hidden = wins[a].hidden;
    b.classList.toggle('running', !wins[a].hidden);
    b.classList.toggle('active', a === activeApp && winVisible(a));
  });
  for (const a in wins) wins[a].classList.toggle('active', a === activeApp && winVisible(a));
}
function focusWin(a) { activeApp = a; wins[a].style.zIndex = ++zTop; updateTb(); }
function closeStart() { startMenu.hidden = true; tbStart.setAttribute('aria-expanded', 'false'); }
function openWin(a) {
  const w = wins[a];
  if (w.hidden) {
    w.hidden = false;
    w.classList.remove('min', 'pop');
    void w.offsetWidth;
    w.classList.add('pop');
  } else w.classList.remove('min');
  focusWin(a);
  closeStart();
}
function closeWin(a) { wins[a].hidden = true; wins[a].classList.remove('min'); if (activeApp === a) activeApp = topVisible(); updateTb(); }
function minWin(a) { wins[a].classList.add('min'); if (activeApp === a) activeApp = topVisible(); updateTb(); }

for (const a in wins) {
  const w = wins[a];
  w.addEventListener('pointerdown', () => focusWin(a));
  w.querySelector('[data-act="close"]').addEventListener('click', () => closeWin(a));
  w.querySelector('[data-act="min"]').addEventListener('click', () => minWin(a));
  const bar = w.querySelector('.win-bar');
  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.win-ctl') || isSmall()) return;
    const dr = desk.getBoundingClientRect(), wr = w.getBoundingClientRect();
    const ox = e.clientX - wr.left, oy = e.clientY - wr.top;
    bar.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const x = Math.min(Math.max(ev.clientX - dr.left - ox, 80 - w.offsetWidth), dr.width - 80);
      const y = Math.min(Math.max(ev.clientY - dr.top - oy, 0), dr.height - 34);
      w.style.left = x + 'px';
      w.style.top = y + 'px';
    };
    const up = () => {
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  });
}

let popOpen = null;
function openPop(name, from) {
  const ov = document.getElementById('msg-' + name);
  if (!ov) return;
  popOpen = { ov, from };
  ov.hidden = false;
  const box = ov.querySelector('.msg-box');
  box.classList.remove('pop');
  void box.offsetWidth;
  box.classList.add('pop');
  const ok = ov.querySelector('.msg-ok');
  if (ok) ok.focus({ preventScroll: true });
}
function closePop() {
  if (!popOpen) return;
  const { ov, from } = popOpen;
  popOpen = null;
  ov.hidden = true;
  if (from) from.focus({ preventScroll: true });
}
document.querySelectorAll('.msg-ov').forEach((ov) => {
  ov.querySelectorAll('.msg-ok, [data-act="close"]').forEach((b) => b.addEventListener('click', closePop));
  ov.addEventListener('click', (e) => { if (e.target === ov) closePop(); });
});
document.addEventListener('keydown', (e) => {
  if (popOpen && e.key === 'Escape') { e.stopImmediatePropagation(); closePop(); }
}, true);

deskIcons.forEach((ic) => {
  const open = () => (ic.dataset.pop ? openPop(ic.dataset.pop, ic) : openWin(ic.dataset.app));
  ic.addEventListener('click', (e) => {
    if (e.detail === 0 || isCoarse()) { open(); return; }
    deskIcons.forEach((o) => o.classList.toggle('sel', o === ic));
  });
  ic.addEventListener('dblclick', open);
});
pcScreen.addEventListener('click', (e) => {
  if (!e.target.closest('.desk-icon')) deskIcons.forEach((o) => o.classList.remove('sel'));
  if (!e.target.closest('.start-menu, .tb-start')) closeStart();
});

tbBtns.forEach((b) => b.addEventListener('click', () => {
  const a = b.dataset.app;
  if (wins[a].hidden || wins[a].classList.contains('min')) openWin(a);
  else if (activeApp === a) minWin(a);
  else focusWin(a);
}));
tbStart.addEventListener('click', () => {
  const show = startMenu.hidden;
  startMenu.hidden = !show;
  tbStart.setAttribute('aria-expanded', String(show));
});
startMenu.querySelectorAll('.sm-item').forEach((b) => b.addEventListener('click', () => openWin(b.dataset.app)));


const stageEl = document.getElementById('viewer-stage');
thumbEls.forEach((t, i) => t.addEventListener('click', () => showNote(i, true)));
document.getElementById('files-status').textContent = `${NOTES.length} item`;
function showNote(i, open) {
  const n = NOTES.length;
  viewerIdx = (i + n) % n;
  const p = NOTES[viewerIdx];
  stageEl.replaceChildren(makePic(p));
  document.getElementById('viewer-cap').textContent = `${p.title} · ${viewerIdx + 1} / ${n}`;
  document.getElementById('viewer-title').textContent = `${p.title} – Note`;
  thumbsEl.querySelectorAll('.thumb').forEach((t) => t.classList.toggle('sel', +t.dataset.i === viewerIdx));
  if (open) openWin('viewer');
}
document.getElementById('viewer-prev').addEventListener('click', () => showNote(viewerIdx - 1));
document.getElementById('viewer-next').addEventListener('click', () => showNote(viewerIdx + 1));
showNote(0);


function openPC() {
  if (pcOpen) return;
  pcOpen = true;
  pc.hidden = false;
  document.getElementById('page2').inert = true;
  requestAnimationFrame(() => requestAnimationFrame(() => pc.classList.add('open')));
  pcScreen.focus({ preventScroll: true });
  if (!pcPushed) { history.pushState({ ov: 'pc' }, ''); pcPushed = true; }
}
function closePC(fromPop) {
  if (!pcOpen) return;
  pcOpen = false;
  if (pcPushed) { pcPushed = false; if (fromPop !== true) history.back(); }
  closeStart();
  closeVol();
  pc.classList.remove('open');
  document.getElementById('page2').inert = false;
  setTimeout(() => { if (!pcOpen) pc.hidden = true; }, reduceMotion ? 0 : 380);
  monitorSpot.focus({ preventScroll: true });
}
monitorSpot.addEventListener('click', openPC);
monitorSpot.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPC(); }
});
monitorScreen.style.cursor = 'pointer';
monitorScreen.addEventListener('click', openPC);
document.getElementById('pc-close').addEventListener('click', closePC);
document.getElementById('sm-power').addEventListener('click', closePC);
document.getElementById('tb-power').addEventListener('click', closePC);
pc.addEventListener('click', (e) => { if (e.target === pc) closePC(); });
document.addEventListener('keydown', (e) => {
  if (!pcOpen) return;
  if (e.key === 'Escape') { if (!startMenu.hidden) closeStart(); else if (volIsOpen()) closeVol(); else closePC(); }
  else if (activeApp === 'viewer' && winVisible('viewer') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    showNote(viewerIdx + (e.key === 'ArrowRight' ? 1 : -1));
  }
});
updateTb();


const stickySpot = document.querySelector('.hotspot[aria-label="Catatan" i]');
const stickyPaper = document.getElementById('sticky-paper');
const stickyOv = document.getElementById('sticky');
const stickyNote = document.getElementById('sticky-note');
let stickyOpen = false, stickyPushed = false;
function openSticky() {
  if (stickyOpen || pcOpen) return;
  stickyOpen = true;
  stickyOv.hidden = false;
  inside.inert = true;
  requestAnimationFrame(() => requestAnimationFrame(() => stickyOv.classList.add('open')));
  stickyNote.focus({ preventScroll: true });
  if (!stickyPushed) { history.pushState({ ov: 'sticky' }, ''); stickyPushed = true; }
}
function closeSticky(fromPop) {
  if (!stickyOpen) return;
  stickyOpen = false;
  if (stickyPushed) { stickyPushed = false; if (fromPop !== true) history.back(); }
  stickyOv.classList.remove('open');
  inside.inert = false;
  setTimeout(() => { if (!stickyOpen) stickyOv.hidden = true; }, reduceMotion ? 0 : 280);
  stickySpot.focus({ preventScroll: true });
}
stickySpot.addEventListener('click', openSticky);
stickySpot.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSticky(); }
});
if (stickyPaper) { stickyPaper.style.cursor = 'pointer'; stickyPaper.addEventListener('click', openSticky); }
document.getElementById('sticky-close').addEventListener('click', closeSticky);
stickyOv.addEventListener('click', (e) => { if (e.target === stickyOv) closeSticky(); });
document.addEventListener('keydown', (e) => { if (stickyOpen && e.key === 'Escape') closeSticky(); });



const artOv = document.getElementById('art');
const artCard = document.getElementById('art-card');
const artBody = document.getElementById('art-body');
let artOpen = false, artPushed = false, artSpot = null;
function openArt(n, spot) {
  if (artOpen || stickyOpen || pcOpen) return;
  const tpl = document.querySelector(`template[data-art="${n}"]`);
  if (!tpl) return;
  artBody.replaceChildren(tpl.content.cloneNode(true));
  artSpot = spot || null;
  artCard.dataset.art = n;                              
  artOpen = true;
  artOv.hidden = false;
  inside.inert = true;
  requestAnimationFrame(() => requestAnimationFrame(() => artOv.classList.add('open')));
  artCard.focus({ preventScroll: true });
  if (!artPushed) { history.pushState({ ov: 'art' }, ''); artPushed = true; }
}
function closeArt(fromPop) {
  if (!artOpen) return;
  artOpen = false;
  if (artPushed) { artPushed = false; if (fromPop !== true) history.back(); }
  artOv.classList.remove('open');
  inside.inert = false;
  setTimeout(() => { if (!artOpen) { artOv.hidden = true; artBody.replaceChildren(); } }, reduceMotion ? 0 : 280);
  if (artSpot) artSpot.focus({ preventScroll: true });
}
document.querySelectorAll('.hotspot[data-art]').forEach((h) => {
  const n = h.dataset.art;
  h.addEventListener('click', () => openArt(n, h));
  h.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openArt(n, h); }
  });
});
document.querySelectorAll('.art-frame').forEach((f) => {
  f.addEventListener('click', () => openArt(f.dataset.art, document.querySelector(`.hotspot[data-art="${f.dataset.art}"]`)));
});
document.getElementById('art-close').addEventListener('click', () => closeArt());
artOv.addEventListener('click', (e) => { if (e.target === artOv) closeArt(); });
document.addEventListener('keydown', (e) => { if (artOpen && e.key === 'Escape') closeArt(); });



let closeVol = () => {};           
let volIsOpen = () => false;
(() => {
  const byId = (id) => document.getElementById(id);
  const bgm = byId('bgm');
  const songEls = [...byId('songs').querySelectorAll('.song')];
  const TRACKS = songEls.map((el) => ({
    src: el.dataset.src || '', title: el.dataset.title || 'Tanpa judul',
    artist: el.dataset.artist || '', cover: el.dataset.cover || '',
  }));
  const plName = byId('pl-name'), plArtist = byId('pl-artist'), plMsg = byId('pl-msg');
  const plCur = byId('pl-cur'), plDur = byId('pl-dur'), plSeek = byId('pl-seek');
  const plPlay = byId('pl-play'), plPrev = byId('pl-prev'), plNext = byId('pl-next');
  const plShuffle = byId('pl-shuffle'), plRepeat = byId('pl-repeat');
  const plMute = byId('pl-mute'), plVol = byId('pl-vol'), plVolVal = byId('pl-volval');
  const plCoverImg = byId('pl-cover-img'), vfCoverImg = byId('vf-cover-img');
  const tbVol = byId('tb-vol'), volFly = byId('vol-fly');
  const vfNow = byId('vf-now'), vfName = byId('vf-name'), vfArtist = byId('vf-artist');
  const vfPlay = byId('vf-play'), vfPrev = byId('vf-prev'), vfNext = byId('vf-next');
  const vfMute = byId('vf-mute'), vfVol = byId('vf-vol');

  let mIdx = 0;
  let mRepeat = 'all';
  let mShuffle = false;
  let mWant = true;                 // false kalau pengguna sengaja menekan jeda
  let mErr = false, seeking = false, armed = false;
  const volAttr = parseFloat(byId('songs').dataset.volume);
  bgm.volume = Math.min(Math.max(isFinite(volAttr) ? volAttr : 2, 0), 100) / 100;
  bgm.muted = false;

  const fmt = (s) => {
    if (!isFinite(s) || s < 0) s = 0;
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  };
  const setIcon = (btn, id) => btn.querySelector('use').setAttribute('href', '#' + id);
  const setFill = (r) => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%');

  songEls.forEach((el, i) => {
    const t = TRACKS[i];
    el.innerHTML = '<span class="song-ico"><svg><use href="#ic-music"/></svg><span class="eq"><i></i><i></i><i></i></span></span>' +
      '<span class="song-meta"><b class="song-title"></b><i class="song-artist"></i></span><span class="song-dur">&ndash;:&ndash;&ndash;</span>';
    el.querySelector('.song-title').textContent = t.title;
    el.querySelector('.song-artist').textContent = t.artist;
    if (t.cover) {
      const im = new Image();
      im.alt = '';
      im.onload = () => el.querySelector('.song-ico').prepend(im);
      im.src = t.cover;
    }
    el.addEventListener('click', () => selectSong(i));

    const durEl = el.querySelector('.song-dur');                    
    if (!t.src) { durEl.textContent = '–'; return; }
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', () => { durEl.textContent = isFinite(probe.duration) ? fmt(probe.duration) : '–'; });
    probe.addEventListener('error', () => { durEl.textContent = 'file tidak ada'; el.classList.add('missing'); });
    probe.src = t.src;
  });
  byId('music-status').textContent = `${TRACKS.length} lagu`;

  function renderMusic() {
    const t = TRACKS[mIdx] || { title: 'Belum ada lagu', artist: '', cover: '' };
    const playing = !bgm.paused && !bgm.ended && !mErr;
    plName.textContent = vfName.textContent = t.title;
    plArtist.textContent = vfArtist.textContent = t.artist;
    [plCoverImg, vfCoverImg].forEach((im) => {
      if (!t.cover) { im.hidden = true; im.removeAttribute('src'); }
      else if (im.getAttribute('src') !== t.cover) { im.hidden = true; im.src = t.cover; }
    });
    [plPlay, vfPlay].forEach((b) => {
      setIcon(b, playing ? 'ic-pause' : 'ic-play');
      b.setAttribute('aria-label', playing ? 'Jeda' : 'Putar');
    });
    const off = bgm.muted || bgm.volume === 0;
    [tbVol, plMute, vfMute].forEach((b) => setIcon(b, off ? 'ic-vol-off' : 'ic-vol'));
    [plMute, vfMute].forEach((b) => b.setAttribute('aria-label', off ? 'Suarakan' : 'Bisukan'));
    const v = Math.round(bgm.volume * 100);
    [plVol, vfVol].forEach((r) => { r.value = v; setFill(r); });
    plVolVal.textContent = bgm.muted ? 'Mute' : v + '%';
    plShuffle.classList.toggle('on', mShuffle);
    plShuffle.setAttribute('aria-pressed', String(mShuffle));
    setIcon(plRepeat, mRepeat === 'one' ? 'ic-repeat1' : 'ic-repeat');
    plRepeat.classList.toggle('on', mRepeat !== 'off');
    const rl = { all: 'Ulangi semua', one: 'Ulangi satu lagu', off: 'Ulangi mati' }[mRepeat];
    plRepeat.setAttribute('aria-label', rl); plRepeat.title = rl;
    songEls.forEach((el, i) => {
      el.classList.toggle('playing', i === mIdx);
      el.classList.toggle('live', i === mIdx && playing);
    });
  }
  function renderTime() {
    const d = bgm.duration, c = bgm.currentTime || 0;
    plCur.textContent = fmt(c);
    plDur.textContent = isFinite(d) ? fmt(d) : '0:00';
    plSeek.disabled = !isFinite(d);
    if (!seeking) { plSeek.value = isFinite(d) && d > 0 ? Math.round(c / d * 1000) : 0; setFill(plSeek); }
  }

  function startPlay() {
    if (!TRACKS.length || !bgm.src) return;
    const p = bgm.play();
    if (p && p.catch) p.catch((err) => { if (err && err.name === 'NotAllowedError') armGesture(); });
  }
  function loadTrack(i) {
    if (!TRACKS.length) return;
    mIdx = (i + TRACKS.length) % TRACKS.length;
    mErr = false;
    plMsg.textContent = '';
    if (TRACKS[mIdx].src) bgm.src = TRACKS[mIdx].src;
    renderMusic(); renderTime(); updateMediaSession();
  }
  function toggleMusic() {
    if (bgm.paused || bgm.ended) { mWant = true; if (mErr) loadTrack(mIdx); startPlay(); }
    else { mWant = false; bgm.pause(); }
  }
  function pickNext() {
    const n = TRACKS.length;
    if (n < 2) return mIdx;
    if (mShuffle) { let k; do { k = Math.floor(Math.random() * n); } while (k === mIdx); return k; }
    return (mIdx + 1) % n;
  }
  function nextTrack() { mWant = true; loadTrack(pickNext()); startPlay(); }
  function prevTrack() {
    if (bgm.currentTime > 3) { bgm.currentTime = 0; return; }
    mWant = true; loadTrack(mIdx - 1); startPlay();
  }
  function selectSong(i) {                       
    mWant = true;
    if (i !== mIdx || mErr) loadTrack(i);
    if (bgm.paused) startPlay();
    openWin('player');
  }

  plPlay.addEventListener('click', toggleMusic);
  vfPlay.addEventListener('click', toggleMusic);
  plPrev.addEventListener('click', prevTrack);
  vfPrev.addEventListener('click', prevTrack);
  plNext.addEventListener('click', nextTrack);
  vfNext.addEventListener('click', nextTrack);
  plShuffle.addEventListener('click', () => { mShuffle = !mShuffle; renderMusic(); });
  plRepeat.addEventListener('click', () => {
    mRepeat = { all: 'one', one: 'off', off: 'all' }[mRepeat];
    renderMusic();
  });
  [plMute, vfMute].forEach((b) => b.addEventListener('click', () => { bgm.muted = !bgm.muted; }));
  [plVol, vfVol].forEach((r) => r.addEventListener('input', () => {
    bgm.volume = r.value / 100;
    if (bgm.muted && bgm.volume > 0) bgm.muted = false;
  }));
  plSeek.addEventListener('input', () => {
    seeking = true;
    const d = bgm.duration;
    if (isFinite(d)) plCur.textContent = fmt(plSeek.value / 1000 * d);
    setFill(plSeek);
  });
  plSeek.addEventListener('change', () => {
    const d = bgm.duration;
    if (isFinite(d)) bgm.currentTime = plSeek.value / 1000 * d;
    seeking = false;
  });

  ['play', 'pause', 'volumechange'].forEach((ev) => bgm.addEventListener(ev, renderMusic));
  ['timeupdate', 'loadedmetadata', 'durationchange', 'emptied'].forEach((ev) => bgm.addEventListener(ev, renderTime));
  bgm.addEventListener('ended', () => {
    if (mRepeat === 'one') { bgm.currentTime = 0; startPlay(); return; }
    if (!mShuffle && mIdx === TRACKS.length - 1 && mRepeat === 'off') { renderMusic(); return; }
    loadTrack(pickNext()); startPlay();
  });
  bgm.addEventListener('error', () => {
    if (!TRACKS[mIdx]) return;
    mErr = true;
    songEls[mIdx].classList.add('missing');
    plMsg.textContent = `Lagu tidak bisa dimuat. Cek file: ${TRACKS[mIdx].src}`;
    renderMusic();
  });
  [plCoverImg, vfCoverImg].forEach((im) => {
    im.addEventListener('load', () => { im.hidden = false; });
    im.addEventListener('error', () => { im.hidden = true; });
  });

  
  closeVol = () => { volFly.hidden = true; tbVol.setAttribute('aria-expanded', 'false'); };
  volIsOpen = () => !volFly.hidden;
  tbVol.addEventListener('click', () => {
    const show = volFly.hidden;
    closeStart();
    volFly.hidden = !show;
    tbVol.setAttribute('aria-expanded', String(show));
  });
  tbStart.addEventListener('click', () => closeVol());
  pcScreen.addEventListener('click', (e) => { if (!e.target.closest('.vol-fly, .tb-vol')) closeVol(); });
  vfNow.addEventListener('click', () => { openWin('player'); closeVol(); });


  function updateMediaSession() {
    if (!('mediaSession' in navigator) || !TRACKS[mIdx]) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: TRACKS[mIdx].title, artist: TRACKS[mIdx].artist, album: 'his space' });
    } catch (e) {}
  }
  if ('mediaSession' in navigator) {
    [['play', () => { mWant = true; startPlay(); }], ['pause', () => { mWant = false; bgm.pause(); }],
     ['previoustrack', prevTrack], ['nexttrack', nextTrack]].forEach(([a, f]) => {
      try { navigator.mediaSession.setActionHandler(a, f); } catch (e) {}
    });
  }

  
  function armGesture() {
    if (armed) return;
    armed = true;
    const evs = ['pointerup', 'touchend', 'click', 'keydown'];
    const off = () => { evs.forEach((e) => document.removeEventListener(e, go, true)); armed = false; };
    const go = () => {
      if (!mWant || !bgm.paused) { off(); return; }
      const p = bgm.play();
      if (p && p.then) p.then(off, () => {});
    };
    evs.forEach((e) => document.addEventListener(e, go, true));
  }
  window.kickMusic = () => {
    if (!TRACKS.length || !mWant || !bgm.paused) return;
    const p = bgm.play();
    if (p && p.catch) p.catch(() => {});
  };
  if (TRACKS.length) {
    loadTrack(mIdx);
    startPlay();
  } else {
    renderMusic();
  }
  window.addEventListener('pageshow', (e) => { if (e.persisted && mWant) startPlay(); });
})();



const PC_PASSWORD = '2611';   
const lockEl = document.getElementById('lock');
const lockForm = document.getElementById('lock-form');
const lockInput = document.getElementById('lock-input');
const lockMsg = document.getElementById('lock-msg');
let pcLocked = true;

function tickLock() {
  const d = new Date();
  document.getElementById('lock-time').textContent =
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  document.getElementById('lock-date').textContent =
    d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
}
tickLock();
setInterval(tickLock, 1000);

lockForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (lockInput.value === PC_PASSWORD) {
    if (window.kickMusic) window.kickMusic();
    pcLocked = false;
    lockMsg.textContent = '';
    lockEl.classList.add('unlocking');
    setTimeout(() => { lockEl.hidden = true; pcScreen.focus({ preventScroll: true }); }, reduceMotion ? 0 : 450);
  } else {
    lockMsg.textContent = 'Kata sandi salah. Coba lagi.';
    lockInput.value = '';
    lockForm.classList.remove('shake');
    void lockForm.offsetWidth;
    lockForm.classList.add('shake');
    lockInput.focus();
  }
});
lockInput.addEventListener('input', () => { lockMsg.textContent = ''; });


const LOCK_AVATAR = 'picture/vlad 9.jfif';
const lockAvatar = document.querySelector('.lock-avatar');
const lockAvatarImg = document.getElementById('lock-avatar-img');
lockAvatarImg.addEventListener('load', () => { lockAvatarImg.hidden = false; lockAvatar.classList.add('has-photo'); });
lockAvatarImg.addEventListener('error', () => { lockAvatarImg.hidden = true; lockAvatar.classList.remove('has-photo'); });
lockAvatarImg.src = LOCK_AVATAR;


document.getElementById('lock-logout').addEventListener('click', () => closePC());


window.addEventListener('popstate', () => {
  if (artOpen) closeArt(true);
  else if (stickyOpen) closeSticky(true);
  else if (pcOpen) closePC(true);
});

const catHorn = catGroup.querySelector('.cat-horn');
let catBusy = false, catMode = '', catToken = 0, catAnims = [], idleT;
const wait = (ms) => new Promise((r) => setTimeout(() => r(true), ms));

function play(el, frames, opts) {
  const a = el.animate(frames, Object.assign({ fill: 'forwards' }, opts));
  catAnims.push(a);
  return a.finished.then(() => true, () => false);
}
function catStart(mode) {
  catAbort();
  catBusy = true; catMode = mode;
  catSpot.classList.add('busy');
  return catToken;
}
function catAbort() {
  catToken++;
  catAnims.forEach((a) => { try { a.cancel(); } catch (e) {} });
  catAnims = [];
  fx.querySelectorAll('.cat-fx').forEach((n) => n.remove());
  catBusy = false; catMode = '';
  catSpot.classList.remove('busy');
}

let tootCtx = null;
function toot(pitch) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!tootCtx) tootCtx = new AC();
  const c = tootCtx;
  if (c.state === 'suspended') c.resume();
  const t = c.currentTime;
  const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(pitch * 0.8, t);
  o.frequency.exponentialRampToValueAtTime(pitch, t + 0.08);
  f.type = 'lowpass';
  f.frequency.value = 1800;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
  g.gain.setValueAtTime(0.12, t + 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  o.connect(f).connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.45);
}

async function blowHorn() {
  const t = catStart('horn');
  const go = async (p) => (await p) && t === catToken;
  const UP = 'rotate(-7deg) translate(0px, -2px)';
  if (!await go(play(catHead, [{ transform: 'none' }, { transform: UP }], { duration: 240, easing: 'ease-out' }))) return;
  for (let i = 0; i < 3; i++) {
    toot(340 + i * 60);
    play(catHorn, [{ transform: 'scaleX(.38)' }, { transform: 'scaleX(1.4)' }], { duration: 160, easing: 'ease-out' });
    play(catAwake, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.04,.96)' }, { transform: 'scale(1,1)' }], { duration: 320 });
    if (!await go(wait(140))) return;
    const r = catHorn.getBoundingClientRect();
    popConfetti(r.right, r.top + r.height / 2, 30);
    if (!await go(wait(260))) return;
    play(catHorn, [{ transform: 'scaleX(1.4)' }, { transform: 'scaleX(.38)' }], { duration: 200, easing: 'ease-in' });
    if (!await go(wait(240))) return;
  }
  play(catHead, [{ transform: UP }, { transform: 'none' }], { duration: 300, easing: 'ease-in-out' });
  play(catTail, rot(0, -30, 24, -26, 20, -12, 0), { duration: 1000, easing: 'ease-in-out' });
  if (!await go(wait(800))) return;
  catAbort();
}

function idleTick() {
  clearTimeout(idleT);
  idleT = setTimeout(() => {
    const free = !catBusy && !document.hidden && !reduceMotion && !pcOpen && !stickyOpen && !artOpen && !inside.classList.contains('night');
    if (free) {
      const r = Math.random();
      (r < .45 ? moves.tail : r < .8 ? moves.tilt : moves.ears)();
    }
    idleTick();
  }, 3200 + Math.random() * 3800);
}
if (!reduceMotion) idleTick();



const DLG_SOUND = 'pop';

const dlgBlip = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, noise = null, n = 0;
  const wake = () => {
    if (!AC) return;
    if (!ctx) {
      ctx = new AC();
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, wake, { passive: true }));

  const env = (g, t, peak, attack, end) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + end);
  };

  const styles = {
    pop(t, base) {
      const f = base * 1.5 * (0.94 + Math.random() * 0.12);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f * 0.7, t);
      o.frequency.exponentialRampToValueAtTime(f * 1.15, t + 0.03);
      env(g, t, 0.1, 0.004, 0.08);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + 0.1);
    },
    tap(t, base) {
      const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = noise;
      bp.type = 'bandpass';
      bp.frequency.value = 700 + Math.random() * 300;
      bp.Q.value = 3;
      env(g, t, 0.35, 0.002, 0.04);
      src.connect(bp).connect(g).connect(ctx.destination);
      src.start(t); src.stop(t + 0.05);
      const o = ctx.createOscillator(), g2 = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(base * 0.8, t);
      env(g2, t, 0.06, 0.003, 0.05);
      o.connect(g2).connect(ctx.destination);
      o.start(t); o.stop(t + 0.06);
    },
    chime(t, base) {
      const f = base * 2 * (n % 2 ? 1 : 1.25);
      [[1, 0.06], [3, 0.012]].forEach(([m, v]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f * m;
        env(g, t, v, 0.004, 0.12);
        o.connect(g).connect(ctx.destination);
        o.start(t); o.stop(t + 0.14);
      });
    }
  };

  return function (ch, base) {
    if (!ch || /[\s.,!?]/.test(ch)) return;
    if ((n++ % 3) !== 0) return;
    wake();
    if (!ctx || ctx.state !== 'running') return;
    (styles[DLG_SOUND] || styles.pop)(ctx.currentTime, base);
  };
})();

const ROOM_LINES = [
  'happy birthday sayang! sedikit kejutan buat kamu',
  'musik nya kedengeran ga sayang? coba atur volume di komputer',
];
const dialogEl = document.getElementById('dialog');
const dlgTyped = document.getElementById('dlg-typed');
const dlgRest = document.getElementById('dlg-rest');
let dlgTimer = null;

function showDialog(lines) {
  return new Promise((resolve) => {
    let i = 0, pos = 0, full = false;
    const paint = () => {
      dlgTyped.textContent = lines[i].slice(0, pos);
      dlgRest.textContent = lines[i].slice(pos);
    };
    const finishLine = () => {
      clearInterval(dlgTimer);
      dlgTimer = null;
      pos = lines[i].length;
      paint();
      full = true;
      dialogEl.classList.add('done');
    };
    const startLine = () => {
      full = false;
      pos = 0;
      paint();
      dialogEl.classList.remove('done');
      dialogEl.setAttribute('aria-label', 'me: ' + lines[i]);
      const nextEl = dialogEl.querySelector('.dlg-next');
      const more = i < lines.length - 1;
      nextEl.textContent = more ? 'next' : '\u25BC';
      nextEl.classList.toggle('is-text', more);
      if (reduceMotion) { finishLine(); return; }
      dlgTimer = setInterval(() => {
        pos++;
        paint();
        dlgBlip(lines[i][pos - 1], 262);
        if (pos >= lines[i].length) finishLine();
      }, 34);
    };
    const close = () => {
      dialogEl.removeEventListener('click', advance);
      document.removeEventListener('keydown', onKey);
      dialogEl.classList.remove('show');
      setTimeout(() => { dialogEl.hidden = true; }, 380);
      resolve();
    };
    function advance(e) {
      if (e) e.stopPropagation();
      if (!full) { finishLine(); return; }
      if (i < lines.length - 1) { i++; startLine(); return; }
      close();
    }
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
    };
    dialogEl.addEventListener('click', advance);
    document.addEventListener('keydown', onKey);
    dialogEl.hidden = false;
    void dialogEl.offsetWidth;
    dialogEl.classList.add('show');
    startLine();
  });
}

(async () => {
  await new Promise((r) => setTimeout(r, 1500));
  inside.inert = true;
  await showDialog(ROOM_LINES);
  inside.inert = false;
  showQuest();
})();

function showQuest() {
  const q = document.getElementById('quest');
  const audio = document.getElementById('bgm');
  q.hidden = false;
  void q.offsetWidth;
  q.classList.add('show');
  const sliders = ['pl-vol', 'vf-vol'].map((id) => document.getElementById(id)).filter(Boolean);
  const mutes = ['pl-mute', 'vf-mute'].map((id) => document.getElementById(id)).filter(Boolean);
  const done = () => {
    audio.removeEventListener('volumechange', done);
    sliders.forEach((el) => el.removeEventListener('input', done));
    mutes.forEach((el) => el.removeEventListener('click', done));
    q.classList.remove('show');
    setTimeout(() => { q.hidden = true; }, reduceMotion ? 0 : 400);
  };
  audio.addEventListener('volumechange', done);
  sliders.forEach((el) => el.addEventListener('input', done));
  mutes.forEach((el) => el.addEventListener('click', done));
}

const cfCanvas = document.getElementById('confetti');
const cfCtx = cfCanvas.getContext('2d');
const CF_COLORS = ['#f06292', '#ffd54f', '#4dd0e1', '#ba68c8', '#81c784', '#ff8a65', '#ffffff', '#64b5f6', '#ff5252', '#ffb74d'];
let cfParts = [], cfRaf = 0, cfW = 0, cfH = 0;

function cfSize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cfW = window.innerWidth;
  cfH = window.innerHeight;
  cfCanvas.width = cfW * dpr;
  cfCanvas.height = cfH * dpr;
  cfCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
cfSize();
window.addEventListener('resize', cfSize);

function cfMake(x, y, vx, vy, life, delay) {
  return {
    x, y, vx, vy, life, age: -(delay || 0),
    w: 5 + Math.random() * 7, h: 3 + Math.random() * 5,
    rot: Math.random() * 6.28, vr: (Math.random() - .5) * .4,
    c: pick(CF_COLORS), wob: Math.random() * 6.28, round: Math.random() < .25,
  };
}

function cfStep() {
  cfCtx.clearRect(0, 0, cfW, cfH);
  const next = [];
  for (const p of cfParts) {
    p.age++;
    if (p.age < 0) { next.push(p); continue; }
    p.vx *= .992;
    p.vy = p.vy * .992 + .16;
    p.x += p.vx + Math.sin(p.wob + p.age * .08) * .5;
    p.y += p.vy;
    p.rot += p.vr;
    if (p.age > p.life || p.y > cfH + 30) continue;
    const left = p.life - p.age;
    cfCtx.globalAlpha = left < 25 ? left / 25 : 1;
    cfCtx.fillStyle = p.c;
    cfCtx.save();
    cfCtx.translate(p.x, p.y);
    cfCtx.rotate(p.rot);
    if (p.round) {
      cfCtx.beginPath();
      cfCtx.arc(0, 0, p.h / 1.6, 0, 6.28);
      cfCtx.fill();
    } else {
      cfCtx.scale(1, Math.abs(Math.cos(p.age * .12 + p.wob)) * .8 + .2);
      cfCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    cfCtx.restore();
    next.push(p);
  }
  cfCtx.globalAlpha = 1;
  cfParts = next;
  if (cfParts.length) cfRaf = requestAnimationFrame(cfStep);
  else { cfRaf = 0; cfCtx.clearRect(0, 0, cfW, cfH); }
}
function cfKick() { if (!cfRaf) cfRaf = requestAnimationFrame(cfStep); }

function popConfetti(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (.05 + Math.random() * .45);
    const sp = 4 + Math.random() * 7;
    cfParts.push(cfMake(x, y, Math.cos(a) * sp, Math.sin(a) * sp, 80 + Math.random() * 50, 0));
  }
  cfKick();
}

function entryBurst() {
  const L = cfW, H = cfH;
  for (let i = 0; i < 90; i++) {
    const a = -Math.PI / 2 + (Math.random() - .5) * 1.1;
    const sp = 9 + Math.random() * 11;
    cfParts.push(cfMake(0, H, Math.abs(Math.cos(a)) * sp * 1.1, Math.sin(a) * sp, 160 + Math.random() * 70, Math.random() * 14));
    cfParts.push(cfMake(L, H, -Math.abs(Math.cos(a)) * sp * 1.1, Math.sin(a) * sp, 160 + Math.random() * 70, Math.random() * 14));
  }
  for (let i = 0; i < 150; i++) {
    cfParts.push(cfMake(Math.random() * L, -20 - Math.random() * H * .5, (Math.random() - .5) * 2, 1 + Math.random() * 2.5, 320, Math.random() * 100));
  }
  cfKick();
}
if (!reduceMotion) {
  setTimeout(entryBurst, 450);
  setTimeout(() => popConfetti(cfW * .5, cfH * .35, 60), 1500);
}