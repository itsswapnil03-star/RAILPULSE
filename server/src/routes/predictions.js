import { Router } from 'express';
import Prediction from '../models/Prediction.js';
import { apiCache } from '../utils/cache.js';

const router = Router();

router.get('/:trainNumber', async (req, res) => {
  const cacheKey = `pred_${req.params.trainNumber}`;
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const predictions = await Prediction.find({ trainNumber: req.params.trainNumber })
      .sort({ predictedAt: -1 })
      .limit(100)
      .lean();
    apiCache.set(cacheKey, predictions, 2500);
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
