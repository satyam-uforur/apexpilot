const ANSWER_CELLS = {
  corners: [
    { r: 0, c: 0, val: 82, ch: 'R' },
    { r: 0, c: 11, val: 73, ch: 'I' },
    { r: 11, c: 0, val: 83, ch: 'S' },
    { r: 11, c: 11, val: 69, ch: 'E' },
  ],
  cross: [
    { r: 1, c: 1, val: 83, ch: 'S' },
    { r: 1, c: 4, val: 84, ch: 'T' },
    { r: 2, c: 2, val: 65, ch: 'A' },
    { r: 9, c: 2, val: 78, ch: 'N' },
    { r: 9, c: 4, val: 68, ch: 'D' },
  ],
};

const RNG = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const randInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;

const EXCLUDED_RANGE = [65, 90];

const randomNonLetter = (rng) => {
  const range = rng() < 0.5 ? [10, 64] : [91, 200];
  return randInt(rng, range[0], range[1]);
};

const isAnswerCell = (r, c) => {
  const all = [...ANSWER_CELLS.corners, ...ANSWER_CELLS.cross];
  return all.some(cell => cell.r === r && cell.c === c);
};

const getAnswerVal = (r, c) => {
  const all = [...ANSWER_CELLS.corners, ...ANSWER_CELLS.cross];
  const found = all.find(cell => cell.r === r && cell.c === c);
  return found ? found.val : null;
};

const generateGrid = (seed) => {
  const rng = RNG(seed);
  const grid = [];
  for (let r = 0; r < 12; r++) {
    const row = [];
    for (let c = 0; c < 12; c++) {
      if (isAnswerCell(r, c)) {
        row.push(getAnswerVal(r, c));
      } else {
        row.push(randomNonLetter(rng));
      }
    }
    grid.push(row);
  }
  return grid;
};

const TUTORIAL_GRIDS = {
  'TUT-01': generateGrid(101),
  'TUT-02': generateGrid(202),
  'TUT-03': generateGrid(303),
  'TUT-04': generateGrid(404),
  'TUT-05': generateGrid(505),
  'TUT-06': generateGrid(606),
  'TUT-07': generateGrid(707),
  'TUT-08': generateGrid(808),
  'TUT-09': generateGrid(909),
  'TUT-10': generateGrid(111),
};

const TUTORIAL_NOTES = {
  'TUT-01': 'Sequence locked at intersection points where diagonal parity matches column sum modulo of adjacent prime clusters.',
  'TUT-02': 'Data integrity check: transverse XOR of non-prime indices yields the activation vector.',
  'TUT-03': 'Signal threshold normalized against baseline entropy of secondary frequency harmonics.',
  'TUT-04': 'Decryption key embedded in orthogonal complement of the main transmission subspace.',
  'TUT-05': 'Reconstruct the phase-shifted carrier wave by applying inverse Hamming window to residuals.',
  'TUT-06': 'Tower synchronization pulse aligns with the null space of the covariance matrix eigenvalues.',
  'TUT-07': 'Extract the eigenvector corresponding to the largest singular value of the adjacency matrix.',
  'TUT-08': 'Calibration required: apply Z-score normalization to the log-transformed spectral density.',
  'TUT-09': 'Correlation decay threshold exceeded; bootstrap confidence interval does not converge.',
  'TUT-10': 'Convolution kernel stride must match the pooling layer dimension reduction factor.',
};

const TUTORIAL_HINTS = [
  '144 numbers. But only 9 matter. Look for structure, not computation.',
  'The answer lies in specific positions: corners and a pattern within.',
  'Not all numbers are random. Some fall within a specific range. That range represents something.',
  'Look for numbers between 65-90. These are uppercase ASCII codes. Find them. Convert them. Read in order.',
];

export { TUTORIAL_GRIDS, TUTORIAL_NOTES, TUTORIAL_HINTS, ANSWER_CELLS };
