import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNetwork } from "../NetworkContext.jsx";
import { RouteProgress, Timeline } from "../components/TrainWidgets.jsx";
import { delayLabel, formatClock, severityColor } from "../format.js";

export default function TrainDetail() {
  const { number } = useParams();
  const { snapshot } = useNetwork();
  const train = snapshot?.trains?.find((t) => t.number === number);

  if (!snapshot) return <p className="p-8 text-center">Loading…</p>;
  if (!train) return <p className="p-8 text-center">Train {number} not found.</p>;

  const chart = (train.delayHistory || []).map((p) => ({
    time: new Date(p.t).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    delay: p.delayMin,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      <Link to="/control" className="text-sm text-rail-700 hover:underline">
        ← All trains
      </Link>
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-rail-900">
              {train.number} {train.name}
            </h2>
            <p className="text-sm text-slate-500">
              Model: {train.modelName} · Confidence ±{train.destinationConfidenceMin} min at destination
            </p>
          </div>
          <span className={`h-fit text-white px-3 py-1 rounded-full ${severityColor(train.severity)}`}>
            {delayLabel(train.currentDelayMin)}
          </span>
        </div>
        <RouteProgress train={train} />
        <p className="text-sm">Congestion {(train.congestionFactor * 100).toFixed(0)}% · Weather {(train.weatherFactor * 100).toFixed(0)}%</p>
      </div>

      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold mb-3">Delay history (minutes)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis unit=" m" />
              <Tooltip />
              <Line type="monotone" dataKey="delay" stroke="#1a4468" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-3">Route & predicted ETA</h3>
          <Timeline train={train} />
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-3">Recent delay events</h3>
          <ul className="text-sm space-y-2">
            {[...(train.events || [])].reverse().map((e, i) => (
              <li key={`${e.atMs}-${i}`} className="border-b pb-2">
                <span className="text-slate-500">{formatClock(e.atMs)}</span> · +{e.minutes} min · {e.label}
              </li>
            ))}
            {!train.events?.length && <li className="text-slate-500">No injected events yet — wait a few ticks.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
