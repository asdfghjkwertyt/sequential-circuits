// Virtual Lab Engine for Sequential Circuit Simulator Lab

class VirtualLab {
  constructor(canvasContainerId, svgLayerId) {
    this.container = document.getElementById(canvasContainerId);
    this.svg = document.getElementById(svgLayerId);
    this.components = [];
    this.wires = []; // elements format: { id, fromCompId, fromPinId, toCompId, toPinId }
    
    this.activePin = null; // format: { compId, pinId, isOutput }
    this.componentCounter = 0;
    this.wireCounter = 0;
    
    this.clockState = 0;
    this.isRunning = false;
    this.intervalId = null;
    this.clockSpeed = 1000; // ms
  }

  clear() {
    this.components = [];
    this.wires = [];
    this.activePin = null;
    this.componentCounter = 0;
    this.wireCounter = 0;
    this.isRunning = false;
    if (this.intervalId) clearInterval(this.intervalId);
    this.render();
  }

  // Pre-load a gorgeous 2-bit Ripple Counter demo circuit!
  loadDemo() {
    this.clear();
    
    // 1. Clock Source
    const clockId = this.addComponent('clock', 50, 180, 'Clock Pulse Generator');
    // 2. VCC Source (High level)
    const vccId = this.addComponent('vcc', 50, 50, 'VCC (Logic 1)');
    // 3. D Flip-Flop 0
    const ff0Id = this.addComponent('d-ff', 240, 60, 'Flip-Flop 0 (Q0)');
    // 4. D Flip-Flop 1
    const ff1Id = this.addComponent('d-ff', 480, 60, 'Flip-Flop 1 (Q1)');
    // 5. LED for Q0
    const led0Id = this.addComponent('led', 410, 280, 'LED Q0');
    // 6. LED for Q1
    const led1Id = this.addComponent('led', 650, 280, 'LED Q1');

    // Create standard counter connections
    // Clock pin outputs to FF0 Clock input
    this.addWire(clockId, 'clk-out', ff0Id, 'clk-in');
    
    // FF0 Q' connects back to FF0 D (creates toggle/divide by 2)
    this.addWire(ff0Id, 'q-bar-out', ff0Id, 'd-in');
    
    // FF0 Q' connects to FF1 Clock input (ripple style clock)
    this.addWire(ff0Id, 'q-bar-out', ff1Id, 'clk-in');
    
    // FF1 Q' connects back to FF1 D (creates toggle/divide by 4)
    this.addWire(ff1Id, 'q-bar-out', ff1Id, 'd-in');

    // Feed FF0 Q to LED 0
    this.addWire(ff0Id, 'q-out', led0Id, 'led-in');
    // Feed FF1 Q to LED 1
    this.addWire(ff1Id, 'q-out', led1Id, 'led-in');

    this.render();
    this.simulateStep(); // initialize values
  }

  addComponent(type, x, y, name) {
    this.componentCounter++;
    const id = `comp_${this.componentCounter}`;
    
    let pins = [];
    if (type === 'vcc') {
      pins = [{ id: 'vcc-out', label: 'VCC', isOutput: true, value: 1 }];
    } else if (type === 'gnd') {
      pins = [{ id: 'gnd-out', label: 'GND', isOutput: true, value: 0 }];
    } else if (type === 'clock') {
      pins = [{ id: 'clk-out', label: 'CLK', isOutput: true, value: 0 }];
    } else if (type === 'd-ff') {
      pins = [
        { id: 'd-in', label: 'D', isOutput: false, value: 0 },
        { id: 'clk-in', label: '►', isOutput: false, value: 0 },
        { id: 'q-out', label: 'Q', isOutput: true, value: 0 },
        { id: 'q-bar-out', label: "Q'", isOutput: true, value: 1 }
      ];
    } else if (type === 'jk-ff') {
      pins = [
        { id: 'j-in', label: 'J', isOutput: false, value: 0 },
        { id: 'k-in', label: 'K', isOutput: false, value: 0 },
        { id: 'clk-in', label: '►', isOutput: false, value: 0 },
        { id: 'q-out', label: 'Q', isOutput: true, value: 0 },
        { id: 'q-bar-out', label: "Q'", isOutput: true, value: 1 }
      ];
    } else if (type === 'led') {
      pins = [{ id: 'led-in', label: 'IN', isOutput: false, value: 0 }];
    }

    const component = {
      id,
      type,
      name: name || `${type.toUpperCase()} Component`,
      x,
      y,
      pins,
      internalState: { q: 0, lastClk: 0 } // for flip-flops
    };

    this.components.push(component);
    return id;
  }

  deleteComponent(id) {
    this.components = this.components.filter(c => c.id !== id);
    this.wires = this.wires.filter(w => w.fromCompId !== id && w.toCompId !== id);
    this.render();
  }

  addWire(fromCompId, fromPinId, toCompId, toPinId) {
    // Check if wire already exists
    const duplicate = this.wires.find(w => 
      w.fromCompId === fromCompId && 
      w.fromPinId === fromPinId && 
      w.toCompId === toCompId && 
      w.toPinId === toPinId
    );
    if (duplicate) return;

    // Remove any previous wires connected to the target input pin (only 1 driver per input)
    this.wires = this.wires.filter(w => !(w.toCompId === toCompId && w.toPinId === toPinId));

    this.wireCounter++;
    const wire = {
      id: `wire_${this.wireCounter}`,
      fromCompId,
      fromPinId,
      toCompId,
      toPinId,
      value: 0
    };
    this.wires.push(wire);
    this.render();
  }

  deleteWire(wireId) {
    this.wires = this.wires.filter(w => w.id !== wireId);
    this.render();
  }

  startSimulation() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      // Toggle clock pulses
      this.clockState = this.clockState === 0 ? 1 : 0;
      this.simulateStep();
    }, this.clockSpeed);
  }

  stopSimulation() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setSpeed(ms) {
    this.clockSpeed = ms;
    if (this.isRunning) {
      this.stopSimulation();
      this.startSimulation();
    }
  }

  simulateStep() {
    // 1. Force state values of source nodes
    this.components.forEach(comp => {
      if (comp.type === 'vcc') {
        const p = comp.pins.find(pin => pin.id === 'vcc-out');
        if (p) p.value = 1;
      } else if (comp.type === 'gnd') {
        const p = comp.pins.find(pin => pin.id === 'gnd-out');
        if (p) p.value = 0;
      } else if (comp.type === 'clock') {
        const p = comp.pins.find(pin => pin.id === 'clk-out');
        if (p) p.value = this.clockState;
      }
    });

    // We do multiple passes to propagate outputs to inputs and compute flip-flop triggers
    // Standard ripple/propagation requires sequential steps:
    for (let pass = 0; pass < 3; pass++) {
      // Propagate wires: transfer values from outputs to inputs
      this.wires.forEach(wire => {
        const sourceComp = this.components.find(c => c.id === wire.fromCompId);
        const targetComp = this.components.find(c => c.id === wire.toCompId);
        if (sourceComp && targetComp) {
          const sourcePin = sourceComp.pins.find(p => p.id === wire.fromPinId);
          const targetPin = targetComp.pins.find(p => p.id === wire.toPinId);
          if (sourcePin && targetPin) {
            targetPin.value = sourcePin.value;
            wire.value = sourcePin.value; // display color on wire
          }
        }
      });

      // Update Flip-Flops and LEDs
      this.components.forEach(comp => {
        if (comp.type === 'd-ff') {
          const dPin = comp.pins.find(p => p.id === 'd-in');
          const clkPin = comp.pins.find(p => p.id === 'clk-in');
          const qPin = comp.pins.find(p => p.id === 'q-out');
          const qBarPin = comp.pins.find(p => p.id === 'q-bar-out');

          // Check for rising edge on CLOCK pin
          if (clkPin && clkPin.value === 1 && comp.internalState.lastClk === 0) {
            // Clock Rising Edge triggered!
            const dVal = dPin ? dPin.value : 0;
            comp.internalState.q = dVal;
            
            // Trigger visual pulse on element if it exists in DOM
            const element = document.getElementById(comp.id);
            if (element) {
              element.classList.add('ff-pulse');
              setTimeout(() => element.classList.remove('ff-pulse'), 400);
            }
          }
          
          if (clkPin) {
            comp.internalState.lastClk = clkPin.value;
          }

          // Output represents stored Q
          if (qPin) qPin.value = comp.internalState.q;
          if (qBarPin) qBarPin.value = comp.internalState.q === 1 ? 0 : 1;

        } else if (comp.type === 'jk-ff') {
          const jPin = comp.pins.find(p => p.id === 'j-in');
          const kPin = comp.pins.find(p => p.id === 'k-in');
          const clkPin = comp.pins.find(p => p.id === 'clk-in');
          const qPin = comp.pins.find(p => p.id === 'q-out');
          const qBarPin = comp.pins.find(p => p.id === 'q-bar-out');

          // Check for rising edge
          if (clkPin && clkPin.value === 1 && comp.internalState.lastClk === 0) {
            const jVal = jPin ? jPin.value : 0;
            const kVal = kPin ? kPin.value : 0;
            const currentQ = comp.internalState.q;

            if (jVal === 0 && kVal === 0) {
              // Hold state
            } else if (jVal === 1 && kVal === 0) {
              comp.internalState.q = 1; // Set
            } else if (jVal === 0 && kVal === 1) {
              comp.internalState.q = 0; // Reset
            } else if (jVal === 1 && kVal === 1) {
              comp.internalState.q = currentQ === 1 ? 0 : 1; // Toggle
            }

            const element = document.getElementById(comp.id);
            if (element) {
              element.classList.add('ff-pulse');
              setTimeout(() => element.classList.remove('ff-pulse'), 400);
            }
          }

          if (clkPin) {
            comp.internalState.lastClk = clkPin.value;
          }

          if (qPin) qPin.value = comp.internalState.q;
          if (qBarPin) qBarPin.value = comp.internalState.q === 1 ? 0 : 1;

        } else if (comp.type === 'led') {
          const inPin = comp.pins.find(p => p.id === 'led-in');
          comp.internalState.q = inPin ? inPin.value : 0;
        }
      });
    }

    this.renderWiresOnly();
    this.updateDomValues();
  }

  // Draw wires on the absolute layered SVG
  renderWiresOnly() {
    this.svg.innerHTML = '';
    
    // Draw wire connections
    this.wires.forEach(wire => {
      const fromPinElem = document.querySelector(`[data-comp-id="${wire.fromCompId}"][data-pin-id="${wire.fromPinId}"]`);
      const toPinElem = document.querySelector(`[data-comp-id="${wire.toCompId}"][data-pin-id="${wire.toPinId}"]`);
      
      if (fromPinElem && toPinElem) {
        const containerRect = this.container.getBoundingClientRect();
        const r1 = fromPinElem.getBoundingClientRect();
        const r2 = toPinElem.getBoundingClientRect();
        
        // Calculate center relative to playground container
        const x1 = r1.left + r1.width / 2 - containerRect.left;
        const y1 = r1.top + r1.height / 2 - containerRect.top;
        const x2 = r2.left + r2.width / 2 - containerRect.left;
        const y2 = r2.top + r2.height / 2 - containerRect.top;
        
        // Dynamic path: beautiful S-curve or cubic bezier
        const dx = Math.abs(x2 - x1) * 0.5;
        const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        
        // Active signal glow: red/orange for HIGH (1), blue/dark-gray for LOW (0)
        const isHigh = wire.value === 1;
        path.setAttribute('stroke', isHigh ? '#ef4444' : '#3b82f6');
        path.setAttribute('stroke-width', isHigh ? '3' : '1.5');
        path.setAttribute('class', isHigh ? 'signal-active' : '');
        path.style.cursor = 'pointer';
        
        // Allow deleting wire by clicking it
        path.addEventListener('click', () => {
          if (confirm('Delete this wire connection?')) {
            this.deleteWire(wire.id);
          }
        });

        this.svg.appendChild(path);
      }
    });
  }

  // Update logic level styles inside the components
  updateDomValues() {
    this.components.forEach(comp => {
      const compDiv = document.getElementById(comp.id);
      if (!compDiv) return;

      // Update LED visual state
      if (comp.type === 'led') {
        const ledBulb = compDiv.querySelector('.led-bulb');
        if (ledBulb) {
          if (comp.internalState.q === 1) {
            ledBulb.className = 'led-bulb w-12 h-12 rounded-full transition-all duration-300 bg-red-500 glow-red border-4 border-red-300 dark:bg-green-500 dark:glow-green dark:border-green-300';
          } else {
            ledBulb.className = 'led-bulb w-12 h-12 rounded-full transition-all duration-300 bg-gray-300 border-4 border-gray-400 dark:bg-slate-700 dark:border-slate-800';
          }
        }
      }

      // Update inner display states (e.g., outputs text)
      comp.pins.forEach(pin => {
        const pinValueNode = compDiv.querySelector(`[data-pin-val-id="${pin.id}"]`);
        if (pinValueNode) {
          pinValueNode.textContent = pin.value;
          pinValueNode.className = `text-xs font-mono px-1 rounded ${pin.value === 1 ? 'bg-red-500/20 text-red-500 dark:bg-green-500/20 dark:text-green-400' : 'bg-blue-500/10 text-blue-500 dark:bg-slate-700/50 dark:text-slate-400'}`;
        }
      });
    });
  }

  render() {
    // Clear and build DOM components
    this.container.querySelectorAll('.virtual-component').forEach(el => el.remove());

    this.components.forEach(comp => {
      const card = document.createElement('div');
      card.id = comp.id;
      card.className = 'virtual-component absolute flex flex-col justify-between bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hover:shadow-xl p-3 z-10 hover-card cursor-move';
      card.style.left = `${comp.x}px`;
      card.style.top = `${comp.y}px`;
      card.style.userSelect = 'none';

      // Width and Height depending on component type
      if (comp.type === 'vcc' || comp.type === 'gnd') {
        card.style.width = '120px';
      } else if (comp.type === 'clock') {
        card.style.width = '160px';
      } else if (comp.type === 'd-ff' || comp.type === 'jk-ff') {
        card.style.width = '180px';
        card.style.height = '140px';
      } else if (comp.type === 'led') {
        card.style.width = '120px';
      }

      // Dragging logic
      let isDragging = false;
      let startX, startY;

      card.addEventListener('mousedown', (e) => {
        if (e.target.closest('.pin-node') || e.target.closest('.delete-btn')) return;
        isDragging = true;
        startX = e.clientX - comp.x;
        startY = e.clientY - comp.y;
        card.style.zIndex = '50';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const containerRect = this.container.getBoundingClientRect();
        // Constrain in workspace
        let newX = e.clientX - startX;
        let newY = e.clientY - startY;

        newX = Math.max(0, Math.min(newX, containerRect.width - card.offsetWidth));
        newY = Math.max(0, Math.min(newY, containerRect.height - card.offsetHeight));

        comp.x = newX;
        comp.y = newY;
        card.style.left = `${newX}px`;
        card.style.top = `${newY}px`;
        
        this.renderWiresOnly();
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          card.style.zIndex = '10';
        }
      });

      // HTML template inner contents
      let contentHtml = `
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1 mb-2">
          <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 font-display">${comp.name}</span>
          <button class="delete-btn text-slate-400 hover:text-red-500 transition-colors text-xs" title="Delete Node">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;

      if (comp.type === 'led') {
        contentHtml += `
          <div class="flex flex-col items-center justify-center py-2">
            <div class="led-bulb w-12 h-12 rounded-full bg-gray-300 border-4 border-gray-400 dark:bg-slate-700 dark:border-slate-800"></div>
          </div>
        `;
      } else if (comp.type === 'clock') {
        contentHtml += `
          <div class="flex flex-col items-center justify-center space-y-1">
            <div class="text-xs font-mono text-cyan-500 font-bold tracking-widest animate-pulse">CLOCK TOCK</div>
            <div class="text-2s bg-slate-100 dark:bg-slate-900 px-3 py-1 font-mono text-xs rounded text-slate-600 dark:text-slate-400">CLK Out</div>
          </div>
        `;
      } else if (comp.type === 'vcc') {
        contentHtml += `
          <div class="text-center py-2 text-red-500 dark:text-green-500 font-bold font-mono">HIGH (1)</div>
        `;
      } else if (comp.type === 'gnd') {
        contentHtml += `
          <div class="text-center py-2 text-blue-500 dark:text-slate-400 font-bold font-mono">LOW (0)</div>
        `;
      } else if (comp.type === 'd-ff' || comp.type === 'jk-ff') {
        contentHtml += `
          <div class="grid grid-cols-2 gap-2 text-xs h-full flex-grow">
            <!-- Left inputs -->
            <div class="flex flex-col justify-around text-left">
              ${comp.type === 'd-ff' ? '<div>D</div>' : '<div>J</div><div>K</div>'}
              <div class="text-slate-400 text-[10px]">► Clock</div>
            </div>
            <!-- Right outputs -->
            <div class="flex flex-col justify-around text-right font-semibold">
              <div>Q</div>
              <div>Q'</div>
            </div>
          </div>
        `;
      }

      // Pin Layout Container
      contentHtml += `<div class="flex justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-700">`;

      // Draw pin inputs/outputs as little interactive node circles
      const inputs = comp.pins.filter(p => !p.isOutput);
      const outputs = comp.pins.filter(p => p.isOutput);

      let pinsHtml = `<div class="flex flex-wrap gap-2 items-center">`;
      inputs.forEach(pin => {
        pinsHtml += `
          <div class="flex items-center space-x-1">
            <div class="pin-node pin-connectable w-3.5 h-3.5 rounded-full border-2 border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] font-mono text-slate-600 dark:text-slate-300"
                 data-comp-id="${comp.id}" data-pin-id="${pin.id}" title="Input: ${pin.label}">
            </div>
            <span class="text-[9px] font-mono" data-pin-val-id="${pin.id}">0</span>
          </div>
        `;
      });
      pinsHtml += `</div><div class="flex flex-wrap gap-2 items-center justify-end ml-auto">`;
      outputs.forEach(pin => {
        pinsHtml += `
          <div class="flex items-center space-x-1">
            <span class="text-[9px] font-mono" data-pin-val-id="${pin.id}">0</span>
            <div class="pin-node pin-connectable w-3.5 h-3.5 rounded-full border-2 border-slate-500 dark:border-cyan-500 bg-slate-200 dark:bg-slate-900 flex items-center justify-center text-[8px] font-mono text-cyan-500 glow-cyan font-bold"
                 data-comp-id="${comp.id}" data-pin-id="${pin.id}" title="Output: ${pin.label}">
            </div>
          </div>
        `;
      });
      pinsHtml += `</div>`;

      contentHtml += pinsHtml + '</div>';
      card.innerHTML = contentHtml;

      // Attach Event listeners
      card.querySelector('.delete-btn').addEventListener('click', () => {
        this.deleteComponent(comp.id);
      });

      // Pin interactions
      card.querySelectorAll('.pin-node').forEach(pinNode => {
        pinNode.addEventListener('click', (e) => {
          const compId = pinNode.getAttribute('data-comp-id');
          const pinId = pinNode.getAttribute('data-pin-id');
          const sourceComponent = this.components.find(c => c.id === compId);
          const pinObject = sourceComponent.pins.find(p => p.id === pinId);
          
          if (!this.activePin) {
            // Select start node
            this.activePin = { compId, pinId, isOutput: pinObject.isOutput };
            pinNode.classList.add('scale-150', 'border-yellow-500', 'glow-yellow');
          } else {
            // Try to wire if it is a valid combo (output -> input)
            const firstComp = this.components.find(c => c.id === this.activePin.compId);
            const firstPin = firstComp.pins.find(p => p.id === this.activePin.pinId);

            // Output to Input only
            if (this.activePin.isOutput && !pinObject.isOutput) {
              if (this.activePin.compId === compId) {
                alert("Cannot wire a component to itself!");
              } else {
                this.addWire(this.activePin.compId, this.activePin.pinId, compId, pinId);
              }
            } else if (!this.activePin.isOutput && pinObject.isOutput) {
              if (this.activePin.compId === compId) {
                alert("Cannot wire a component to itself!");
              } else {
                this.addWire(compId, pinId, this.activePin.compId, this.activePin.pinId);
              }
            } else {
              alert("Please connect an OUTPUT pin to an INPUT pin!");
            }

            // Reset active state
            const prevActiveNode = document.querySelector(`[data-comp-id="${this.activePin.compId}"][data-pin-id="${this.activePin.pinId}"]`);
            if (prevActiveNode) {
              prevActiveNode.classList.remove('scale-150', 'border-yellow-500', 'glow-yellow');
            }
            this.activePin = null;
          }
        });
      });

      this.container.appendChild(card);
    });

    // Draw wires immediately
    this.renderWiresOnly();
    this.updateDomValues();
  }
}

// Export
window.VirtualLab = VirtualLab;
