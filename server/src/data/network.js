/** New Delhi → Varanasi coaching corridor (8 stations). Distances are approximate sectional km. */

export const STATIONS = [
  { code: "NDLS", name: "New Delhi", km: 0, state: "Delhi" },
  { code: "GZB", name: "Ghaziabad", km: 25, state: "Uttar Pradesh" },
  { code: "ALJN", name: "Aligarh Junction", km: 131, state: "Uttar Pradesh" },
  { code: "TDL", name: "Tundla Junction", km: 204, state: "Uttar Pradesh" },
  { code: "CNB", name: "Kanpur Central", km: 440, state: "Uttar Pradesh" },
  { code: "FTP", name: "Fatehpur", km: 518, state: "Uttar Pradesh" },
  { code: "PRYJ", name: "Prayagraj Junction", km: 635, state: "Uttar Pradesh" },
  { code: "BSB", name: "Varanasi Junction", km: 760, state: "Uttar Pradesh" },
];

export const TOTAL_KM = STATIONS[STATIONS.length - 1].km;

export const DELAY_EVENT_TYPES = [
  { type: "signal", label: "Signal caution / automatic signalling failure", delayMin: [6, 14] },
  { type: "congestion", label: "Congestion at junction / platform occupancy", delayMin: [8, 18] },
  { type: "weather", label: "Weather slowdown (fog / heavy rain)", delayMin: [5, 16] },
  { type: "restriction", label: "Temporary speed restriction on section", delayMin: [4, 10] },
];

/**
 * Six coaching trains. Timetables are demo schedules anchored to a rolling
 * simulation clock, not live NTES. Some trains run Down (NDLS→BSB), others Up.
 */
export const TRAIN_SEEDS = [
  {
    number: "22435",
    name: "New Delhi – Varanasi Vande Bharat",
    type: "Vande Bharat",
    direction: "down",
    cruiseKmh: 92,
    startOffsetMin: 12,
    dwellMin: 2,
  },
  {
    number: "12582",
    name: "Banaras SF Express",
    type: "Superfast",
    direction: "down",
    cruiseKmh: 72,
    startOffsetMin: 95,
    dwellMin: 4,
  },
  {
    number: "12381",
    name: "Poorva Express",
    type: "Superfast",
    direction: "down",
    cruiseKmh: 70,
    startOffsetMin: 210,
    dwellMin: 5,
  },
  {
    number: "15126",
    name: "Patna – New Delhi Jan Shatabdi (demo path)",
    type: "Jan Shatabdi",
    direction: "up",
    cruiseKmh: 68,
    startOffsetMin: 40,
    dwellMin: 3,
  },
  {
    number: "12876",
    name: "Neelachal Express",
    type: "Superfast",
    direction: "up",
    cruiseKmh: 68,
    startOffsetMin: 155,
    dwellMin: 4,
  },
  {
    number: "12418",
    name: "Prayagraj Express",
    type: "Superfast",
    direction: "up",
    cruiseKmh: 74,
    startOffsetMin: 280,
    dwellMin: 3,
  },
];

export function stationsForDirection(direction) {
  return direction === "up" ? [...STATIONS].reverse() : STATIONS;
}

export function kmAlongRoute(direction, kmFromNdls) {
  return direction === "up" ? TOTAL_KM - kmFromNdls : kmFromNdls;
}
