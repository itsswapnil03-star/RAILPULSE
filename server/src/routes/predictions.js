import { Router } from 'express';
import Prediction from '../models/Prediction.js';

const router = Router();

router.get('/:trainNumber', async (req, res) => {
  try {
    const predictions = await Prediction.find({ trainNumber: req.params.trainNumber })
      .sort({ predictedAt: -1 })
      .limit(100)
      .lean();
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
