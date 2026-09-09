export const SEAT_ROWS = 20; // A..T
export const SEAT_COLS = 24; // 1..24

export function seatLabel(row, col) {
  return `${String.fromCharCode(64 + row)}${col}`;
}