import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  trainNumber: { type: String, index: true },
  stationCode: String,
  predictedAt: { type: Date, default: Date.now },
  predictedDelayMinutes: Number,
  confidenceLower: Number,
  confidenceUpper: Number,
  topFactors: [{
    feature: String,
    importance: Number,
    value: String
  }],
  modelVersion: String
});

export default mongoose.model('Prediction', predictionSchema);
