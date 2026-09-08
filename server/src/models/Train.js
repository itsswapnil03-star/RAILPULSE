import mongoose from 'mongoose';

const scheduleStopSchema = new mongoose.Schema({
  stationCode: String,
  stationName: String,
  arrivalOffset: Number,
  departureOffset: Number,
  scheduledArrival: mongoose.Schema.Types.Mixed,
  scheduledDeparture: mongoose.Schema.Types.Mixed,
  actualArrival: mongoose.Schema.Types.Mixed,
  actualDeparture: mongoose.Schema.Types.Mixed,
  stopDuration: Number,
  kmFromStart: Number,
  delayMinutes: { type: Number, default: 0 },
  arrived: { type: Boolean, default: false }
}, { _id: false });

const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: { type: String, default: 'Express' },
  zone: String,
  direction: { type: String, default: 'UP' },
  originCode: String,
  destinationCode: String,
  totalKm: Number,
  currentSpeed: Number,
  currentDelay: Number,
  status: { type: String, default: 'running' },
  schedule: [scheduleStopSchema]
});

export default mongoose.model('Train', trainSchema);

