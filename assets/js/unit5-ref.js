/* ================================================================
   SEQUENTIAL LOGIC CIRCUITS – SCRIPT.JS
   All interactive logic, simulations, timing diagrams, quiz
   ================================================================ */
'use strict';

/* ═══════════ THEME ═══════════ */
let dark = true;
function setTheme(d) {
  dark = d;
  document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light');
  const ico = d ? '🌙' : '☀️', lbl = d ? 'Dark Mode' : 'Light Mode';
  document.getElementById('themeIcon').textContent  = ico;
  document.getElementById('themeLabel').textContent = lbl;
  document.getElementById('themeBtnTop').textContent = ico;
  localStorage.setItem('sltheme', d ? 'dark' : 'light');
  setTimeout(redrawAll, 80);
}
document.getElementById('themeBtn').onclick    = () => setTheme(!dark);
document.getElementById('themeBtnTop').onclick = () => setTheme(!dark);
setTheme(localStorage.getItem('sltheme') !== 'light');

/* ═══════════ SIDEBAR ═══════════ */
const sb = document.getElementById('sidebar'), ov = document.getElementById('overlay');
document.getElementById('menuBtn').onclick  = () => { sb.classList.add('open'); ov.classList.add('show'); };
document.getElementById('sb-close').onclick = () => { sb.classList.remove('open'); ov.classList.remove('show'); };
ov.onclick = () => { sb.classList.remove('open'); ov.classList.remove('show'); };

/* ═══════════ NAV SEARCH ═══════════ */
document.getElementById('navSrch').addEventListener('input', function () {
  const q = this.value.toLowerCase();
  document.querySelectorAll('.nav-link').forEach(a => {
    a.parentElement.style.display = a.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});

/* ═══════════ SCROLL / PROGRESS / ACTIVE NAV ═══════════ */
const allSecs = document.querySelectorAll('.sec');
const navLinks = document.querySelectorAll('.nav-link');
function goTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  sb.classList.remove('open'); ov.classList.remove('show');
}
navLinks.forEach(a => a.addEventListener('click', e => { e.preventDefault(); goTo(a.getAttribute('href').slice(1)); }));

const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('vis');
      const id = en.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.dataset.sec === id));
    }
  });
}, { threshold: 0.08, rootMargin: '-56px 0px -56px 0px' });
allSecs.forEach(s => io.observe(s));

window.addEventListener('scroll', () => {
  const pct = Math.min(100, Math.round(scrollY / (document.body.scrollHeight - innerHeight) * 100));
  document.getElementById('progBar').style.width = pct + '%';
  document.getElementById('progLabel').textContent = pct + '%';
  document.getElementById('btt').classList.toggle('show', scrollY > 400);
});

/* ═══════════ HERO CANVAS ═══════════ */
(function () {
  const c = document.getElementById('circuitCanvas');
  const cx = c.getContext('2d');
  let nodes = [], signals = [], conns = [], raf;
  function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; build(); }
  function build() {
    nodes = []; signals = []; conns = [];
    const cols = Math.ceil(c.width / 110) + 1, rows = Math.ceil(c.height / 90) + 1;
    for (let r = 0; r < rows; r++)
      for (let cl = 0; cl < cols; cl++)
        nodes.push({ x: cl * 110 + (r % 2 ? 55 : 0), y: r * 90 });
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 130) {
          conns.push([i, j]);
          if (Math.random() > .65) signals.push({ ci: conns.length - 1, p: Math.random(), sp: .003 + Math.random() * .006, d: Math.random() > .5 ? 1 : -1 });
        }
      }
  }
  function draw() {
    cx.clearRect(0, 0, c.width, c.height);
    const a = dark ? 'rgba(79,142,247,' : 'rgba(37,99,235,';
    const b = dark ? 'rgba(168,85,247,' : 'rgba(147,51,234,';
    conns.forEach(([i, j]) => {
      cx.beginPath(); cx.moveTo(nodes[i].x, nodes[i].y); cx.lineTo(nodes[j].x, nodes[j].y);
      cx.strokeStyle = a + '.07)'; cx.lineWidth = 1; cx.stroke();
    });
    signals.forEach(s => {
      s.p += s.sp * s.d;
      if (s.p > 1 || s.p < 0) { s.d *= -1; s.p = Math.max(0, Math.min(1, s.p)); }
      const [i, j] = conns[s.ci] || [];
      if (i == null) return;
      const x = nodes[i].x + (nodes[j].x - nodes[i].x) * s.p;
      const y = nodes[i].y + (nodes[j].y - nodes[i].y) * s.p;
      const col = s.ci % 3 === 0 ? a + '.9)' : b + '.9)';
      cx.beginPath(); cx.arc(x, y, 3, 0, Math.PI * 2); cx.fillStyle = col; cx.fill();
      const g = cx.createRadialGradient(x, y, 0, x, y, 10);
      g.addColorStop(0, col); g.addColorStop(1, 'transparent');
      cx.beginPath(); cx.arc(x, y, 10, 0, Math.PI * 2); cx.fillStyle = g; cx.fill();
    });
    nodes.forEach(n => {
      cx.beginPath(); cx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
      cx.fillStyle = a + '.2)'; cx.fill();
    });
    raf = requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize(); draw();
})();

/* ═══════════ CLOCK WAVE ANIMATION ═══════════ */
let clkOff = 0;
(function clkAnim() {
  const svg = document.getElementById('clkWave');
  if (svg) {
    const pts = [];
    for (let x = 0; x <= 200; x += 2) {
      const ph = ((x + clkOff) % 38) / 38;
      pts.push(`${x},${ph < .5 ? 12 : 42}`);
    }
    svg.setAttribute('points', pts.join(' '));
    clkOff += 1.4;
  }
  requestAnimationFrame(clkAnim);
})();

/* ═══════════ TAB SWITCHING ═══════════ */
function tab(group, id, btn) {
  document.querySelectorAll(`[id^="${group}-"]`).forEach(el => { if (el.classList.contains('tab-body')) el.classList.remove('on'); });
  const t = document.getElementById(`${group}-${id}`);
  if (t) t.classList.add('on');
  if (btn) {
    btn.closest('.tabs').querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
  }
}

/* ═══════════ COLOUR HELPERS ═══════════ */
const C = {
  get accent()   { return dark ? '#4f8ef7' : '#2563eb' },
  get accent2()  { return dark ? '#a855f7' : '#9333ea' },
  get green()    { return '#22c55e' },
  get red()      { return '#ef4444' },
  get amber()    { return '#f59e0b' },
  get txt()      { return dark ? '#94a3b8' : '#64748b' },
  get bg()       { return dark ? '#1c2333' : '#ffffff' },
  get grid()     { return dark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)' },
  get wire0()    { return dark ? '#4b5563' : '#9ca3af' },
  wire(v)        { return v ? this.green : this.wire0 }
};

/* ═══════════════════════════════════════════════════
   SVG WIRE / NODE / PAD HELPERS
═══════════════════════════════════════════════════ */
function setWire(id, hi) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.stroke = hi ? C.green : C.wire0;
}
function setWires(ids, hi) { ids.forEach(id => setWire(id, hi)); }
function setFBWire(id, hi, color) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.stroke = color || (hi ? C.green : C.wire0);
}
function setNode(id, hi, inv) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.fill = inv ? C.red : hi ? C.green : C.wire0;
}
function setPad(padId, txtId, val, hi, inv) {
  const p = document.getElementById(padId), t = document.getElementById(txtId);
  if (p) {
    p.classList.toggle('hi', !!hi && !inv);
    p.classList.toggle('inv', !!inv);
  }
  if (t) t.textContent = val;
}
function setOutPad(padId, txtId, label, hi) {
  const p = document.getElementById(padId), t = document.getElementById(txtId);
  if (p) {
    p.classList.toggle('hi', !!hi);
    p.style.fill = hi ? C.green : C.wire0;
  }
  if (t) { t.textContent = label; t.style.fill = '#fff'; }
}
function setGate(id, active) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('active', !!active);
}

/* ═══════════════════════════════════════════════════
   NOR SR LATCH
═══════════════════════════════════════════════════ */
let norState = { S: 0, R: 0, Q: 0, Qb: 1 };

function togNOR(inp) { norState[inp] ^= 1; norUpdate(); }
function rstNOR()    { norState = { S: 0, R: 0, Q: 0, Qb: 1 }; norUpdate(); }

function norUpdate() {
  const { S, R } = norState;
  let Q = norState.Q, Qb = norState.Qb, state;
  if (S === 1 && R === 1) { Q = 0; Qb = 0; state = 'invalid'; }
  else if (S === 0 && R === 0) { state = 'hold'; }
  else if (S === 1 && R === 0) { Q = 1; Qb = 0; state = 'set'; }
  else                         { Q = 0; Qb = 1; state = 'reset'; }
  norState.Q = Q; norState.Qb = Qb;

  // Input pads
  setPad('norSpad','norSval', `S=${S}`, S, false);
  setPad('norRpad','norRval', `R=${R}`, R, false);

  // Input wires S
  setWires(['wS1','wS2','wS3'], S);
  setWires(['wR1','wR2','wR3'], R);
  // Output wires
  const qhi = state !== 'invalid' && Q;
  const qbhi = state !== 'invalid' && Qb;
  setWires(['wQ1'], qhi);
  setWires(['wQb1'], qbhi);
  // Feedback wires
  const fbQ  = state === 'invalid' ? false : Q;
  const fbQb = state === 'invalid' ? false : Qb;
  ['wFB1','wFB2','wFB3','wFB4'].forEach(id => setFBWire(id, fbQ,  fbQ  ? C.green : C.wire0));
  ['wFB5','wFB6','wFB7','wFB8'].forEach(id => setFBWire(id, fbQb, fbQb ? C.green : C.wire0));
  setNode('norQfbDot',  Q  && state !== 'invalid');
  setNode('norQbfbDot', Qb && state !== 'invalid');
  // Gates active?
  setGate('norG1', S === 1 || (state === 'invalid'));
  setGate('norG2', R === 1 || (state === 'invalid'));
  // Output pads
  if (state === 'invalid') {
    setOutPad('norQpad','norQtxt','Q=?', false); document.getElementById('norQpad').style.fill = C.amber;
    setOutPad('norQbpad','norQbtxt','Q̄=?', false); document.getElementById('norQbpad').style.fill = C.amber;
  } else {
    setOutPad('norQpad','norQtxt',`Q=${Q}`, Q);
    setOutPad('norQbpad','norQbtxt',`Q̄=${Qb}`, Qb);
  }
  // Truth table highlight
  ['00','01','10','11'].forEach(k => {
    const r = document.getElementById(`norRow${k}`);
    if (r) r.classList.toggle('hl', k === `${S}${R}`);
  });
  // Status
  const msgs = {
    hold:'State: HOLD — Q retains previous value',
    set:'State: SET — Q=1, Q̄=0',
    reset:'State: RESET — Q=0, Q̄=1',
    invalid:'⚠️ INVALID STATE — S=R=1 forbidden!'
  };
  const exps = {
    hold:`S=R=0: Both NOR gates see 0 from direct inputs. Output depends only on cross-feedback. Q stays at ${Q}.`,
    set:`S=1, R=0: Top NOR gate has S=1 → output forced 0 (Q̄=0). Bottom NOR gate: R=0, Q̄=0 → output=1 (Q=1). Cross-feedback stabilises.`,
    reset:`S=0, R=1: Bottom NOR gate has R=1 → output forced 0 (Q=0). Top NOR gate: S=0, Q=0 → output=1 (Q̄=1). Stable.`,
    invalid:`S=R=1: Both NOR gate outputs forced to 0. Q=Q̄=0 violates complementarity. When S,R return to 0,0, final state is unpredictable (race condition)!`
  };
  const st = document.getElementById('norStat'), ex = document.getElementById('norExp');
  st.textContent = msgs[state];
  st.className = `sim-status${state==='invalid'?' warn':state==='hold'?'':' ok'}`;
  ex.textContent = exps[state];
}

/* ═══════════════════════════════════════════════════
   NAND SR LATCH
═══════════════════════════════════════════════════ */
let nandState = { S: 1, R: 1, Q: 1, Qb: 0 };

function togNAND(inp) { nandState[inp] ^= 1; nandUpdate(); }
function rstNAND()    { nandState = { S: 1, R: 1, Q: 1, Qb: 0 }; nandUpdate(); }

function nandUpdate() {
  const { S, R } = nandState;
  let Q = nandState.Q, Qb = nandState.Qb, state;
  if (S === 0 && R === 0) { Q = 1; Qb = 1; state = 'invalid'; }
  else if (S === 0 && R === 1) { Q = 1; Qb = 0; state = 'set'; }
  else if (S === 1 && R === 0) { Q = 0; Qb = 1; state = 'reset'; }
  else { state = 'hold'; }
  nandState.Q = Q; nandState.Qb = Qb;

  setPad('nandSpad','nandSval',`S̄=${S}`, S===0, false);
  setPad('nandRpad','nandRval',`R̄=${R}`, R===0, false);
  setWires(['ndwS1','ndwS2','ndwS3'], S===1);
  setWires(['ndwR1','ndwR2','ndwR3'], R===1);
  const qhi  = state !== 'invalid' && Q;
  const qbhi = state !== 'invalid' && Qb;
  setWires(['ndwQ'], qhi);
  setWires(['ndwQb'], qbhi);
  ['ndwFB1','ndwFB2','ndwFB3','ndwFB4'].forEach(id => setFBWire(id, qhi,  qhi  ? C.green : C.wire0));
  ['ndwFB5','ndwFB6','ndwFB7','ndwFB8'].forEach(id => setFBWire(id, qbhi, qbhi ? C.green : C.wire0));
  setNode('ndQfbDot',  qhi);
  setNode('ndQbfbDot', qbhi);
  setGate('nandG1', S===0);
  setGate('nandG2', R===0);
  if (state === 'invalid') {
    setOutPad('nandQpad','nandQtxt','Q=?',false); document.getElementById('nandQpad').style.fill = C.amber;
    setOutPad('nandQbpad','nandQbtxt','Q̄=?',false); document.getElementById('nandQbpad').style.fill = C.amber;
  } else {
    setOutPad('nandQpad','nandQtxt',`Q=${Q}`, Q);
    setOutPad('nandQbpad','nandQbtxt',`Q̄=${Qb}`, Qb);
  }
  const msgs = { hold:'HOLD', set:'SET (S̄=0 active)', reset:'RESET (R̄=0 active)', invalid:'⚠️ INVALID (S̄=R̄=0)' };
  const exps = {
    hold:`S̄=R̄=1: Both NAND gates maintain previous state through cross-feedback. Q=${Q}.`,
    set:`S̄=0 (active): Top NAND output forced HIGH (Q=1). R̄=1 inactive. Feedback locks Qb=0.`,
    reset:`R̄=0 (active): Bottom NAND output forced HIGH (Qb=1). S̄=1 inactive. Feedback locks Q=0.`,
    invalid:`S̄=R̄=0: Both NAND outputs forced to 1. Q=Qb=1 is invalid (complements must differ). Unpredictable when inputs return to 1,1.`
  };
  const st = document.getElementById('nandStat'), ex = document.getElementById('nandExp');
  st.textContent = 'State: ' + msgs[state];
  st.className = `sim-status${state==='invalid'?' warn':state==='hold'?'':' ok'}`;
  ex.textContent = exps[state];
}

/* ═══════════ SR Latch Truth Table Clicks ═══════════ */
function srlTTclick(k) {
  document.querySelectorAll('#srlTT tbody tr').forEach((r,i) => r.classList.toggle('hl', i === ['00','01','10','11'].indexOf(k)));
  const exps = {
    '00':'S=0, R=0 → HOLD: No inputs active. Both NOR gates depend on cross-feedback only. Output stays at previous value Q. This is the memory state.',
    '01':'S=0, R=1 → RESET: R=1 forces the bottom NOR gate output (Q) to 0 (NOR with a 1 input = 0). Feedback then pulls Q̄ to 1 via top NOR gate.',
    '10':'S=1, R=0 → SET: S=1 forces the top NOR gate output (Q̄) to 0. Feedback forces bottom NOR gate output (Q) to 1. Stable.',
    '11':'S=R=1 → INVALID/FORBIDDEN: Both NOR outputs forced to 0. Q=Q̄=0 violates complementarity. When inputs revert to 0,0, a race condition determines the unpredictable final state.'
  };
  document.getElementById('srlTTexp').textContent = exps[k] || '';
}

/* ═══════════════════════════════════════════════════
   D LATCH
═══════════════════════════════════════════════════ */
let dlState = { D: 0, EN: 0, Q: 0, Qb: 1 };

function togDL(inp) { dlState[inp] ^= 1; dlUpdate(); }
function rstDL()    { dlState = { D: 0, EN: 0, Q: 0, Qb: 1 }; dlUpdate(); }

function dlUpdate() {
  const { D, EN } = dlState;
  let Q = dlState.Q, Qb = dlState.Qb, state;
  if (EN === 1) { Q = D; Qb = D ? 0 : 1; state = D ? 'set' : 'reset'; }
  else { state = 'hold'; }
  dlState.Q = Q; dlState.Qb = Qb;

  // Inputs
  setPad('dlDpad','dlDval',`D=${D}`, D, false);
  setPad('dlENpad','dlENval',`EN=${EN}`, EN, false);
  // NOT gate active when D=1 (outputs D̄=0)
  setGate('dlNOT', D && EN);
  // NAND1 active when EN=1, D=1 (outputs S̄=0 → sets Q)
  setGate('dlN1', EN && D);
  // NAND2 active when EN=1, D=0 (outputs R̄=0 → resets Q)
  setGate('dlN2', EN && !D);
  // Cross-latch gates
  setGate('dlN3', Q===1);
  setGate('dlN4', Qb===1);
  // Wires
  setWires(['dlwD1','dlwD2','dlwD3','dlwD4','dlwD5','dlwD6'], D);
  setWires(['dlwEN1','dlwEN2','dlwEN3'], EN);
  // S-bar and R-bar lines
  const Sbar = !(D && EN);   // NAND1 output
  const Rbar = !((!D) && EN); // NAND2 output — if EN=0, NAND2 out=1
  setWires(['dlwS1','dlwS2'], !Sbar); // active low
  setWires(['dlwR1','dlwR2'], !Rbar);
  setWires(['dlwDb1'], !D && EN ? true : false); // D̄ active
  setWires(['dlwQ'], Q);
  setWires(['dlwQb'], Qb);
  ['dlwFB1','dlwFB2','dlwFB3','dlwFB4'].forEach(id => setFBWire(id, Q,  Q  ? C.green : C.wire0));
  ['dlwFB5','dlwFB6','dlwFB7','dlwFB8'].forEach(id => setFBWire(id, Qb, Qb ? C.green : C.wire0));
  setNode('dlQfbDot',  Q);
  setNode('dlQbfbDot', Qb);
  setOutPad('dlQpad','dlQtxt',`Q=${Q}`, Q);
  setOutPad('dlQbpad','dlQbtxt',`Q̄=${Qb}`, Qb);
  // EN junction dot
  const enDot = document.getElementById('dlENjDot');
  if (enDot) enDot.style.fill = EN ? C.green : C.wire0;

  const msgs = { hold:`EN=0 → Latch disabled, Q holds at ${Q}`, set:'EN=1, D=1 → Transparent: Q=1', reset:'EN=1, D=0 → Transparent: Q=0' };
  const exps = {
    hold:`EN=0: Both NAND arms (NAND1, NAND2) output 1 regardless of D. Cross-coupled NAND latch (NAND3/NAND4) holds its state. Q remains ${Q}.`,
    set:`EN=1, D=1: NAND1 sees D=1,EN=1 → outputs 0 (S̄=0 = Set active). NAND2 sees D̄=0 → outputs 1 (R̄=1 = inactive). NAND latch sets: Q=1.`,
    reset:`EN=1, D=0: NOT gate outputs D̄=1. NAND2 sees D̄=1,EN=1 → outputs 0 (R̄=0 = Reset active). NAND1 sees D=0 → outputs 1 (S̄=1). NAND latch resets: Q=0.`
  };
  document.getElementById('dlStat').textContent = msgs[state];
  document.getElementById('dlStat').className = `sim-status${state==='hold'?'':' ok'}`;
  document.getElementById('dlExp').textContent  = exps[state];
}

/* ═══════════════════════════════════════════════════
   TIMING DIAGRAM ENGINE
═══════════════════════════════════════════════════ */
const tdState = {};

function tdDraw(canvasId, signals) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth || 600;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  const LW = 62, RW = 16;
  const steps = signals[0].data.length;
  const segW = (W - LW - RW) / steps;
  const rowH = (H - 20) / signals.length;
  const startX = LW;

  // Grid
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let i = 0; i <= steps; i++) {
    ctx.beginPath(); ctx.moveTo(startX + i * segW, 0); ctx.lineTo(startX + i * segW, H); ctx.stroke();
  }

  signals.forEach((sig, si) => {
    const yBase = 10 + si * rowH;
    const yHi = yBase + 5, yLo = yBase + rowH - 10;
    // Label
    ctx.fillStyle = sig.color; ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right'; ctx.fillText(sig.label, startX - 5, (yHi + yLo) / 2 + 4); ctx.textAlign = 'left';
    // Signal
    ctx.beginPath(); ctx.strokeStyle = sig.color; ctx.lineWidth = 2.5;
    sig.data.forEach((v, i) => {
      const x = startX + i * segW;
      const y = v === '?' ? (yHi + yLo) / 2 : v ? yHi : yLo;
      if (i === 0) { ctx.moveTo(x, y); return; }
      const pv = sig.data[i - 1];
      const py = pv === '?' ? (yHi + yLo) / 2 : pv ? yHi : yLo;
      if (y !== py) { ctx.lineTo(x, py); ctx.lineTo(x, y); }
      else ctx.lineTo(x, y);
    });
    const lastV = sig.data[sig.data.length - 1];
    ctx.lineTo(W - RW, lastV === '?' ? (yHi + yLo) / 2 : lastV ? yHi : yLo);
    ctx.stroke();

    // Invalid highlight
    sig.data.forEach((v, i) => {
      if (v === '?') {
        ctx.fillStyle = 'rgba(245,158,11,.12)';
        ctx.fillRect(startX + i * segW, yBase, segW, rowH - 5);
        ctx.fillStyle = C.amber; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('?', startX + (i + .5) * segW, (yHi + yLo) / 2 + 4);
        ctx.textAlign = 'left';
      }
    });
  });

  // Active step highlight
  const st = tdState[canvasId];
  if (st && st.step > 0 && st.step <= steps) {
    const i = st.step - 1;
    ctx.fillStyle = 'rgba(79,142,247,.09)';
    ctx.fillRect(startX + i * segW, 0, segW, H);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(startX + i * segW, 0); ctx.lineTo(startX + i * segW, H); ctx.stroke();
    ctx.setLineDash([]);
    const note = st.notes?.[i];
    if (note) {
      ctx.fillStyle = note.includes('nvalid') || note.includes('?') ? C.amber : C.accent;
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(note, startX + i * segW + 3, 12);
    }
  }
}

function tdCtrl(key, action) {
  if (!tdState[key]) tdState[key] = { step: 0, playing: false, interval: null };
  const s = tdState[key];
  if (action === 'play') {
    if (s.playing) { clearInterval(s.interval); s.playing = false; document.getElementById(key + 'TDplay').textContent = '▶ Play'; }
    else {
      s.playing = true; document.getElementById(key + 'TDplay').textContent = '⏸ Pause';
      const data = tdDatasets[key];
      s.interval = setInterval(() => {
        s.step = (s.step % data.signals[0].data.length) + 1;
        tdDraw(data.canvas, data.signals);
        if (s.step >= data.signals[0].data.length) { clearInterval(s.interval); s.playing = false; document.getElementById(key + 'TDplay').textContent = '▶ Play'; }
      }, 750);
    }
  } else if (action === 'step') {
    const data = tdDatasets[key];
    s.step = (s.step % data.signals[0].data.length) + 1;
    tdDraw(data.canvas, data.signals);
  } else {
    clearInterval(s.interval); s.playing = false; s.step = 0;
    document.getElementById(key + 'TDplay').textContent = '▶ Play';
    const data = tdDatasets[key];
    tdDraw(data.canvas, data.signals);
  }
}

const tdDatasets = {
  srl: {
    canvas: 'srlTD',
    signals: [
      { label:'S',  color:'#4f8ef7', data:[0,1,0,0,0,1,1,0] },
      { label:'R',  color:'#a855f7', data:[0,0,0,1,0,0,1,0] },
      { label:'Q',  color:'#22c55e', data:[0,1,1,0,0,1,'?','?'] },
      { label:'Q̄', color:'#22d3ee', data:[1,0,0,1,1,0,'?','?'] }
    ],
    notes:['Hold','Set','Hold','Reset','Hold','Set','Invalid!','Undef.']
  },
  dl: {
    canvas: 'dlTD',
    signals: [
      { label:'EN', color:'#a855f7', data:[0,0,1,1,1,0,0,1] },
      { label:'D',  color:'#4f8ef7', data:[0,1,1,0,1,1,0,0] },
      { label:'Q',  color:'#22c55e', data:[0,0,1,0,1,1,1,0] },
      { label:'Q̄', color:'#22d3ee', data:[1,1,0,1,0,0,0,1] }
    ],
    notes:['Latch','Latch','Trans=1','Trans=0','Trans=1','Latch','Latch','Trans=0']
  },
  srff: {
    canvas: 'srffTD2',
    signals: [
      { label:'CLK', color:'#a855f7', data:[0,1,0,1,0,1,0,1,0,1] },
      { label:'S',   color:'#4f8ef7', data:[0,0,1,1,0,0,1,1,0,0] },
      { label:'R',   color:'#ef4444', data:[0,0,0,0,1,1,0,0,1,1] },
      { label:'Q',   color:'#22c55e', data:[0,0,0,1,1,0,0,1,1,0] }
    ],
    notes:['','↑Hold','','↑Set','','↑Reset','','↑Set','','↑Reset']
  },
  jk: {
    canvas: 'jkTD2',
    signals: [
      { label:'CLK', color:'#a855f7', data:[0,1,0,1,0,1,0,1,0,1,0,1] },
      { label:'J',   color:'#4f8ef7', data:[0,0,1,1,0,0,1,1,1,1,0,0] },
      { label:'K',   color:'#ef4444', data:[0,0,0,0,1,1,1,1,0,0,1,1] },
      { label:'Q',   color:'#22c55e', data:[0,0,0,1,1,0,0,'T',1,0,0,0] }
    ],
    notes:['','↑Hold','','↑Set','','↑Reset','','↑Toggle','','↑Hold','','↑Reset']
  },
  dff: {
    canvas: 'dffTD2',
    signals: [
      { label:'CLK', color:'#a855f7', data:[0,1,0,1,0,1,0,1,0,1] },
      { label:'D',   color:'#4f8ef7', data:[0,0,1,1,0,0,1,1,0,0] },
      { label:'Q',   color:'#22c55e', data:[0,0,0,1,1,0,0,1,1,0] }
    ],
    notes:['','↑Q=D=0','','↑Q=D=1','','↑Q=D=0','','↑Q=D=1','','↑Q=D=0']
  },
  tff: {
    canvas: 'tffTD2',
    signals: [
      { label:'CLK', color:'#a855f7', data:[0,1,0,1,0,1,0,1,0,1,0,1] },
      { label:'T',   color:'#4f8ef7', data:[1,1,1,1,0,0,1,1,1,1,1,1] },
      { label:'Q',   color:'#22c55e', data:[0,0,1,1,0,0,0,0,1,1,0,0] }
    ],
    notes:['','↑Tog','','↑Tog','','↑Hold','','↑Tog','','↑Tog','','↑Tog']
  }
};

function initTDState() {
  Object.keys(tdDatasets).forEach(k => {
    tdState[k] = { step: 0, playing: false, interval: null, notes: tdDatasets[k].notes };
  });
}

/* ═══════════════════════════════════════════════════
   FF CANVAS (live clock history)
═══════════════════════════════════════════════════ */
function drawFFHistory(canvasId, history, labels, getters, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth || 600;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  if (!history.length) {
    ctx.fillStyle = C.txt; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Click "CLK Pulse" to see waveform', W / 2, H / 2); ctx.textAlign = 'left'; return;
  }
  const LW = 55, rowH = Math.floor((H - 10) / labels.length);
  const segW = Math.min(55, (W - LW - 10) / history.length);
  labels.forEach((lbl, li) => {
    const yBase = 5 + li * rowH, yHi = yBase + 6, yLo = yBase + rowH - 8;
    ctx.fillStyle = colors[li]; ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right'; ctx.fillText(lbl, LW - 4, (yHi + yLo) / 2 + 4); ctx.textAlign = 'left';
    const data = history.map(getters[li]);
    ctx.beginPath(); ctx.strokeStyle = colors[li]; ctx.lineWidth = 2;
    data.forEach((v, i) => {
      const x = LW + i * segW;
      const y = typeof v === 'string' ? (yHi + yLo) / 2 : v ? yHi : yLo;
      if (i === 0) { ctx.moveTo(x, y); return; }
      const pv = data[i - 1];
      const py = typeof pv === 'string' ? (yHi + yLo) / 2 : pv ? yHi : yLo;
      if (y !== py) { ctx.lineTo(x, py); ctx.lineTo(x, y); } else ctx.lineTo(x, y);
    });
    ctx.lineTo(LW + history.length * segW, data[data.length - 1] ? yHi : yLo);
    ctx.stroke();
    // Clock pulses
    history.forEach((_, i) => {
      const x = LW + i * segW + segW * .3;
      ctx.strokeStyle = C.accent2; ctx.lineWidth = 1.5; ctx.setLineDash([]);
      if (li === labels.length - 1) {
        ctx.beginPath();
        ctx.moveTo(x, yLo); ctx.lineTo(x, yHi); ctx.lineTo(x + segW * .4, yHi); ctx.lineTo(x + segW * .4, yLo);
        ctx.strokeStyle = C.accent2; ctx.lineWidth = 1.5; ctx.stroke();
      }
    });
  });
}

/* ═══════════════════════════════════════════════════
   SR FLIP-FLOP
═══════════════════════════════════════════════════ */
let srffQ = 0, srffHist = [];
function srffUpdate() {
  const S = +document.getElementById('srffS').value, R = +document.getElementById('srffR').value;
  document.getElementById('srffSv').textContent = S; document.getElementById('srffRv').textContent = R;
  document.getElementById('srffSval').textContent = `S=${S}`; document.getElementById('srffRval').textContent = `R=${R}`;
  setPad('srffSpad', null, null, S); setPad('srffRpad', null, null, R);
  let Qn, state;
  if (S===1&&R===1) { Qn='?'; state='invalid'; }
  else if (S===0&&R===0) { Qn=srffQ; state='hold'; }
  else if (S===1) { Qn=1; state='set'; }
  else { Qn=0; state='reset'; }
  document.getElementById('srffQnd').textContent = Qn;
  setWire('srffwS', S); setWire('srffwR', R);
  const msgs = { hold:`Hold Q=${srffQ}`, set:'Set → Q=1', reset:'Reset → Q=0', invalid:'⚠️ Invalid: S·R≠0' };
  const exps = { hold:`S=R=0 → Hold. Q remains ${srffQ}.`, set:'S=1,R=0 → Set. Next CLK edge: Q←1.', reset:'S=0,R=1 → Reset. Next CLK edge: Q←0.', invalid:'S=R=1 → INVALID! Constraint S·R=0 violated.' };
  document.getElementById('srffStat').textContent = msgs[state];
  document.getElementById('srffExp').textContent  = exps[state];
}
function srffSld(inp) {
  const el = document.getElementById('srff' + inp);
  if (el) { el.value = el.value === '0' ? '1' : '0'; srffUpdate(); }
}
function srffClk() {
  const S=+document.getElementById('srffS').value, R=+document.getElementById('srffR').value;
  if (S===1&&R===1) { document.getElementById('srffStat').textContent='⚠️ Clock blocked: S=R=1 invalid!'; return; }
  const prev=srffQ;
  if (S===0&&R===0) {} else if (S===1) srffQ=1; else srffQ=0;
  srffHist.push({S,R,Q:prev,Qn:srffQ});
  document.getElementById('srffQd').textContent = srffQ;
  document.getElementById('srffQnd').textContent = srffQ;
  document.getElementById('srffQd').closest('.state-box').classList.add('flash');
  setTimeout(()=>document.getElementById('srffQd').closest('.state-box').classList.remove('flash'),500);
  setOutPad('srffQpad','srffQtxt',`Q=${srffQ}`,srffQ);
  setOutPad('srffQbpad','srffQbtxt',`Q̄=${srffQ?0:1}`,!srffQ);
  setWire('srffwQ', srffQ); setWire('srffwQb', !srffQ);
  drawFFHistory('srffTD', srffHist, ['S','R','Q'], [d=>d.S,d=>d.R,d=>d.Qn], [C.accent,C.red,C.green]);
  srffUpdate();
}

/* ═══════════════════════════════════════════════════
   JK FLIP-FLOP
═══════════════════════════════════════════════════ */
let jkQ = 0, jkHist = [];
function jkUpdate() {
  const J=+document.getElementById('jkJ').value, K=+document.getElementById('jkK').value;
  document.getElementById('jkJv').textContent=J; document.getElementById('jkKv').textContent=K;
  document.getElementById('jkJval').textContent=`J=${J}`; document.getElementById('jkKval').textContent=`K=${K}`;
  setPad('jkJpad',null,null,J); setPad('jkKpad',null,null,K);
  let Qn, state;
  if (J===0&&K===0) { Qn=jkQ; state='hold'; }
  else if (J===0&&K===1) { Qn=0; state='reset'; }
  else if (J===1&&K===0) { Qn=1; state='set'; }
  else { Qn=jkQ?0:1; state='toggle'; }
  document.getElementById('jkQnd').textContent=Qn;
  // Wire updates
  setWire('jkwJ1',J); setWire('jkwJ2',J); setWire('jkwJ3',J);
  setWire('jkwK1',K); setWire('jkwK2',K); setWire('jkwK3',K);
  const clkColor = C.accent2;
  ['jkwC1','jkwC2','jkwC3','jkwC4','jkwC5'].forEach(id=>{ const e=document.getElementById(id); if(e) e.style.stroke=clkColor; });
  // Gate highlights
  setGate('jkN1', J && !K); setGate('jkN2', K && !J);
  const msgs = {hold:`Hold Q=${jkQ}`,set:'Set → Q=1',reset:'Reset → Q=0',toggle:`Toggle → Q=${Qn}`};
  const exps = {
    hold:`J=K=0 → Hold. NAND1,NAND2 both output 1 (inactive). Cross-latch maintains Q=${jkQ}.`,
    set:`J=1,K=0 → Set. NAND1 (J=1,CLK=1,Q̄=1) → active, forces S̄=0. Cross-latch sets Q=1.`,
    reset:`J=0,K=1 → Reset. NAND2 (K=1,CLK=1,Q=1) → active, forces R̄=0. Cross-latch resets Q=0.`,
    toggle:`J=K=1 → Toggle! Q(n+1) = Q̄(n). NAND1 uses Q̄ feedback, NAND2 uses Q feedback. Result: Q=${Qn}. No invalid state!`
  };
  document.getElementById('jkStat').textContent=msgs[state];
  document.getElementById('jkExp').textContent=exps[state];
}
function jkToggle(inp) {
  const el=document.getElementById('jk'+inp);
  if(el){el.value=el.value==='0'?'1':'0'; jkUpdate();}
}
function jkClkPulse() {
  const J=+document.getElementById('jkJ').value, K=+document.getElementById('jkK').value;
  const prev=jkQ;
  if(J===0&&K===0){}
  else if(J===0&&K===1) jkQ=0;
  else if(J===1&&K===0) jkQ=1;
  else jkQ=jkQ?0:1;
  jkHist.push({J,K,Q:prev,Qn:jkQ});
  document.getElementById('jkQd').textContent=jkQ;
  document.getElementById('jkQnd').textContent=jkQ;
  document.getElementById('jkQd').closest('.state-box').classList.add('flash');
  setTimeout(()=>document.getElementById('jkQd').closest('.state-box').classList.remove('flash'),500);
  setOutPad('jkQpad','jkQtxt',`Q=${jkQ}`,jkQ);
  setOutPad('jkQbpad','jkQbtxt',`Q̄=${jkQ?0:1}`,!jkQ);
  setWire('jkwQ',jkQ); setWire('jkwQb',!jkQ);
  // Feedback wires
  ['jkwFB1','jkwFB2','jkwFB3','jkwFB4'].forEach(id=>setFBWire(id,jkQ,jkQ?C.green:C.wire0));
  ['jkwFB8','jkwFB9','jkwFB10','jkwFB11'].forEach(id=>setFBWire(id,!jkQ,!jkQ?C.green:C.wire0));
  setNode('jkQfbDot',jkQ); setNode('jkQbfbDot',!jkQ);
  drawFFHistory('jkTD',jkHist,['J','K','Q'],[d=>d.J,d=>d.K,d=>d.Qn],[C.accent2,C.red,C.green]);
  jkUpdate();
}

/* ═══════════════════════════════════════════════════
   D FLIP-FLOP
═══════════════════════════════════════════════════ */
let dffQ=0, dffHist=[];
function dffUpdate() {
  const D=+document.getElementById('dffD').value;
  document.getElementById('dffDv').textContent=D;
  document.getElementById('dffDval').textContent=`D=${D}`;
  setPad('dffDpad',null,null,D);
  document.getElementById('dffQnd').textContent=D;
  setWire('dffwD',D);
  document.getElementById('dffStat').textContent=`D=${D}: Next CLK edge → Q=${D}`;
  document.getElementById('dffExp').textContent=`D FF: Q(n+1)=D. On next rising edge, Q will become ${D}.`;
}
function dffClk() {
  const D=+document.getElementById('dffD').value, prev=dffQ;
  dffQ=D; dffHist.push({D,Q:prev,Qn:dffQ});
  document.getElementById('dffQd').textContent=dffQ;
  document.getElementById('dffQnd').textContent=dffQ;
  document.getElementById('dffQd').closest('.state-box').classList.add('flash');
  setTimeout(()=>document.getElementById('dffQd').closest('.state-box').classList.remove('flash'),500);
  setOutPad('dffQpad','dffQtxt',`Q=${dffQ}`,dffQ);
  setOutPad('dffQbpad','dffQbtxt',`Q̄=${dffQ?0:1}`,!dffQ);
  setWire('dffwQ',dffQ); setWire('dffwQb',!dffQ);
  drawFFHistory('dffTD',dffHist,['D','Q'],[d=>d.D,d=>d.Qn],[C.accent,C.green]);
  document.getElementById('dffStat').textContent=`CLK ↑: D=${D} captured. Q changed ${prev}→${dffQ}.`;
  document.getElementById('dffExp').textContent=`Q(n+1)=D=${D}. Rising edge sampled D and latched it. Q is now ${dffQ} until next CLK edge.`;
}
function dffRst() { dffQ=0; dffHist=[]; document.getElementById('dffQd').textContent=0; document.getElementById('dffQnd').textContent=+document.getElementById('dffD').value; setOutPad('dffQpad','dffQtxt','Q=0',false); setOutPad('dffQbpad','dffQbtxt','Q̄=1',true); drawFFHistory('dffTD',dffHist,[],[],[]); dffUpdate(); }
function dffToggle() { const el=document.getElementById('dffD'); el.value=el.value==='0'?'1':'0'; dffUpdate(); }

/* ═══════════════════════════════════════════════════
   T FLIP-FLOP
═══════════════════════════════════════════════════ */
let tffQ=0, tffHist=[];
function tffUpdate() {
  const T=+document.getElementById('tffT').value;
  document.getElementById('tffTv').textContent=T;
  document.getElementById('tffTval').textContent=`T=${T}`;
  setPad('tffTpad',null,null,T,false);
  const Qn=T?(tffQ?0:1):tffQ;
  document.getElementById('tffQnd').textContent=Qn;
  setWire('tffwT',T); setWire('tffwT2',T); setWire('tffwJ',T); setWire('tffwK',T); setWire('tffwK2',T);
  document.getElementById('tffStat').textContent=T?`T=1: Next CLK → Q=${Qn} (toggle from ${tffQ})`:`T=0: Next CLK → Q holds at ${tffQ}`;
  document.getElementById('tffExp').textContent=T?`T=1 → Toggle mode. Q(n+1)=T⊕Q=${T}⊕${tffQ}=${Qn}. Each CLK pulse inverts Q — divide-by-2 behaviour.`:`T=0 → Hold mode. Q(n+1)=Q(n)=${tffQ}. No change on CLK.`;
}
function tffToggleT() { const el=document.getElementById('tffT'); el.value=el.value==='0'?'1':'0'; tffUpdate(); }
function tffClk() {
  const T=+document.getElementById('tffT').value, prev=tffQ;
  tffQ=T?(tffQ?0:1):tffQ;
  tffHist.push({T,Q:prev,Qn:tffQ});
  document.getElementById('tffQd').textContent=tffQ;
  document.getElementById('tffQnd').textContent=tffQ;
  document.getElementById('tffQd').closest('.state-box').classList.add('flash');
  setTimeout(()=>document.getElementById('tffQd').closest('.state-box').classList.remove('flash'),500);
  setOutPad('tffQpad','tffQtxt',`Q=${tffQ}`,tffQ);
  setOutPad('tffQbpad','tffQbtxt',`Q̄=${tffQ?0:1}`,!tffQ);
  setWire('tffwQ',tffQ); setWire('tffwQb',!tffQ);
  drawFFHistory('tffTD',tffHist,['T','Q'],[d=>d.T,d=>d.Qn],[C.accent2,C.green]);
  tffUpdate();
}
function tffRst() { tffQ=0; tffHist=[]; document.getElementById('tffQd').textContent=0; setOutPad('tffQpad','tffQtxt','Q=0',false); setOutPad('tffQbpad','tffQbtxt','Q̄=1',true); drawFFHistory('tffTD',tffHist,[],[],[]); tffUpdate(); }

/* ═══════════════════════════════════════════════════
   MASTER-SLAVE FF
═══════════════════════════════════════════════════ */
let msState = { J:0, K:0, masterQ:0, slaveQ:0, clk:0 };
function msUpdate() {
  const J=+document.getElementById('msJ').value, K=+document.getElementById('msK').value;
  document.getElementById('msJv').textContent=J; document.getElementById('msKv').textContent=K;
  document.getElementById('msJval').textContent=`J=${J}`; document.getElementById('msKval').textContent=`K=${K}`;
  setPad('msJpad',null,null,J); setPad('msKpad',null,null,K);
  msState.J=J; msState.K=K;
}
function msToggle(inp) { const el=document.getElementById('ms'+inp); el.value=el.value==='0'?'1':'0'; msUpdate(); }
function msEdge(edge) {
  const {J,K}=msState;
  if (edge==='rise') {
    msState.clk=1;
    // Master captures J,K
    const Q=msState.masterQ;
    if(J===0&&K===0) msState.masterQ=Q;
    else if(J===0&&K===1) msState.masterQ=0;
    else if(J===1&&K===0) msState.masterQ=1;
    else msState.masterQ=Q?0:1;
    document.getElementById('msCval').textContent='CLK=1';
    document.getElementById('msMaster').style.stroke=C.green;
    document.getElementById('msSlave').style.stroke=C.wire0;
    document.getElementById('msMactive').style.opacity='1';
    document.getElementById('msSactive').style.opacity='0.2';
    setWires(['mswC1','mswC2','mswJ','mswK'], true);
    ['mswC3','mswC4'].forEach(id=>setFBWire(id,true,C.accent2));
    document.getElementById('msS1').classList.add('on');
    document.getElementById('msS2').classList.remove('on');
    document.getElementById('msS3').classList.remove('on');
    document.getElementById('msStat').textContent=`CLK ↑: Master ACTIVE — captured J=${J},K=${K}. MasterQ=${msState.masterQ}. Slave disabled (CLK̄=0).`;
    document.getElementById('msExp').textContent=`Rising edge: Master FF is enabled by CLK=1. It computes next state from J,K. Slave receives inverted CLK (=0) so it stays disabled. Slave output doesn't change yet.`;
  } else {
    msState.clk=0;
    msState.slaveQ=msState.masterQ;
    document.getElementById('msCval').textContent='CLK=0';
    document.getElementById('msMaster').style.stroke=C.wire0;
    document.getElementById('msSlave').style.stroke=C.green;
    document.getElementById('msMactive').style.opacity='0.2';
    document.getElementById('msSactive').style.opacity='1';
    setWires(['mswMQ','mswMQb'], true);
    ['mswCb','mswCb2','mswCb3'].forEach(id=>setFBWire(id,true,C.accent2));
    setOutPad('msQpad','msQtxt',`Q=${msState.slaveQ}`,msState.slaveQ);
    setOutPad('msQbpad','msQbtxt',`Q̄=${msState.slaveQ?0:1}`,!msState.slaveQ);
    setWire('mswQ',msState.slaveQ); setWire('mswQb',!msState.slaveQ);
    document.getElementById('msS1').classList.remove('on');
    document.getElementById('msS2').classList.add('on');
    document.getElementById('msS3').classList.add('on');
    document.getElementById('msStat').textContent=`CLK ↓: Slave ACTIVE — copies MasterQ=${msState.masterQ}. Final Q=${msState.slaveQ}. Race-around eliminated!`;
    document.getElementById('msExp').textContent=`Falling edge: Master is disabled (inputs locked). Slave clock goes HIGH (inverted). Slave copies Master output. Q updates once — safely — at the end of the full clock pulse.`;
  }
}
function msRst() {
  msState={J:0,K:0,masterQ:0,slaveQ:0,clk:0};
  document.getElementById('msCval').textContent='CLK=0';
  document.getElementById('msMaster').style.stroke='var(--accent)';
  document.getElementById('msSlave').style.stroke='var(--accent2)';
  document.getElementById('msMactive').style.opacity='0.25';
  document.getElementById('msSactive').style.opacity='0.25';
  setOutPad('msQpad','msQtxt','Q=0',false);
  setOutPad('msQbpad','msQbtxt','Q̄=1',true);
  document.getElementById('msS1').classList.add('on');
  document.getElementById('msS2').classList.remove('on');
  document.getElementById('msS3').classList.remove('on');
  document.getElementById('msStat').textContent='Waiting for clock edge…';
  document.getElementById('msExp').textContent='Click CLK Rise → Master captures. Click CLK Fall → Slave copies Master output.';
}

/* ═══════════ CONVERSION PANELS ═══════════ */
function showConv(id, btn) {
  document.querySelectorAll('.conv-panel').forEach(p=>p.classList.remove('on'));
  document.getElementById('conv-'+id).classList.add('on');
  document.querySelectorAll('.conv-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}

/* ═══════════ GLOSSARY ═══════════ */
function glosFilter() {
  const q=document.getElementById('glosIn').value.toLowerCase();
  document.querySelectorAll('.glos-card').forEach(c=>{
    c.classList.toggle('hide', !!(q && !(c.dataset.t+' '+c.textContent.toLowerCase()).includes(q)));
  });
}

/* ═══════════ QUICK CHECK ═══════════ */
function qck(btn, type, id) {
  const sec=btn.closest('.qck');
  sec.querySelectorAll('.qck-opt').forEach(b=>{
    b.disabled=true;
    if(b===btn && type==='w') b.classList.add('wrong');
  });
  sec.querySelectorAll('.qck-opt').forEach(b=>{ if(b.getAttribute('onclick')?.includes("'c'")) b.classList.add('correct'); });
  const fb=document.getElementById(id+'fb');
  fb.textContent=type==='c'?'✅ Correct!':'❌ Incorrect — see highlighted answer.';
  fb.style.color=type==='c'?C.green:C.red;
}

/* ═══════════════════════════════════════════════════
   QUIZ
═══════════════════════════════════════════════════ */
const QS = [
  {q:"In a NOR SR Latch, when S=0 and R=0, the output:", opts:["Becomes 0","Becomes 1","Holds previous state","Is unpredictable"], ans:2, t:"SR Latch", d:"easy", ex:"S=R=0 is the HOLD state. Both NOR gate inputs from S,R are 0, so outputs depend only on cross-feedback and maintain their previous stable values."},
  {q:"In a NOR SR Latch, S=1 and R=1 is called the _____ state:", opts:["Hold","Set","Reset","Forbidden/Invalid"], ans:3, t:"SR Latch", d:"easy", ex:"S=R=1 forces both NOR outputs to 0, so Q=Q̄=0, violating complementarity. This is the forbidden state."},
  {q:"The characteristic equation of a JK Flip-Flop is:", opts:["Q+ = J + K̄Q","Q+ = JQ̄ + K̄Q","Q+ = J⊕K","Q+ = JK + Q"], ans:1, t:"JK FF", d:"med", ex:"Q(n+1) = J·Q̄(n) + K̄·Q(n). When J=K=1 this gives Q̄ (toggle). When J=K=0 it gives Q (hold)."},
  {q:"A T Flip-Flop with T=1, Q=0. After 4 clock pulses, Q =", opts:["0","1","×","undefined"], ans:0, t:"T FF", d:"med", ex:"T=1 toggles Q each pulse: 0→1→0→1→0. Four even toggles return to 0."},
  {q:"Q(n+1) = D is the characteristic equation of:", opts:["SR FF","JK FF","D FF","T FF"], ans:2, t:"D FF", d:"easy", ex:"The D Flip-Flop simply captures whatever is on D at the clock edge. Q(n+1)=D — the simplest of all FF equations."},
  {q:"Which condition causes the Race-Around problem?", opts:["Level-triggered FF, J=K=1, long CLK HIGH","Edge-triggered FF, J=K=0","Master-Slave FF, J=1, K=0","Any FF with Reset active"], ans:0, t:"JK FF", d:"hard", ex:"Race-around occurs in a level-triggered JK FF when J=K=1 and the CLK HIGH period exceeds propagation delay, causing Q to toggle multiple times."},
  {q:"To convert JK FF to D FF, the connections are:", opts:["J=D, K=D","J=D̄, K=D","J=D, K=D̄","J=K=D̄"], ans:2, t:"Conversion", d:"med", ex:"J=D and K=D̄. When D=1: J=1,K=0 (Set). When D=0: J=0,K=1 (Reset). Exactly mimics D FF behaviour."},
  {q:"When EN=0 in a D Latch and D changes, Q:", opts:["Follows D","Becomes 0","Holds unchanged","Toggles"], ans:2, t:"D Latch", d:"easy", ex:"EN=0 disables the latch. Both NAND arms output 1 regardless of D. The cross-latch holds its stored state."},
  {q:"T Flip-Flop characteristic equation:", opts:["Q+ = T + Q","Q+ = T·Q","Q+ = T⊕Q","Q+ = T̄Q"], ans:2, t:"T FF", d:"med", ex:"Q(n+1) = T⊕Q(n). XOR: T=0 → Hold (0⊕Q=Q). T=1 → Toggle (1⊕Q=Q̄)."},
  {q:"In a NAND SR Latch, the HOLD state requires:", opts:["S̄=0, R̄=0","S̄=0, R̄=1","S̄=1, R̄=0","S̄=1, R̄=1"], ans:3, t:"SR Latch", d:"med", ex:"NAND latch is active-low. S̄=R̄=1 means neither input is active → Hold. (Contrast with NOR where S=R=0 is hold.)"},
  {q:"Master-Slave JK FF: when does Slave update?", opts:["CLK rising edge","CLK=1 throughout","CLK falling edge","Continuously"], ans:2, t:"Master-Slave", d:"easy", ex:"Slave receives inverted clock. It becomes enabled when CLK=0. So Slave updates (copies Master) on the falling edge of CLK."},
  {q:"SR FF → JK FF conversion uses:", opts:["S=J, R=K","S=JQ̄, R=KQ","S=JK, R=QQ̄","S=J+Q, R=K̄"], ans:1, t:"Conversion", d:"hard", ex:"S=J·Q̄ ensures S activates only when Q=0 (Set makes sense). R=K·Q ensures R activates only when Q=1 (Reset makes sense). Prevents S=R=1."},
  {q:"A D Latch is described as 'transparent' because:", opts:["It has no output","While EN=1, Q continuously tracks D","It uses transparent NAND gates","Q never changes"], ans:1, t:"D Latch", d:"easy", ex:"While EN=1, any change in D immediately propagates to Q — the latch is 'transparent' (no clock edge needed). Unlike an FF which only samples at the edge."},
  {q:"JK FF excitation for transition Q:1→0 is:", opts:["J=0, K=×","J=1, K=×","J=×, K=1","J=×, K=0"], ans:2, t:"Conversion", d:"hard", ex:"Q: 1→0 means Reset. For JK FF: J=× (don't care, Q will reset regardless of J if K=1) and K=1 (must be 1 to force reset)."},
  {q:"Which is edge-triggered (NOT level-sensitive)?", opts:["SR Latch","D Latch","D Flip-Flop","All of the above"], ans:2, t:"D FF", d:"easy", ex:"D Flip-Flop is edge-triggered — output changes only at clock edge. SR Latch and D Latch are level-sensitive (transparent while enabled)."},
  {q:"JK FF: J=1, K=1, Q=1. After CLK pulse, Q=", opts:["0","1","undefined","1 always"], ans:0, t:"JK FF", d:"med", ex:"J=K=1 → Toggle. Q(n+1)=Q̄(n)=Q̄(1)=0. JK safely handles this case unlike SR FF."},
  {q:"T→D FF conversion: the required equation is:", opts:["T=D+Q","T=D·Q","T=D⊕Q","T=D̄⊕Q"], ans:2, t:"Conversion", d:"hard", ex:"D FF: Q+=D. T FF: Q+=T⊕Q. Setting equal: D=T⊕Q → T=D⊕Q. XOR detects whether a toggle is needed to reach desired D."},
  {q:"An SR FF has Q=0 after clock. What were S, R?", opts:["S=1, R=0","S=0, R=0 (from Q=0)","S=0, R=1","S=1, R=1"], ans:2, t:"SR FF", d:"med", ex:"S=0, R=1 → Reset → Q=0. Also S=0,R=0 with previous Q=0 gives Q=0 (hold). But the definitive reset action is S=0, R=1."},
  {q:"D FF = JK FF with:", opts:["J=D, K=D","J=D̄, K=D̄","K=J̄","J=K=D"], ans:2, t:"Conversion", d:"med", ex:"D FF = JK FF with K=J̄ (K is complement of J). Since J=D, we need K=D̄=J̄. This forces SR equivalent inputs to be S=D, R=D̄ — never both 1."},
  {q:"T FF with T=1 always acts as a:", opts:["Data register","Divide-by-2 circuit","SR FF","Invalid circuit"], ans:1, t:"T FF", d:"easy", ex:"T=1 always: Q toggles on every CLK edge. If CLK has frequency f, then Q has frequency f/2. Hence divide-by-2. Used in binary ripple counters."},
  {q:"Which FF has NO invalid state at all?", opts:["SR FF","JK FF","Both SR and JK","Neither"], ans:1, t:"JK FF", d:"easy", ex:"SR FF has invalid state at S=R=1. JK FF converts J=K=1 into a Toggle operation — no invalid state. JK is therefore more versatile."},
  {q:"In Master-Slave JK FF, Master is active when:", opts:["CLK=0","CLK=1","CLK falling","Always"], ans:1, t:"Master-Slave", d:"easy", ex:"Master receives CLK directly. It is enabled (active, reads inputs) when CLK=1. Slave receives CLK̄=0, so Slave is disabled at this time."},
  {q:"SR FF excitation for Q:0→0 is:", opts:["S=1, R=0","S=0, R=1","S=0, R=×","S=1, R=×"], ans:2, t:"Conversion", d:"hard", ex:"Q:0→0 (No change/Hold from 0). S=0 (must not set), R=× (don't care — R already has no effect when Q=0 since Q is the reset target). So S=0, R=×."},
  {q:"The forbidden input combination for NOR SR Latch causes:", opts:["Q=1 always","Both Q and Q̄ forced to 0","Q toggles","Reset condition"], ans:1, t:"SR Latch", d:"med", ex:"S=R=1 in NOR latch: each NOR gate has at least one input=1, forcing output=0. So Q=Q̄=0, violating complementarity. Final state after removal is unpredictable."},
  {q:"JK FF → T FF conversion requires:", opts:["J=T, K=T̄","J=T̄, K=T","J=T, K=T","J=T⊕K, K=T"], ans:2, t:"Conversion", d:"med", ex:"J=T and K=T: tie J and K to same input T. When T=0: J=K=0 → Hold (same as T FF hold). When T=1: J=K=1 → Toggle (same as T FF toggle). Perfect conversion!"}
];

let qCur=0, qScore=0, qWrong=[];
function qStart() {
  qCur=0; qScore=0; qWrong=[];
  document.getElementById('qStartBox').style.display='none';
  document.getElementById('qEnd').style.display='none';
  document.getElementById('qBox').style.display='block';
  qShowQ();
}
function qShowQ() {
  const q=QS[qCur];
  document.getElementById('qTopic').textContent=q.t;
  document.getElementById('qDiff').textContent=q.d.charAt(0).toUpperCase()+q.d.slice(1);
  document.getElementById('qDiff').className=`q-diff ${q.d}`;
  document.getElementById('qText').textContent=`Q${qCur+1}. ${q.q}`;
  document.getElementById('qProg').style.width=`${(qCur/QS.length)*100}%`;
  document.getElementById('qProgLbl').textContent=`Q ${qCur+1} / ${QS.length}`;
  document.getElementById('qFB').style.display='none';
  document.getElementById('qNext').style.display='none';
  const oc=document.getElementById('qOpts'); oc.innerHTML='';
  q.opts.forEach((o,i)=>{ const b=document.createElement('button'); b.className='q-opt'; b.textContent=String.fromCharCode(65+i)+'. '+o; b.addEventListener('click',()=>qAnswer(i,b)); oc.appendChild(b); });
  document.getElementById('qScoreN').textContent=qScore;
  document.getElementById('qScoreD').textContent=qCur;
}
function qAnswer(chosen, btn) {
  const q=QS[qCur], ok=chosen===q.ans;
  if(ok) qScore++;
  else qWrong.push(qCur);
  document.querySelectorAll('#qOpts .q-opt').forEach((b,i)=>{ b.disabled=true; if(i===q.ans) b.classList.add('correct'); if(b===btn&&!ok) b.classList.add('wrong'); });
  const fb=document.getElementById('qFB');
  fb.style.display='block'; fb.className='q-fb '+(ok?'ok':'no');
  fb.textContent=(ok?'✅ Correct! ':'❌ Incorrect. ')+q.ex;
  document.getElementById('qNext').style.display='block';
  document.getElementById('qScoreN').textContent=qScore;
  document.getElementById('qScoreD').textContent=qCur+1;
}
function qNextQ() { qCur++; if(qCur>=QS.length) qFinish(); else qShowQ(); }
function qFinish() {
  document.getElementById('qBox').style.display='none';
  document.getElementById('qEnd').style.display='block';
  document.getElementById('qProg').style.width='100%';
  document.getElementById('qProgLbl').textContent=`Completed! ${QS.length}/${QS.length}`;
  const pct=Math.round(qScore/QS.length*100);
  document.getElementById('qEndScore').textContent=`${qScore} / ${QS.length} (${pct}%)`;
  const lvl=pct>=90?['🏆','Excellent!','You have mastered Sequential Logic!']:pct>=75?['🎉','Great Job!','Strong understanding demonstrated.']:pct>=60?['👍','Good Effort!','Review highlighted topics and retry.']:['📚','Keep Studying!','Revisit the lessons and try again.'];
  document.getElementById('qEndIco').textContent=lvl[0];
  document.getElementById('qEndTitle').textContent=lvl[1];
  document.getElementById('qEndMsg').textContent=lvl[2];
  const rv=document.getElementById('qRevList'); rv.innerHTML='';
  if(qWrong.length){ const h=document.createElement('h4'); h.style.cssText='margin-bottom:.7rem;font-size:.9rem;color:var(--txt-s)'; h.textContent='📚 Review These:'; rv.appendChild(h); }
  qWrong.forEach(i=>{ const d=document.createElement('div'); d.className='rev-item'; d.innerHTML=`<strong>${QS[i].t}:</strong> ${QS[i].q}`; rv.appendChild(d); });
}
function qReset() { document.getElementById('qStartBox').style.display='block'; document.getElementById('qBox').style.display='none'; document.getElementById('qEnd').style.display='none'; document.getElementById('qProg').style.width='0%'; document.getElementById('qProgLbl').textContent='Q 0 / '+QS.length; document.getElementById('qScoreN').textContent=0; document.getElementById('qScoreD').textContent=0; }

/* ═══════════ NOTES ═══════════ */
const notesEl=document.getElementById('studyNotes'), notesStEl=document.getElementById('notesSt');
notesEl.value=localStorage.getItem('slnotes')||'';
let ntTimer;
notesEl.addEventListener('input',()=>{ notesStEl.textContent='Saving…'; clearTimeout(ntTimer); ntTimer=setTimeout(()=>{ localStorage.setItem('slnotes',notesEl.value); notesStEl.textContent='✅ Saved!'; setTimeout(()=>notesStEl.textContent='Notes auto-saved.',2000); },800); });

/* ═══════════ KEYBOARD ═══════════ */
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ sb.classList.remove('open'); ov.classList.remove('show'); } if(e.ctrlKey&&e.key==='d'){ e.preventDefault(); setTheme(!dark); } });

/* ═══════════ CANVAS RESIZE ═══════════ */
let rzTimer;
window.addEventListener('resize',()=>{ clearTimeout(rzTimer); rzTimer=setTimeout(redrawAll,300); });

function redrawAll() {
  Object.entries(tdDatasets).forEach(([k,data])=>{ tdDraw(data.canvas, data.signals); });
  drawFFHistory('srffTD',srffHist,['S','R','Q'],[d=>d.S,d=>d.R,d=>d.Qn],[C.accent,C.red,C.green]);
  drawFFHistory('jkTD',jkHist,['J','K','Q'],[d=>d.J,d=>d.K,d=>d.Qn],[C.accent2,C.red,C.green]);
  drawFFHistory('dffTD',dffHist,['D','Q'],[d=>d.D,d=>d.Qn],[C.accent,C.green]);
  drawFFHistory('tffTD',tffHist,['T','Q'],[d=>d.T,d=>d.Qn],[C.accent2,C.green]);
}

/* ═══════════ INIT ═══════════ */
window.addEventListener('load', () => {
  initTDState();
  norUpdate();
  nandUpdate();
  dlUpdate();
  srffUpdate();
  jkUpdate();
  dffUpdate();
  tffUpdate();
  msRst();
  redrawAll();
  allSecs.forEach(s=>{ const r=s.getBoundingClientRect(); if(r.top<innerHeight) s.classList.add('vis'); });
});
