export const SEAT_ROWS = 20; // A..T
export const SEAT_COLS = 24; // 1..24

export function seatLabel(row, col) {
  return `${String.fromCharCode(64 + row)}${col}`;
}

export function allSeatLabels() {
  const out = [];
  for (let r = 1; r <= SEAT_ROWS; r++) {
    for (let c = 1; c <= SEAT_COLS; c++) out.push(seatLabel(r, c));
  }
  return out;
}