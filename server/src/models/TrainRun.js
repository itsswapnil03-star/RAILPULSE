import mongoose from 'mongoose';

const stationLogEntry = new mongoose.Schema({
  stationCode: String,
  stationName: String,
  scheduledArrival: Date,
  actualArrival: Date,
  scheduledDeparture: Date,
  actualDeparture: Date,
  delayMinutes: { type: Number, default: 0 },
  predictedDelayMinutes: Number,
  confidenceLower: Number,
  confidenceUpper: Number,
  arrived: { type: Boolean, default: false },
  departed: { type: Boolean, default: false }
}, { _id: false });

const trainRunSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, index: true },
  trainName: String,
  trainType: String,
  direction: String,
  status: { type: String, enum: ['not_started', 'running', 'at_station', 'completed'], default: 'not_started' },
  currentKm: { type: Number, default: 0 },
  totalKm: Number,
  currentSpeed: { type: Number, default: 0 },
  nextStationIndex: { type: Number, default: 0 },
  departureTime: Date,
  activeDelayEvent: {
    type: { type: String, default: null },
    category: String, // 'weather', 'signaling', 'congestion', 'track_work', 'rolling_stock', 'operational'
    severity: Number,
    description: String,
    speedReduction: Number,
    startedAtKm: Number,
    remainingTicks: Number,
    impactMinutes: Number
  },
  stationLog: [stationLogEntry],
  weather: {
    condition: { type: String, default: 'clear' },
    temperature: { type: Number, default: 32 }
  },
  congestionLevel: { type: Number, default: 0.3 },
  predictionHistory: [{
    tick: Number,
    stationCode: String,
    predictedDelay: Number,
    confidence: { lower: Number, upper: Number },
    timestamp: Date
  }]
}, { timestamps: true });

export default mongoose.model('TrainRun', trainRunSchema);
