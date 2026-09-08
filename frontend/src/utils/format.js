import { STATUS_META } from "./constants";

export function delayLabel(min) {
  const n = Number(min) || 0;
  if (n < 1) return "On time";
  return `+${n.toFixed(0)} min`;
}

export function statusOf(train) {
  return STATUS_META[train?.status] || STATUS_META.on_time;
}

export function hhmmNow() {
  const d = new Date();
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatClock(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
}
