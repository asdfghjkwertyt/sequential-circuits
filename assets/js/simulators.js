// Interactive Simulator Logic for Sequential Circuit Simulator Lab

// Simple Audio Tone Generator using Web Audio API
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTick(frequency = 600, duration = 0.05) {
    if (this.muted) return;
    this.init();
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio Context error:', e);
    }
  }

  playCorrect() {
    this.playTick(523.25, 0.1); // C5
    setTimeout(() => this.playTick(659.25, 0.15), 100); // E5
  }

  playError() {
    this.playTick(220, 0.25); // A3
  }
}

const SoundEffect = new AudioSynth();
window.SoundEffect = SoundEffect;


// --------------------------------------------------
// Real-time Canvas Waveform Drawer
// --------------------------------------------------
class WaveformDrawer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.history = []; // holds snapshots of states: { clk, d, q0, q1, q2, q3 }
    this.maxSamples = 50;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  addSample(clk, d, q0, q1, q2, q3) {
    this.history.push({ clk, d, q0, q1, q2, q3 });
    if (this.history.length > this.maxSamples) {
      this.history.shift();
    }
    this.draw();
  }

  clear() {
    this.history = [];
    this.draw();
  }

  draw() {
    if (!this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width / window.devicePixelRatio;
    const h = this.canvas.height / window.devicePixelRatio;
    
    ctx.clearRect(0, 0, w, h);
    
    // Background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, w, h);

    if (this.history.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('No signals recorded yet. Click CLOCK to generate waves.', w / 2, h / 2);
      return;
    }

    const signals = ['CLK', 'DIN', 'Q0', 'Q1', 'Q2', 'Q3'];
    const rowHeight = h / signals.length;
    const xStep = w / this.maxSamples;

    signals.forEach((sigName, rowIdx) => {
      const centerY = rowIdx * rowHeight + rowHeight / 2;
      const topY = rowIdx * rowHeight + 10;
      const bottomY = (rowIdx + 1) * rowHeight - 10;
      
      // Draw row dividers
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, (rowIdx + 1) * rowHeight);
      ctx.lineTo(w, (rowIdx + 1) * rowHeight);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#38bdf8'; // cyan-400
      ctx.font = '11px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(sigName, 10, centerY + 4);

      // Wave path
      ctx.strokeStyle = '#22c55e'; // green-500
      ctx.lineWidth = 2;
      ctx.beginPath();

      this.history.forEach((state, stepIdx) => {
        const x = w - (this.history.length - stepIdx) * xStep;
        let val = 0;
        
        if (sigName === 'CLK') val = state.clk;
        else if (sigName === 'DIN') val = state.d;
        else if (sigName === 'Q0') val = state.q0;
        else if (sigName === 'Q1') val = state.q1;
        else if (sigName === 'Q2') val = state.q2;
        else if (sigName === 'Q3') val = state.q3;

        const targetY = (val === 1) ? topY : bottomY;

        if (stepIdx === 0) {
          ctx.moveTo(x, targetY);
        } else {
          // Digital square logic transition (vertical line then horizontal)
          const prevX = w - (this.history.length - (stepIdx - 1)) * xStep;
          const prevVal = getSigValue(signals[rowIdx], this.history[stepIdx - 1]);
          const prevY = (prevVal === 1) ? topY : bottomY;
          
          ctx.lineTo(x, prevY);
          ctx.lineTo(x, targetY);
        }
      });
      ctx.stroke();
    });

    function getSigValue(name, state) {
      if (name === 'CLK') return state.clk;
      if (name === 'DIN') return state.d;
      if (name === 'Q0') return state.q0;
      if (name === 'Q1') return state.q1;
      if (name === 'Q2') return state.q2;
      if (name === 'Q3') return state.q3;
      return 0;
    }
  }
}


// --------------------------------------------------
// Shift Registers Simulator Engine
// --------------------------------------------------
class ShiftRegisterSimulator {
  constructor() {
    this.mode = 'siso'; // siso, sipo, piso, pipo
    this.register = [0, 0, 0, 0]; // 4-bit storage
    this.serialInput = 0;
    this.parallelInputs = [0, 0, 0, 0];
    this.outputs = [0, 0, 0, 0];
    
    this.steps = []; // step logs
    this.pisoLoaded = false;
    this.pisoOutIdx = 0;
    
    this.autoClock = false;
    this.intervalId = null;
    this.speed = 1000; // ms
    
    this.waveform = null;
    this.clkPulseState = 0;
  }

  init(waveformCanvasId) {
    this.waveform = new WaveformDrawer(waveformCanvasId);
    this.reset();
  }

  reset() {
    this.register = [0, 0, 0, 0];
    this.outputs = [0, 0, 0, 0];
    this.pisoLoaded = false;
    this.pisoOutIdx = 0;
    this.steps = ["Simulator reset. Register initialized with 0000."];
    this.updateUI();
    if (this.waveform) this.waveform.clear();
  }

  setMode(mode) {
    this.mode = mode;
    this.reset();
  }

  toggleSerialInput() {
    this.serialInput = this.serialInput === 0 ? 1 : 0;
    this.steps.push(`Changed serial input to ${this.serialInput}.`);
    this.updateUI();
  }

  toggleParallelInput(idx) {
    this.parallelInputs[idx] = this.parallelInputs[idx] === 0 ? 1 : 0;
    this.steps.push(`Toggled Parallel Input I${idx} to ${this.parallelInputs[idx]}.`);
    this.updateUI();
  }

  clockPulse() {
    SoundEffect.playTick(600, 0.04);
    
    // Timing Wave pulses CLK 1 then 0 rapidly
    this.clkPulseState = 1;
    this.executeShift();
    
    if (this.waveform) {
      this.waveform.addSample(
        1,
        this.serialInput,
        this.outputs[0],
        this.outputs[1],
        this.outputs[2],
        this.outputs[3]
      );
    }

    setTimeout(() => {
      this.clkPulseState = 0;
      if (this.waveform) {
        this.waveform.addSample(
          0,
          this.serialInput,
          this.outputs[0],
          this.outputs[1],
          this.outputs[2],
          this.outputs[3]
        );
      }
    }, 150);
  }

  executeShift() {
    const prevReg = [...this.register];

    if (this.mode === 'siso') {
      // RIGHT-shift: new serial bit enters FF0 (left), data shifts toward FF3 (right)
      // Serial output is taken from FF3 (the last/rightmost stage)
      const serialIn = this.serialInput;
      this.register[3] = this.register[2]; // FF3 ← FF2
      this.register[2] = this.register[1]; // FF2 ← FF1
      this.register[1] = this.register[0]; // FF1 ← FF0
      this.register[0] = serialIn;          // FF0 ← Serial Input

      // SISO: only Q3 (last stage) is the serial output pin
      this.outputs = [0, 0, 0, this.register[3]];
      this.steps.push(`CLOCK ↑ Rising Edge: D_in=${serialIn} enters FF0. Each FF captures its left neighbour. Register=[${this.register.join('')}]. Serial out Q3=${this.register[3]}.`);

    } else if (this.mode === 'sipo') {
      // RIGHT-shift: same as SISO but ALL Q outputs are exposed simultaneously
      const serialIn = this.serialInput;
      this.register[3] = this.register[2];
      this.register[2] = this.register[1];
      this.register[1] = this.register[0];
      this.register[0] = serialIn;

      this.outputs = [...this.register]; // All 4 outputs exposed in parallel
      this.steps.push(`CLOCK ↑ Rising Edge: D_in=${serialIn} enters FF0. Bits shift RIGHT. Parallel outputs Q0=${this.outputs[0]}, Q1=${this.outputs[1]}, Q2=${this.outputs[2]}, Q3=${this.outputs[3]}.`);

    } else if (this.mode === 'piso') {
      // PISO: 1) PARALLEL LOAD all bits at once, then 2) SHIFT RIGHT each clock
      // Serial output is always from Q3 (rightmost stage)
      if (!this.pisoLoaded) {
        // Parallel Load — all FFs capture their parallel inputs simultaneously on one clock edge
        this.register = [...this.parallelInputs];
        this.pisoLoaded = true;
        this.pisoOutIdx = 0;
        // After load: Q3 holds bit I3 → first to appear on serial output
        this.outputs = [0, 0, 0, this.register[3]];
        this.steps.push(`PARALLEL LOAD: Register loaded as [${this.register.join('')}]. Q0=I0=${this.register[0]}, Q1=I1=${this.register[1]}, Q2=I2=${this.register[2]}, Q3=I3=${this.register[3]}. Serial out Q3=${this.register[3]}.`);
      } else {
        // Shift RIGHT: 0 enters from left (FF0), each bit moves one stage right
        // Output sequence: I3 (already seen), then I2, I1, I0
        this.register[3] = this.register[2]; // FF3 ← FF2
        this.register[2] = this.register[1]; // FF2 ← FF1
        this.register[1] = this.register[0]; // FF1 ← FF0
        this.register[0] = 0;                // FF0 ← 0 (no serial input in PISO shift mode)
        this.pisoOutIdx++;
        this.outputs = [0, 0, 0, this.register[3]];
        this.steps.push(`CLOCK ↑ Shift #${this.pisoOutIdx}: 0 enters FF0, bits shift RIGHT. Register=[${this.register.join('')}]. Serial output Q3=${this.register[3]}.`);
      }

    } else if (this.mode === 'pipo') {
      // All parallel inputs transferred to all outputs in ONE clock pulse
      this.register = [...this.parallelInputs];
      this.outputs = [...this.register];
      this.steps.push(`CLOCK ↑ (PIPO): All 4 bits loaded and available instantly. Q0=I0=${this.outputs[0]}, Q1=I1=${this.outputs[1]}, Q2=I2=${this.outputs[2]}, Q3=I3=${this.outputs[3]}.`);
    }

    this.updateUI();
  }

  triggerAutoClock(start, speedMs) {
    this.autoClock = start;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.autoClock) {
      this.speed = speedMs || this.speed;
      this.intervalId = setInterval(() => {
        this.clockPulse();
      }, this.speed);
    }
  }

  updateUI() {
    // Dynamically populated in main application loop based on current state
    if (window.updateShiftRegisterDOM) {
      window.updateShiftRegisterDOM(this);
    }
  }
}


// --------------------------------------------------
// Counters Simulator Engine
// --------------------------------------------------
class CounterSimulator {
  constructor() {
    this.type = 'async'; // async, sync
    this.mode = 'up'; // up, down
    this.modType = 'mod-16'; // mod-16, mod-10, mod-8, custom
    this.customModValue = 16;
    
    this.count = 0;
    this.autoClock = false;
    this.intervalId = null;
    this.speed = 1000;
    this.paused = false;
    
    this.waveform = null;
    this.clkPulseState = 0;
  }

  init(waveformCanvasId) {
    this.waveform = new WaveformDrawer(waveformCanvasId);
    this.reset();
  }

  reset() {
    this.count = this.mode === 'up' ? 0 : this.getLimit() - 1;
    this.paused = false;
    this.updateUI();
    if (this.waveform) this.waveform.clear();
  }

  getLimit() {
    if (this.modType === 'mod-16') return 16;
    if (this.modType === 'mod-10') return 10;
    if (this.modType === 'mod-8') return 8;
    if (this.modType === 'custom') return this.customModValue;
    return 16;
  }

  clockPulse() {
    if (this.paused) return;
    SoundEffect.playTick(500, 0.04);
    
    this.clkPulseState = 1;
    this.executeCount();
    
    const binary = this.getBinaryState();
    if (this.waveform) {
      this.waveform.addSample(
        1,
        0,
        binary[0],
        binary[1],
        binary[2],
        binary[3]
      );
    }

    setTimeout(() => {
      this.clkPulseState = 0;
      if (this.waveform) {
        this.waveform.addSample(
          0,
          0,
          binary[0],
          binary[1],
          binary[2],
          binary[3]
        );
      }
    }, 150);
  }

  executeCount() {
    const limit = this.getLimit();

    if (this.mode === 'up') {
      this.count++;
      if (this.count >= limit) {
        this.count = 0; // wrap around
      }
    } else {
      this.count--;
      if (this.count < 0) {
        this.count = limit - 1; // wrap around
      }
    }
    this.updateUI();
  }

  getBinaryState() {
    // Returns [Q0, Q1, Q2, Q3] where Q0 is LSB
    const q0 = this.count & 1;
    const q1 = (this.count >> 1) & 1;
    const q2 = (this.count >> 2) & 1;
    const q3 = (this.count >> 3) & 1;
    return [q0, q1, q2, q3];
  }

  triggerAutoClock(start, speedMs) {
    this.autoClock = start;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.autoClock) {
      this.speed = speedMs || this.speed;
      this.intervalId = setInterval(() => {
        this.clockPulse();
      }, this.speed);
    }
  }

  updateUI() {
    if (window.updateCounterDOM) {
      window.updateCounterDOM(this);
    }
  }
}


// --------------------------------------------------
// Ring Counter Simulator Engine
// --------------------------------------------------
class RingCounterSimulator {
  constructor() {
    this.register = [1, 0, 0, 0]; // 4-bit, initialized to 1000
    this.autoClock = false;
    this.intervalId = null;
    this.speed = 1000;
    this.history = []; // record of states
  }

  reset() {
    this.register = [1, 0, 0, 0];
    this.history = [['Preset Init', '1', '0', '0', '0']];
    this.updateUI();
  }

  clockPulse() {
    SoundEffect.playTick(650, 0.04);
    
    // Shift right: Register [Q0, Q1, Q2, Q3] -> Q3 is shifted back into Q0
    const finalBit = this.register[3];
    
    // Shift everything right
    this.register[3] = this.register[2];
    this.register[2] = this.register[1];
    this.register[1] = this.register[0];
    this.register[0] = finalBit;

    this.history.push([`Pulse ${this.history.length}`, ...this.register.map(String)]);
    if (this.history.length > 8) this.history.shift();

    this.updateUI();
  }

  triggerAutoClock(start, speedMs) {
    this.autoClock = start;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.autoClock) {
      this.speed = speedMs || this.speed;
      this.intervalId = setInterval(() => {
        this.clockPulse();
      }, this.speed);
    }
  }

  updateUI() {
    if (window.updateRingDOM) {
      window.updateRingDOM(this);
    }
  }
}


// --------------------------------------------------
// Johnson Counter Simulator Engine
// --------------------------------------------------
class JohnsonCounterSimulator {
  constructor() {
    this.register = [0, 0, 0, 0]; // 4-bit, initialized to 0000
    this.autoClock = false;
    this.intervalId = null;
    this.speed = 1000;
    this.history = [];
  }

  reset() {
    this.register = [0, 0, 0, 0];
    this.history = [['Reset Init', '0', '0', '0', '0']];
    this.updateUI();
  }

  clockPulse() {
    SoundEffect.playTick(680, 0.04);
    
    // Feedback: Complement of Q3 (final bit) goes back to D0 (first bit)
    const feedback = this.register[3] === 1 ? 0 : 1;
    
    // Shift everything right
    this.register[3] = this.register[2];
    this.register[2] = this.register[1];
    this.register[1] = this.register[0];
    this.register[0] = feedback;

    this.history.push([`Pulse ${this.history.length}`, ...this.register.map(String)]);
    if (this.history.length > 8) this.history.shift();

    this.updateUI();
  }

  triggerAutoClock(start, speedMs) {
    this.autoClock = start;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.autoClock) {
      this.speed = speedMs || this.speed;
      this.intervalId = setInterval(() => {
        this.clockPulse();
      }, this.speed);
    }
  }

  updateUI() {
    if (window.updateJohnsonDOM) {
      window.updateJohnsonDOM(this);
    }
  }
}

// Attach simulators to window scope
window.ShiftRegisterSimulator = ShiftRegisterSimulator;
window.CounterSimulator = CounterSimulator;
window.RingCounterSimulator = RingCounterSimulator;
window.JohnsonCounterSimulator = JohnsonCounterSimulator;
