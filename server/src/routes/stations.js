import { Router } from 'express';
import Station from '../models/Station.js';
import TrainRun from '../models/TrainRun.js';
import Train from '../models/Train.js';
import { simulationEngine } from '../services/simulationEngine.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const stations = await Station.find({}).sort({ kmFromOrigin: 1 }).lean();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:code/board', async (req, res) => {
  try {
    const station = await Station.findOne({ code: req.params.code.toUpperCase() }).lean();
    if (!station) return res.status(404).json({ error: 'Station not found' });
    
    const runs = await TrainRun.find({ status: { $ne: 'completed' } }).lean();
    const trains = await Train.find({}).lean();
    const trainMap = new Map(trains.map(t => [t.trainNumber, t]));
    
    const allStations = await Station.find({}).lean();
    const stationCodeMap = new Map(allStations.map(s => [s.code, s.name]));

    const arrivals = [];
    for (const run of runs) {
      const train = trainMap.get(run.trainNumber);
      if (!train) continue;
      
      const logEntry = run.stationLog.find(s => s.stationCode === station.code);
      if (!logEntry || logEntry.departed) continue;
      
      const scheduledArr = logEntry.scheduledArrival ? new Date(logEntry.scheduledArrival) : null;
      const predictedDelay = logEntry.predictedDelayMinutes || 0;
      const expectedArr = scheduledArr ? new Date(scheduledArr.getTime() + predictedDelay * 60000) : null;
      
      let status = 'Expected';
      if (logEntry.arrived && !logEntry.departed) status = 'At Platform';
      else if (logEntry.arrived && logEntry.departed) status = 'Departed';
      else if (predictedDelay > 5) status = 'Delayed';
      else status = 'On Time';
      
      arrivals.push({
        trainNumber: run.trainNumber,
        trainName: run.trainName || train.name,
        trainType: train.type,
        from: stationCodeMap.get(train.originCode) || train.originCode,
        to: stationCodeMap.get(train.destinationCode) || train.destinationCode,
        scheduledArrival: scheduledArr?.toISOString(),
        expectedArrival: expectedArr?.toISOString(),
        delayMinutes: logEntry.arrived ? (logEntry.delayMinutes || 0) : predictedDelay,
        status,
        platform: ((parseInt(run.trainNumber.slice(-1), 10) || 1) % 6) + 1
      });
    }
    
    arrivals.sort((a, b) => new Date(a.expectedArrival || 0) - new Date(b.expectedArrival || 0));
    
    res.json({
      station,
      currentTime: simulationEngine.simulatedTime?.toISOString(),
      arrivals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
