import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  kmFromOrigin: { type: Number, required: true },
  zone: String,
  lat: Number,
  lng: Number
});

export default mongoose.model('Station', stationSchema);
