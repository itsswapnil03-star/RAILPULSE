import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDatabase } from './seed/seedData.js';
import { simulationEngine } from './services/simulationEngine.js';
import { setupSocketHandlers } from './socket/handlers.js';
import trainRoutes from './routes/trains.js';
import stationRoutes from './routes/stations.js';
import predictionRoutes from './routes/predictions.js';
import simulationRoutes from './routes/simulation.js';
import networkRoutes from './routes/network.js';
import analyticsRoutes from './routes/analytics.js';

const PORT = process.env.PORT || 3008;

async function startServer() {
  console.log('[DB] Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(`[DB] Connected to MongoDB at ${uri}`);

  await seedDatabase();
  console.log('[DB] Database seeded');

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/trains', trainRoutes);
  app.use('/api/stations', stationRoutes);
  app.use('/api/predictions', predictionRoutes);
  app.use('/api/simulation', simulationRoutes);
  app.use('/api/network', networkRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', simulatedTime: simulationEngine.simulatedTime?.toISOString() });
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  setupSocketHandlers(io);

  await simulationEngine.init(io);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log('══════════════════════════════════════════════');
    console.log(`🚄 RailPulse Server running on port ${PORT} (0.0.0.0)`);
    console.log(`📡 Socket.IO ready`);
    console.log(`⏱️  Simulation speed: ${process.env.SIM_SPEED || 24}×`);
    console.log('══════════════════════════════════════════════');
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
