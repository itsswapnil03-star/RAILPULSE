import { Router } from 'express';
import Station from '../models/Station.js';
import TrainRun from '../models/TrainRun.js';
import Train from '../models/Train.js';
import { simulationEngine } from '../services/simulationEngine.js';
import { apiCache } from '../utils/cache.js';

const router = Router();

router.get('/', async (req, res) => {
  const cached = apiCache.get('all_stations');
  if (cached) return res.json(cached);

  try {
    const stations = await Station.find({}).sort({ kmFromOrigin: 1 }).lean();
    apiCache.set('all_stations', stations, 10000);
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:code/board', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const cacheKey = `board_${code}`;
  const cached = apiCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const station = await Station.findOne({ code }).lean();
    if (!station) return res.status(404).json({ error: 'Station not found' });
    
    const runs = await TrainRun.find({ status: { $ne: 'completed' } }).lean();
    const trains = await Train.find({}).lean();
    const trainMap = new Map(trains.map(t => [t.trainNumber, t]));
    
    const allStations = await Station.find({}).lean();
    const stationCodeMap = new Map(allStations.map(s => [s.code, s.name]));
    const baseDate = simulationEngine.simulatedTime ? new Date(simulationEngine.simulatedTime) : new Date();

    const arrivals = [];
    for (const run of runs) {
      const train = trainMap.get(run.trainNumber);
      if (!train) continue;
      
      const logEntry = (run.stationLog || []).find(s => s.stationCode === station.code);
      if (!logEntry || logEntry.departed) continue;
      
      // Parse scheduledArrival "HH:MM:SS" or "HH:MM"
      let scheduledArr = null;
      if (logEntry.scheduledArrival) {
        scheduledArr = new Date(baseDate);
        const parts = String(logEntry.scheduledArrival).split(':').map(Number);
        scheduledArr.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);
      }
      
      const effectiveDelay = logEntry.arrived
        ? (logEntry.delayMinutes !== undefined && logEntry.delayMinutes !== null ? logEntry.delayMinutes : (run.currentDelay || 0))
        : (logEntry.predictedDelayMinutes !== undefined && logEntry.predictedDelayMinutes > 0
            ? logEntry.predictedDelayMinutes
            : (run.currentDelay !== undefined && run.currentDelay !== null ? run.currentDelay : 0));
            
      const expectedArr = scheduledArr ? new Date(scheduledArr.getTime() + effectiveDelay * 60000) : null;
      
      let status = 'ON TIME';
      if (logEntry.arrived && !logEntry.departed) status = 'ARRIVED';
      else if (logEntry.arrived && logEntry.departed) status = 'DEPARTED';
      else if (effectiveDelay > 15) status = 'DELAYED';
      else if (effectiveDelay > 5) status = 'DELAYED';
      else status = 'ON TIME';
      
      arrivals.push({
        trainNumber: run.trainNumber,
        trainName: run.trainName || train.name,
        trainType: train.type,
        from: stationCodeMap.get(train.originCode) || train.originCode,
        to: stationCodeMap.get(train.destinationCode) || train.destinationCode,
        scheduledArrival: scheduledArr?.toISOString(),
        expectedArrival: expectedArr?.toISOString(),
        delayMinutes: effectiveDelay,
        status,
        platform: ((parseInt(run.trainNumber.slice(-1), 10) || 1) % 6) + 1
      });
    }
    
    arrivals.sort((a, b) => new Date(a.expectedArrival || 0) - new Date(b.expectedArrival || 0));
    
    const payload = {
      station,
      currentTime: simulationEngine.simulatedTime?.toISOString(),
      arrivals
    };

    apiCache.set(cacheKey, payload, 2000);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
