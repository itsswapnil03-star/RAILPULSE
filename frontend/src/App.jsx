import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import LoadingState from "./components/LoadingState";

const PassengerView = lazy(() => import("./pages/PassengerView"));
const StationBoard   = lazy(() => import("./pages/StationBoard"));
const ControlRoom    = lazy(() => import("./pages/ControlRoom"));

const NAV = [
  { to: "/",        label: "🚂 Passenger",     end: true },
  { to: "/station", label: "🖥 Station Board" },
  { to: "/control", label: "⚙ Control Room" },
];

function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-steel-500/20 bg-navy-900/90 px-3 py-2 backdrop-blur-sm">
      <NavLink to="/" className="flex items-center gap-2">
        <span className="font-display text-lg font-bold tracking-tight text-amber-400">
          🚄 RailPulse
        </span>
        <span className="hidden text-[10px] uppercase tracking-widest text-steel-500 sm:block">
          · Dynamic ETA · SIH26028
        </span>
      </NavLink>
      <nav className="flex gap-0.5">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors focus-ring ${
                isActive
                  ? "bg-navy-700 text-amber-400"
                  : "text-steel-400 hover:bg-navy-800/60 hover:text-steel-200"
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-steel-500/15 bg-navy-900/60 px-4 py-2 text-center text-[10px] uppercase tracking-widest text-steel-600">
      SIH26028 · Dynamic Forecast of ETA for Coaching Trains · Ministry of Railways
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-navy-950 text-steel-300">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<div className="flex h-96 items-center justify-center"><LoadingState /></div>}>
            <Routes>
              <Route path="/"        element={<PassengerView />} />
              <Route path="/station" element={<StationBoard />} />
              <Route path="/control" element={<ControlRoom />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
