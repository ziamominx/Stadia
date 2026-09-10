const KEY = 'stadia_tickets';

export function getSavedTickets() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveTicket(entry) {
  const list = getSavedTickets();
  if (!list.some((t) => t.id === entry.id)) {
    list.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30)));
  }
}

export function clearSavedTickets() {
  localStorage.removeItem(KEY);
}