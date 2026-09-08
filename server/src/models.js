import mongoose from "mongoose";

const haltSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    kmFromOrigin: Number,
    scheduledArrivalMs: Number,
    scheduledDepartureMs: Number,
    predictedArrivalMs: Number,
    predictedDepartureMs: Number,
    confidenceLowMs: Number,
    confidenceHighMs: Number,
    delayMinutes: Number,
  },
  { _id: false }
);

const delayEventSchema = new mongoose.Schema(
  {
    atMs: Number,
    type: String,
    label: String,
    minutes: Number,
  },
  { _id: false }
);

const delayPointSchema = new mongoose.Schema(
  {
    t: Number,
    delayMin: Number,
  },
  { _id: false }
);

const trainSchema = new mongoose.Schema({
  number: { type: String, unique: true },
  name: String,
  type: String,
  direction: { type: String, enum: ["up", "down"] },
  cruiseKmh: Number,
  dwellMin: Number,
  kmFromNdls: Number,
  progressPct: Number,
  status: { type: String, enum: ["enroute", "at_station", "looping"] },
  currentStationCode: String,
  nextStationCode: String,
  currentDelayMin: { type: Number, default: 0 },
  congestionFactor: { type: Number, default: 0.12 },
  weatherFactor: { type: Number, default: 0.05 },
  lastEvent: String,
  destinationDelayMin: Number,
  destinationEtaMs: Number,
  destinationConfidenceMin: Number,
  modelName: String,
  halts: [haltSchema],
  delayHistory: [delayPointSchema],
  events: [delayEventSchema],
});

export const Train = mongoose.model("Train", trainSchema);

const stationSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  name: String,
  km: Number,
  state: String,
});

export const Station = mongoose.model("Station", stationSchema);
