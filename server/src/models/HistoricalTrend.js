import mongoose from 'mongoose';

const HistoricalTrendSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  trainNumber: { type: String, required: true, index: true },
  corridor: { type: String, required: true, index: true },
  stationCode: { type: String, required: true },
  predictedDelay: { type: Number, required: true },
  actualDelay: { type: Number, required: true },
  date: { type: String, index: true } // YYYY-MM-DD
});

export default mongoose.model('HistoricalTrend', HistoricalTrendSchema);
