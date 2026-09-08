import { NavLink, Outlet } from "react-router-dom";
import { useNetwork } from "../NetworkContext.jsx";

export default function Layout() {
  const { connected } = useNetwork();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-rail-900 text-white border-b border-rail-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-400 text-rail-950 grid place-items-center font-bold">
              RP
            </div>
            <div>
              <p className="font-semibold leading-tight">RailPulse</p>
              <p className="text-xs text-slate-300">Live ETA for coaching trains · SIH26028</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <Tab to="/" label="Passenger" />
            <Tab to="/station" label="Station board" />
            <Tab to="/control" label="Control room" />
          </nav>
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`} />
            <span className="text-slate-300 hidden sm:inline">{connected ? "Live feed" : "Reconnecting"}</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-slate-500 py-4 border-t bg-white">
        Ministry of Railways prototype · Simulated telemetry · No live GPS credentials required
      </footer>
    </div>
  );
}

function Tab({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `px-3 py-1.5 rounded-md ${isActive ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10"}`
      }
    >
      {label}
    </NavLink>
  );
}
