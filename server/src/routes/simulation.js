import { Router } from 'express';
import { simulationEngine } from '../services/simulationEngine.js';
import { seedDatabase } from '../seed/seedData.js';

const router = Router();

router.get('/status', (req, res) => {
  res.json(simulationEngine.getStatus());
});

router.post('/inject-event', async (req, res) => {
  const { trainNumber, eventType, description, severity } = req.body;
  try {
    const success = await simulationEngine.injectManualEvent(trainNumber, eventType, description, severity);
    if (success) {
      res.json({ success: true, message: `Event ${eventType} injected into train ${trainNumber}` });
    } else {
      res.status(404).json({ error: 'Train not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/execute-action', async (req, res) => {
  try {
    const result = await simulationEngine.executeResolutionAction(req.body || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset', async (req, res) => {
  try {
    await simulationEngine.reset();
    await seedDatabase(simulationEngine.simulatedTime);
    res.json({ success: true, message: 'Simulation reset' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
