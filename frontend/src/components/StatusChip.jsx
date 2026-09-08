import { statusOf, delayLabel } from "../utils/format";

export default function StatusChip({ train, compact = false }) {
  const meta = statusOf(train);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${meta.badge}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {compact ? delayLabel(train.delay_minutes) : meta.label}
    </span>
  );
}
