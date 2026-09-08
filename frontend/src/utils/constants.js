export const API_BASE = "/api";

export const WS_URL = "ws://localhost:8000/ws/trains";

export const INDIA_CENTER = [22.0, 79.0];
export const INDIA_BOUNDS = [
  [5.0, 68.0],
  [36.0, 97.0],
];

export const STATUS_META = {
  on_time: { label: "On time", color: "#3dcc8a", badge: "bg-signal-green/15 text-signal-green" },
  delayed: { label: "Delayed", color: "#f0b429", badge: "bg-amber-500/15 text-amber-400" },
  heavily_delayed: { label: "Heavy delay", color: "#e85d4c", badge: "bg-signal-red/15 text-signal-red" },
  arrived: { label: "Arrived", color: "#8b9aab", badge: "bg-steel-500/20 text-steel-300" },
};

export const CORRIDOR_LABELS = {
  mumbai_cst_nagpur: "Mumbai CST → Nagpur",
  mumbai_cst_kolhapur: "Mumbai CST → Kolhapur",
  mumbai_central_ahmedabad: "Mumbai Central suburban",
  pune_nagpur: "Pune → Nagpur",
  mumbai_cst_solapur: "Mumbai CST → Solapur / Nagpur",
};

// Updated: Light-themed map tiles for white background
export const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
export const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
