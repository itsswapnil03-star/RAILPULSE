import { Router } from 'express';
import { simulationEngine } from '../services/simulationEngine.js';
import { seedDatabase } from '../seed/seedData.js';
import TrainRun from '../models/TrainRun.js';
import Train from '../models/Train.js';

const router = Router();

router.get('/status', (req, res) => {
  res.json(simulationEngine.getStatus());
});

router.get('/notifications', (req, res) => {
  try {
    res.json(simulationEngine.getNotifications());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notify-test', async (req, res) => {
  try {
    const { trainNumber, delayDelta = 15, reason = 'Signal aspect hold' } = req.body;
    const run = await TrainRun.findOne(trainNumber ? { trainNumber } : {});
    if (!run) return res.status(404).json({ error: 'No active train run found' });
    const train = await Train.findOne({ trainNumber: run.trainNumber });
    const notif = simulationEngine.dispatchEtaNotification(run, train, delayDelta, reason);
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/preset', async (req, res) => {
  try {
    const { preset } = req.body;
    const result = await simulationEngine.setScenarioPreset(preset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
