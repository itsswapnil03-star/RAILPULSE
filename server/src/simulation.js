import { DELAY_EVENT_TYPES, STATIONS, TOTAL_KM, stationsForDirection } from "./data/network.js";
import { Train } from "./models.js";
import { predictEta } from "./predictorClient.js";

const TICK_MS = 3000;
const SIM_MINUTES_PER_TICK = 1.6;

export function startSimulation(io) {
  setInterval(() => {
    tick(io).catch((err) => console.error("[sim]", err.message));
  }, TICK_MS);
  console.log(`[sim] tick every ${TICK_MS}ms (~${SIM_MINUTES_PER_TICK} sim-min)`);
}

async function tick(io) {
  const trains = await Train.find();
  const now = Date.now();

  for (const train of trains) {
    decayFactors(train);
    maybeInjectEvent(train, now);
    advanceTrain(train);
    await refreshPredictions(train, now);
    recordHistory(train, now);
    await train.save();
  }

  const snapshot = await buildSnapshot();
  io.emit("network:update", snapshot);
}

function decayFactors(train) {
  train.congestionFactor = Math.max(0.04, train.congestionFactor * 0.97);
  train.weatherFactor = Math.max(0.03, train.weatherFactor * 0.985);
  if (train.currentDelayMin > 0 && Math.random() < 0.22) {
    train.currentDelayMin = Math.max(0, train.currentDelayMin - 0.35);
  }
}

function maybeInjectEvent(train, now) {
  if (Math.random() > 0.08) return;
  const spec = DELAY_EVENT_TYPES[Math.floor(Math.random() * DELAY_EVENT_TYPES.length)];
  const minutes = randBetween(spec.delayMin[0], spec.delayMin[1]);
  train.currentDelayMin += minutes;
  train.lastEvent = spec.label;
  train.events.push({ atMs: now, type: spec.type, label: spec.label, minutes });
  if (train.events.length > 12) train.events.shift();

  if (spec.type === "congestion") train.congestionFactor = Math.min(1, train.congestionFactor + 0.28);
  if (spec.type === "weather") train.weatherFactor = Math.min(1, train.weatherFactor + 0.35);
  if (spec.type === "signal") train.congestionFactor = Math.min(1, train.congestionFactor + 0.18);
}

function advanceTrain(train) {
  const ordered = stationsForDirection(train.direction);
  const originKm = ordered[0].km;
  const destKm = ordered[ordered.length - 1].km;
  const routeKm = Math.abs(destKm - originKm);

  const speedPenalty = 1 - 0.32 * train.congestionFactor - 0.18 * train.weatherFactor;
  const kmThisTick = ((train.cruiseKmh * speedPenalty) / 60) * SIM_MINUTES_PER_TICK;

  if (train.direction === "down") {
    train.kmFromNdls = Math.min(TOTAL_KM, train.kmFromNdls + kmThisTick);
    if (train.kmFromNdls >= TOTAL_KM - 1) {
      train.direction = "up";
      train.kmFromNdls = TOTAL_KM;
      train.currentDelayMin = Math.max(0, train.currentDelayMin * 0.35);
      train.lastEvent = "Turned at Varanasi — forming return working";
      rebuildHalts(train, Date.now());
    }
  } else {
    train.kmFromNdls = Math.max(0, train.kmFromNdls - kmThisTick);
    if (train.kmFromNdls <= 1) {
      train.direction = "down";
      train.kmFromNdls = 0;
      train.currentDelayMin = Math.max(0, train.currentDelayMin * 0.35);
      train.lastEvent = "Turned at New Delhi — forming Down service";
      rebuildHalts(train, Date.now());
    }
  }

  const kmFromOrigin = Math.abs(train.kmFromNdls - originKm);
  train.progressPct = Math.round((kmFromOrigin / routeKm) * 1000) / 10;
  train.progressPct = Math.max(0, Math.min(100, train.progressPct));

  const next = nextStation(train);
  const here = nearestStation(train.kmFromNdls);
  const distToStation = Math.abs(train.kmFromNdls - here.km);
  train.status = distToStation < 4 ? "at_station" : "enroute";
  train.currentStationCode = here.code;
  train.nextStationCode = next?.code || ordered[ordered.length - 1].code;
}

function rebuildHalts(train, now) {
  const ordered = stationsForDirection(train.direction);
  const originKm = ordered[0].km;
  let t = now;
  train.halts = ordered.map((st, i) => {
    const runMin =
      i === 0 ? 0 : Math.round((Math.abs(st.km - ordered[i - 1].km) / train.cruiseKmh) * 60);
    if (i > 0) t += runMin * 60_000;
    const arrival = t;
    const dwell = i === 0 || i === ordered.length - 1 ? 0 : train.dwellMin;
    const departure = t + dwell * 60_000;
    t = departure;
    return {
      code: st.code,
      name: st.name,
      kmFromOrigin: Math.abs(st.km - originKm),
      scheduledArrivalMs: arrival,
      scheduledDepartureMs: departure,
      predictedArrivalMs: arrival,
      predictedDepartureMs: departure,
      confidenceLowMs: arrival,
      confidenceHighMs: arrival,
      delayMinutes: 0,
    };
  });
}

async function refreshPredictions(train, now) {
  const results = await Promise.all(
    train.halts.map(async (halt) => {
      const station = STATIONS.find((s) => s.code === halt.code);
      const remaining = remainingKm(train, station);
      if (remaining < -2) {
        return {
          halt,
          pred: {
            predicted_epoch_ms: halt.scheduledArrivalMs + train.currentDelayMin * 60_000,
            delay_minutes: Math.round(train.currentDelayMin * 10) / 10,
            confidence_low_epoch_ms: halt.scheduledArrivalMs,
            confidence_high_epoch_ms: halt.scheduledArrivalMs,
            model_name: train.modelName,
          },
          skip: true,
        };
      }
      const pred = await predictEta({
        scheduled_epoch_ms: halt.scheduledArrivalMs,
        now_epoch_ms: now,
        distance_remaining_km: Math.max(0, remaining),
        current_delay_min: train.currentDelayMin,
        congestion_factor: train.congestionFactor,
        weather_factor: train.weatherFactor,
        cruise_speed_kmh: train.cruiseKmh,
      });
      return { halt, pred };
    })
  );

  for (const { halt, pred } of results) {
    halt.predictedArrivalMs = pred.predicted_epoch_ms;
    halt.predictedDepartureMs = pred.predicted_epoch_ms + train.dwellMin * 60_000;
    halt.confidenceLowMs = pred.confidence_low_epoch_ms;
    halt.confidenceHighMs = pred.confidence_high_epoch_ms;
    halt.delayMinutes = pred.delay_minutes;
    if (pred.model_name) train.modelName = pred.model_name;
  }

  const dest = train.halts[train.halts.length - 1];
  train.destinationEtaMs = dest.predictedArrivalMs;
  train.destinationDelayMin = dest.delayMinutes;
  train.destinationConfidenceMin = dest.confidenceHighMs
    ? Math.round((dest.confidenceHighMs - dest.predictedArrivalMs) / 60_000)
    : 4;
}

function remainingKm(train, station) {
  if (train.direction === "down") return station.km - train.kmFromNdls;
  return train.kmFromNdls - station.km;
}

function nextStation(train) {
  const ordered = stationsForDirection(train.direction);
  if (train.direction === "down") {
    return STATIONS.find((s) => s.km > train.kmFromNdls + 1) || ordered[ordered.length - 1];
  }
  const up = [...STATIONS].reverse();
  return up.find((s) => s.km < train.kmFromNdls - 1) || up[up.length - 1];
}

function nearestStation(kmFromNdls) {
  return STATIONS.reduce((best, s) =>
    Math.abs(s.km - kmFromNdls) < Math.abs(best.km - kmFromNdls) ? s : best
  );
}

function recordHistory(train, now) {
  train.delayHistory.push({ t: now, delayMin: Math.round(train.currentDelayMin * 10) / 10 });
  if (train.delayHistory.length > 48) train.delayHistory.shift();
}

function randBetween(a, b) {
  return Math.round((a + Math.random() * (b - a)) * 10) / 10;
}

export async function buildSnapshot() {
  const trains = await Train.find().lean();
  const stations = await (await import("./models.js")).Station.find().lean();
  const delayed = trains.filter((t) => t.currentDelayMin >= 5).length;
  const onTime = trains.length - delayed;
  const avg = trains.reduce((s, t) => s + t.currentDelayMin, 0) / (trains.length || 1);
  const major = trains.filter((t) => t.currentDelayMin >= 20).length;
  return {
    at: Date.now(),
    stats: {
      total: trains.length,
      onTime,
      delayed,
      major,
      averageDelayMin: Math.round(avg * 10) / 10,
    },
    stations,
    trains: trains.map(publicTrain),
  };
}

export function publicTrain(t) {
  return {
    id: String(t._id),
    number: t.number,
    name: t.name,
    type: t.type,
    direction: t.direction,
    kmFromNdls: Math.round(t.kmFromNdls * 10) / 10,
    progressPct: t.progressPct,
    status: t.status,
    currentStationCode: t.currentStationCode,
    nextStationCode: t.nextStationCode,
    currentDelayMin: Math.round(t.currentDelayMin * 10) / 10,
    congestionFactor: round2(t.congestionFactor),
    weatherFactor: round2(t.weatherFactor),
    lastEvent: t.lastEvent,
    destinationDelayMin: t.destinationDelayMin,
    destinationEtaMs: t.destinationEtaMs,
    destinationConfidenceMin: t.destinationConfidenceMin,
    modelName: t.modelName,
    severity: delayBand(t.currentDelayMin),
    halts: t.halts,
    delayHistory: t.delayHistory,
    events: t.events,
  };
}

function delayBand(min) {
  if (min < 5) return "on-time";
  if (min < 20) return "minor";
  return "major";
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
