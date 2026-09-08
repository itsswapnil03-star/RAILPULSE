import { useMemo, useState } from "react";
import { useNetwork } from "../NetworkContext.jsx";
import { IconClock, IconPin, IconTrain } from "../components/Icons.jsx";
import { RouteProgress, Timeline } from "../components/TrainWidgets.jsx";
import { delayLabel, formatClock, severityColor } from "../format.js";

export default function Passenger() {
  const { snapshot } = useNetwork();
  const trains = snapshot?.trains || [];
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trains.filter(
      (t) => !q || t.number.includes(q) || t.name.toLowerCase().includes(q)
    );
  }, [trains, query]);

  const train = trains.find((t) => t.number === selected) || filtered[0] || trains[0];

  if (!snapshot) {
    return <p className="p-8 text-center text-slate-500">Connecting to RailPulse simulation…</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="bg-white rounded-xl border border-slate-200 p-4 h-fit">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Find a train</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Number or name"
          className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
        />
        <ul className="mt-3 space-y-1 max-h-[28rem] overflow-auto">
          {filtered.map((t) => (
            <li key={t.number}>
              <button
                onClick={() => setSelected(t.number)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  train?.number === t.number ? "bg-rail-900 text-white" : "hover:bg-slate-100"
                }`}
              >
                <span className="font-semibold">{t.number}</span>
                <span className="block text-xs opacity-80 truncate">{t.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {train && (
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">{train.type} · {train.direction === "down" ? "Down (NDLS → BSB)" : "Up (BSB → NDLS)"}</p>
              <h2 className="text-2xl font-semibold text-rail-900">{train.number} {train.name}</h2>
            </div>
            <span className={`text-white text-sm px-3 py-1 rounded-full ${severityColor(train.severity)}`}>
              {delayLabel(train.currentDelayMin)}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <Stat icon={<IconTrain />} label="Position" value={`${train.kmFromNdls} km from NDLS`} />
            <Stat icon={<IconPin />} label="Next halt" value={train.nextStationCode} />
            <Stat
              icon={<IconClock />}
              label="Destination ETA"
              value={`${formatClock(train.destinationEtaMs)} (±${train.destinationConfidenceMin} min)`}
            />
          </div>

          <RouteProgress train={train} />
          <p className="text-sm text-slate-600">{train.lastEvent}</p>
          <Timeline train={train} />
        </section>
      )}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="border rounded-lg p-3 flex gap-2 items-start">
      <span className="text-rail-600 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
