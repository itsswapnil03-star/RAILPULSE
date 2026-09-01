export function formatTime(dateStr) {
  if (!dateStr) return '--:--';
  if (typeof dateStr === 'string' && /^\d{1,2}:\d{2}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return typeof dateStr === 'string' ? dateStr : '--:--';
  return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDelay(minutes) {
  if (minutes === null || minutes === undefined) return '';
  if (minutes <= 0) return 'On Time';
  return `+${Math.round(minutes)} min`;
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMin = Math.round((d - now) / 60000);
  if (diffMin > 0) return `in ${diffMin} min`;
  if (diffMin < 0) return `${Math.abs(diffMin)} min ago`;
  return 'now';
}
