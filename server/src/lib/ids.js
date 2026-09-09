const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function randomCode(len = 6) {
  let out = '';
  for (let i = 0; i < len; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
  return out;
}

export function ticketId(matchId, blockName) {
  return `FWC-${matchId}-${blockName}-${randomCode(6)}`;
}