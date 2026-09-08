import { Link } from "react-router-dom";
import { useNetwork } from "../NetworkContext.jsx";
import { delayLabel, formatClock, severityColor } from "../format.js";
import CorridorMap from "../components/CorridorMap.jsx";

export default function ControlRoom() {
  const { snapshot } = useNetwork();
  if (!snapshot) return <p className="p-8 text-center text-slate-500">Connecting to control feed…</p>;
  const { stats, trains } = snapshot;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="On time (< 5 min)" value={stats.onTime} tone="text-emerald-700 bg-emerald-50" />
        <Kpi label="Delayed" value={stats.delayed} tone="text-amber-800 bg-amber-50" />
        <Kpi label="Major delay (≥ 20 min)" value={stats.major} tone="text-red-700 bg-red-50" />
        <Kpi label="Average network delay" value={`${stats.averageDelayMin} min`} tone="text-rail-800 bg-slate-100" />
      </div>

      <CorridorMap trains={trains} stations={snapshot.stations} />

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-rail-900 text-white text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Train</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Direction</th>
              <th className="px-4 py-3 font-medium">Delay</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Next</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Dest ETA</th>
              <th className="px-4 py-3 font-medium">Event</th>
            </tr>
          </thead>
          <tbody>
            {trains.map((t) => (
              <tr key={t.number} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/control/${t.number}`} className="font-semibold text-rail-800 hover:underline">
                    {t.number}
                  </Link>
                  <p className="text-xs text-slate-500">{t.name}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell uppercase">{t.direction}</td>
                <td className="px-4 py-3">
                  <span className={`text-white text-xs px-2 py-0.5 rounded-full ${severityColor(t.severity)}`}>
                    {delayLabel(t.currentDelayMin)}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">{t.nextStationCode}</td>
                <td className="px-4 py-3 hidden lg:table-cell">{formatClock(t.destinationEtaMs)}</td>
                <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{t.lastEvent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }) {
  return (
    <div className={`rounded-xl p-4 ${tone}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
