import { Router } from 'express';
import Train from '../models/Train.js';
import TrainRun from '../models/TrainRun.js';
import Prediction from '../models/Prediction.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const trains = await Train.find({}).lean();
    const runs = await TrainRun.find({}).lean();
    const runMap = new Map(runs.map(r => [r.trainNumber, r]));
    
    const result = trains.map(t => ({
      ...t,
      currentRun: runMap.get(t.trainNumber) || null
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:trainNumber', async (req, res) => {
  try {
    const train = await Train.findOne({ trainNumber: req.params.trainNumber }).lean();
    if (!train) return res.status(404).json({ error: 'Train not found' });
    
    const run = await TrainRun.findOne({ trainNumber: req.params.trainNumber }).lean();
    const predictions = await Prediction.find({ trainNumber: req.params.trainNumber })
      .sort({ predictedAt: -1 })
      .limit(50)
      .lean();
    
    res.json({ ...train, currentRun: run, predictions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
