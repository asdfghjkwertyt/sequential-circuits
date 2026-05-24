/* ============================================================
   Unit V – Sequential Logic Circuits — JavaScript Engine
   ============================================================ */

'use strict';

// ── Tab Navigation ───────────────────────────────────────────
function u5InitTabs() {
  document.querySelectorAll('.u5-tab-bar').forEach(bar => {
    const tabs   = bar.querySelectorAll('.u5-tab');
    const target = bar.dataset.target;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll(`#${target} .u5-panel`).forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(tab.dataset.panel);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

// ── Beginner Mode Toggle ─────────────────────────────────────
function u5InitBeginnerMode() {
  const toggle = document.getElementById('u5-beginner-toggle');
  const label  = document.getElementById('u5-beginner-label');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('on');
    const on = toggle.classList.contains('on');
    document.body.classList.toggle('beginner-mode', on);
    if (label) label.textContent = on ? 'Beginner Mode: ON' : 'Beginner Mode: OFF';
  });
}

// ── SR Latch Simulator ───────────────────────────────────────
class SRLatch {
  constructor(prefix, gateType = 'nor') {
    this.S = 0; this.R = 0;
    this.Q = 0; this.Qb = 1;
    this.gateType = gateType; // 'nor' or 'nand'
    this.prefix = prefix;
    this.steps = [];
  }

  apply(S, R) {
    this.S = S; this.R = R;
    const prev = { Q: this.Q, Qb: this.Qb };

    if (this.gateType === 'nor') {
      // NOR latch: S=1,R=0 → Set; S=0,R=1 → Reset; S=0,R=0 → Hold; S=1,R=1 → INVALID
      if (S === 1 && R === 1) {
        this.Q = 0; this.Qb = 0; // both forced to 0 temporarily (invalid)
        this.steps.push('⚠️ INVALID: S=R=1. Both Q and Q\' forced to 0 — unpredictable!');
        this.updateUI('invalid');
        return;
      }
      if (S === 1 && R === 0) { this.Q = 1; this.Qb = 0; this.steps.push('SET: S=1,R=0 → Q=1, Q\'=0'); }
      else if (S === 0 && R === 1) { this.Q = 0; this.Qb = 1; this.steps.push('RESET: S=0,R=1 → Q=0, Q\'=1'); }
      else { this.steps.push(`HOLD: S=0,R=0 → Q stays ${this.Q}`); }
    } else {
      // NAND latch: active-LOW inputs. S'=0,R'=1 → Set; S'=1,R'=0 → Reset; S'=1,R'=1 → Hold; S'=0,R'=0 → INVALID
      // For NAND latch the inputs are S' and R' (active low), so we invert user input convention
      const Sn = 1 - S; const Rn = 1 - R;
      if (Sn === 0 && Rn === 0) {
        this.Q = 1; this.Qb = 1;
        this.steps.push('⚠️ INVALID: S\'=R\'=0. Both Q and Q\' become 1 — unpredictable!');
        this.updateUI('invalid');
        return;
      }
      if (Sn === 0 && Rn === 1) { this.Q = 1; this.Qb = 0; this.steps.push('SET: S\'=0 → Q=1, Q\'=0'); }
      else if (Sn === 1 && Rn === 0) { this.Q = 0; this.Qb = 1; this.steps.push('RESET: R\'=0 → Q=0, Q\'=1'); }
      else { this.steps.push(`HOLD: S\'=R\'=1 → Q stays ${this.Q}`); }
    }
    this.updateUI('valid');
  }

  updateUI(state) {
    const p = this.prefix;
    const qEl = document.getElementById(`${p}-Q`);
    const qbEl = document.getElementById(`${p}-Qb`);
    const stateEl = document.getElementById(`${p}-state`);
    const logEl = document.getElementById(`${p}-log`);

    if (qEl)  { qEl.textContent = this.Q; qEl.className = `ff-led ${state === 'invalid' ? 'led-invalid' : (this.Q ? 'led-1' : 'led-0')}`; }
    if (qbEl) { qbEl.textContent = this.Qb; qbEl.className = `ff-led ${state === 'invalid' ? 'led-invalid' : (this.Qb ? 'led-1' : 'led-0')}`; }

    if (stateEl) {
      if (state === 'invalid') {
        stateEl.textContent = '⚠️ INVALID STATE';
        stateEl.className = 'text-xs font-bold text-red-500 font-mono mt-2';
      } else {
        const stateMap = [[['Hold','Set'],['Reset','—']]];
        const labels = ['Hold', 'Set', 'Reset', 'Hold'];
        stateEl.textContent = this.Q ? (this.S ? 'SET (Q=1)' : 'Hold Q=1') : (this.R ? 'RESET (Q=0)' : 'Hold Q=0');
        stateEl.className = 'text-xs font-semibold text-cyan-400 font-mono mt-2';
      }
    }

    if (logEl && this.steps.length) {
      const div = document.createElement('div');
      div.className = 'narrator-log-entry';
      div.textContent = this.steps[this.steps.length - 1];
      logEl.prepend(div);
      if (logEl.children.length > 6) logEl.removeChild(logEl.lastChild);
    }
    this.updateSVG(state);
  }

  updateSVG(state) {
    const p = this.prefix;
    const wireQ  = document.getElementById(`${p}-wire-Q`);
    const wireQb = document.getElementById(`${p}-wire-Qb`);
    if (wireQ)  wireQ.className.baseVal  = state === 'invalid' ? 'gate-wire active-inv' : (this.Q ? 'gate-wire active' : 'gate-wire');
    if (wireQb) wireQb.className.baseVal = state === 'invalid' ? 'gate-wire active-inv' : (this.Qb ? 'gate-wire active' : 'gate-wire');
  }
}

// ── D Latch Simulator ─────────────────────────────────────────
class DLatch {
  constructor(prefix) {
    this.D = 0; this.EN = 0;
    this.Q = 0; this.Qb = 1;
    this.prefix = prefix;
    this.steps = [];
  }

  apply(D, EN) {
    this.D = D; this.EN = EN;
    if (EN === 1) {
      this.Q = D; this.Qb = 1 - D;
      this.steps.push(`ENABLED: EN=1, D=${D} → Q=${D} (transparent mode — Q follows D)`);
    } else {
      this.steps.push(`LATCHED: EN=0 → Q stays ${this.Q} (memory mode — ignores D)`);
    }
    this.updateUI();
  }

  updateUI() {
    const p = this.prefix;
    const qEl = document.getElementById(`${p}-Q`);
    const qbEl = document.getElementById(`${p}-Qb`);
    const logEl = document.getElementById(`${p}-log`);
    const modeEl = document.getElementById(`${p}-mode`);

    if (qEl)  { qEl.textContent = this.Q;  qEl.className  = `ff-led ${this.Q  ? 'led-1' : 'led-0'}`; }
    if (qbEl) { qbEl.textContent = this.Qb; qbEl.className = `ff-led ${this.Qb ? 'led-1' : 'led-0'}`; }
    if (modeEl) {
      modeEl.textContent = this.EN ? '🟢 Transparent (follows D)' : '🔒 Latched (holds value)';
      modeEl.className = this.EN ? 'text-xs font-bold text-green-400 font-mono' : 'text-xs font-bold text-amber-400 font-mono';
    }
    if (logEl && this.steps.length) {
      const div = document.createElement('div');
      div.className = 'narrator-log-entry';
      div.textContent = this.steps[this.steps.length - 1];
      logEl.prepend(div);
      if (logEl.children.length > 6) logEl.removeChild(logEl.lastChild);
    }
  }
}

// ── Generic Edge-Triggered FF Simulator ──────────────────────
class FlipFlopSim {
  constructor(prefix, type) {
    this.type = type; // 'sr','jk','d','t'
    this.prefix = prefix;
    this.inputs = { S:0, R:0, J:0, K:0, D:0, T:0 };
    this.Q = 0; this.Qb = 1;
    this.clkCount = 0;
    this.steps = [];
    this.history = [{ clk: 0, Q: 0 }];
  }

  setInput(name, val) {
    this.inputs[name] = val;
    const el = document.getElementById(`${this.prefix}-inp-${name}`);
    if (el) { el.textContent = val; el.className = val ? 'font-mono font-bold text-green-400' : 'font-mono text-slate-400'; }
  }

  clock() {
    this.clkCount++;
    const Q = this.Q;
    let nextQ = Q;
    let action = '';

    switch (this.type) {
      case 'sr': {
        const { S, R } = this.inputs;
        if (S && R) { action = '⚠️ INVALID (S=R=1)'; this.updateUI('invalid'); this.steps.push(`CLK ${this.clkCount}: INVALID S=R=1`); return; }
        if (S && !R)      { nextQ = 1; action = 'SET (S=1) → Q=1'; }
        else if (!S && R) { nextQ = 0; action = 'RESET (R=1) → Q=0'; }
        else               { action = `HOLD → Q stays ${Q}`; }
        break;
      }
      case 'jk': {
        const { J, K } = this.inputs;
        if (J && K)       { nextQ = 1 - Q; action = `TOGGLE → Q=${1-Q}`; }
        else if (J && !K) { nextQ = 1; action = 'SET (J=1,K=0) → Q=1'; }
        else if (!J && K) { nextQ = 0; action = 'RESET (J=0,K=1) → Q=0'; }
        else               { action = `HOLD → Q stays ${Q}`; }
        break;
      }
      case 'd': {
        const { D } = this.inputs;
        nextQ = D; action = `CAPTURE D=${D} → Q=${D}`;
        break;
      }
      case 't': {
        const { T } = this.inputs;
        if (T) { nextQ = 1 - Q; action = `TOGGLE → Q=${1-Q}`; }
        else   { action = `HOLD → Q stays ${Q}`; }
        break;
      }
    }

    this.Q = nextQ; this.Qb = 1 - nextQ;
    this.steps.push(`CLK↑ ${this.clkCount}: ${action}`);
    this.history.push({ clk: this.clkCount, Q: this.Q });
    if (this.history.length > 10) this.history.shift();
    this.updateUI('valid');
    this.drawTiming();
  }

  reset() {
    this.Q = 0; this.Qb = 1; this.clkCount = 0;
    this.steps = []; this.history = [{ clk: 0, Q: 0 }];
    this.updateUI('valid');
    this.drawTiming();
  }

  updateUI(state) {
    const p = this.prefix;
    const qEl  = document.getElementById(`${p}-Q`);
    const qbEl = document.getElementById(`${p}-Qb`);
    const logEl = document.getElementById(`${p}-log`);

    if (qEl)  { qEl.textContent  = this.Q;  qEl.className  = `ff-led ${state === 'invalid' ? 'led-invalid' : (this.Q ? 'led-1' : 'led-0')}`; }
    if (qbEl) { qbEl.textContent = this.Qb; qbEl.className = `ff-led ${state === 'invalid' ? 'led-invalid' : (this.Qb ? 'led-1' : 'led-0')}`; }

    if (logEl && this.steps.length) {
      const div = document.createElement('div');
      div.className = 'narrator-log-entry';
      div.textContent = this.steps[this.steps.length - 1];
      logEl.prepend(div);
      if (logEl.children.length > 8) logEl.removeChild(logEl.lastChild);
    }
    this.highlightTruthRow();
  }

  highlightTruthRow() {
    const table = document.getElementById(`${this.prefix}-truth`);
    if (!table) return;
    table.querySelectorAll('tbody tr').forEach(r => r.classList.remove('hl'));
    let rowIdx = -1;
    const { S, R, J, K, D, T } = this.inputs;
    switch (this.type) {
      case 'sr': rowIdx = (S === 0 && R === 0) ? 0 : (S === 0 && R === 1) ? 1 : (S === 1 && R === 0) ? 2 : 3; break;
      case 'jk': rowIdx = (J === 0 && K === 0) ? 0 : (J === 0 && K === 1) ? 1 : (J === 1 && K === 0) ? 2 : 3; break;
      case 'd' : rowIdx = D; break;
      case 't' : rowIdx = T; break;
    }
    const rows = table.querySelectorAll('tbody tr');
    if (rows[rowIdx]) rows[rowIdx].classList.add('hl');
  }

  drawTiming() {
    const canvas = document.getElementById(`${this.prefix}-timing`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const rows = this.history;
    const trackH = 36, pad = 8, leftW = 32;
    const segW = rows.length > 1 ? (W - leftW - pad) / (rows.length - 1) : W - leftW - pad;

    const drawWave = (yTop, dataFn, color, label) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right';
      ctx.fillText(label, leftW - 4, yTop + trackH / 2 + 3);
      ctx.beginPath();
      rows.forEach((pt, i) => {
        const x = leftW + i * segW;
        const y = yTop + (dataFn(pt) ? pad : trackH - pad);
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevY = yTop + (dataFn(rows[i-1]) ? pad : trackH - pad);
          if (y !== prevY) { ctx.lineTo(x, prevY); ctx.lineTo(x, y); }
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    };

    // CLK signal
    const clkH = 22; ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 1.5;
    ctx.fillStyle = '#64748b'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right';
    ctx.fillText('CLK', leftW - 4, clkH + 10);
    ctx.beginPath(); let cx = leftW;
    rows.forEach((pt, i) => {
      if (i === 0) { ctx.moveTo(cx, clkH + 14); return; }
      ctx.lineTo(cx, clkH + 14); ctx.lineTo(cx, clkH + 4); cx += segW / 2;
      ctx.lineTo(cx, clkH + 4); ctx.lineTo(cx, clkH + 14); cx += segW / 2;
    });
    ctx.stroke();

    drawWave(50, p => p.Q, '#22c55e', 'Q');
    drawWave(90, p => 1 - p.Q, '#ef4444', "Q'");

    // Grid lines
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5;
    rows.forEach((_, i) => {
      const x = leftW + i * segW;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    });
  }
}

// ── Master-Slave JK Animator ──────────────────────────────────
class MasterSlaveAnim {
  constructor() {
    this.step = 0;
    this.J = 1; this.K = 0;
    this.masterQ = 0; this.slaveQ = 0;
    this.clockHigh = false;
  }

  tick() {
    this.step++;
    if (this.step % 2 === 1) {
      // Clock goes HIGH — master samples J,K
      this.clockHigh = true;
      const J = this.J, K = this.K, Q = this.masterQ;
      if (J && K) this.masterQ = 1 - Q;
      else if (J) this.masterQ = 1;
      else if (K) this.masterQ = 0;
      this.updateUI('master sampling');
    } else {
      // Clock goes LOW — slave copies master
      this.clockHigh = false;
      this.slaveQ = this.masterQ;
      this.updateUI('slave copying');
    }
  }

  updateUI(phase) {
    const masterBlock = document.getElementById('ms-master');
    const slaveBlock  = document.getElementById('ms-slave');
    const clkLed      = document.getElementById('ms-clk-led');
    const phaseEl     = document.getElementById('ms-phase');
    const mqEl        = document.getElementById('ms-masterQ');
    const sqEl        = document.getElementById('ms-slaveQ');

    if (masterBlock) masterBlock.className = `ms-block${this.clockHigh ? ' master-active' : ''}`;
    if (slaveBlock)  slaveBlock.className  = `ms-block${!this.clockHigh ? ' slave-active' : ''}`;
    if (clkLed)      clkLed.className      = `ff-led ${this.clockHigh ? 'led-1' : 'led-0'}`;
    if (phaseEl)     phaseEl.textContent   = this.clockHigh ? '⬆ CLK HIGH — Master is ACTIVE (sampling inputs)' : '⬇ CLK LOW — Slave is ACTIVE (copying master)';
    if (mqEl)        { mqEl.textContent = this.masterQ; mqEl.className = `ff-led ${this.masterQ ? 'led-1' : 'led-0'}`; }
    if (sqEl)        { sqEl.textContent = this.slaveQ;  sqEl.className = `ff-led ${this.slaveQ ? 'led-1' : 'led-0'}`; }
  }
}

// ── K-Map Helper ──────────────────────────────────────────────
function renderKmap(containerId, cells, groupCells, result) {
  const el = document.getElementById(containerId);
  if (!el) return;
  // cells: array of 4 values for [00,01,11,10] columns
  el.innerHTML = `
    <div class="kmap-grid" style="grid-template-columns: repeat(3,44px)">
      <div class="kmap-cell kh">Q\\JK</div>
      <div class="kmap-cell kh">0</div>
      <div class="kmap-cell kh">1</div>
      <div class="kmap-cell kh">Q=0</div>
      <div class="kmap-cell ${cells[0]==='1'?'k1':cells[0]==='X'?'kx':'k0'}">${cells[0]}</div>
      <div class="kmap-cell ${cells[1]==='1'?'k1':cells[1]==='X'?'kx':'k0'}">${cells[1]}</div>
      <div class="kmap-cell kh">Q=1</div>
      <div class="kmap-cell ${cells[2]==='1'?'k1':cells[2]==='X'?'kx':'k0'}">${cells[2]}</div>
      <div class="kmap-cell ${cells[3]==='1'?'k1':cells[3]==='X'?'kx':'k0'}">${cells[3]}</div>
    </div>
    <div class="char-eq mt-3">${result}</div>
  `;
}

// ── Initialize All Simulators ─────────────────────────────────
function u5Init() {
  u5InitTabs();
  u5InitBeginnerMode();

  // SR NOR Latch
  const srNor = new SRLatch('srl-nor', 'nor');
  bindToggle('srl-nor-S', v => srNor.apply(v, srNor.R));
  bindToggle('srl-nor-R', v => srNor.apply(srNor.S, v));

  // SR NAND Latch
  const srNand = new SRLatch('srl-nand', 'nand');
  bindToggle('srl-nand-S', v => srNand.apply(v, srNand.R));
  bindToggle('srl-nand-R', v => srNand.apply(srNand.S, v));

  // D Latch
  const dLatch = new DLatch('dl');
  bindToggle('dl-D',  v => dLatch.apply(v, dLatch.EN));
  bindToggle('dl-EN', v => dLatch.apply(dLatch.D, v));

  // SR FF
  const srFF = new FlipFlopSim('srff', 'sr');
  bindToggle('srff-S', v => { srFF.setInput('S', v); });
  bindToggle('srff-R', v => { srFF.setInput('R', v); });
  bindClk('srff-clk', () => srFF.clock());
  bindClk('srff-rst', () => srFF.reset());

  // JK FF
  const jkFF = new FlipFlopSim('jkff', 'jk');
  bindToggle('jkff-J', v => { jkFF.setInput('J', v); });
  bindToggle('jkff-K', v => { jkFF.setInput('K', v); });
  bindClk('jkff-clk', () => jkFF.clock());
  bindClk('jkff-rst', () => jkFF.reset());

  // D FF
  const dFF = new FlipFlopSim('dff', 'd');
  bindToggle('dff-D', v => { dFF.setInput('D', v); });
  bindClk('dff-clk', () => dFF.clock());
  bindClk('dff-rst', () => dFF.reset());

  // T FF
  const tFF = new FlipFlopSim('tff', 't');
  bindToggle('tff-T', v => { tFF.setInput('T', v); });
  bindClk('tff-clk', () => tFF.clock());
  bindClk('tff-rst', () => tFF.reset());

  // Master-Slave
  const ms = new MasterSlaveAnim();
  const msBtn = document.getElementById('ms-tick');
  if (msBtn) msBtn.addEventListener('click', () => { ms.tick(); if(typeof SoundEffect !== 'undefined') SoundEffect.playTick(600, 0.02); });
  const msJ = document.getElementById('ms-J');
  const msK = document.getElementById('ms-K');
  if (msJ) msJ.addEventListener('click', () => { ms.J = 1 - ms.J; msJ.classList.toggle('on'); });
  if (msK) msK.addEventListener('click', () => { ms.K = 1 - ms.K; msK.classList.toggle('on'); });

  // K-Maps for conversions
  renderKmap('kmap-sr-to-jk-S', ['0','0','X','X'], [], 'S = J · Q\'');
  renderKmap('kmap-sr-to-jk-R', ['X','X','1','0'], [], 'R = K · Q');
  renderKmap('kmap-jk-to-d-J',  ['0','1','0','1'], [], 'J = D');
  renderKmap('kmap-jk-to-d-K',  ['1','0','1','0'], [], 'K = D\'');
  renderKmap('kmap-d-to-t',     ['0','1','1','0'], [], 'D = T ⊕ Q');
  renderKmap('kmap-t-to-jk',    ['0','1','0','1'], [], 'J = K = T');
}

// ── Helpers ───────────────────────────────────────────────────
function bindToggle(id, cb) {
  const el = document.getElementById(id);
  if (!el) return;
  let state = 0;
  el.addEventListener('click', () => {
    state = 1 - state;
    el.classList.toggle('on', state === 1);
    cb(state);
    if (typeof SoundEffect !== 'undefined') SoundEffect.playTick(800, 0.015);
  });
}

function bindClk(id, cb) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', () => {
    cb();
    if (typeof SoundEffect !== 'undefined') SoundEffect.playTick(550, 0.03);
    el.classList.add('clk-flash');
    setTimeout(() => el.classList.remove('clk-flash'), 200);
  });
}

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', u5Init);
} else {
  u5Init();
}
