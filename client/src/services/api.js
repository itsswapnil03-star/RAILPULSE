import { FALLBACK_STATIONS, FALLBACK_TRAINS, FALLBACK_ALERTS, FALLBACK_NETWORK_STATS } from '../data/fallbackData';

const BASE = import.meta.env.VITE_API_URL || '';

async function safeFetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchTrains() {
  const data = await safeFetchJson(`${BASE}/api/trains`);
  if (Array.isArray(data) && data.length > 0) return data;
  return FALLBACK_TRAINS;
}
 
export async function fetchTrain(trainNumber) {
  const data = await safeFetchJson(`${BASE}/api/trains/${trainNumber}`);
  if (data && data.trainNumber) return data;
  const match = FALLBACK_TRAINS.find(t => t.trainNumber === trainNumber);
  return match || FALLBACK_TRAINS[0];
}
 
export async function fetchStations() {
  const data = await safeFetchJson(`${BASE}/api/stations`);
  if (Array.isArray(data) && data.length > 0) return data;
  return FALLBACK_STATIONS;
}
 
export async function fetchStationBoard(code) {
  const data = await safeFetchJson(`${BASE}/api/stations/${code}/board`);
  if (data && Array.isArray(data.arrivals)) return data;
  // Dynamic fallback station board
  const station = FALLBACK_STATIONS.find(s => s.code === code) || FALLBACK_STATIONS[0];
  const arrivals = FALLBACK_TRAINS.filter(t => {
    const log = t.currentRun?.stationLog || [];
    return log.some(s => s.stationCode === code);
  }).map((t, idx) => {
    const halt = (t.currentRun?.stationLog || []).find(s => s.stationCode === code);
    return {
      trainNumber: t.trainNumber,
      trainName: t.name,
      platform: (idx % 4) + 1,
      scheduledTime: halt?.scheduledArrival || '08:30',
      expectedTime: halt?.scheduledArrival || '08:30',
      delayMinutes: t.currentDelay || 0,
      status: (t.currentDelay || 0) > 5 ? 'Delayed' : 'On Time'
    };
  });
  return { station, arrivals };
}
 
export async function fetchPredictions(trainNumber) {
  const data = await safeFetchJson(`${BASE}/api/predictions/${trainNumber}`);
  if (data && Array.isArray(data)) return data;
  if (data && Array.isArray(data.predictions)) return data.predictions;
  const match = FALLBACK_TRAINS.find(t => t.trainNumber === trainNumber) || FALLBACK_TRAINS[0];
  const log = match.currentRun?.stationLog || [];
  return log.map((s, idx) => ({
    stationCode: s.stationCode,
    stationName: s.stationName,
    predictedDelayMinutes: (match.currentDelay || 0) + idx * 2,
    confidenceLower: Math.max(0, (match.currentDelay || 0) + idx * 2 - 3),
    confidenceUpper: (match.currentDelay || 0) + idx * 2 + 5,
    topFactors: [
      { factorName: 'Track Congestion', impactMinutes: 3.2 },
      { factorName: 'Weather Caution', impactMinutes: 2.1 }
    ]
  }));
}
 
export async function fetchNetworkStats() {
  const data = await safeFetchJson(`${BASE}/api/network/stats`);
  if (data && typeof data.totalActive === 'number') return data;
  return FALLBACK_NETWORK_STATS;
}
 
export async function fetchCorridorTrend(corridor = 'CSMT-SUR', days = 7) {
  const data = await safeFetchJson(`${BASE}/api/analytics/corridor-trend?corridor=${encodeURIComponent(corridor)}&days=${days}`);
  if (Array.isArray(data)) return data;
  return [
    { date: 'Day -6', avgDelay: 4.2 },
    { date: 'Day -5', avgDelay: 5.1 },
    { date: 'Day -4', avgDelay: 8.3 },
    { date: 'Day -3', avgDelay: 6.0 },
    { date: 'Day -2', avgDelay: 3.8 },
    { date: 'Day -1', avgDelay: 5.4 },
    { date: 'Today', avgDelay: 7.2 }
  ];
}
 
export async function fetchSimulationStatus() {
  const data = await safeFetchJson(`${BASE}/api/simulation/status`);
  if (data && data.simulatedTime) return data;
  return {
    simulatedTime: new Date().toISOString(),
    tickCount: 120,
    timeMultiplier: 15,
    recentEvents: []
  };
}
 
export async function resetSimulation() {
  try {
    const res = await fetch(`${BASE}/api/simulation/reset`, { method: 'POST' });
    return await res.json();
  } catch (e) {
    return { success: true, message: 'Simulation reset (client fallback)' };
  }
}
 
export async function injectSimulationEvent(trainNumber, eventType, description) {
  try {
    const res = await fetch(`${BASE}/api/simulation/inject-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainNumber, eventType, description })
    });
    return await res.json();
  } catch (e) {
    return { success: true, message: `Injected event ${eventType} into train ${trainNumber} (client fallback)` };
  }
}
 
export async function executeResolutionAction(actionPayload) {
  try {
    const res = await fetch(`${BASE}/api/simulation/execute-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionPayload)
    });
    return await res.json();
  } catch (e) {
    return { success: true, message: 'Resolution action executed (client fallback)' };
  }
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
 
