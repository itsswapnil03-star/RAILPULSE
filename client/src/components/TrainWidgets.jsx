import { delayLabel, formatClock, severityText } from "../format.js";

export function RouteProgress({ train }) {
  const dest = train.halts[train.halts.length - 1];
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{train.halts[0]?.name}</span>
        <span>
          {train.progressPct}% · next {train.nextStationCode}
        </span>
        <span>{dest?.name}</span>
      </div>
      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-rail-600 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, train.progressPct)}%` }}
        />
      </div>
    </div>
  );
}

export function Timeline({ train }) {
  return (
    <ol className="space-y-0">
      {train.halts.map((halt, i) => {
        const destKm = train.halts[train.halts.length - 1].kmFromOrigin || 1;
        const passed = train.progressPct > (halt.kmFromOrigin / destKm) * 100 + 1;
        const isNext = halt.code === train.nextStationCode;
        return (
          <li key={halt.code} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full mt-1.5 ${
                  isNext ? "bg-amber-500" : passed ? "bg-rail-600" : "bg-slate-300"
                }`}
              />
              {i < train.halts.length - 1 && <div className="w-px flex-1 bg-slate-200 min-h-[2.5rem]" />}
            </div>
            <div className="pb-5 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                  {halt.name}{" "}
                  <span className="text-slate-400 font-normal text-sm">{halt.code}</span>
                </p>
                <p className={`text-sm font-semibold ${severityText(delayBand(halt.delayMinutes))}`}>
                  {delayLabel(halt.delayMinutes)}
                </p>
              </div>
              <p className="text-sm text-slate-600">
                Sched {formatClock(halt.scheduledArrivalMs)} · Predicted {formatClock(halt.predictedArrivalMs)}
                {halt.confidenceHighMs
                  ? ` (±${Math.round((halt.confidenceHighMs - halt.predictedArrivalMs) / 60000)} min)`
                  : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function delayBand(min) {
  if (min < 5) return "on-time";
  if (min < 20) return "minor";
  return "major";
}
