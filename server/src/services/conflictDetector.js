/**
 * RailMind Conflict Detection & Decision Support Engine (Features 1 & 2)
 * Detects platform/junction overlaps within buffer minutes and generates imperative controller recommendations.
 */

const BUFFER_WINDOW_MINUTES = 6;

const TRAIN_PRIORITY = {
  'Semi-high-speed': 100, // Vande Bharat
  'Superfast': 80,
  'Intercity': 70,
  'Express': 60,
  'Mail': 50
};

export function detectConflicts(activeRuns, trainsMap, bufferMinutes = BUFFER_WINDOW_MINUTES) {
  const stationOccupancyMap = new Map(); // stationCode -> Array of arrival objects

  // 1. Collect all upcoming and current station arrival estimates for active trains
  for (const run of activeRuns) {
    if (!run || run.status === 'completed' || run.status === 'not_started') continue;

    const train = trainsMap.get(run.trainNumber);
    if (!train) continue;

    const stationLog = run.stationLog || [];
    const schedule = train.schedule || [];
    const nextIdx = run.nextStationIndex || 0;

    for (let i = nextIdx; i < Math.min(schedule.length, nextIdx + 3); i++) {
      const stop = schedule[i];
      const logEntry = stationLog[i];
      if (!stop) continue;

      let estimatedArrival = null;
      if (logEntry && logEntry.actualArrival) {
        estimatedArrival = new Date(logEntry.actualArrival);
      } else if (logEntry && logEntry.scheduledArrival) {
        const delay = logEntry.predictedDelayMinutes || logEntry.delayMinutes || 0;
        estimatedArrival = new Date(new Date(logEntry.scheduledArrival).getTime() + delay * 60000);
      } else if (stop.arrivalOffset !== null && stop.arrivalOffset !== undefined) {
        const depTime = run.departureTime ? new Date(run.departureTime).getTime() : Date.now();
        const delay = logEntry?.predictedDelayMinutes || logEntry?.delayMinutes || 0;
        estimatedArrival = new Date(depTime + (stop.arrivalOffset + delay) * 60000);
      }

      if (!estimatedArrival || isNaN(estimatedArrival.getTime())) continue;

      // Determine previous station for potential holding recommendation
      const prevStop = i > 0 ? schedule[i - 1] : null;

      if (!stationOccupancyMap.has(stop.stationCode)) {
        stationOccupancyMap.set(stop.stationCode, []);
      }

      stationOccupancyMap.get(stop.stationCode).push({
        trainNumber: run.trainNumber,
        trainName: train.name || run.trainName,
        trainType: train.type || run.trainType || 'Express',
        stationCode: stop.stationCode,
        stationName: stop.stationName,
        estimatedArrival,
        currentDelay: logEntry?.delayMinutes || 0,
        prevStationCode: prevStop?.stationCode || 'Outer Junction',
        prevStationName: prevStop?.stationName || 'Previous Junction',
        stopIndex: i
      });
    }
  }

  const conflicts = [];
  const checkedPairs = new Set();

  // 2. Scan for overlaps within the buffer window at each station
  for (const [stationCode, arrivals] of stationOccupancyMap.entries()) {
    if (arrivals.length < 2) continue;

    for (let i = 0; i < arrivals.length; i++) {
      for (let j = i + 1; j < arrivals.length; j++) {
        const a = arrivals[i];
        const b = arrivals[j];

        if (a.trainNumber === b.trainNumber) continue;

        const pairKey = [a.trainNumber, b.trainNumber].sort().join('-') + `-${stationCode}`;
        if (checkedPairs.has(pairKey)) continue;

        const diffMinutes = Math.abs(a.estimatedArrival.getTime() - b.estimatedArrival.getTime()) / 60000;

        if (diffMinutes <= bufferMinutes) {
          checkedPairs.add(pairKey);

          const timeGap = Math.max(1, Math.round(diffMinutes));
          const severity = timeGap <= 3 ? 'high' : 'medium';

          // Generate Decision Support Recommendation (Feature 2)
          const prioA = TRAIN_PRIORITY[a.trainType] || 60;
          const prioB = TRAIN_PRIORITY[b.trainType] || 60;

          let higherTrain = a;
          let lowerTrain = b;

          if (prioB > prioA || (prioB === prioA && a.currentDelay > b.currentDelay)) {
            higherTrain = b;
            lowerTrain = a;
          }

          let recommendation = '';
          const holdMinutes = Math.max(3, (bufferMinutes - timeGap) + 2);

          if (Math.abs(prioA - prioB) >= 15 || Math.abs(a.currentDelay - b.currentDelay) >= 8) {
            recommendation = `Hold #${lowerTrain.trainNumber} at ${lowerTrain.prevStationName} for ${holdMinutes} min to grant precedence to #${higherTrain.trainNumber} (${higherTrain.trainType}) at ${a.stationName}`;
          } else {
            recommendation = `Reassign #${lowerTrain.trainNumber} to Platform 3 Loop at ${a.stationName} for simultaneous clearance without detention`;
          }

          const actionType = (Math.abs(prioA - prioB) >= 15 || Math.abs(a.currentDelay - b.currentDelay) >= 8) ? 'hold_at_station' : 'reassign_platform';

          conflicts.push({
            id: `conflict-${stationCode}-${a.trainNumber}-${b.trainNumber}`,
            severity,
            stationCode,
            stationName: a.stationName,
            trainsInvolved: [a.trainNumber, b.trainNumber],
            trainNames: [a.trainName, b.trainName],
            trainTypes: [a.trainType, b.trainType],
            timeGapMinutes: timeGap,
            description: `Train #${a.trainNumber} and #${b.trainNumber} both predicted at ${a.stationName} (${stationCode}) within ${timeGap} minutes`,
            predictedTimes: {
              [a.trainNumber]: a.estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              [b.trainNumber]: b.estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            recommendation,
            actionPayload: {
              alertId: `conflict-${stationCode}-${a.trainNumber}-${b.trainNumber}`,
              actionType,
              targetTrainNumber: lowerTrain.trainNumber,
              targetTrainName: lowerTrain.trainName,
              higherTrainNumber: higherTrain.trainNumber,
              holdMinutes,
              holdStationCode: lowerTrain.prevStationCode,
              holdStationName: lowerTrain.prevStationName,
              conflictStationCode: a.stationCode,
              conflictStationName: a.stationName,
              recommendation
            },
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  }

  // Filter out any explicitly resolved conflicts
  const activeUnresolved = conflicts.filter(c => !resolvedConflictIds.has(c.id));

  // Sort by severity (high first) then lowest time gap
  return activeUnresolved.sort((a, b) => {
    if (a.severity === 'high' && b.severity !== 'high') return -1;
    if (b.severity === 'high' && a.severity !== 'high') return 1;
    return a.timeGapMinutes - b.timeGapMinutes;
  });
}

const resolvedConflictIds = new Set();

export function resolveConflict(alertId) {
  if (alertId) {
    resolvedConflictIds.add(alertId);
    // Keep resolved cache bounded
    if (resolvedConflictIds.size > 200) {
      const first = resolvedConflictIds.values().next().value;
      resolvedConflictIds.delete(first);
    }
  }
}

export function clearResolvedConflicts() {
  resolvedConflictIds.clear();
}

