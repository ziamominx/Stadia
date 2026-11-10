// The wallet is a browser-local index of passes booked on this device. The
// booking API remains the source of truth for ticket details and validity.
const KEY = 'stadia_wallet_ticket_ids_v1';

export function getWalletTicketIds() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(saved)
      ? saved.filter((id) => typeof id === 'string' && id.trim()).slice(0, 30)
      : [];
  } catch {
    return [];
  }
}

export function rememberWalletTicket(ticketId) {
  if (typeof window === 'undefined' || typeof ticketId !== 'string' || !ticketId.trim()) return;
  try {
    const next = [ticketId, ...getWalletTicketIds().filter((id) => id !== ticketId)].slice(0, 30);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('stadia_wallet_updated'));
  } catch {
    // A ticket can still be opened directly when storage is unavailable.
  }
}

export function forgetWalletTicket(ticketId) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(getWalletTicketIds().filter((id) => id !== ticketId)));
    window.dispatchEvent(new Event('stadia_wallet_updated'));
  } catch {
    // Ignore disabled storage.
  }
}
