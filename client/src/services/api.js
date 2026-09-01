const BASE = ''

export async function fetchTrains() {
  const res = await fetch(`${BASE}/api/trains`)
  if (!res.ok) throw new Error(`Failed to fetch trains: ${res.status}`)
  return res.json()
}

export async function fetchTrain(trainNumber) {
  const res = await fetch(`${BASE}/api/trains/${trainNumber}`)
  if (!res.ok) throw new Error(`Failed to fetch train ${trainNumber}: ${res.status}`)
  return res.json()
}

export async function fetchStations() {
  const res = await fetch(`${BASE}/api/stations`)
  if (!res.ok) throw new Error(`Failed to fetch stations: ${res.status}`)
  return res.json()
}

export async function fetchStationBoard(code) {
  const res = await fetch(`${BASE}/api/stations/${code}/board`)
  if (!res.ok) throw new Error(`Failed to fetch board for ${code}: ${res.status}`)
  return res.json()
}

export async function fetchPredictions(trainNumber) {
  const res = await fetch(`${BASE}/api/predictions/${trainNumber}`)
  if (!res.ok) throw new Error(`Failed to fetch predictions: ${res.status}`)
  return res.json()
}

export async function fetchNetworkStats() {
  const res = await fetch(`${BASE}/api/network/stats`)
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`)
  return res.json()
}

export async function fetchCorridorTrend(corridor = 'CSMT-SUR', days = 7) {
  const res = await fetch(`${BASE}/api/analytics/corridor-trend?corridor=${encodeURIComponent(corridor)}&days=${days}`)
  if (!res.ok) throw new Error(`Failed to fetch corridor trend: ${res.status}`)
  return res.json()
}

export async function fetchSimulationStatus() {
  const res = await fetch(`${BASE}/api/simulation/status`)
  if (!res.ok) throw new Error(`Failed to fetch simulation status: ${res.status}`)
  return res.json()
}

export async function resetSimulation() {
  const res = await fetch(`${BASE}/api/simulation/reset`, { method: 'POST' })
  if (!res.ok) throw new Error(`Failed to reset: ${res.status}`)
  return res.json()
}

export async function injectSimulationEvent(trainNumber, eventType, description) {
  const res = await fetch(`${BASE}/api/simulation/inject-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trainNumber, eventType, description })
  })
  if (!res.ok) throw new Error(`Failed to inject event: ${res.status}`)
  return res.json()
}

export async function executeResolutionAction(actionPayload) {
  const res = await fetch(`${BASE}/api/simulation/execute-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(actionPayload)
  })
  if (!res.ok) throw new Error(`Failed to execute resolution action: ${res.status}`)
  return res.json()
}

export function interpolateTrainPosition(train, stationsMap) {
  if (!train) return [18.9402, 72.8356];
  const run = train.currentRun || train;
  const schedule = train.schedule || run.stationLog;
  if (!schedule || schedule.length === 0) return [18.9402, 72.8356];

  const currentKm = run.currentKm || 0;
  const originCode = schedule[0].stationCode;
  const originStation = stationsMap.get(originCode);

  if (currentKm <= 0 && originStation) {
    return [originStation.lat, originStation.lng];
  }

  for (let i = 0; i < schedule.length - 1; i++) {
    const s1 = schedule[i];
    const s2 = schedule[i + 1];
    const km1 = s1.kmFromStart || 0;
    const km2 = s2.kmFromStart || (km1 + 50);

    if (currentKm >= km1 && currentKm <= km2) {
      const st1 = stationsMap.get(s1.stationCode);
      const st2 = stationsMap.get(s2.stationCode);
      if (!st1 || !st2) return [19.0, 73.5];

      const segmentLength = Math.max(1, km2 - km1);
      const progress = (currentKm - km1) / segmentLength;

      const lat = st1.lat + (st2.lat - st1.lat) * progress;
      const lng = st1.lng + (st2.lng - st1.lng) * progress;
      return [lat, lng];
    }
  }

  const lastStop = schedule[schedule.length - 1];
  const lastStation = stationsMap.get(lastStop.stationCode);
  if (lastStation) return [lastStation.lat, lastStation.lng];

  return [18.9402, 72.8356];
}
