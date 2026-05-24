// Core Application Coordinator - Sequential Circuit Simulator Lab

document.addEventListener('DOMContentLoaded', () => {
  // --- Initialize State and Engines ---
  const shiftRegSim = new window.ShiftRegisterSimulator();
  const counterSim = new window.CounterSimulator();
  const ringSim = new window.RingCounterSimulator();
  const johnsonSim = new window.JohnsonCounterSimulator();
  const quiz = new window.QuizEngine();
  let virtualLab = null; // initialized when the virtual lab section opens

  // --- Sound Setup ---
  const muteBtn = document.getElementById('mute-toggle-btn');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      window.SoundEffect.muted = !window.SoundEffect.muted;
      const icon = muteBtn.querySelector('i');
      if (window.SoundEffect.muted) {
        icon.className = 'fas fa-volume-mute text-red-400';
        muteBtn.title = 'Unmute Sound';
      } else {
        icon.className = 'fas fa-volume-up text-cyan-400';
        muteBtn.title = 'Mute Sound';
      }
    });
  }

  // --- Theme Controller ---
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  // Set default theme to Dark (preferred for glowing logic lab aesthetic)
  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'dark');
  }
  
  applyTheme();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const curr = localStorage.getItem('theme');
      localStorage.setItem('theme', curr === 'dark' ? 'light' : 'dark');
      applyTheme();
    });
  }

  function applyTheme() {
    const theme = localStorage.getItem('theme');
    const root = document.documentElement;
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

    if (theme === 'dark') {
      root.classList.add('dark');
      if (themeIcon) themeIcon.className = 'fas fa-sun text-yellow-400';
    } else {
      root.classList.remove('dark');
      if (themeIcon) themeIcon.className = 'fas fa-moon text-slate-600 dark:text-slate-300';
    }
  }

  // --- Router & Tab Swapping ---
  const navLinks = document.querySelectorAll('[data-target-view]');
  const views = document.querySelectorAll('.app-view');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target-view');
      switchView(target);
    });
  });

  // Home "Start Learning" Button jump
  const startLearningBtn = document.getElementById('btn-start-learning');
  if (startLearningBtn) {
    startLearningBtn.addEventListener('click', () => {
      switchView('shift-registers');
    });
  }

  function switchView(viewId) {
    // 1. Hide all views
    views.forEach(v => {
      v.classList.add('hidden');
    });

    // 2. Show target view
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.remove('hidden');
    }

    // 3. Highlight active link
    navLinks.forEach(link => {
      if (link.getAttribute('data-target-view') === viewId) {
        link.classList.add('text-cyan-500', 'border-b-2', 'border-cyan-500', 'font-bold');
        link.classList.remove('text-slate-600', 'dark:text-slate-300');
      } else {
        link.classList.remove('text-cyan-500', 'border-b-2', 'border-cyan-500', 'font-bold');
        link.classList.add('text-slate-600', 'dark:text-slate-300');
      }
    });

    // 4. Initialize specialized views if active
    if (viewId === 'shift-registers') {
      shiftRegSim.init('sr-waveform');
    } else if (viewId === 'counters') {
      counterSim.init('counter-waveform');
    } else if (viewId === 'ring-counter') {
      ringSim.reset();
    } else if (viewId === 'johnson-counter') {
      johnsonSim.reset();
    } else if (viewId === 'virtual-lab') {
      if (!virtualLab) {
        virtualLab = new window.VirtualLab('lab-playground', 'lab-svg-layer');
      }
      virtualLab.loadDemo();
    } else if (viewId === 'quiz') {
      initQuizUI('shift-registers');
    }

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Set default view on load
  switchView('home');


  // --- Floating Logic Gate Canvas Background ---
  const gateCanvas = document.getElementById('gate-canvas');
  if (gateCanvas) {
    const ctx = gateCanvas.getContext('2d');
    let gates = [];
    const gateTypes = ['AND', 'OR', 'NOT', 'XOR', '0', '1', 'D-FF', 'CLK'];

    function initGates() {
      const rect = gateCanvas.getBoundingClientRect();
      gateCanvas.width = rect.width;
      gateCanvas.height = rect.height;
      gates = [];
      const count = Math.min(25, Math.floor(rect.width / 60));
      for (let i = 0; i < count; i++) {
        gates.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          text: gateTypes[Math.floor(Math.random() * gateTypes.length)],
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 12 + 10,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
    }

    function animateGates() {
      ctx.clearRect(0, 0, gateCanvas.width, gateCanvas.height);
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? 'rgba(6, 182, 212, 1)' : 'rgba(15, 23, 42, 1)';

      gates.forEach(gate => {
        ctx.save();
        ctx.globalAlpha = gate.opacity;
        ctx.font = `bold ${gate.size}px JetBrains Mono`;
        ctx.fillText(gate.text, gate.x, gate.y);
        ctx.restore();

        gate.x += gate.speedX;
        gate.y += gate.speedY;

        if (gate.x < -40) gate.x = gateCanvas.width + 40;
        if (gate.x > gateCanvas.width + 40) gate.x = -40;
        if (gate.y < -40) gate.y = gateCanvas.height + 40;
        if (gate.y > gateCanvas.height + 40) gate.y = -40;
      });

      requestAnimationFrame(animateGates);
    }

    initGates();
    animateGates();
    window.addEventListener('resize', initGates);
  }


  // =========================================================================
  // Shift Registers UI Bindings & DOM Updates
  // =========================================================================
  const srClockBtn = document.getElementById('sr-clk-btn');
  const srResetBtn = document.getElementById('sr-reset-btn');
  const srAutoClockCheckbox = document.getElementById('sr-auto-clk');
  const srSpeedSlider = document.getElementById('sr-speed');
  const srSerialToggle = document.getElementById('sr-serial-toggle');
  const srModeSelect = document.getElementById('sr-mode-select');

  if (srClockBtn) srClockBtn.addEventListener('click', () => shiftRegSim.clockPulse());
  if (srResetBtn) srResetBtn.addEventListener('click', () => shiftRegSim.reset());
  if (srSerialToggle) {
    srSerialToggle.addEventListener('click', () => {
      shiftRegSim.toggleSerialInput();
    });
  }
  if (srModeSelect) {
    srModeSelect.addEventListener('change', (e) => {
      shiftRegSim.setMode(e.target.value);
    });
  }
  if (srAutoClockCheckbox) {
    srAutoClockCheckbox.addEventListener('change', (e) => {
      const speed = srSpeedSlider ? parseInt(srSpeedSlider.value) : 1000;
      shiftRegSim.triggerAutoClock(e.target.checked, speed);
    });
  }
  if (srSpeedSlider) {
    srSpeedSlider.addEventListener('input', (e) => {
      const speed = parseInt(e.target.value);
      const speedLabel = document.getElementById('sr-speed-val');
      if (speedLabel) speedLabel.textContent = `${(1000 / speed).toFixed(1)}Hz`;
      if (shiftRegSim.autoClock) {
        shiftRegSim.triggerAutoClock(true, speed);
      }
    });
  }

  // Bind Parallel inputs checkboxes
  for (let i = 0; i < 4; i++) {
    const sw = document.getElementById(`sr-p-sw-${i}`);
    if (sw) {
      sw.addEventListener('change', () => {
        shiftRegSim.toggleParallelInput(i);
      });
    }
  }

  // DOM update function called by Simulator
  window.updateShiftRegisterDOM = function(sim) {
    // 1. Update Mode Header explanation
    const modeHeaders = {
      siso: 'Serial-In Serial-Out (SISO) Mode',
      sipo: 'Serial-In Parallel-Out (SIPO) Mode',
      piso: 'Parallel-In Serial-Out (PISO) Mode',
      pipo: 'Parallel-In Parallel-Out (PIPO) Mode'
    };
    const activeHeader = document.getElementById('sr-active-mode-header');
    if (activeHeader) activeHeader.textContent = modeHeaders[sim.mode] || 'Shift Register Mode';

    // Show/Hide relevant controls (Serial Input only for SISO/SIPO, Parallel for PISO/PIPO)
    const serialControlWrap = document.getElementById('sr-serial-input-wrapper');
    const parallelControlWrap = document.getElementById('sr-parallel-inputs-wrapper');
    if (serialControlWrap) {
      if (sim.mode === 'siso' || sim.mode === 'sipo') {
        serialControlWrap.classList.remove('hidden');
      } else {
        serialControlWrap.classList.add('hidden');
      }
    }
    if (parallelControlWrap) {
      if (sim.mode === 'piso' || sim.mode === 'pipo') {
        parallelControlWrap.classList.remove('hidden');
      } else {
        parallelControlWrap.classList.add('hidden');
      }
    }

    // 2. Update Serial Toggle styling
    if (srSerialToggle) {
      if (sim.serialInput === 1) {
        srSerialToggle.className = 'w-full py-2.5 px-4 bg-red-600 dark:bg-green-600 hover:bg-red-700 dark:hover:bg-green-700 text-white font-bold rounded shadow transition-all';
        srSerialToggle.innerHTML = '<i class="fas fa-toggle-on mr-2"></i>Serial Input: HIGH (1)';
      } else {
        srSerialToggle.className = 'w-full py-2.5 px-4 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded shadow transition-all';
        srSerialToggle.innerHTML = '<i class="fas fa-toggle-off mr-2"></i>Serial Input: LOW (0)';
      }
    }

    // 3. Update Register flip-flop nodes visually
    for (let i = 0; i < 4; i++) {
      const bitNode = document.getElementById(`sr-ff-bit-${i}`);
      const dInNode = document.getElementById(`sr-ff-din-${i}`);
      const qOutNode = document.getElementById(`sr-ff-qout-${i}`);
      const qBarOutNode = document.getElementById(`sr-ff-qbar-${i}`);

      if (bitNode) {
        bitNode.textContent = sim.register[i];
        if (sim.register[i] === 1) {
          bitNode.className = 'text-3xl font-bold font-mono text-red-500 dark:text-green-500 radial-pulse';
        } else {
          bitNode.className = 'text-3xl font-bold font-mono text-slate-400 dark:text-slate-600';
        }
      }

      // Update interactive logic inputs/outputs
      let inputVal = 0;
      if (i === 0) {
        inputVal = sim.mode === 'piso' || sim.mode === 'pipo' ? sim.parallelInputs[0] : sim.serialInput;
      } else {
        inputVal = sim.register[i - 1];
      }

      if (dInNode) dInNode.textContent = inputVal;
      if (qOutNode) qOutNode.textContent = sim.register[i];
      if (qBarOutNode) qBarOutNode.textContent = sim.register[i] === 1 ? 0 : 1;
    }

    // 4. Update overall Outputs LEDs row
    for (let i = 0; i < 4; i++) {
      const led = document.getElementById(`sr-led-out-${i}`);
      const label = document.getElementById(`sr-led-lbl-${i}`);
      if (led) {
        if (sim.outputs[i] === 1) {
          led.className = 'w-10 h-10 rounded-full bg-red-500 glow-red border-4 border-red-300 dark:bg-green-500 dark:glow-green dark:border-green-300 transition-all duration-300';
        } else {
          led.className = 'w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-700 transition-all duration-300';
        }
      }
      if (label) {
        // Highlight active exposed output based on current mode
        let active = false;
        if (sim.mode === 'siso') active = (i === 3);
        else if (sim.mode === 'sipo') active = true;
        else if (sim.mode === 'piso') active = (i === 3);
        else if (sim.mode === 'pipo') active = true;

        if (active) {
          label.className = 'text-xs font-mono font-bold text-cyan-500';
        } else {
          label.className = 'text-xs font-mono text-slate-400 dark:text-slate-600';
        }
      }
    }

    // 5. Update Narrator Text log
    const logBox = document.getElementById('sr-narrative-log');
    if (logBox) {
      logBox.innerHTML = sim.steps.slice(-5).map(step => `
        <div class="border-l-2 border-cyan-500 pl-2 py-1 text-slate-700 dark:text-slate-300 font-mono text-xs">
          ${step}
        </div>
      `).join('');
      logBox.scrollTop = logBox.scrollHeight;
    }

    // Update Clock LED indicator matching simulation status
    const clockLed = document.getElementById('sr-clk-pulse-led');
    if (clockLed) {
      if (sim.clkPulseState === 1) {
        clockLed.className = 'w-4 h-4 rounded-full bg-cyan-400 glow-cyan transition-all';
      } else {
        clockLed.className = 'w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-800 transition-all';
      }
    }
  };


  // =========================================================================
  // Counters UI Bindings & DOM Updates
  // =========================================================================
  const counterClkBtn = document.getElementById('counter-clk-btn');
  const counterResetBtn = document.getElementById('counter-reset-btn');
  const counterPlayPauseBtn = document.getElementById('counter-pause-btn');
  const counterAutoClkCheck = document.getElementById('counter-auto-clk');
  const counterSpeedSlider = document.getElementById('counter-speed');
  const counterTypeSelect = document.getElementById('counter-type-select');
  const counterDirSelect = document.getElementById('counter-dir-select');
  const counterModSelect = document.getElementById('counter-mod-select');
  const customModWrapper = document.getElementById('counter-custom-mod-wrapper');
  const customModSlider = document.getElementById('counter-custom-mod');

  if (counterClkBtn) counterClkBtn.addEventListener('click', () => counterSim.clockPulse());
  if (counterResetBtn) counterResetBtn.addEventListener('click', () => counterSim.reset());
  if (counterPlayPauseBtn) {
    counterPlayPauseBtn.addEventListener('click', () => {
      counterSim.paused = !counterSim.paused;
      counterPlayPauseBtn.innerHTML = counterSim.paused 
        ? '<i class="fas fa-play mr-1"></i>Resume' 
        : '<i class="fas fa-pause mr-1"></i>Pause';
    });
  }
  if (counterTypeSelect) {
    counterTypeSelect.addEventListener('change', (e) => {
      counterSim.type = e.target.value;
      counterSim.reset();
    });
  }
  if (counterDirSelect) {
    counterDirSelect.addEventListener('change', (e) => {
      counterSim.mode = e.target.value;
      counterSim.reset();
    });
  }
  if (counterModSelect) {
    counterModSelect.addEventListener('change', (e) => {
      counterSim.modType = e.target.value;
      if (counterSim.modType === 'custom') {
        customModWrapper.classList.remove('hidden');
      } else {
        customModWrapper.classList.add('hidden');
      }
      counterSim.reset();
    });
  }
  if (customModSlider) {
    customModSlider.addEventListener('input', (e) => {
      counterSim.customModValue = parseInt(e.target.value);
      const customModValDisplay = document.getElementById('counter-custom-mod-val');
      if (customModValDisplay) customModValDisplay.textContent = counterSim.customModValue;
      counterSim.reset();
    });
  }
  if (counterAutoClkCheck) {
    counterAutoClkCheck.addEventListener('change', (e) => {
      const speed = counterSpeedSlider ? parseInt(counterSpeedSlider.value) : 1000;
      counterSim.triggerAutoClock(e.target.checked, speed);
    });
  }
  if (counterSpeedSlider) {
    counterSpeedSlider.addEventListener('input', (e) => {
      const speed = parseInt(e.target.value);
      const label = document.getElementById('counter-speed-val');
      if (label) label.textContent = `${(1000 / speed).toFixed(1)}Hz`;
      if (counterSim.autoClock) {
        counterSim.triggerAutoClock(true, speed);
      }
    });
  }

  // DOM update function called by Simulator
  window.updateCounterDOM = function(sim) {
    // 1. Digital Display (retro 7-segment style)
    const decDisplay = document.getElementById('counter-dec-display');
    const binDisplay = document.getElementById('counter-bin-display');
    if (decDisplay) decDisplay.textContent = sim.count.toString().padStart(2, '0');
    
    const binArr = sim.getBinaryState(); // [Q0, Q1, Q2, Q3]
    if (binDisplay) {
      // Show Q3 Q2 Q1 Q0 (standard MSB left layout)
      binDisplay.textContent = [...binArr].reverse().join('');
    }

    // 2. Binary LEDs Row
    for (let i = 0; i < 4; i++) {
      const led = document.getElementById(`counter-led-out-${i}`);
      const valText = document.getElementById(`counter-val-out-${i}`);
      if (led) {
        if (binArr[i] === 1) {
          led.className = 'w-10 h-10 rounded-full bg-red-500 glow-red border-4 border-red-300 dark:bg-green-500 dark:glow-green dark:border-green-300 transition-all duration-300';
        } else {
          led.className = 'w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-700 transition-all duration-300';
        }
      }
      if (valText) {
        valText.textContent = binArr[i];
      }
    }

    // 3. Schematic connection animations based on Asynchronous vs Synchronous
    const schematicLabel = document.getElementById('counter-schematic-label');
    const clkLine1 = document.getElementById('counter-line-clk-1');
    const clkLine2 = document.getElementById('counter-line-clk-2');
    const clkLine3 = document.getElementById('counter-line-clk-3');

    if (schematicLabel) {
      if (sim.type === 'async') {
        schematicLabel.textContent = 'Asynchronous (Ripple) Clock Path: Notice each Flip-Flop is clocked by the preceding Q/Q\' output.';
        if (clkLine1) clkLine1.className = 'text-[10px] text-blue-500 font-mono';
        if (clkLine2) clkLine2.className = 'text-[10px] text-orange-500 font-mono';
        if (clkLine3) clkLine3.className = 'text-[10px] text-orange-500 font-mono';
      } else {
        schematicLabel.textContent = 'Synchronous Clock Path: Notice all Flip-Flops are clocked together simultaneously by the main Clock line.';
        if (clkLine1) clkLine1.className = 'text-[10px] text-blue-500 font-mono font-bold';
        if (clkLine2) clkLine2.className = 'text-[10px] text-blue-500 font-mono font-bold';
        if (clkLine3) clkLine3.className = 'text-[10px] text-blue-500 font-mono font-bold';
      }
    }

    // Clock Pulse LED
    const clockLed = document.getElementById('counter-clk-pulse-led');
    if (clockLed) {
      if (sim.clkPulseState === 1) {
        clockLed.className = 'w-4 h-4 rounded-full bg-cyan-400 glow-cyan transition-all';
      } else {
        clockLed.className = 'w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-800 transition-all';
      }
    }
  };


  // =========================================================================
  // Ring Counter UI Bindings & DOM Updates
  // =========================================================================
  const ringClkBtn = document.getElementById('ring-clk-btn');
  const ringResetBtn = document.getElementById('ring-reset-btn');
  const ringAutoClkCheck = document.getElementById('ring-auto-clk');
  const ringSpeedSlider = document.getElementById('ring-speed');

  if (ringClkBtn) ringClkBtn.addEventListener('click', () => ringSim.clockPulse());
  if (ringResetBtn) ringResetBtn.addEventListener('click', () => ringSim.reset());
  if (ringAutoClkCheck) {
    ringAutoClkCheck.addEventListener('change', (e) => {
      const speed = ringSpeedSlider ? parseInt(ringSpeedSlider.value) : 1000;
      ringSim.triggerAutoClock(e.target.checked, speed);
    });
  }
  if (ringSpeedSlider) {
    ringSpeedSlider.addEventListener('input', (e) => {
      const speed = parseInt(e.target.value);
      const label = document.getElementById('ring-speed-val');
      if (label) label.textContent = `${(1000 / speed).toFixed(1)}Hz`;
      if (ringSim.autoClock) {
        ringSim.triggerAutoClock(true, speed);
      }
    });
  }

  window.updateRingDOM = function(sim) {
    // 1. Update circular LEDs
    for (let i = 0; i < 4; i++) {
      const led = document.getElementById(`ring-led-${i}`);
      const val = document.getElementById(`ring-val-${i}`);
      if (led) {
        if (sim.register[i] === 1) {
          led.className = 'w-16 h-16 rounded-full led-on border-4 transition-all duration-200 flex items-center justify-center font-bold text-white text-lg shadow-xl radial-pulse';
          led.textContent = '1';
        } else {
          led.className = 'w-16 h-16 rounded-full led-off border-4 transition-all duration-200 flex items-center justify-center font-mono text-slate-500 dark:text-slate-600 text-lg';
          led.textContent = '0';
        }
      }
      if (val) val.textContent = sim.register[i];
    }

    // 2. State history table with active row highlight
    const tableBody = document.getElementById('ring-table-body');
    if (tableBody) {
      tableBody.innerHTML = sim.history.map((row, idx) => {
        const isCurrent = (idx === sim.history.length - 1);
        return `<tr class="${isCurrent ? 'state-row-active' : ''}">
          <td class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-mono">${row[0]}</td>
          ${[1,2,3,4].map(j => `<td class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-mono text-center ${row[j]==='1'?'bit-one':'bit-zero'}">${row[j]}</td>`).join('')}
        </tr>`;
      }).join('');
    }
  };


  // =========================================================================
  // Johnson Counter UI Bindings & DOM Updates
  // =========================================================================
  const johnsonClkBtn = document.getElementById('johnson-clk-btn');
  const johnsonResetBtn = document.getElementById('johnson-reset-btn');
  const johnsonAutoClkCheck = document.getElementById('johnson-auto-clk');
  const johnsonSpeedSlider = document.getElementById('johnson-speed');

  if (johnsonClkBtn) johnsonClkBtn.addEventListener('click', () => johnsonSim.clockPulse());
  if (johnsonResetBtn) johnsonResetBtn.addEventListener('click', () => johnsonSim.reset());
  if (johnsonAutoClkCheck) {
    johnsonAutoClkCheck.addEventListener('change', (e) => {
      const speed = johnsonSpeedSlider ? parseInt(johnsonSpeedSlider.value) : 1000;
      johnsonSim.triggerAutoClock(e.target.checked, speed);
    });
  }
  if (johnsonSpeedSlider) {
    johnsonSpeedSlider.addEventListener('input', (e) => {
      const speed = parseInt(e.target.value);
      const label = document.getElementById('johnson-speed-val');
      if (label) label.textContent = `${(1000 / speed).toFixed(1)}Hz`;
      if (johnsonSim.autoClock) {
        johnsonSim.triggerAutoClock(true, speed);
      }
    });
  }

  window.updateJohnsonDOM = function(sim) {
    // 1. Update horizontal LEDs with bit value shown
    for (let i = 0; i < 4; i++) {
      const led = document.getElementById(`johnson-led-${i}`);
      const val = document.getElementById(`johnson-val-${i}`);
      if (led) {
        if (sim.register[i] === 1) {
          led.className = 'w-16 h-16 rounded-full bg-pink-500 glow-purple border-4 border-pink-300 transition-all duration-200 flex items-center justify-center font-bold text-white text-lg shadow-xl radial-pulse';
          led.textContent = '1';
        } else {
          led.className = 'w-16 h-16 rounded-full led-off border-4 transition-all duration-200 flex items-center justify-center font-mono text-slate-500 dark:text-slate-600 text-lg';
          led.textContent = '0';
        }
      }
      if (val) val.textContent = sim.register[i];
    }

    // 2. Feedback indicator: shows Q3' value going into D0
    const feedbackIndicator = document.getElementById('johnson-feedback-complement');
    if (feedbackIndicator) {
      const feedIn = sim.register[3] === 1 ? 0 : 1;
      feedbackIndicator.textContent = `Q3=${sim.register[3]} → Q3'=${feedIn} → D0 next`;
      feedbackIndicator.className = feedIn === 1
        ? 'absolute -bottom-8 right-[5%] bg-pink-500/20 text-pink-400 border border-pink-500/50 rounded-full px-3 py-1 text-[10px] font-mono font-bold animate-pulse'
        : 'absolute -bottom-8 right-[5%] bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-3 py-1 text-[10px] font-mono text-slate-400';
    }

    // 3. State history table
    const tableBody = document.getElementById('johnson-table-body');
    if (tableBody) {
      tableBody.innerHTML = sim.history.map((row, idx) => {
        const isCurrent = (idx === sim.history.length - 1);
        return `<tr class="${isCurrent ? 'state-row-active' : ''}">
          <td class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-mono">${row[0]}</td>
          ${[1,2,3,4].map(j => `<td class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-mono text-center ${row[j]==='1'?'bit-one':'bit-zero'}">${row[j]}</td>`).join('')}
        </tr>`;
      }).join('');
    }
  };


  // =========================================================================
  // Virtual Lab Add Component Buttons
  // =========================================================================
  const labVccBtn = document.getElementById('lab-add-vcc');
  const labGndBtn = document.getElementById('lab-add-gnd');
  const labClockBtn = document.getElementById('lab-add-clock');
  const labDffBtn = document.getElementById('lab-add-dff');
  const labJkffBtn = document.getElementById('lab-add-jkff');
  const labLedBtn = document.getElementById('lab-add-led');
  const labSimRunBtn = document.getElementById('lab-run-sim');
  const labSimStepBtn = document.getElementById('lab-step-sim');
  const labClearBtn = document.getElementById('lab-clear-canvas');
  const labSpeedSlider = document.getElementById('lab-speed-slider');

  if (labVccBtn) {
    labVccBtn.addEventListener('click', () => {
      virtualLab.addComponent('vcc', 50, 50, 'VCC (Logic 1)');
      virtualLab.render();
    });
  }
  if (labGndBtn) {
    labGndBtn.addEventListener('click', () => {
      virtualLab.addComponent('gnd', 50, 150, 'GND (Logic 0)');
      virtualLab.render();
    });
  }
  if (labClockBtn) {
    labClockBtn.addEventListener('click', () => {
      virtualLab.addComponent('clock', 50, 250, 'Clock Pulse Generator');
      virtualLab.render();
    });
  }
  if (labDffBtn) {
    labDffBtn.addEventListener('click', () => {
      virtualLab.addComponent('d-ff', 240, 100, 'D Flip-Flop');
      virtualLab.render();
    });
  }
  if (labJkffBtn) {
    labJkffBtn.addEventListener('click', () => {
      virtualLab.addComponent('jk-ff', 240, 250, 'JK Flip-Flop');
      virtualLab.render();
    });
  }
  if (labLedBtn) {
    labLedBtn.addEventListener('click', () => {
      virtualLab.addComponent('led', 450, 150, 'LED Out');
      virtualLab.render();
    });
  }

  if (labSimStepBtn) {
    labSimStepBtn.addEventListener('click', () => {
      virtualLab.clockState = virtualLab.clockState === 0 ? 1 : 0;
      virtualLab.simulateStep();
      SoundEffect.playTick(580, 0.05);
    });
  }

  if (labSimRunBtn) {
    labSimRunBtn.addEventListener('click', () => {
      if (virtualLab.isRunning) {
        virtualLab.stopSimulation();
        labSimRunBtn.innerHTML = '<i class="fas fa-play mr-1"></i>Run Clock Auto';
        labSimRunBtn.className = 'py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow transition-all';
      } else {
        virtualLab.startSimulation();
        labSimRunBtn.innerHTML = '<i class="fas fa-pause mr-1"></i>Stop Clock Auto';
        labSimRunBtn.className = 'py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow transition-all';
      }
    });
  }

  if (labClearBtn) {
    labClearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the canvas?')) {
        virtualLab.clear();
      }
    });
  }

  if (labSpeedSlider) {
    labSpeedSlider.addEventListener('input', (e) => {
      const hz = parseFloat(e.target.value);
      const label = document.getElementById('lab-speed-val');
      if (label) label.textContent = `${hz}Hz`;
      
      const ms = Math.floor(1000 / hz);
      virtualLab.setSpeed(ms);
    });
  }


  // =========================================================================
  // Quiz Module UI Bindings & DOM Updates
  // =========================================================================
  const quizCategoryBtns = document.querySelectorAll('.quiz-cat-btn');
  const quizPrevBtn = document.getElementById('quiz-prev-btn');
  const quizNextBtn = document.getElementById('quiz-next-btn');
  const quizSubmitBtn = document.getElementById('quiz-submit-btn');
  const quizResetBtn = document.getElementById('quiz-reset-btn');

  quizCategoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      
      // Update active category buttons styling
      quizCategoryBtns.forEach(b => {
        b.classList.remove('bg-cyan-600', 'text-white');
        b.classList.add('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      btn.classList.add('bg-cyan-600', 'text-white');
      btn.classList.remove('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');

      initQuizUI(cat);
    });
  });

  if (quizPrevBtn) {
    quizPrevBtn.addEventListener('click', () => {
      if (quiz.prevQuestion()) {
        renderQuizQuestion();
      }
    });
  }

  if (quizNextBtn) {
    quizNextBtn.addEventListener('click', () => {
      if (quiz.nextQuestion()) {
        renderQuizQuestion();
      }
    });
  }

  if (quizSubmitBtn) {
    quizSubmitBtn.addEventListener('click', () => {
      const unanswered = quiz.answers.some(ans => ans === null);
      if (unanswered) {
        if (!confirm('You have unanswered questions. Submit anyway?')) {
          return;
        }
      }

      const score = quiz.submitQuiz();
      SoundEffect.playCorrect();
      renderQuizResults();
    });
  }

  if (quizResetBtn) {
    quizResetBtn.addEventListener('click', () => {
      initQuizUI(quiz.currentCategory);
    });
  }

  function initQuizUI(category) {
    quiz.init(category);
    
    const resultsContainer = document.getElementById('quiz-results-card');
    const questionCard = document.getElementById('quiz-question-card');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (questionCard) questionCard.classList.remove('hidden');

    if (quizSubmitBtn) quizSubmitBtn.classList.remove('hidden');
    if (quizResetBtn) quizResetBtn.classList.add('hidden');

    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const q = quiz.getCurrentQuestion();
    const total = quiz.getTotalQuestions();
    
    // Set text headers
    const qNumText = document.getElementById('quiz-q-num');
    const qDiffText = document.getElementById('quiz-q-diff');
    const qText = document.getElementById('quiz-question-text');
    const optionsGrid = document.getElementById('quiz-options-grid');
    const progressFill = document.getElementById('quiz-progress-fill');

    if (qNumText) qNumText.textContent = `Question ${quiz.currentIndex + 1} of ${total}`;
    if (qDiffText) {
      qDiffText.textContent = q.difficulty;
      if (q.difficulty === 'Beginner') {
        qDiffText.className = 'px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      } else if (q.difficulty === 'Intermediate') {
        qDiffText.className = 'px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      } else {
        qDiffText.className = 'px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      }
    }
    if (qText) qText.textContent = q.question;
    
    // Update progress bar
    if (progressFill) {
      progressFill.style.width = `${((quiz.currentIndex + 1) / total) * 100}%`;
    }

    // Render multiple choice options
    if (optionsGrid) {
      optionsGrid.innerHTML = '';
      q.options.forEach(opt => {
        const isSelected = quiz.answers[quiz.currentIndex] === opt.id;
        
        const optBtn = document.createElement('button');
        optBtn.className = `w-full text-left p-4 rounded-lg border-2 transition-all flex items-start space-x-3 ${
          isSelected 
            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300' 
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
        }`;
        
        optBtn.innerHTML = `
          <span class="flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
            isSelected 
              ? 'bg-cyan-500 text-white' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }">${opt.id.toUpperCase()}</span>
          <span class="text-sm pt-0.5 font-medium leading-tight">${opt.text}</span>
        `;

        optBtn.addEventListener('click', () => {
          if (quiz.submitted) return;
          SoundEffect.playTick(750, 0.02);
          quiz.selectAnswer(opt.id);
          renderQuizQuestion(); // re-render to show selected active state
        });

        optionsGrid.appendChild(optBtn);
      });
    }

    // Navigation buttons control
    if (quizPrevBtn) quizPrevBtn.disabled = quiz.currentIndex === 0;
    if (quizNextBtn) quizNextBtn.disabled = quiz.currentIndex === total - 1;
  }

  function renderQuizResults() {
    const questionCard = document.getElementById('quiz-question-card');
    const resultsCard = document.getElementById('quiz-results-card');
    
    if (questionCard) questionCard.classList.add('hidden');
    if (resultsCard) resultsCard.classList.remove('hidden');

    if (quizSubmitBtn) quizSubmitBtn.classList.add('hidden');
    if (quizResetBtn) quizResetBtn.classList.remove('hidden');

    const total = quiz.getTotalQuestions();
    const scoreVal = document.getElementById('quiz-score-val');
    const pctVal = document.getElementById('quiz-pct-val');
    const descVal = document.getElementById('quiz-desc-val');
    const breakdown = document.getElementById('quiz-breakdown');

    if (scoreVal) scoreVal.textContent = `${quiz.score} / ${total}`;
    
    const percentage = Math.round((quiz.score / total) * 100);
    if (pctVal) pctVal.textContent = `${percentage}%`;

    if (descVal) {
      if (percentage === 100) {
        descVal.textContent = "Incredible! Complete mastery of this topic! Outstanding performance.";
        descVal.className = "text-sm text-green-500 font-bold";
      } else if (percentage >= 80) {
        descVal.textContent = "Excellent work! You have a solid understanding of these sequential elements.";
        descVal.className = "text-sm text-cyan-500 font-semibold";
      } else if (percentage >= 50) {
        descVal.textContent = "Good try! We suggest reviewing the interactive simulations and trying again.";
        descVal.className = "text-sm text-yellow-500";
      } else {
        descVal.textContent = "Needs practice. Go through the explanations and test with step-by-step signals.";
        descVal.className = "text-sm text-red-500";
      }
    }

    // Render detailed correctness question review with explanations
    if (breakdown) {
      breakdown.innerHTML = '';
      const questions = window.QuizData[quiz.currentCategory];
      
      questions.forEach((q, idx) => {
        const userAns = quiz.answers[idx];
        const isCorrect = userAns === q.correct;
        const correctOpt = q.options.find(o => o.id === q.correct);
        const userOpt = q.options.find(o => o.id === userAns);

        const row = document.createElement('div');
        row.className = `p-4 rounded-lg border-l-4 ${
          isCorrect 
            ? 'border-green-500 bg-green-50/50 dark:bg-green-950/10 mb-3' 
            : 'border-red-500 bg-red-50/50 dark:bg-red-950/10 mb-3'
        }`;

        row.innerHTML = `
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-xs font-bold font-mono text-slate-500">Q${idx + 1}.</span>
            <span class="text-xs font-semibold ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
              ${isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          </div>
          <p class="text-xs font-medium text-slate-800 dark:text-slate-200 mb-2">${q.question}</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] mb-2">
            <div>
              <span class="text-slate-500">Your Answer:</span>
              <span class="font-semibold ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                ${userOpt ? `(${userOpt.id.toUpperCase()}) ${userOpt.text}` : 'No answer'}
              </span>
            </div>
            ${!isCorrect ? `
              <div>
                <span class="text-slate-500">Correct Answer:</span>
                <span class="font-semibold text-green-600 dark:text-green-400">
                  (${correctOpt.id.toUpperCase()}) ${correctOpt.text}
                </span>
              </div>
            ` : ''}
          </div>
          <div class="text-[11px] text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/40 p-2 rounded border border-slate-100 dark:border-slate-800">
            <strong>Explanation:</strong> ${q.explanation}
          </div>
        `;

        breakdown.appendChild(row);
      });
    }
  }


  // =========================================================================
  // Download Notes PDF (Simulated beautifully as direct text/pdf layout download)
  // =========================================================================
  const downloadNotesBtn = document.getElementById('btn-download-notes');
  if (downloadNotesBtn) {
    downloadNotesBtn.addEventListener('click', () => {
      SoundEffect.playTick(700, 0.05);
      
      const studyContent = `===============================================================
SEQUENTIAL CIRCUIT SIMULATOR LAB - STUDY NOTES
===============================================================
Sequential logic circuits are digital circuits whose outputs depend not 
only on their current inputs but also on past inputs (i.e., they have MEMORY).
Unlike combinational logic, sequential systems use a periodic clock signal.

---------------------------------------------------------------
1. SHIFT REGISTERS
---------------------------------------------------------------
A shift register is a group of flip-flops wired in series used to store 
and transfer digital binary data.

- SISO (Serial-In Serial-Out): 
  Data is entered one bit at a time, shifted right, and read out from the 
  last flip-flop sequentially. Takes 2N-1 clock ticks for N-bits.
- SIPO (Serial-In Parallel-Out):
  Data entered one bit at a time, but all flip-flops expose their outputs 
  simultaneously. Excellent for deserializing data lines.
- PISO (Parallel-In Serial-Out):
  All bits are loaded in parallel simultaneously on a clock edge, then 
  shifted out one by one.
- PIPO (Parallel-In Parallel-Out):
  Data is loaded in parallel and is immediately visible on the parallel outputs. 
  Acts as a temporary data buffer.

---------------------------------------------------------------
2. COUNTERS
---------------------------------------------------------------
Counters are sequential circuits that cycle through a predetermined sequence of binary states.

- Asynchronous (Ripple) Counter:
  Only the first flip-flop receives the external clock. Subsequent flip-flops are 
  clocked by the output of the preceding stage. Simple but prone to propagation delay accumulation (glitches).
- Synchronous Counter:
  All stages share the external clock line and trigger simultaneously. Eliminates cumulative delay glitches, enabling extremely high frequency operation.
- MOD-N Counter:
  A counter that resets its count to 0 after passing through N states. (e.g., MOD-10 counts from 0 to 9, then resets).

---------------------------------------------------------------
3. RING & JOHNSON COUNTERS
---------------------------------------------------------------
- Ring Counter:
  A circular shift register initialized with a single "1" (e.g. 1000). The "1" circulates back from Q3 to D0. Has N states for N stages.
- Johnson Counter (Twisted Ring):
  The inverted output (Q3') of the final stage connects back to the input (D0). This creates a cycle where "1"s fill up the register, then "0"s empty it. Has 2N states for N stages.

===============================================================
Thank you for using the Sequential Circuit Simulator Lab!
For interactive testing, visit: https://sequential-lab.arena.ai
===============================================================`;

      // Trigger a direct text/markdown download representing the comprehensive notes
      const blob = new Blob([studyContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Sequential_Circuit_Simulator_Lab_Notes.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

});
