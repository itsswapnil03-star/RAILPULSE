import TrainRun from '../models/TrainRun.js';
import Train from '../models/Train.js';
import Prediction from '../models/Prediction.js';
import HistoricalTrend from '../models/HistoricalTrend.js';
import { predictDelay } from './mlClient.js';
import { injectRandomDelay, createExplicitDelayEvent } from './delayInjector.js';
import { detectConflicts, resolveConflict, clearResolvedConflicts } from './conflictDetector.js';

const TICK_INTERVAL_MS = 1000;
const TIME_MULTIPLIER = parseInt(process.env.SIM_SPEED || '15');
const SIMULATED_SECONDS_PER_TICK = (TICK_INTERVAL_MS / 1000) * TIME_MULTIPLIER;
const SIM_START_HOUR = parseInt(process.env.SIM_START_HOUR || '5');

class SimulationEngine {
  constructor() {
    this.io = null;
    this.timer = null;
    this.tickCount = 0;
    this.simulatedTime = null;
    this.delayHistory = [];
    this.recentEvents = [];
    this.activeAlerts = [];
  }

  async init(io) {
    this.io = io;
    const now = new Date();
    this.simulatedTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), SIM_START_HOUR, 0, 0);
    this.start();
    console.log(`[Simulation] Started. Simulated time: ${this.simulatedTime.toLocaleTimeString()}. Speed: ${TIME_MULTIPLIER}× (1s continuous broadcast)`);
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async tick() {
    this.tickCount++;
    this.simulatedTime = new Date(this.simulatedTime.getTime() + SIMULATED_SECONDS_PER_TICK * 1000);

    try {
      const trainRuns = await TrainRun.find({});
      const trains = await Train.find({});
      const trainMap = new Map(trains.map(t => [t.trainNumber, t]));

      for (const run of trainRuns) {
        await this.updateTrainRun(run, trainMap.get(run.trainNumber));
      }

      const updatedRuns = await TrainRun.find({}).lean();
      const runMap = new Map(updatedRuns.map(r => [r.trainNumber, r]));

      // 1. Run Conflict Detection & Decision Recommendations on each tick (Features 1 & 2)
      this.activeAlerts = detectConflicts(updatedRuns, trainMap, 6);

      const fleet = trains.map(t => {
        const tObj = t.toObject ? t.toObject() : t;
        return {
          ...tObj,
          currentRun: runMap.get(t.trainNumber)
        };
      });

      // Emit continuous full fleet update every 1 second
      this.io.emit('trains:fleet', fleet);

      for (const run of updatedRuns) {
        this.io.emit('train:update', run);
      }

      // Broadcast live conflict alerts feed
      this.io.emit('conflicts:alerts', this.activeAlerts);

      this.io.emit('simulation:tick', {
        simulatedTime: this.simulatedTime.toISOString(),
        tickCount: this.tickCount,
        alerts: this.activeAlerts
      });

      if (this.tickCount % 5 === 0) {
        const stats = this.computeNetworkStats(updatedRuns);
        this.io.emit('network:stats', stats);
        this.delayHistory.push({
          time: this.simulatedTime.toISOString(),
          avgDelay: stats.averageDelay
        });
        if (this.delayHistory.length > 100) this.delayHistory.shift();
      }
    } catch (err) {
      console.error('[Simulation] Tick error:', err.message);
    }
  }

  async updateTrainRun(run, train) {
    if (!train || run.status === 'completed') return;

    const schedule = train.schedule;
    const simTime = this.simulatedTime;

    if (run.status === 'not_started') {
      if (simTime >= run.departureTime) {
        run.status = 'running';
        run.currentSpeed = this.getBaseSpeed(train.type);
        if (run.stationLog.length > 0) {
          run.stationLog[0].actualDeparture = new Date(simTime);
          run.stationLog[0].departed = true;
          run.stationLog[0].arrived = true;
          run.stationLog[0].actualArrival = new Date(simTime);
          
          const lateDeptDelay = injectRandomDelay('late_departure');
          const realisticDelay = lateDeptDelay ? Math.min(10, Math.max(1, lateDeptDelay.delayMinutes)) : 0;
          run.stationLog[0].delayMinutes = realisticDelay;

          if (lateDeptDelay) {
            run.activeDelayEvent = {
              type: 'late_departure',
              severity: lateDeptDelay.severity,
              description: lateDeptDelay.description,
              speedReduction: 0,
              startedAtKm: 0,
              remainingTicks: 0
            };
            this.emitDelayEvent(run, lateDeptDelay);
          }
        }
        run.nextStationIndex = 1;
        console.log(`[Simulation] ${train.name} (${train.trainNumber}) departed`);
        run.markModified('stationLog');
        await run.save();
        return;
      }
      return;
    }

    if (run.status === 'at_station') {
      const currentStop = schedule[run.nextStationIndex - 1];
      if (currentStop && currentStop.stopDuration) {
        const ticksToWait = Math.max(1, Math.ceil(currentStop.stopDuration / 2));
        const arrivedTick = run.get('_arrivedTick') || this.tickCount;
        if (this.tickCount - arrivedTick >= ticksToWait) {
          run.status = 'running';
          run.currentSpeed = 30; // Begin departing station
          const logEntry = run.stationLog[run.nextStationIndex - 1];
          if (logEntry) {
            logEntry.actualDeparture = new Date(simTime);
            logEntry.departed = true;
          }
          run.set('_arrivedTick', undefined);
        } else {
          run.currentSpeed = 0;
          await run.save();
          return;
        }
      } else {
        run.status = 'running';
        run.currentSpeed = 30;
      }
      run.markModified('stationLog');
    }

    if (run.activeDelayEvent && run.activeDelayEvent.remainingTicks > 0) {
      run.activeDelayEvent.remainingTicks--;
      if (run.activeDelayEvent.remainingTicks <= 0) {
        console.log(`[Simulation] ${train.trainNumber}: Delay event '${run.activeDelayEvent.type}' ended`);
        run.activeDelayEvent = undefined;
        if (run.weather.condition !== 'clear') {
          run.weather.condition = 'clear';
        }
      }
    }

    // Dynamic Physics & Kinematics (Deceleration on approach, Acceleration on depart, Fluctuations)
    const effectiveSpeed = this.calculateDynamicSpeed(run, train, schedule);
    run.currentSpeed = effectiveSpeed;

    const hoursPerTick = SIMULATED_SECONDS_PER_TICK / 3600;
    const kmAdvanced = effectiveSpeed * hoursPerTick;
    run.currentKm = Math.min(run.totalKm, run.currentKm + kmAdvanced);

    if (run.nextStationIndex < schedule.length) {
      const nextStop = schedule[run.nextStationIndex];
      if (run.currentKm >= nextStop.kmFromStart) {
        run.currentKm = nextStop.kmFromStart;
        const logEntry = run.stationLog[run.nextStationIndex];
        if (logEntry) {
          logEntry.actualArrival = new Date(simTime);
          logEntry.arrived = true;
          if (logEntry.scheduledArrival) {
            const rawDelay = Math.round((simTime - logEntry.scheduledArrival) / 60000);
            logEntry.delayMinutes = Math.max(0, Math.min(30, rawDelay));
          }
        }
        run.markModified('stationLog');
        console.log(`[Simulation] ${train.trainNumber} arrived at ${nextStop.stationCode} | Delay: ${logEntry?.delayMinutes || 0} min`);

        // Persist rolling prediction vs actual outcome for Historical Trend Analytics (Feature 3)
        try {
          const corridorName = `${train.originCode || 'CSMT'}-${train.destinationCode || 'SUR'}`;
          HistoricalTrend.create({
            timestamp: new Date(simTime),
            trainNumber: train.trainNumber,
            corridor: corridorName,
            stationCode: nextStop.stationCode,
            predictedDelay: logEntry?.predictedDelayMinutes || logEntry?.delayMinutes || 0,
            actualDelay: logEntry?.delayMinutes || 0,
            date: new Date(simTime).toISOString().split('T')[0]
          }).catch(() => {});
        } catch (e) {}

        if (run.nextStationIndex === schedule.length - 1) {
          run.status = 'at_station';
          run.currentSpeed = 0;
          run.set('_arrivedTick', this.tickCount);
          
          // Terminal turnaround: restart service after turnaround buffer
          setTimeout(async () => {
            try {
              const freshRun = await TrainRun.findById(run._id);
              if (freshRun) {
                freshRun.status = 'running';
                freshRun.currentKm = 0;
                freshRun.currentSpeed = this.getBaseSpeed(train.type);
                freshRun.nextStationIndex = 1;
                freshRun.stationLog.forEach((s, idx) => {
                  s.arrived = idx === 0;
                  s.departed = idx === 0;
                  s.delayMinutes = (train.trainNumber.charCodeAt(0) % 5 === 0) ? 6 : 0;
                });
                freshRun.markModified('stationLog');
                await freshRun.save();
              }
            } catch (err) {}
          }, 10000);
        } else {
          run.status = 'at_station';
          run.currentSpeed = 0;
          run.set('_arrivedTick', this.tickCount);
          run.nextStationIndex++;

          await this.predictRemainingStations(run, train, logEntry?.delayMinutes || 0);
        }

        if (run.status !== 'completed') {
          const event = injectRandomDelay('random', run.weather.condition);
          if (event) {
            run.activeDelayEvent = {
              type: event.type,
              severity: event.severity,
              description: event.description,
              speedReduction: Math.min(0.4, event.speedReduction || 0.2),
              startedAtKm: run.currentKm,
              remainingTicks: Math.min(6, event.durationTicks || 3)
            };
            if (event.weatherCondition) run.weather.condition = event.weatherCondition;
            if (event.congestionDelta) run.congestionLevel = Math.min(0.8, run.congestionLevel + 0.1);
            this.emitDelayEvent(run, event);
          }
        }
      }
    }
    await run.save();
  }

  async predictRemainingStations(run, train, currentDelayAtStation) {
    const schedule = train.schedule;
    let prevDelay = Math.max(0, Math.min(30, currentDelayAtStation || 0));
    let cumulativeDelay = prevDelay;

    const arrivedStations = run.stationLog.filter(s => s.arrived && s.delayMinutes !== undefined);
    if (arrivedStations.length > 0) {
      const lastArrived = arrivedStations[arrivedStations.length - 1];
      prevDelay = Math.max(0, Math.min(30, lastArrived.delayMinutes || 0));
      cumulativeDelay = prevDelay;
    }

    for (let i = run.nextStationIndex; i < schedule.length; i++) {
      const stop = schedule[i];
      const features = {
        scheduled_hour: stop.arrivalOffset ? Math.floor((run.departureTime.getTime() + stop.arrivalOffset * 60000) / 3600000) % 24 : 12,
        day_of_week: this.simulatedTime.getDay() === 0 ? 6 : this.simulatedTime.getDay() - 1,
        month: this.simulatedTime.getMonth() + 1,
        is_monsoon: [7, 8, 9].includes(this.simulatedTime.getMonth() + 1),
        weather_condition: run.weather.condition,
        station_index: i,
        km_from_origin: stop.kmFromStart,
        cumulative_delay_so_far: cumulativeDelay,
        previous_station_delay: prevDelay,
        congestion_level: run.congestionLevel,
        train_type: train.type,
        stop_duration: stop.stopDuration || 0,
        num_remaining_stops: schedule.length - i - 1
      };

      const prediction = await predictDelay(features);
      
      if (run.stationLog[i]) {
        run.stationLog[i].predictedDelayMinutes = prediction.predicted_delay_minutes;
        run.stationLog[i].confidenceLower = prediction.confidence_lower;
        run.stationLog[i].confidenceUpper = prediction.confidence_upper;
        run.markModified('stationLog');
      }

      await Prediction.create({
        trainNumber: run.trainNumber,
        stationCode: stop.stationCode,
        predictedDelayMinutes: prediction.predicted_delay_minutes,
        confidenceLower: prediction.confidence_lower,
        confidenceUpper: prediction.confidence_upper,
        topFactors: prediction.top_factors,
        modelVersion: prediction.model_version
      });

      run.predictionHistory.push({
        tick: this.tickCount,
        stationCode: stop.stationCode,
        predictedDelay: prediction.predicted_delay_minutes,
        confidence: { lower: prediction.confidence_lower, upper: prediction.confidence_upper },
        timestamp: new Date()
      });
      if (run.predictionHistory.length > 200) {
        run.predictionHistory = run.predictionHistory.slice(-100);
      }

      prevDelay = prediction.predicted_delay_minutes;
      cumulativeDelay += prediction.predicted_delay_minutes;
    }
  }

  calculateDynamicSpeed(run, train, schedule) {
    if (run.status !== 'running') return 0;

    const baseCruise = this.getBaseSpeed(train.type);
    let targetSpeed = baseCruise;

    // 1. Deceleration on approaching next station
    if (run.nextStationIndex < schedule.length) {
      const nextStop = schedule[run.nextStationIndex];
      const distToNext = Math.max(0, nextStop.kmFromStart - run.currentKm);

      if (distToNext < 1.0) {
        targetSpeed = 25; // Station yard crawling
      } else if (distToNext < 3.0) {
        targetSpeed = 50; // Approaching outer home signal
      } else if (distToNext < 6.0) {
        targetSpeed = 75; // Coasting & braking phase
      }
    }

    // 2. Acceleration on departing previous station
    const prevStop = schedule[run.nextStationIndex - 1];
    if (prevStop) {
      const distFromPrev = Math.max(0, run.currentKm - prevStop.kmFromStart);
      if (distFromPrev < 1.5) {
        targetSpeed = Math.min(targetSpeed, 35); // Starting out of station
      } else if (distFromPrev < 3.5) {
        targetSpeed = Math.min(targetSpeed, 65); // Clearing station points & crossovers
      }
    }

    // 3. Sectional Congestion & Active Caution Reductions
    if (run.congestionLevel > 0.4) {
      targetSpeed *= (1.0 - (run.congestionLevel * 0.35)); // 20-30% reduction
    }

    if (run.activeDelayEvent && run.activeDelayEvent.remainingTicks > 0) {
      const red = run.activeDelayEvent.speedReduction || 0.3;
      targetSpeed *= (1.0 - red);
    }

    // 4. Subtle realistic open-track throttle fluctuation (+/- 1-3 km/h)
    const trainSeed = parseInt(String(train.trainNumber).replace(/\D/g, '')) || 10;
    const fluctuation = Math.sin(this.tickCount * 0.6 + trainSeed) * 2.2;
    targetSpeed += fluctuation;

    // 5. Smooth exponential inertia easing towards target speed
    const current = run.currentSpeed || 0;
    const lerpRate = targetSpeed < current ? 0.35 : 0.2; // Decelerates faster than accelerating
    const newSpeed = Math.max(0, Math.round((current + (targetSpeed - current) * lerpRate) * 10) / 10);

    return newSpeed;
  }

  getBaseSpeed(trainType) {
    const speeds = { 
      'Semi-high-speed': 130, 
      'Superfast': 110, 
      'Intercity': 95, 
      'Express': 85, 
      'Mail': 75 
    };
    return speeds[trainType] || 85;
  }

  emitDelayEvent(run, event) {
    const eventData = {
      trainNumber: run.trainNumber,
      trainName: run.trainName,
      event: {
        type: event.type,
        severity: event.severity,
        description: event.description
      }
    };
    this.io.emit('delay:event', eventData);
    this.recentEvents.unshift(eventData);
    if (this.recentEvents.length > 20) this.recentEvents.pop();
  }

  computeNetworkStats(runs) {
    const activeRuns = runs.filter(r => r.status !== 'not_started');
    const delays = activeRuns.map(r => {
      const arrivedStations = r.stationLog.filter(s => s.arrived);
      const lastArrived = arrivedStations[arrivedStations.length - 1];
      return lastArrived?.delayMinutes || 0;
    });
    
    const avg = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
    const max = delays.length > 0 ? Math.max(...delays) : 0;
    const onTime = delays.filter(d => d <= 5).length;
    const delayed = delays.filter(d => d > 5 && d <= 15).length;
    const severe = delays.filter(d => d > 15).length;

    return {
      averageDelay: Math.round(avg * 10) / 10,
      maxDelay: max,
      trainsOnTime: onTime,
      trainsDelayed: delayed,
      trainsSeverelyDelayed: severe,
      totalActive: activeRuns.length,
      alerts: this.activeAlerts || [],
      highRiskAlerts: (this.activeAlerts || []).filter(a => a.severity === 'high').length,
      delayHistory: this.delayHistory.slice(-50)
    };
  }

  getStatus() {
    return {
      simulatedTime: this.simulatedTime?.toISOString(),
      tickCount: this.tickCount,
      timeMultiplier: TIME_MULTIPLIER,
      recentEvents: this.recentEvents.slice(0, 10)
    };
  }

  async injectManualEvent(trainNumber, eventType, description, severity = 3) {
    const run = await TrainRun.findOne({ trainNumber });
    if (!run) return false;
    
    const event = createExplicitDelayEvent(eventType, description);
    if (severity) event.severity = severity;

    run.activeDelayEvent = {
      type: event.type,
      category: event.category,
      severity: event.severity,
      description: event.description,
      speedReduction: event.speedReduction,
      startedAtKm: run.currentKm,
      remainingTicks: event.durationTicks,
      impactMinutes: event.delayMinutes
    };

    if (event.weatherCondition) run.weather.condition = event.weatherCondition;
    if (event.congestionDelta) run.congestionLevel = Math.min(0.9, run.congestionLevel + event.congestionDelta);

    await run.save();
    this.emitDelayEvent(run, event);
    return true;
  }

  async executeResolutionAction(actionData) {
    const { alertId, actionType, targetTrainNumber, holdMinutes = 5, holdStationName, recommendation } = actionData;
    
    // 1. Mark conflict as resolved in conflict detector cache
    if (alertId) {
      resolveConflict(alertId);
    }

    // 2. If it's a hold action, apply speed regulation/hold on the target train
    if (targetTrainNumber) {
      const run = await TrainRun.findOne({ trainNumber: targetTrainNumber });
      if (run) {
        run.activeDelayEvent = {
          type: 'controller_regulation',
          severity: 2,
          description: `Precedence Regulation: Holding at ${holdStationName || 'Station'} for ${holdMinutes}m`,
          speedReduction: 0.4,
          startedAtKm: run.currentKm,
          remainingTicks: Math.min(10, holdMinutes)
        };
        await run.save();

        this.emitDelayEvent(run, {
          type: 'controller_regulation',
          severity: 2,
          description: `Dispatch Order Executed: ${recommendation || 'Precedence hold applied'}`
        });
      }
    }

    // 3. Immediately re-scan and emit updated conflicts
    try {
      const updatedRuns = await TrainRun.find({}).lean();
      const trains = await Train.find({});
      const trainMap = new Map(trains.map(t => [t.trainNumber, t]));
      this.activeAlerts = detectConflicts(updatedRuns, trainMap, 6);
      this.io.emit('conflicts:alerts', this.activeAlerts);
    } catch (e) {}

    console.log(`[Controller Action Executed] ${recommendation}`);
    return { success: true, message: `Successfully executed: ${recommendation}` };
  }

  async reset() {
    this.stop();
    this.tickCount = 0;
    this.delayHistory = [];
    this.recentEvents = [];
    clearResolvedConflicts();
    const now = new Date();
    this.simulatedTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), SIM_START_HOUR, 0, 0);
    this.start();
  }
}

export const simulationEngine = new SimulationEngine();
