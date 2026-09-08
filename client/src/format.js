export function formatClock(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function delayLabel(min) {
  const n = Math.round(min);
  if (n <= 0) return "On time";
  return `+${n} min`;
}

export function severityColor(severity) {
  if (severity === "on-time") return "bg-emerald-600";
  if (severity === "minor") return "bg-amber-500";
  return "bg-red-600";
}

export function severityText(severity) {
  if (severity === "on-time") return "text-emerald-700";
  if (severity === "minor") return "text-amber-700";
  return "text-red-700";
}
