import { Router } from "express";
import { STATIONS } from "./data/network.js";
import { Train } from "./models.js";
import { buildSnapshot, publicTrain } from "./simulation.js";

export const api = Router();

api.get("/health", (_req, res) => res.json({ ok: true }));

api.get("/network", async (_req, res) => {
  res.json(await buildSnapshot());
});

api.get("/trains", async (_req, res) => {
  const trains = await Train.find().lean();
  res.json(trains.map(publicTrain));
});

api.get("/trains/:number", async (req, res) => {
  const train = await Train.findOne({ number: req.params.number }).lean();
  if (!train) return res.status(404).json({ error: "Train not found" });
  res.json(publicTrain(train));
});

api.get("/stations", (_req, res) => {
  res.json(STATIONS);
});

api.get("/stations/:code/board", async (req, res) => {
  const code = req.params.code.toUpperCase();
  const station = STATIONS.find((s) => s.code === code);
  if (!station) return res.status(404).json({ error: "Station not found" });

  const trains = await Train.find().lean();
  const rows = trains
    .map(publicTrain)
    .map((train) => {
      const halt = train.halts.find((h) => h.code === code);
      if (!halt) return null;
      return {
        trainNumber: train.number,
        trainName: train.name,
        type: train.type,
        direction: train.direction,
        severity: train.severity,
        scheduledArrivalMs: halt.scheduledArrivalMs,
        predictedArrivalMs: halt.predictedArrivalMs,
        delayMinutes: halt.delayMinutes,
        confidenceLowMs: halt.confidenceLowMs,
        confidenceHighMs: halt.confidenceHighMs,
        status: train.currentStationCode === code ? "Arriving / at platform" : "Expected",
        lastEvent: train.lastEvent,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.predictedArrivalMs - b.predictedArrivalMs);

  res.json({ station, rows });
});
