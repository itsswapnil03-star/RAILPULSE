import mongoose from 'mongoose';

const scheduleStopSchema = new mongoose.Schema({
  stationCode: String,
  stationName: String,
  arrivalOffset: Number,    // minutes from origin departure (null for origin)
  departureOffset: Number,  // minutes from origin departure (null for terminus)
  stopDuration: Number,
  kmFromStart: Number
}, { _id: false });

const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: { type: String, default: 'Express' },
  direction: { type: String, enum: ['UP', 'DOWN'] },
  originCode: String,
  destinationCode: String,
  schedule: [scheduleStopSchema]
});

export default mongoose.model('Train', trainSchema);
