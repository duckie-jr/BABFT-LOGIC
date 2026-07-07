// Declared here so refreshRCA() can safely read it before the
// segment-display block is reached (avoids temporal dead zone crash).
let segLinkedToRCA = false;

const GATE_LOGIC = {
  AND:  (a, b) => a & b,
  OR:   (a, b) => a | b,
  XOR:  (a, b) => a ^ b,
  NAND: (a, b) => (a & b) ^ 1,
  NOR:  (a, b) => (a | b) ^ 1,
  XNOR: (a, b) => (a ^ b) ^ 1,
};

document.querySelectorAll('.gate-card').forEach(card => {
  const gateType  = card.dataset.gate;
  const btnA      = card.querySelector('[data-input="a"]');
  const btnB      = card.querySelector('[data-input="b"]');
  const valSpan   = card.querySelector('.try-val');
  const tableRows = card.querySelectorAll('tbody tr');
  let stateA = 0, stateB = 0;

  function refresh() {
    const out = GATE_LOGIC[gateType](stateA, stateB);
    btnA.textContent = `A = ${stateA}`;
    btnB.textContent = `B = ${stateB}`;
    btnA.classList.toggle('btn-on', stateA === 1);
    btnB.classList.toggle('btn-on', stateB === 1);
    valSpan.textContent = out;
    valSpan.className = `try-val ${out ? 'o1' : 'o0'}`;
    tableRows.forEach(row => {
      row.classList.toggle('row-active',
        +row.cells[0].textContent === stateA &&
        +row.cells[1].textContent === stateB
      );
    });
  }

  btnA.addEventListener('click', () => { stateA ^= 1; refresh(); });
  btnB.addEventListener('click', () => { stateB ^= 1; refresh(); });
  refresh();
});

// ── Half adder interactive ──
const haBtnA  = document.getElementById('ha-btn-a');
const haBtnB  = document.getElementById('ha-btn-b');
const haSum   = document.getElementById('ha-sum');
const haCarry = document.getElementById('ha-carry');
const haRows  = document.querySelectorAll('#half-adder tbody tr');
let haA = 0, haB = 0;

function refreshHA() {
  const sum   = haA ^ haB;
  const carry = haA & haB;
  haBtnA.textContent = `A = ${haA}`;
  haBtnB.textContent = `B = ${haB}`;
  haBtnA.classList.toggle('btn-on', haA === 1);
  haBtnB.classList.toggle('btn-on', haB === 1);
  haSum.textContent   = sum;
  haSum.className     = `try-val ${sum   ? 'o1' : 'o0'}`;
  haCarry.textContent = carry;
  haCarry.className   = `try-val ${carry ? 'o1' : 'o0'}`;
  haRows.forEach(row => {
    row.classList.toggle('row-active',
      +row.cells[0].textContent === haA &&
      +row.cells[1].textContent === haB
    );
  });
}

haBtnA.addEventListener('click', () => { haA ^= 1; refreshHA(); });
haBtnB.addEventListener('click', () => { haB ^= 1; refreshHA(); });
refreshHA();

// ── Decoder interactive ──
const decBtnA   = document.getElementById('dec-a');
const decBtnB   = document.getElementById('dec-b');
const decOutEls = [0, 1, 2, 3].map(i => document.getElementById(`dec-out-${i}`));
const decRows   = document.querySelectorAll('#decoder tbody tr');
let decA = 0, decB = 0;

function refreshDecoder() {
  const nA = decA ^ 1;
  const nB = decB ^ 1;
  const outputs = [ nA & nB, nA & decB, decA & nB, decA & decB ];

  decBtnA.textContent = `A = ${decA}`;
  decBtnB.textContent = `B = ${decB}`;
  decBtnA.classList.toggle('btn-on', decA === 1);
  decBtnB.classList.toggle('btn-on', decB === 1);

  decOutEls.forEach((el, i) => {
    const valEl = el.querySelector('.dec-val');
    valEl.textContent = outputs[i];
    valEl.className   = `dec-val ${outputs[i] ? 'o1' : 'o0'}`;
    el.classList.toggle('dec-active', outputs[i] === 1);
  });

  decRows.forEach(row => {
    row.classList.toggle('row-active',
      +row.cells[0].textContent === decA &&
      +row.cells[1].textContent === decB
    );
  });
}

decBtnA.addEventListener('click', () => { decA ^= 1; refreshDecoder(); });
decBtnB.addEventListener('click', () => { decB ^= 1; refreshDecoder(); });
refreshDecoder();

// ── SR Latch interactive ──
const srBtnS     = document.getElementById('sr-btn-s');
const srBtnR     = document.getElementById('sr-btn-r');
const srQSpan    = document.getElementById('sr-q');
const srStateLbl = document.getElementById('sr-state-lbl');
const srRows     = document.querySelectorAll('#sr-latch tbody tr');
let srS = 0, srR = 0, srQState = 0;

function refreshSR() {
  if      (srS === 1 && srR === 0) srQState = 1;
  else if (srS === 0 && srR === 1) srQState = 0;
  // S=0,R=0: hold — srQState unchanged
  // S=1,R=1: invalid — leave srQState as-is but show warning

  const stateKey   = `${srS}${srR}`;
  const isInvalid  = srS === 1 && srR === 1;
  const stateNames = { '00': 'Hold', '10': 'Set', '01': 'Reset', '11': 'Invalid' };

  srBtnS.textContent = `S = ${srS}`;
  srBtnR.textContent = `R = ${srR}`;
  srBtnS.classList.toggle('btn-on', srS === 1);
  srBtnR.classList.toggle('btn-on', srR === 1);

  srQSpan.textContent = isInvalid ? '⚠' : srQState;
  srQSpan.className   = isInvalid ? 'try-val' : `try-val ${srQState ? 'o1' : 'o0'}`;

  srStateLbl.textContent = stateNames[stateKey];
  srStateLbl.classList.toggle('sr-invalid', isInvalid);

  srRows.forEach(row => {
    row.classList.toggle('row-active', row.dataset.sr === stateKey);
  });
}

srBtnS.addEventListener('click', () => { srS ^= 1; refreshSR(); });
srBtnR.addEventListener('click', () => { srR ^= 1; refreshSR(); });
refreshSR();

// ── MUX interactive ──
const muxBtnA    = document.getElementById('mux-btn-a');
const muxBtnB    = document.getElementById('mux-btn-b');
const muxBtnSel  = document.getElementById('mux-btn-sel');
const muxOutSpan = document.getElementById('mux-out');
const muxRows    = document.querySelectorAll('#mux tbody tr');
let muxA = 0, muxB = 0, muxSel = 0;

function refreshMux() {
  const output = muxSel === 0 ? muxA : muxB;

  muxBtnA.textContent   = `A = ${muxA}`;
  muxBtnB.textContent   = `B = ${muxB}`;
  muxBtnSel.textContent = `Sel = ${muxSel}`;
  muxBtnA.classList.toggle('btn-on', muxA === 1);
  muxBtnB.classList.toggle('btn-on', muxB === 1);
  muxBtnSel.classList.toggle('btn-on', muxSel === 1);

  muxOutSpan.textContent = output;
  muxOutSpan.className   = `try-val ${output ? 'o1' : 'o0'}`;

  muxRows.forEach(row => {
    row.classList.toggle('row-active', row.dataset.mux === `${muxSel}${muxA}${muxB}`);
  });
}

muxBtnA.addEventListener('click',   () => { muxA   ^= 1; refreshMux(); });
muxBtnB.addEventListener('click',   () => { muxB   ^= 1; refreshMux(); });
muxBtnSel.addEventListener('click', () => { muxSel ^= 1; refreshMux(); });
refreshMux();

// ── Full Adder interactive ──
const faBtnA   = document.getElementById('fa-btn-a');
const faBtnB   = document.getElementById('fa-btn-b');
const faBtnCin = document.getElementById('fa-btn-cin');
const faSum    = document.getElementById('fa-sum');
const faCout   = document.getElementById('fa-cout');
const faRows   = document.querySelectorAll('#full-adder tbody tr');
let faA = 0, faB = 0, faCin = 0;

function refreshFA() {
  const s1   = faA ^ faB;
  const c1   = faA & faB;
  const sum  = s1  ^ faCin;
  const c2   = s1  & faCin;
  const cout = c1  | c2;

  faBtnA.textContent   = `A = ${faA}`;
  faBtnB.textContent   = `B = ${faB}`;
  faBtnCin.textContent = `Cin = ${faCin}`;
  faBtnA.classList.toggle('btn-on', faA   === 1);
  faBtnB.classList.toggle('btn-on', faB   === 1);
  faBtnCin.classList.toggle('btn-on', faCin === 1);

  faSum.textContent  = sum;
  faSum.className    = `try-val ${sum  ? 'o1' : 'o0'}`;
  faCout.textContent = cout;
  faCout.className   = `try-val ${cout ? 'o1' : 'o0'}`;

  faRows.forEach(row => {
    row.classList.toggle('row-active', row.dataset.fa === `${faA}${faB}${faCin}`);
  });
}

faBtnA.addEventListener('click',   () => { faA   ^= 1; refreshFA(); });
faBtnB.addEventListener('click',   () => { faB   ^= 1; refreshFA(); });
faBtnCin.addEventListener('click', () => { faCin ^= 1; refreshFA(); });
refreshFA();

// ── Clock / Oscillator interactive ──
const clkOutSpan         = document.getElementById('clk-out');
const clkToggleBtn       = document.getElementById('clk-toggle');
const clkWaveContainer   = document.getElementById('clk-wave');
const WAVE_HISTORY_LENGTH = 14;

let clockIsRunning   = false;
let clockIntervalId  = null;
let clockState       = 0;
let clockWaveHistory = Array(WAVE_HISTORY_LENGTH).fill(null);

clkWaveContainer.innerHTML = Array.from({ length: WAVE_HISTORY_LENGTH })
  .map((_, cellIndex) => `<div class="clock-wave-cell" id="clk-cell-${cellIndex}"></div>`)
  .join('');

function renderClockWave() {
  clockWaveHistory.forEach((bitValue, cellIndex) => {
    const cellElement = document.getElementById(`clk-cell-${cellIndex}`);
    const isNewestCell = cellIndex === WAVE_HISTORY_LENGTH - 1;

    if (bitValue === null) {
      cellElement.className = 'clock-wave-cell';
    } else {
      cellElement.className = `clock-wave-cell wave-${bitValue}${isNewestCell ? ' wave-current' : ''}`;
    }
  });
}

function tickClock() {
  clockState = clockState ^ 1;

  clkOutSpan.textContent = clockState;
  clkOutSpan.className   = `try-val ${clockState ? 'o1' : 'o0'} clock-out`;

  clockWaveHistory.shift();
  clockWaveHistory.push(clockState);
  renderClockWave();
}

clkToggleBtn.addEventListener('click', () => {
  if (clockIsRunning) {
    clearInterval(clockIntervalId);
    clockIsRunning = false;
    clkToggleBtn.textContent = '▶ Start';
    clkToggleBtn.classList.remove('btn-on');
  } else {
    clockIsRunning = true;
    clkToggleBtn.textContent = '⏹ Stop';
    clkToggleBtn.classList.add('btn-on');
    clockIntervalId = setInterval(tickClock, 500);
  }
});

// ── LED Display interactive ──
const ledBtnR        = document.getElementById('led-btn-r');
const ledBtnG        = document.getElementById('led-btn-g');
const ledBtnB        = document.getElementById('led-btn-b');
const ledBtnActivate = document.getElementById('led-btn-act');
const ledScreenEl    = document.getElementById('led-screen');
const ledColorNameEl = document.getElementById('led-color-name');
const ledTableRows   = document.querySelectorAll('#led-display tbody tr');
let ledSwitchR = 0, ledSwitchG = 0, ledSwitchB = 0, ledSwitchActivate = 0;

const LED_COLOR_NAMES = {
  '000': 'Off (Black)', '100': 'Red',     '010': 'Green', '001': 'Blue',
  '110': 'Yellow',      '101': 'Magenta', '011': 'Cyan',  '111': 'White',
};
const LED_COLOR_HEX = {
  '000': '#000000', '100': '#ff0000', '010': '#00ff00', '001': '#0000ff',
  '110': '#ffff00', '101': '#ff00ff', '011': '#00ffff', '111': '#ffffff',
};

function applyLedScreenOutput(outputR, outputG, outputB) {
  const colorKey = `${outputR}${outputG}${outputB}`;
  ledScreenEl.style.backgroundColor = LED_COLOR_HEX[colorKey]   || '#000000';
  ledColorNameEl.textContent         = LED_COLOR_NAMES[colorKey] || 'Unknown';
  ledTableRows.forEach(row => row.classList.toggle('row-active', row.dataset.led === colorKey));
}

function triggerLedUpdate() {
  const andOutputR = ledSwitchR & ledSwitchActivate;
  const andOutputG = ledSwitchG & ledSwitchActivate;
  const andOutputB = ledSwitchB & ledSwitchActivate;
  setTimeout(() => applyLedScreenOutput(andOutputR, andOutputG, andOutputB), 200);
}

function refreshLedSwitchButtons() {
  ledBtnR.textContent        = `R = ${ledSwitchR}`;
  ledBtnG.textContent        = `G = ${ledSwitchG}`;
  ledBtnB.textContent        = `B = ${ledSwitchB}`;
  ledBtnActivate.textContent = `Activate = ${ledSwitchActivate}`;
  ledBtnR.classList.toggle('btn-on',        ledSwitchR        === 1);
  ledBtnG.classList.toggle('btn-on',        ledSwitchG        === 1);
  ledBtnB.classList.toggle('btn-on',        ledSwitchB        === 1);
  ledBtnActivate.classList.toggle('btn-on', ledSwitchActivate === 1);
  triggerLedUpdate();
}

ledBtnR.addEventListener('click',        () => { ledSwitchR        ^= 1; refreshLedSwitchButtons(); });
ledBtnG.addEventListener('click',        () => { ledSwitchG        ^= 1; refreshLedSwitchButtons(); });
ledBtnB.addEventListener('click',        () => { ledSwitchB        ^= 1; refreshLedSwitchButtons(); });
ledBtnActivate.addEventListener('click', () => { ledSwitchActivate ^= 1; refreshLedSwitchButtons(); });
refreshLedSwitchButtons();

// ── T-Latch interactive ──
const tlBtn       = document.getElementById('tl-btn');
const tlQSpan     = document.getElementById('tl-q');
const tlActionLbl = document.getElementById('tl-action');
const tlRows      = document.querySelectorAll('#t-latch tbody tr');
let tlQState     = 0;
let tlLastAction = 'hold';

function refreshTLatch(pressed) {
  if (pressed) {
    tlQState    ^= 1;
    tlLastAction = tlQState === 1 ? 'set' : 'reset';
  } else {
    tlLastAction = 'hold';
  }

  tlQSpan.textContent = tlQState;
  tlQSpan.className   = `try-val ${tlQState ? 'o1' : 'o0'}`;

  const actionLabels = { hold: 'Hold', set: '↑ Set', reset: '↓ Reset' };
  tlActionLbl.textContent = actionLabels[tlLastAction];

  tlRows.forEach(row => {
    row.classList.toggle('row-active', row.dataset.tl === tlLastAction);
  });
}

tlBtn.addEventListener('click', () => refreshTLatch(true));
refreshTLatch(false);

// ── Sticky nav: highlight active section via IntersectionObserver ──
const allPageSections   = document.querySelectorAll('section[id]');
const allNavLinks       = document.querySelectorAll('.nav-links a');
const navLinksScroller  = document.querySelector('.nav-links');
const visibleSectionIds = new Set();

const navSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleSectionIds.add(entry.target.id);
      } else {
        visibleSectionIds.delete(entry.target.id);
      }
    });

    let firstVisibleSectionId = null;
    allPageSections.forEach(section => {
      if (firstVisibleSectionId === null && visibleSectionIds.has(section.id)) {
        firstVisibleSectionId = section.id;
      }
    });

    allNavLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${firstVisibleSectionId}`;
      link.classList.toggle('nav-active', isActive);

      if (isActive) {
        const linkCenter = link.offsetLeft + link.offsetWidth / 2;
        navLinksScroller.scrollTo({
          left: linkCenter - navLinksScroller.offsetWidth / 2,
          behavior: 'smooth',
        });
      }
    });
  },
  { rootMargin: '-44px 0px -50% 0px', threshold: 0 }
);

allPageSections.forEach(section => navSectionObserver.observe(section));

// ── 4-bit Ripple-Carry Adder interactive ──
const rcaBitsA = [0, 0, 0, 0]; // index 0 = bit 3 (MSB), index 3 = bit 0 (LSB)
const rcaBitsB = [0, 0, 0, 0];

const rcaADecEl   = document.getElementById('rca-a-dec');
const rcaBDecEl   = document.getElementById('rca-b-dec');
const rcaSumDecEl = document.getElementById('rca-sum-dec');
const rcaCoutEl   = document.getElementById('rca-cout');
const rcaOutBits  = [
  document.getElementById('rca-s3'),
  document.getElementById('rca-s2'),
  document.getElementById('rca-s1'),
  document.getElementById('rca-s0'),
];

function rcaGetValue(bits) {
  return (bits[0] << 3) | (bits[1] << 2) | (bits[2] << 1) | bits[3];
}

function rcaSetOutBit(element, bitValue) {
  element.textContent = bitValue;
  element.classList.remove('bit-0', 'bit-1');
  element.classList.add(bitValue ? 'bit-1' : 'bit-0');
}

function refreshRCA() {
  const valueA   = rcaGetValue(rcaBitsA);
  const valueB   = rcaGetValue(rcaBitsB);
  const sumTotal = valueA + valueB;

  rcaADecEl.textContent   = `= ${valueA}`;
  rcaBDecEl.textContent   = `= ${valueB}`;
  rcaSumDecEl.textContent = `= ${sumTotal}`;

  rcaSetOutBit(rcaCoutEl, (sumTotal >> 4) & 1);

  [(sumTotal >> 3) & 1, (sumTotal >> 2) & 1, (sumTotal >> 1) & 1, sumTotal & 1]
    .forEach((bit, index) => rcaSetOutBit(rcaOutBits[index], bit));

  if (typeof segLinkedToRCA !== 'undefined' && segLinkedToRCA) {
    refreshSegDisplay(sumTotal);
  }
}

document.querySelectorAll('.rca-bit-btn').forEach(button => {
  button.addEventListener('click', () => {
    const inputName      = button.dataset.rca;
    const bitPosition    = parseInt(button.dataset.bit, 10);
    const bitArrayIndex  = 3 - bitPosition;
    const targetBitArray = inputName === 'a' ? rcaBitsA : rcaBitsB;

    targetBitArray[bitArrayIndex] ^= 1;

    button.textContent = targetBitArray[bitArrayIndex];
    button.classList.toggle('bit-on', targetBitArray[bitArrayIndex] === 1);

    refreshRCA();
  });
});

refreshRCA();

// ── Two-Digit Segment Display interactive ──
const SEG_PATTERNS = {
  //     a  b  c  d  e  f  g
  0: [1, 1, 1, 1, 1, 1, 0],
  1: [0, 1, 1, 0, 0, 0, 0],
  2: [1, 1, 0, 1, 1, 0, 1],
  3: [1, 1, 1, 1, 0, 0, 1],
  4: [0, 1, 1, 0, 0, 1, 1],
  5: [1, 0, 1, 1, 0, 1, 1],
  6: [1, 0, 1, 1, 1, 1, 1],
  7: [1, 1, 1, 0, 0, 0, 0],
  8: [1, 1, 1, 1, 1, 1, 1],
  9: [1, 1, 1, 1, 0, 1, 1],
};

let segDisplayValue = 0;

const segValueDisplayEl = document.getElementById('seg-value-display');
const segBtnInc         = document.getElementById('seg-btn-inc');
const segBtnDec         = document.getElementById('seg-btn-dec');
const segLinkBtn        = document.getElementById('seg-link-rca');

function refreshSegDisplay(value) {
  const clampedValue = Math.max(0, Math.min(99, value));
  const tensDigit    = Math.floor(clampedValue / 10);
  const unitsDigit   = clampedValue % 10;

  const tensPattern  = SEG_PATTERNS[tensDigit];
  const unitsPattern = SEG_PATTERNS[unitsDigit];

  // Digit 1: a=A1, b=I(shared), c=M(shared), d=D1, e=L, f=H, g=G1
  // Digit 2: a=A2, b=K,         c=N,          d=D2, e=M(shared), f=I(shared), g=G2
  const segStates = {
    A1: tensPattern[0],
    H:  tensPattern[5],
    I:  tensPattern[1] | unitsPattern[5],
    G1: tensPattern[6],
    L:  tensPattern[4],
    M:  tensPattern[2] | unitsPattern[4],
    D1: tensPattern[3],
    A2: unitsPattern[0],
    K:  unitsPattern[1],
    G2: unitsPattern[6],
    N:  unitsPattern[2],
    D2: unitsPattern[3],
  };

  Object.entries(segStates).forEach(([segmentName, isActive]) => {
    const segmentElement = document.getElementById(`seg-${segmentName}`);
    if (segmentElement) {
      segmentElement.classList.toggle('seg-on', Boolean(isActive));
    }
  });

  segValueDisplayEl.textContent = clampedValue.toString().padStart(2, '0');
}

segBtnInc.addEventListener('click', () => {
  if (segLinkedToRCA) return;
  segDisplayValue = Math.min(99, segDisplayValue + 1);
  refreshSegDisplay(segDisplayValue);
});

segBtnDec.addEventListener('click', () => {
  if (segLinkedToRCA) return;
  segDisplayValue = Math.max(0, segDisplayValue - 1);
  refreshSegDisplay(segDisplayValue);
});

segLinkBtn.addEventListener('click', () => {
  segLinkedToRCA = !segLinkedToRCA;
  segLinkBtn.classList.toggle('btn-on', segLinkedToRCA);
  segLinkBtn.textContent  = segLinkedToRCA ? '⚡ Linked to Adder' : '⚡ Link to Adder';
  segBtnInc.disabled      = segLinkedToRCA;
  segBtnDec.disabled      = segLinkedToRCA;

  if (segLinkedToRCA) {
    const rcaSum = rcaGetValue(rcaBitsA) + rcaGetValue(rcaBitsB);
    segDisplayValue = rcaSum;
    refreshSegDisplay(segDisplayValue);
  }
});

refreshSegDisplay(0);
