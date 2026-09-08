import Station from '../models/Station.js';
import Train from '../models/Train.js';
import TrainRun from '../models/TrainRun.js';
import Prediction from '../models/Prediction.js';
import HistoricalTrend from '../models/HistoricalTrend.js';
import { PAN_INDIA_STATIONS, generatePanIndiaFleet } from './panIndiaDataset.js';

export const TOTAL_KM = 2500;
export const STATIONS_DATA = PAN_INDIA_STATIONS.map((s, idx) => ({
  code: s.code,
  name: s.name,
  kmFromOrigin: idx * 25,
  zone: s.zone,
  lat: s.lat,
  lng: s.lng,
  state: s.state
}));

export async function seedDatabase(simulatedTime = null) {
  const now = simulatedTime ? new Date(simulatedTime) : new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Seed 120+ Pan-India Stations
  await Station.deleteMany({});
  await Station.insertMany(STATIONS_DATA);
  console.log(`[Seed] Seeded ${STATIONS_DATA.length} Pan-India railway stations across all zones.`);

  // 2. Generate and Seed 500 Active Nationwide Trains & Runs
  const fleetData = generatePanIndiaFleet(500);

  await Train.deleteMany({});
  await TrainRun.deleteMany({});

  const trainsToInsert = [];
  const runsToInsert = [];

  for (const t of fleetData) {
    trainsToInsert.push({
      trainNumber: t.trainNumber,
      name: t.name,
      type: t.type,
      originCode: t.originCode,
      destinationCode: t.destinationCode,
      totalKm: t.totalKm,
      schedule: t.schedule,
      currentSpeed: t.currentSpeed,
      currentDelay: t.currentDelay,
      status: t.status
    });

    const departureTime = new Date(today);
    departureTime.setHours(6, 0, 0, 0);

    runsToInsert.push({
      trainNumber: t.trainNumber,
      trainName: t.name,
      runDate: today.toISOString().split('T')[0],
      status: t.status || 'running',
      currentKm: t.currentKm,
      totalKm: t.totalKm,
      currentSpeed: t.currentSpeed,
      currentDelay: t.currentDelay,
      nextStationIndex: t.currentRun.nextStationIndex,
      departureTime: departureTime,
      stationLog: t.currentRun.stationLog,
      weather: { condition: t.currentDelay > 10 ? 'rain' : 'clear', temperature: 28 },
      congestionLevel: t.currentDelay > 10 ? 0.65 : 0.25,
      predictionHistory: []
    });
  }

  // Batch insert all 500 trains and runs
  await Train.insertMany(trainsToInsert);
  await TrainRun.insertMany(runsToInsert);
  console.log(`[Seed] Seeded ${trainsToInsert.length} trains and active TrainRuns across Pan-India corridors.`);

  // 3. Seed 7-Day Rolling Historical Trend Log for Analytics
  await HistoricalTrend.deleteMany({});
  const corridorKeys = [
    'DELHI-MUMBAI', 'DELHI-HOWRAH', 'DELHI-CHENNAI', 'MUMBAI-HOWRAH', 
    'HOWRAH-CHENNAI', 'MUMBAI-PUNE', 'BENGALURU-CHENNAI', 'DELHI-KATRA'
  ];
  const historicalEntries = [];

  for (let d = 7; d >= 0; d--) {
    const logDate = new Date(today);
    logDate.setDate(logDate.getDate() - d);
    const dateStr = logDate.toISOString().split('T')[0];

    for (const corr of corridorKeys) {
      const baseCorrDelay = corr.includes('HOWRAH') ? 14 : corr.includes('CHENNAI') ? 11 : 6;
      const numServices = 14 + ((d * 3 + corr.length) % 10);

      for (let s = 0; s < numServices; s++) {
        const trainNum = 12000 + ((d * 25 + s * 9) % 800);
        const randomNoise = ((s * 13 + d * 7) % 11) - 5;
        const predicted = Math.max(0, baseCorrDelay + randomNoise);
        const actualDelta = ((s * 5 + d * 3) % 7) - 3;
        const actual = Math.max(0, predicted + actualDelta);

        const serviceTimestamp = new Date(logDate);
        serviceTimestamp.setHours(5 + (s % 18), (s * 21) % 60, 0, 0);

        historicalEntries.push({
          timestamp: serviceTimestamp,
          trainNumber: String(trainNum),
          corridor: corr,
          stationCode: corr.split('-')[1] || 'MUMBAI',
          predictedDelay: Math.round(predicted * 10) / 10,
          actualDelay: Math.round(actual * 10) / 10,
          date: dateStr
        });
      }
    }
  }

  await HistoricalTrend.insertMany(historicalEntries);
  console.log(`[Seed] Seeded ${historicalEntries.length} historical analytics records.`);
}
