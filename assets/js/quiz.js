// Quiz Module for Sequential Circuit Simulator Lab

const QuizData = {
  'shift-registers': [
    {
      id: 'sr1',
      question: 'Which shift register type requires the maximum number of clock pulses to load a 4-bit data word serially?',
      options: [
        { id: 'a', text: 'SISO (Serial-In Serial-Out)' },
        { id: 'b', text: 'SIPO (Serial-In Parallel-Out)' },
        { id: 'c', text: 'PISO (Parallel-In Serial-Out)' },
        { id: 'd', text: 'PIPO (Parallel-In Parallel-Out)' }
      ],
      correct: 'a',
      explanation: 'SISO requires N clock pulses to write/shift-in the data serially, and another N-1 clock pulses to shift it all out, totaling 2N-1 clock pulses for N bits. SIPO only needs N pulses to load because the output is available in parallel instantly.',
      difficulty: 'Beginner'
    },
    {
      id: 'sr2',
      question: 'How many flip-flops are required to construct a 8-bit shift register?',
      options: [
        { id: 'a', text: '4' },
        { id: 'b', text: '8' },
        { id: 'c', text: '16' },
        { id: 'd', text: '32' }
      ],
      correct: 'b',
      explanation: 'In any standard shift register, each flip-flop can store exactly 1 bit of digital information. Therefore, an 8-bit shift register requires exactly 8 flip-flops.',
      difficulty: 'Beginner'
    },
    {
      id: 'sr3',
      question: 'In a PISO (Parallel-In Serial-Out) shift register, what is the role of the Shift/Load control line?',
      options: [
        { id: 'a', text: 'It switches between counting up and counting down' },
        { id: 'b', text: 'It controls whether data is loaded in parallel or shifted out serially' },
        { id: 'c', text: 'It resets all flip-flops to zero' },
        { id: 'd', text: 'It increases the speed of the clock pulse' }
      ],
      correct: 'b',
      explanation: 'When Shift/Load is LOW, the parallel input channels are enabled to load all bits simultaneously into the flip-flops on the next clock pulse. When HIGH, the flip-flops are cross-connected to shift the bits serially from one stage to the next.',
      difficulty: 'Intermediate'
    },
    {
      id: 'sr4',
      question: 'What happens to the stored binary word "1011" in a right-shift register when a single clock pulse is applied and the serial input is "0"?',
      options: [
        { id: 'a', text: 'It becomes "1011"' },
        { id: 'b', text: 'It becomes "1101"' },
        { id: 'c', text: 'It becomes "0101"' },
        { id: 'd', text: 'It becomes "1110"' }
      ],
      correct: 'c',
      explanation: 'Shifting right means the MSB receives the serial input ("0"), and the other bits shift to the right, causing the LSB ("1") to be discarded. Thus, 1011 shifted right with a 0 entering from the left results in 0101.',
      difficulty: 'Intermediate'
    },
    {
      id: 'sr5',
      question: 'What is the propagation delay limitation in a high-speed shift register application?',
      options: [
        { id: 'a', text: 'It accumulates across stages, making serial input slow' },
        { id: 'b', text: 'It must be smaller than the clock period to prevent setup time violations (race conditions)' },
        { id: 'c', text: 'It causes the parallel inputs to overlap' },
        { id: 'd', text: 'It requires additional inverter gates on every stage' }
      ],
      correct: 'b',
      explanation: 'In synchronous circuits like shift registers, all flip-flops trigger together. The propagation delay plus setup time must be less than the clock period, otherwise the next flip-flop might read unstable intermediate data (metastability or hold/setup violation).',
      difficulty: 'Advanced'
    }
  ],
  'counters': [
    {
      id: 'c1',
      question: 'Why is an Asynchronous counter also referred to as a "Ripple" counter?',
      options: [
        { id: 'a', text: 'Because its output changes in a wave-like sinusoidal shape' },
        { id: 'b', text: 'Because the clock pulse ripples through each flip-flop one after the other' },
        { id: 'c', text: 'Because it uses fluidic electronics' },
        { id: 'd', text: 'Because it can only count prime numbers' }
      ],
      correct: 'b',
      explanation: 'In asynchronous counters, only the first flip-flop is clocked directly by the external clock. The output of each flip-flop serves as the clock input for the next stage, causing the change in state to ripple through the counter stages.',
      difficulty: 'Beginner'
    },
    {
      id: 'c2',
      question: 'What is the maximum mod number of a counter constructed with 4 flip-flops?',
      options: [
        { id: 'a', text: '4' },
        { id: 'b', text: '8' },
        { id: 'c', text: '16' },
        { id: 'd', text: '10' }
      ],
      correct: 'c',
      explanation: 'A counter with N flip-flops can represent 2^N unique binary states. For 4 flip-flops, the maximum states are 2^4 = 16 (states 0000 through 1111). Thus, its maximum modulo (MOD) is 16.',
      difficulty: 'Beginner'
    },
    {
      id: 'c3',
      question: 'How does a MOD-10 (decade) counter reset itself when reaching the count of 10 (binary 1010)?',
      options: [
        { id: 'a', text: 'By using an external clock divider' },
        { id: 'b', text: 'Using a NAND/AND gate connected to Q1 and Q3 to trigger the CLEAR (active-low) pin' },
        { id: 'c', text: 'Using a shift register bypass wire' },
        { id: 'd', text: 'By reducing the input supply voltage' }
      ],
      correct: 'b',
      explanation: 'To reset a 4-bit counter (Q3 Q2 Q1 Q0) at 10 (1010), we detect when Q3 and Q1 are both 1. A NAND gate with inputs Q3 and Q1 produces a LOW signal at state 10, which connects to the active-low CLEAR pins of all flip-flops, instantly resetting the count to 0000.',
      difficulty: 'Intermediate'
    },
    {
      id: 'c4',
      question: 'What is the main advantage of a Synchronous Counter over an Asynchronous (Ripple) Counter?',
      options: [
        { id: 'a', text: 'It requires fewer flip-flops' },
        { id: 'b', text: 'It has simpler external wiring' },
        { id: 'c', text: 'It avoids propagation delay accumulation, enabling higher speed operation' },
        { id: 'd', text: 'It does not require a clock source' }
      ],
      correct: 'c',
      explanation: 'In synchronous counters, all flip-flops share the same clock line and trigger simultaneously. This prevents the cumulative "ripple" propagation delays of asynchronous counters, enabling much higher operational frequencies without glitches.',
      difficulty: 'Intermediate'
    },
    {
      id: 'c5',
      question: 'What is a "glitch" in a ripple counter, and why does it occur?',
      options: [
        { id: 'a', text: 'An unexpected high voltage that burns out the chips' },
        { id: 'b', text: 'A temporary invalid state that appears during count transitions due to sequential flip-flop delays' },
        { id: 'c', text: 'A programming error in the clock signal script' },
        { id: 'd', text: 'A clock pulse that is too slow to register' }
      ],
      correct: 'b',
      explanation: 'Because each flip-flop has a small propagation delay, intermediate states briefly appear. For example, during 0111 -> 1000 transition, intermediate states like 0110, 0100, and 0000 may occur for nanoseconds. Decoders reading these values can experience false outputs ("glitches").',
      difficulty: 'Advanced'
    }
  ],
  'ring-johnson': [
    {
      id: 'rj1',
      question: 'What is the primary difference in feedback routing between a Ring Counter and a Johnson Counter?',
      options: [
        { id: 'a', text: 'Ring counter feedback is taken from Q, while Johnson counter feedback is taken from Q\' (complemented output)' },
        { id: 'b', text: 'Ring counter feeds back to the clock, while Johnson feeds back to the preset' },
        { id: 'c', text: 'Johnson counter has no feedback path' },
        { id: 'd', text: 'Ring counter uses parallel feedback, while Johnson uses serial inputs' }
      ],
      correct: 'a',
      explanation: 'A Ring Counter feeds the true output (Q) of the final stage back to the input (D) of the first stage. A Johnson Counter (twisted ring counter) feeds the complemented output (Q\') of the final stage back to the D input of the first stage.',
      difficulty: 'Beginner'
    },
    {
      id: 'rj2',
      question: 'How many unique states does an N-stage Ring Counter have, compared to an N-stage Johnson Counter?',
      options: [
        { id: 'a', text: 'Ring: 2^N, Johnson: 2N' },
        { id: 'b', text: 'Ring: N, Johnson: 2N' },
        { id: 'c', text: 'Ring: N, Johnson: N^2' },
        { id: 'd', text: 'Ring: 2N, Johnson: N' }
      ],
      correct: 'b',
      explanation: 'An N-stage Ring Counter has exactly N states (one "1" recirculating through N positions). An N-stage Johnson Counter has 2N states (filling up with "1"s and then clearing them out with "0"s).',
      difficulty: 'Intermediate'
    },
    {
      id: 'rj3',
      question: 'For a 4-bit Ring Counter initialized to "1000", which sequence is correct?',
      options: [
        { id: 'a', text: '1000 -> 0100 -> 0010 -> 0001 -> 1000...' },
        { id: 'b', text: '1000 -> 1100 -> 1110 -> 1111 -> 0111...' },
        { id: 'c', text: '1000 -> 0001 -> 0010 -> 0100 -> 1000...' },
        { id: 'd', text: '1000 -> 0000 -> 1111 -> 0101 -> 1000...' }
      ],
      correct: 'a',
      explanation: 'A Ring Counter shifts the single "1" bit sequentially on every clock pulse. So, the active bit moves from FF0 to FF1, FF2, FF3, and then recirculates back to FF0: 1000 -> 0100 -> 0010 -> 0001 -> 1000.',
      difficulty: 'Beginner'
    },
    {
      id: 'rj4',
      question: 'What is a major disadvantage of a Ring Counter that makes initialization circuits mandatory?',
      options: [
        { id: 'a', text: 'It is highly asynchronous and prone to extreme glitches' },
        { id: 'b', text: 'If it enters an invalid state (e.g., 0000 or 1010), it cannot recover to the single-circulating-one state on its own' },
        { id: 'c', text: 'It consumes more power than any other type of counter' },
        { id: 'd', text: 'It can only count to prime numbers' }
      ],
      correct: 'b',
      explanation: 'Out of 16 potential states (for 4 bits), only 4 are valid for a Ring Counter. If noise or power-up puts the register in an invalid state like "0000" or "1010", it will circulate those patterns forever. Self-correcting feedback gates or pre-set initialization lines are required to ensure operation.',
      difficulty: 'Advanced'
    },
    {
      id: 'rj5',
      question: 'What is the decoding complexity of an N-stage Johnson counter compared to a binary ripple counter?',
      options: [
        { id: 'a', text: 'It requires complicated 4-input NAND gates for every state' },
        { id: 'b', text: 'It requires absolutely no decoding gates whatsoever' },
        { id: 'c', text: 'Any state can be decoded using a simple 2-input AND gate' },
        { id: 'd', text: 'It requires double-inverting stages' }
      ],
      correct: 'c',
      explanation: 'Due to the sequence characteristics of a Johnson Counter (adjacent states only change by one bit), any of its 2N states can be decoded using a simple 2-input AND/NAND gate, which is much simpler than full binary decoding (which requires N-input gates).',
      difficulty: 'Advanced'
    }
  ]
};

class QuizEngine {
  constructor() {
    this.currentCategory = 'shift-registers';
    this.currentIndex = 0;
    this.score = 0;
    this.answers = []; // stores user choices
    this.submitted = false;
  }

  init(category) {
    this.currentCategory = category || 'shift-registers';
    this.currentIndex = 0;
    this.score = 0;
    this.answers = new Array(QuizData[this.currentCategory].length).fill(null);
    this.submitted = false;
  }

  getCurrentQuestion() {
    return QuizData[this.currentCategory][this.currentIndex];
  }

  getTotalQuestions() {
    return QuizData[this.currentCategory].length;
  }

  selectAnswer(optionId) {
    if (this.submitted) return;
    this.answers[this.currentIndex] = optionId;
  }

  nextQuestion() {
    if (this.currentIndex < this.getTotalQuestions() - 1) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return true;
    }
    return false;
  }

  submitQuiz() {
    if (this.submitted) return this.score;
    this.submitted = true;
    this.score = 0;
    const questions = QuizData[this.currentCategory];
    questions.forEach((q, idx) => {
      if (this.answers[idx] === q.correct) {
        this.score++;
      }
    });
    return this.score;
  }
}

// Export for main application use
window.QuizEngine = QuizEngine;
window.QuizData = QuizData;
