export function kickoffDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function kickoffTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function kickoffLong(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function inr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export function pct(load) {
  return `${Math.round((load || 0) * 100)}%`;
}

const FLAGS = {
  India: '🇮🇳',
  Australia: '🇦🇺',
  Brazil: '🇧🇷',
  Japan: '🇯🇵',
  USA: '🇺🇸',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Spain: '🇪🇸',
  France: '🇫🇷',
  Germany: '🇩🇪',
  Nigeria: '🇳🇬',
  Canada: '🇨🇦',
  Netherlands: '🇳🇱',
  Sweden: '🇸🇪',
};

export function teamFlag(name) {
  return FLAGS[name] ?? (name.startsWith('Winner') ? '🏆' : '⚽');
}

// Minutes between a kickoff time and a given offset-before window.
export function timeBefore(iso, minutesBefore) {
  return new Date(new Date(iso).getTime() - minutesBefore * 60000);
}

export function clockTime(date) {
  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// "Gate C · East" -> "C"; "P3 · DY Patil College Grounds" -> "P3".
export function shortName(name) {
  const s = String(name ?? '');
  const m = s.match(/\b([A-H]|P[0-9])\b/);
  return m ? m[1] : s;
}