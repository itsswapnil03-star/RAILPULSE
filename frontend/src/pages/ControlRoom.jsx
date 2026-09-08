import { useState, useMemo, useEffect, Suspense, lazy } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useWebSocket } from "../hooks/useWebSocket";
import { useCorridors, useStations, useTrainDetail } from "../hooks/useTrainData";
import { statusOf } from "../utils/format";
import { CORRIDOR_LABELS } from "../utils/constants";
import LiveBadge from "../components/LiveBadge";
import StatusChip from "../components/StatusChip";
import ShapPanel from "../components/ShapPanel";
import TrainTimeline from "../components/TrainTimeline";
import LoadingState from "../components/LoadingState";

const RailMap = lazy(() => import("../components/RailMap"));

function NetworkBar({ summary }) {
  if (!summary) return null;
  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-steel-500/15 bg-navy-900/60 px-4 py-2">
      {[
        { label: "Active", val: summary.active_trains, color: "text-steel-200" },
        { label: "On time", val: summary.on_time, color: "text-signal-green" },
        { label: "Delayed", val: summary.delayed, color: "text-amber-400" },
        { label: "Heavy", val: summary.heavily_delayed, color: "text-signal-red" },
        { label: "Avg delay", val: `${summary.average_delay_min}m`, color: "text-amber-300" },
        { label: "Max delay", val: `${summary.max_delay_min}m`, color: "text-signal-red" },
        { label: "Congested junctions", val: summary.junctions_congested, color: "text-steel-400" },
      ].map((s) => (
        <div key={s.label} className="flex flex-col">
          <span className={`font-display text-xl font-bold leading-none ${s.color}`}>{s.val}</span>
          <span className="mt-0.5 text-[9px] uppercase tracking-widest text-steel-600">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function DelayChart({ liveData }) {
  const data = useMemo(
    () =>
      liveData.slice(-60).map((p) => ({
        time: new Date(p.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        "Avg delay": +Number(p.average_delay_min).toFixed(1),
        "Delayed": p.delayed,
        "On time": p.on_time,
      })),
    [liveData]
  );

  if (data.length < 3) {
    return (
      <div className="flex h-36 items-center justify-center text-xs text-steel-500">
        Accumulating data…
      </div>
    );
  }

  return (
    <div className="border-t border-steel-500/15 p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-steel-500">
        Network delay trend
      </p>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={data}>
          <XAxis dataKey="time" tick={{ fontSize: 8, fill: "#5b6b7a" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 8, fill: "#5b6b7a" }} tickLine={false} axisLine={false} width={24} />
          <Tooltip contentStyle={{ background: "#0c1424", border: "1px solid rgba(232,163,23,0.3)", fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 9, color: "#8b9aab" }} />
          <Line type="monotone" dataKey="Avg delay" stroke="#f0b429" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Delayed" stroke="#e85d4c" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
          <Line type="monotone" dataKey="On time" stroke="#3dcc8a" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrainRow({ train, onClick, selected }) {
  const meta = statusOf(train);
  return (
    <tr
      onClick={() => onClick(train)}
      className={`cursor-pointer border-b border-steel-500/10 text-xs transition-colors hover:bg-navy-800/40 ${selected ? "bg-navy-700/50" : ""}`}
    >
      <td className="px-2 py-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
      </td>
      <td className="px-2 py-1.5 font-mono text-steel-300">{train.number}</td>
      <td className="max-w-[140px] truncate px-2 py-1.5 text-steel-200">{train.name}</td>
      <td className="hidden px-2 py-1.5 text-steel-500 xl:table-cell">
        {CORRIDOR_LABELS[train.corridor]?.split("→")[1]?.trim() ?? "—"}
      </td>
      <td className="px-2 py-1.5"><StatusChip train={train} compact /></td>
      <td className="px-2 py-1.5 font-mono text-amber-400">{train.predicted_eta ?? "—"}</td>
    </tr>
  );
}

export default function ControlRoom() {
  const { trains, summary, events, connected, error } = useWebSocket();
  const corridors = useCorridors();
  const { stations } = useStations();
  const [selectedId, setSelectedId] = useState(null);
  const [corridorFilter, setCorridorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trendHistory, setTrendHistory] = useState([]);

  useEffect(() => {
    if (!summary) return;
    setTrendHistory((prev) =>
      [...prev, { ...summary, timestamp: new Date().toISOString() }].slice(-80)
    );
  }, [summary]);

  const { detail, loading: detailLoading } = useTrainDetail(selectedId);
  const selectedTrain = useMemo(() => trains.find((t) => t.train_id === selectedId), [trains, selectedId]);

  const filtered = useMemo(() => {
    let list = trains;
    if (corridorFilter !== "all") list = list.filter((t) => t.corridor === corridorFilter);
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    return list;
  }, [trains, corridorFilter, statusFilter]);

  return (
    <div className="flex h-[calc(100vh-86px)] flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-steel-500/15 bg-navy-900/80 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-bold uppercase tracking-widest text-amber-400">Control Room</span>
          <LiveBadge connected={connected} error={error} />
        </div>
        <div className="flex gap-2">
          <select
            value={corridorFilter}
            onChange={(e) => setCorridorFilter(e.target.value)}
            className="border border-steel-500/25 bg-navy-800 px-2 py-1 text-xs text-steel-300 outline-none"
          >
            <option value="all">All corridors</option>
            {Object.entries(CORRIDOR_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-steel-500/25 bg-navy-800 px-2 py-1 text-xs text-steel-300 outline-none"
          >
            <option value="all">All statuses</option>
            <option value="on_time">On time</option>
            <option value="delayed">Delayed</option>
            <option value="heavily_delayed">Heavy delay</option>
          </select>
        </div>
      </div>

      <NetworkBar summary={summary} />

      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Map */}
        <div className="relative flex-1 card min-w-0 overflow-hidden">
          {trains.length === 0 && <LoadingState label="Waiting for live data…" />}
          <Suspense fallback={<LoadingState label="Loading map…" />}>
            <RailMap
              trains={filtered}
              selectedTrain={selectedId}
              setSelectedTrain={(t) => setSelectedId((p) => (p === t.train_id ? null : t.train_id))}
              corridors={corridors}
              stations={stations || []}
              showStations
            />
          </Suspense>
        </div>

        {/* Right panel */}
        <div className="flex w-96 flex-col gap-4 overflow-hidden">
          {selectedId && selectedTrain ? (
            <div className="flex-1 card overflow-y-auto">
              <div className="flex items-center justify-between border-b border-steel-500/15 p-3">
                <p className="font-display text-xs font-semibold uppercase tracking-widest text-steel-400">Train detail</p>
                <button onClick={() => setSelectedId(null)} className="text-xs text-steel-500 hover:text-steel-300">✕</button>
              </div>
              <div className="p-3"><ShapPanel train={selectedTrain} /></div>
              {detailLoading && <LoadingState label="Loading route…" />}
              {!detailLoading && detail && <TrainTimeline train={detail} liveState={selectedTrain} />}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-navy-900/60">
              <p className="border-b border-steel-500/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-steel-500">
                {filtered.length} trains · click to inspect
              </p>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-steel-500/15">
                    {["", "#", "Name", "To", "Status", "ETA"].map((h, i) => (
                      <th key={i} className={`px-2 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-steel-600 ${i === 3 ? "hidden xl:table-cell" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <TrainRow key={t.train_id} train={t} onClick={(t) => setSelectedId(t.train_id)} selected={t.train_id === selectedId} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DelayChart liveData={trendHistory} />

          {events.length > 0 && (
            <div className="max-h-28 overflow-y-auto border-t border-steel-500/15 bg-navy-950/80 shrink-0">
              <p className="px-3 py-1 text-[9px] uppercase tracking-widest text-steel-600">Live events</p>
              {events.slice(0, 10).map((ev, i) => (
                <div key={i} className="flex items-start gap-2 border-b border-steel-500/10 px-3 py-1.5 text-[10px]">
                  <span className="shrink-0 text-amber-400">⚡</span>
                  <span className="text-steel-400">
                    <span className="font-mono text-steel-300">{ev.train_id}</span>{" "}
                    {(ev.event_type || "").replace(/_/g, " ")} @ {ev.station_id ?? "en route"}{" "}
                    <span className="text-signal-red">+{ev.delay_minutes}m</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
