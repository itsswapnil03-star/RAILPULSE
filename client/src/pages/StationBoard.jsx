import { useEffect, useState } from "react";
import { API_BASE } from "../config.js";
import { useNetwork } from "../NetworkContext.jsx";
import { delayLabel, formatClock } from "../format.js";

export default function StationBoard() {
  const { snapshot } = useNetwork();
  const stations = snapshot?.stations || [];
  const [code, setCode] = useState("CNB");
  const [board, setBoard] = useState(null);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/stations/${code}/board`)
      .then((r) => r.json())
      .then(setBoard)
      .catch(() => {});
  }, [code, snapshot]);

  if (!snapshot) return <p className="p-8 text-center text-slate-500">Connecting…</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Platform-style arrivals for the next working of each rake</p>
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          {stations.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-[#071018] text-amberled rounded-xl overflow-hidden shadow-xl border border-slate-800">
        <div className="board-scan px-5 py-4 flex items-end justify-between border-b border-white/10">
          <div>
            <p className="text-[11px] tracking-[0.35em] text-amber-200/70 uppercase">Indian Railways · Live arrivals</p>
            <h2 className="font-led text-2xl sm:text-4xl font-semibold text-amber-300 mt-1">
              {board?.station?.name || "—"}
            </h2>
          </div>
          <p className="font-led text-xl sm:text-3xl text-amber-200">
            {new Date(snapshot.at).toLocaleTimeString("en-IN", { hour12: false })}
          </p>
        </div>
        <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2 text-[11px] tracking-widest uppercase text-amber-200/60 font-led">
          <span className="col-span-2">Train</span>
          <span className="col-span-4">Name</span>
          <span className="col-span-2">Sched</span>
          <span className="col-span-2">ETA</span>
          <span className="col-span-2">Status</span>
        </div>
        <ul>
          {(board?.rows || []).map((row) => {
            const late = row.delayMinutes >= 5;
            return (
              <li
                key={row.trainNumber}
                className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 px-5 py-3 border-t border-white/10 font-led text-lg sm:text-xl"
              >
                <span className="col-span-2 text-amber-300">{row.trainNumber}</span>
                <span className="col-span-4 text-amber-100 truncate">{row.trainName}</span>
                <span className="col-span-2 text-amber-200/80">{formatClock(row.scheduledArrivalMs)}</span>
                <span className={`col-span-2 ${late ? "text-red-400" : "text-emerald-400"}`}>
                  {formatClock(row.predictedArrivalMs)} {delayLabel(row.delayMinutes)}
                </span>
                <span className="col-span-2 text-amber-200/90 text-base sm:text-lg">{row.status}</span>
              </li>
            );
          })}
        </ul>
        <p className="px-5 py-3 text-xs text-amber-200/50 border-t border-white/10">
          Predicted times include congestion and weather factors. Figures update continuously.
        </p>
      </div>
    </div>
  );
}
