import { statusOf } from "../utils/format";

function StopDot({ status }) {
  const colors = {
    departed: "border-steel-500 bg-steel-500",
    current: "border-amber-400 bg-amber-400 shadow-[0_0_8px_#f0b429]",
    upcoming: "border-steel-500/40 bg-transparent",
    arrived: "border-signal-green bg-signal-green",
  };
  return (
    <div
      className={`h-3 w-3 shrink-0 rounded-full border-2 ${
        colors[status] ?? colors.upcoming
      }`}
    />
  );
}

export default function TrainTimeline({ train, liveState }) {
  if (!train?.stops?.length) return null;
  return (
    <div className="p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-steel-400">
          Station timeline
        </p>
        <p className="font-mono text-[10px] text-steel-500">
          {train.number} · {train.name}
        </p>
      </div>
      <ol className="relative">
        {train.stops.map((stop, i) => {
          const isLast = i === train.stops.length - 1;
          const delayMin = Number(stop.delay_minutes) || 0;
          return (
            <li key={stop.station_id + i} className="flex gap-3">
              {/* spine */}
              <div className="flex flex-col items-center">
                <StopDot status={stop.status} />
                {!isLast && (
                  <div
                    className={`my-0.5 w-px flex-1 ${
                      stop.status === "departed"
                        ? "bg-steel-500"
                        : "bg-steel-500/25"
                    }`}
                    style={{ minHeight: 20 }}
                  />
                )}
              </div>

              {/* content */}
              <div className="mb-2 min-w-0 flex-1 pb-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      stop.status === "current"
                        ? "text-amber-400"
                        : stop.status === "departed"
                        ? "text-steel-500"
                        : "text-steel-300"
                    }`}
                  >
                    {stop.station_name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-steel-500">
                    {stop.station_code}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]">
                  {stop.scheduled_arrival && (
                    <span className="text-steel-500">
                      Sched: {stop.scheduled_arrival}
                    </span>
                  )}
                  {stop.predicted_arrival && stop.predicted_arrival !== stop.scheduled_arrival && (
                    <span className="font-mono text-amber-400">
                      Pred: {stop.predicted_arrival}
                    </span>
                  )}
                  {delayMin >= 1 && (
                    <span className="text-signal-red">+{delayMin}m</span>
                  )}
                  {stop.distance_from_origin_km > 0 && (
                    <span className="text-steel-500">
                      {stop.distance_from_origin_km} km
                    </span>
                  )}
                </div>
                {stop.status === "current" && stop.explanation?.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {stop.explanation.slice(0, 2).map((e, idx) => (
                      <li key={idx} className="flex items-start gap-1 text-[10px] text-amber-300/80">
                        <span>⚡</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
