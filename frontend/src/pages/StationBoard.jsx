import { useState, useMemo, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useStations } from "../hooks/useTrainData";
import { statusOf } from "../utils/format";
import LiveBadge from "../components/LiveBadge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function hashCode(str) {
  let h = 0;
  for (const c of str) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return h;
}

function BoardRow({ entry, idx }) {
  const meta = statusOf(entry);
  const delay = Number(entry.delay_minutes) || 0;
  return (
    <tr className={`border-b border-steel-500/10 transition-colors ${idx % 2 === 0 ? "bg-navy-900/25" : ""} hover:bg-navy-800/40`}>
      <td className="px-4 py-3 font-mono text-base font-bold text-amber-400 tabular-nums">
        {entry.due_predicted || entry.predicted_eta || "—"}
      </td>
      <td className="px-4 py-3">
        <p className="font-display text-sm font-semibold text-steel-100">{entry.name}</p>
        <p className="text-[10px] text-steel-500">#{entry.number} · {entry.train_type}</p>
      </td>
      <td className="hidden px-4 py-3 text-xs text-steel-400 md:table-cell">{entry.origin_name}</td>
      <td className="px-4 py-3 text-xs text-steel-400">{entry.destination_name}</td>
      <td className="px-4 py-3">
        <span className={`${meta.badge} px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider`}>
          {delay >= 1 ? `+${delay.toFixed(0)} min` : "On time"}
        </span>
      </td>
      <td className="px-4 py-3 text-center font-mono text-sm font-bold text-steel-200">
        {entry.platform}
      </td>
      <td className="hidden max-w-[220px] truncate px-4 py-3 text-[11px] text-amber-300/70 lg:table-cell">
        {entry.explanation?.[0] || "—"}
      </td>
    </tr>
  );
}

export default function StationBoard() {
  const { trains, connected, error } = useWebSocket();
  const { stations, loading: stLoading, error: stError } = useStations();
  const [stationId, setStationId] = useState("CST");
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Build board purely from live WS data — no REST poll
  const board = useMemo(() => {
    if (!stationId) return [];
    return trains
      .filter(
        (t) =>
          t.current_station_id === stationId ||
          t.next_station_id === stationId ||
          t.origin_station_id === stationId ||
          t.destination_station_id === stationId
      )
      .map((t) => ({
        ...t,
        due_predicted: t.next_station_id === stationId ? t.predicted_eta : t.scheduled_arrival,
        platform: (Math.abs(hashCode(t.train_id + stationId)) % 8) + 1,
      }))
      .sort((a, b) =>
        (a.due_predicted ?? "99:99").localeCompare(b.due_predicted ?? "99:99")
      )
      .slice(0, 22);
  }, [trains, stationId]);

  const selectedStation = useMemo(
    () => stations.find((s) => s.id === stationId),
    [stations, stationId]
  );

  return (
    <div className="min-h-[calc(100vh-86px)] board-scan bg-navy-950">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-500/20 bg-navy-900/80 px-4 py-3">
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-widest text-amber-400">
            {selectedStation?.name ?? stationId}
          </p>
          <p className="text-xs text-steel-500">
            {selectedStation?.code} · {selectedStation?.city} · Platform Departure Board
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <LiveBadge connected={connected} error={error} />
          <span className="font-mono text-3xl font-bold tabular-nums text-amber-400">
            {clock.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
          </span>
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="focus-ring border border-steel-500/30 bg-navy-800 px-3 py-1.5 text-xs text-steel-300 outline-none"
          >
            {stLoading && <option>Loading…</option>}
            {stations.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
      </div>

      {stError && <ErrorState title="Station data unavailable" detail={stError} />}

      {!stError && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-steel-500/20 bg-navy-900/50">
                {["ETA", "Train", "From", "To", "Status", "Pf", "AI Reason"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-steel-500 ${
                      i === 2 ? "hidden md:table-cell" : i === 6 ? "hidden lg:table-cell" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!connected && trains.length === 0 && (
                <tr><td colSpan={7} className="py-20 text-center"><LoadingState label="Connecting to live feed…" /></td></tr>
              )}
              {connected && board.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-steel-500">
                    No trains due at this station right now.
                  </td>
                </tr>
              )}
              {board.map((entry, i) => (
                <BoardRow key={entry.train_id} entry={entry} idx={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="p-4 text-center text-[10px] uppercase tracking-widest text-steel-700">
        AI-predicted ETAs · Simulation data — not connected to live CRIS/RTIS
      </p>
    </div>
  );
}
