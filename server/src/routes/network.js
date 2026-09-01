import { Router } from 'express';
import TrainRun from '../models/TrainRun.js';
import { simulationEngine } from '../services/simulationEngine.js';
import { apiCache } from '../utils/cache.js';

const router = Router();

router.get('/stats', async (req, res) => {
  const cached = apiCache.get('network_stats');
  if (cached) return res.json(cached);

  try {
    const runs = await TrainRun.find({}).lean();
    const stats = simulationEngine.computeNetworkStats(runs);
    apiCache.set('network_stats', stats, 1500);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
