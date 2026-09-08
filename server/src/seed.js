import { STATIONS, TRAIN_SEEDS, stationsForDirection, TOTAL_KM } from "./data/network.js";
import { Station, Train } from "./models.js";

const MIN = 60_000;

export async function seed() {
  await Station.deleteMany({});
  await Train.deleteMany({});
  await Station.insertMany(STATIONS);

  const originMs = Date.now() - 40 * MIN;

  for (const seed of TRAIN_SEEDS) {
    const ordered = stationsForDirection(seed.direction);
    const originKm = ordered[0].km;
    const destKm = ordered[ordered.length - 1].km;
    const routeKm = Math.abs(destKm - originKm);

    let t = originMs + seed.startOffsetMin * MIN;
    const halts = ordered.map((st, i) => {
      const kmFromOrigin = Math.abs(st.km - originKm);
      const runMin = i === 0 ? 0 : Math.round((Math.abs(st.km - ordered[i - 1].km) / seed.cruiseKmh) * 60);
      if (i > 0) t += runMin * MIN;
      const arrival = t;
      const dwell = i === 0 || i === ordered.length - 1 ? 0 : seed.dwellMin;
      const departure = t + dwell * MIN;
      t = departure;
      return {
        code: st.code,
        name: st.name,
        kmFromOrigin,
        scheduledArrivalMs: arrival,
        scheduledDepartureMs: departure,
        predictedArrivalMs: arrival,
        predictedDepartureMs: departure,
        confidenceLowMs: arrival,
        confidenceHighMs: arrival,
        delayMinutes: 0,
      };
    });

    const startProgress = (seed.startOffsetMin % 180) / 220;
    const kmFromNdls =
      seed.direction === "down" ? startProgress * TOTAL_KM : TOTAL_KM * (1 - startProgress);

    await Train.create({
      number: seed.number,
      name: seed.name,
      type: seed.type,
      direction: seed.direction,
      cruiseKmh: seed.cruiseKmh,
      dwellMin: seed.dwellMin,
      kmFromNdls,
      progressPct: Math.round((Math.abs(kmFromNdls - originKm) / routeKm) * 1000) / 10,
      status: "enroute",
      currentStationCode: nearestStation(kmFromNdls).code,
      nextStationCode: ordered[1].code,
      currentDelayMin: Math.round(Math.random() * 6),
      congestionFactor: 0.1 + Math.random() * 0.15,
      weatherFactor: 0.04 + Math.random() * 0.08,
      lastEvent: "On booked path",
      destinationDelayMin: 0,
      destinationEtaMs: halts[halts.length - 1].scheduledArrivalMs,
      destinationConfidenceMin: 4,
      modelName: "pending",
      halts,
      delayHistory: [{ t: Date.now(), delayMin: 0 }],
      events: [],
    });
  }

  console.log("[seed] 8 stations, 6 trains");
}

function nearestStation(kmFromNdls) {
  return STATIONS.reduce((best, s) =>
    Math.abs(s.km - kmFromNdls) < Math.abs(best.km - kmFromNdls) ? s : best
  );
}
