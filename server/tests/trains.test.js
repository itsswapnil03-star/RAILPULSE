import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import trainRoutes from '../src/routes/trains.js';
import stationRoutes from '../src/routes/stations.js';
import { seedDatabase } from '../src/seed/seedData.js';

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await seedDatabase();
  
  app = express();
  app.use(express.json());
  app.use('/api/trains', trainRoutes);
  app.use('/api/stations', stationRoutes);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('GET /api/trains', () => {
  it('should return all Maharashtra fleet trains', async () => {
    const res = await request(app).get('/api/trains');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(100);
  });
});

describe('GET /api/trains/:trainNumber', () => {
  it('should return a specific train', async () => {
    const res = await request(app).get('/api/trains/22225');
    expect(res.status).toBe(200);
    expect(res.body.trainNumber).toBe('22225');
    expect(res.body.name).toContain('Vande Bharat');
  });

  it('should return 404 for invalid train', async () => {
    const res = await request(app).get('/api/trains/99999');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/stations', () => {
  it('should return all Maharashtra stations', async () => {
    const res = await request(app).get('/api/stations');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(30);
  });
});
