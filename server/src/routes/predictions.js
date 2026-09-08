import { Router } from 'express';
import Prediction from '../models/Prediction.js';
import Train from '../models/Train.js';
import { predictWhatIf, fetchEvaluationMetrics, triggerIncrementalRetraining, predictBatch } from '../services/mlClient.js';
import { apiCache } from '../utils/cache.js';

const router = Router();

router.get('/evaluation', async (req, res) => {
  try {
    const metrics = await fetchEvaluationMetrics();
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/retrain', async (req, res) => {
  try {
    const result = await triggerIncrementalRetraining(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const items = req.body.items || [];
    const result = await predictBatch(items);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/what-if', async (req, res) => {
  try {
    const payload = req.body;
    const result = await predictWhatIf(payload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
