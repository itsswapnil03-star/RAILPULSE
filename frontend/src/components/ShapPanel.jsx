/**
 * ShapPanel — SHAP-derived plain-language explanations.
 * Highlights the top 2–3 factors that caused this train's predicted delay.
 * These reach the frontend from the ML pipeline via the WebSocket payload.
 */
export default function ShapPanel({ train }) {
  if (!train) return null;
  const { explanation = [], explanation_factors = [], predicted_delay_min, confidence_low, confidence_high, predicted_eta } = train;

  return (
    <div className="space-y-3">
      {/* ETA card */}
      <div className="border border-amber-500/30 bg-navy-800/80 p-3">
        <p className="mb-1 text-[10px] uppercase tracking-widest text-steel-500">AI-Predicted ETA</p>
        <p className="font-display text-3xl font-bold text-amber-400">{predicted_eta ?? "—"}</p>
        <p className="mt-1 text-[10px] text-steel-400">
          <span className="text-amber-300">+{Number(predicted_delay_min).toFixed(0)} min</span>
          {" "}delay ·{" "}
          <span className="font-mono">
            [{Number(confidence_low).toFixed(0)}–{Number(confidence_high).toFixed(0)} min]
          </span>{" "}
          confidence range
        </p>
      </div>

      {/* SHAP explanation */}
      <div>
        <p className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-widest text-steel-500">
          <span>⚙</span> Why this delay?
          <span className="ml-auto text-[9px]">Powered by SHAP</span>
        </p>
        {explanation.length === 0 && (
          <p className="text-xs text-steel-500">No significant factors detected.</p>
        )}
        <ol className="space-y-2">
          {explanation_factors.slice(0, 3).map((f, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[9px] font-bold text-amber-400">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-steel-300">{f.phrase}</p>
              </div>
            </li>
          ))}
          {explanation.length > 0 && explanation_factors.length === 0 &&
            explanation.slice(0, 3).map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[9px] font-bold text-amber-400">
                  {i + 1}
                </span>
                <p className="text-xs text-steel-300">{e}</p>
              </li>
            ))}
        </ol>
      </div>

      {/* Speed / status */}
      <div className="grid grid-cols-2 gap-2 border-t border-steel-500/15 pt-2">
        {[
          { label: "Speed", val: `${Number(train.speed_kmph).toFixed(0)} km/h` },
          { label: "Progress", val: `${(train.route_progress * 100).toFixed(0)}%` },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[10px] uppercase tracking-widest text-steel-500">{s.label}</p>
            <p className="font-mono text-sm font-semibold text-steel-300">{s.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
