import { useState, useMemo, Suspense, lazy } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useStations, useCorridors, useTrainDetail } from "../hooks/useTrainData";
import { statusOf } from "../utils/format";
import { CORRIDOR_LABELS } from "../utils/constants";
import LiveBadge from "../components/LiveBadge";
import StatusChip from "../components/StatusChip";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import TrainTimeline from "../components/TrainTimeline";
import ShapPanel from "../components/ShapPanel";

const RailMap = lazy(() => import("../components/RailMap"));

export default function PassengerView() {
  const { trains, summary, connected, error } = useWebSocket();
  const { stations, loading: stLoading, error: stError } = useStations();
  const corridors = useCorridors();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [corridorFilter, setCorridorFilter] = useState("all");

  const { detail, loading: detailLoading } = useTrainDetail(selectedId);
  const selectedTrain = useMemo(
    () => trains.find((t) => t.train_id === selectedId),
    [trains, selectedId]
  );

  const filtered = useMemo(() => {
    let list = trains;
    if (corridorFilter !== "all") list = list.filter((t) => t.corridor === corridorFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.number.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          (t.origin_name || "").toLowerCase().includes(q) ||
          (t.destination_name || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [trains, corridorFilter, search]);

  return (
    <div className="flex h-[calc(100vh-86px)] flex-col overflow-hidden lg:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full flex-col border-b border-steel-500/20 bg-navy-900/70 lg:w-80 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-steel-500/15 p-3">
          <span className="font-display text-xs font-semibold uppercase tracking-widest text-steel-400">
            Trains ({filtered.length})
          </span>
          <LiveBadge connected={connected} error={error} />
        </div>

        <div className="space-y-2 p-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search number or name…"
            className="focus-ring w-full border border-steel-500/30 bg-navy-800 px-3 py-2 text-xs text-steel-300 placeholder:text-steel-500 outline-none"
          />
          <select
            value={corridorFilter}
            onChange={(e) => setCorridorFilter(e.target.value)}
            className="focus-ring w-full border border-steel-500/30 bg-navy-800 px-3 py-2 text-xs text-steel-300 outline-none"
          >
            <option value="all">All corridors</option>
            {Object.entries(CORRIDOR_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {stLoading && !trains.length && <LoadingState label="Loading trains…" />}
          {stError && <ErrorState title="Station data unavailable" />}
          {!stLoading && filtered.length === 0 && (
            <p className="p-4 text-center text-xs text-steel-500">No trains match.</p>
          )}
          {filtered.map((t) => {
            const meta = statusOf(t);
            const active = t.train_id === selectedId;
            return (
              <button
                key={t.train_id}
                onClick={() => setSelectedId(active ? null : t.train_id)}
                className={`focus-ring flex w-full items-start gap-3 border-b border-steel-500/10 p-3 text-left transition-colors hover:bg-navy-800/60 ${active ? "bg-navy-700/50" : ""}`}
              >
                <span className="mt-1 h-3 w-1.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="truncate text-xs font-semibold text-steel-300">{t.name}</span>
                    <span className="shrink-0 font-mono text-[10px] text-steel-500">#{t.number}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-steel-500">
                    {t.origin_name} → {t.destination_name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <StatusChip train={t} compact />
                    {t.predicted_eta && (
                      <span className="font-mono text-[10px] text-steel-400">ETA {t.predicted_eta}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {summary && (
          <div className="grid grid-cols-3 divide-x divide-steel-500/20 border-t border-steel-500/20 bg-navy-900/80">
            {[
              { label: "On time", val: summary.on_time, color: "text-signal-green" },
              { label: "Delayed", val: summary.delayed, color: "text-amber-400" },
              { label: "Avg delay", val: `${summary.average_delay_min}m`, color: "text-steel-300" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center py-2">
                <span className={`font-display text-lg font-bold ${s.color}`}>{s.val}</span>
                <span className="text-[10px] uppercase tracking-widest text-steel-500">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Map + detail */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="relative flex-1">
          {trains.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-950/80">
              <LoadingState label="Connecting to live network…" />
            </div>
          )}
          <Suspense fallback={<LoadingState label="Loading map…" />}>
            <RailMap
              trains={filtered}
              selectedTrain={selectedId}
              setSelectedTrain={(t) => setSelectedId((p) => (p === t.train_id ? null : t.train_id))}
              corridors={corridors}
              stations={stations}
              showStations
            />
          </Suspense>
        </div>

        {selectedTrain && (
          <div className="h-64 overflow-y-auto border-t border-steel-500/20 bg-navy-900/90 lg:h-72">
            {detailLoading && <LoadingState label="Loading train detail…" />}
            {!detailLoading && detail && (
              <div className="flex h-full">
                <div className="flex-1 overflow-y-auto border-r border-steel-500/15">
                  <TrainTimeline train={detail} liveState={selectedTrain} />
                </div>
                <div className="w-64 shrink-0 overflow-y-auto p-3 lg:w-80">
                  <ShapPanel train={selectedTrain} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
