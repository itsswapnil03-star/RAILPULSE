import TrainRun from '../models/TrainRun.js';
import { simulationEngine } from '../services/simulationEngine.js';

export function setupSocketHandlers(io) {
  io.on('connection', async (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    
    try {
      const runs = await TrainRun.find({}).lean();
      for (const run of runs) {
        socket.emit('train:update', run);
      }
      socket.emit('simulation:tick', {
        simulatedTime: simulationEngine.simulatedTime?.toISOString(),
        tickCount: simulationEngine.tickCount
      });
    } catch (err) {
      console.error('[Socket] Error sending initial state:', err.message);
    }
    
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}
