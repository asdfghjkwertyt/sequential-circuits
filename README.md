# Sequential Circuit Simulator Lab

A highly interactive, modern, and professional digital electronics educational single-page web application. It visually explains, models, and simulates core sequential logic elements including Shift Registers, counters, Ring counters, Johnson counters, and a fully interactive Visual Node-Connecting Virtual Lab breadboard sandbox.

---

## 🚀 Key Features

### 1. Shift Registers Simulation
- Modes supported: **SISO**, **SIPO**, **PISO**, and **PIPO**.
- Offers manual **Clock Pulse** execution and **Auto-Clock** speed control ($0.5\text{Hz}$ to $5\text{Hz}$).
- Dual binary inputs: serial bit toggles and 4-channel parallel switches.
- Narrative step-logger translating digital transitions to simple plain English.
- Real-time **wave generation canvas** charting signals ($CLK$, $DIN$, and Outputs $Q_0 \rightarrow Q_3$).

### 2. Binary Counters Simulation
- Configurable clock schemas: **Asynchronous Ripple** vs. **Synchronous Parallel**.
- Dual counting paths: **UP** and **DOWN** counting.
- Modulo selections: **MOD-16** (4-bit), **MOD-10** (decade), **MOD-8** (3-bit), and **Custom MOD-N** (interactive limit slider).
- Dual output displays: retro neon 7-segment decimal representation and parallel binary LED bulb indicators.

### 3. Ring & Johnson Counters
- **Ring Counter**: Circular feedback shift modeling a single active "1" recirculation pattern.
- **Johnson Counter**: Crossed/twisted feedback modeling taking inverted terminal output ($Q_3'$) back to input $D_0$, generating $2N$ stable states.
- Dedicated tabular state-history log showing prior sequence transitions.

### 4. Interactive Virtual Connection Lab
- Interactive visual breadboard grid interface.
- **Component Palette**: Drag-and-drop or click to place *VCC*, *GND*, *Clock Generators*, *D Flip-Flops*, *JK Flip-Flops*, and *LED Output indicators*.
- **Wire connection router**: Click yellow output pins and target input pins to instantly route logic wires.
- **Dynamic Voltage Color-coding**: Wires glow **Red** for logical HIGH signals and **Blue** for logical LOW signals during execution!
- Clicking existing wires prompts confirmation to clear/delete connections.

### 5. Multi-difficulty Quiz Module
- Five custom multi-level multiple choice questions across three topics.
- Active progress indicator bar.
- Immediate correctness analysis, percentage, and descriptive feedback based on score.
- Deep review breakdown explaining the precise logic/working principle behind each correct choice.

### 6. Extra Educational Additions
- **Web Audio synth engine**: Plays electronic sound indicators matching clock ticks and correctness.
- **Microcontroller Integration**: Ready-to-copy standard C++ code snippets showing Arduino control over a hardware **74HC595** SIPO Shift Register and MOD-10 BCD counters.
- **Study Guide Export**: Fully automated generation of detailed, offline study notes downloadable as `.txt` files in a single click.

---

## 📂 Project Structure

```bash
sequential-lab/
│
├── index.html                  # Main visual interface and HTML layout wrappers
│
└── assets/
    ├── css/
    │   └── styles.css          # Custom neon glows, 3D cards, grids, animations
    │
    └── js/
        ├── simulators.js       # Core logic, audio tone synth, real-time waveform canvas
        ├── virtuallab.js       # Node component placements and logic wire routing engines
        ├── quiz.js             # MCQ databases and evaluation tracking controllers
        └── main.js             # Navigation, theme configurations, UI coordinators
```

---

## 🛠️ Deployment & Local Running Guide

### Running Instantly
Since this application uses client-side Web APIs (Canvas, SVG, Web Audio) with absolutely **zero external runtime dependencies**, you can run it instantly:
1. Open the project root folder.
2. Double click `index.html` to run in any modern web browser.

### Hosting in Local Development Node server
If you want to host it on a local server, you can use any static server. For example:

Using Python:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

Using Node.js:
```bash
npm install -g local-server
local-server
```

---

## 🧠 Digital Logic Concepts Cheat-sheet

| Sequential Module | Memory Elements (FFs) | Number of States | Feedback Connection |
| :--- | :---: | :---: | :--- |
| **Shift Register (N-Bit)** | $N$ | $2^N$ | Sequential Stage Chain ($Q_{i-1} \rightarrow D_i$) |
| **Ring Counter** | $N$ | $N$ | Direct True Feedback ($Q_{N-1} \rightarrow D_0$) |
| **Johnson Counter** | $N$ | $2N$ | Inverted Complemented Feedback ($Q'_{N-1} \rightarrow D_0$) |
| **Asynchronous Counter**| $N$ | Up to $2^N$ | Stage clock is triggered by preceding output |
| **Synchronous Counter** | $N$ | Up to $2^N$ | All stages triggered together by centralized clock |
