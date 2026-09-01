import { Router } from 'express';
import TrainRun from '../models/TrainRun.js';
import { simulationEngine } from '../services/simulationEngine.js';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const runs = await TrainRun.find({}).lean();
    const stats = simulationEngine.computeNetworkStats(runs);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
