export const DELAY_CATALOG = {
  // 1. Signaling & Electrical
  signal_failure: {
    category: 'signaling',
    name: 'Automatic Signalling Failure',
    speedReduction: [0.5, 0.75],
    durationTicks: [4, 8],
    impactMinutes: [4, 12],
    descriptions: [
      'Automatic signalling cable fault between block sections',
      'Track circuit glitch detected at home signal approach',
      'Solid State Interlocking (SSI) automatic aspect reset'
    ]
  },
  point_failure: {
    category: 'signaling',
    name: 'Point & Switch Machine Fault',
    speedReduction: [0.6, 0.8],
    durationTicks: [3, 6],
    impactMinutes: [5, 10],
    descriptions: [
      'Point motor failure during cross-over setting',
      'Facing point lock circuit hold at junction approach'
    ]
  },
  ohe_tripping: {
    category: 'signaling',
    name: 'OHE Traction Power Tripping',
    speedReduction: [0.4, 0.6],
    durationTicks: [3, 7],
    impactMinutes: [3, 8],
    descriptions: [
      '25kV AC Overhead Equipment (OHE) voltage drop',
      'Neutral section automatic pantograph drop regulation',
      'Feeder breaker tripping due to grid load shedding'
    ]
  },

  // 2. Weather & Environmental
  weather_fog: {
    category: 'weather',
    name: 'Dense Atmospheric Fog Advisory',
    speedReduction: [0.35, 0.55],
    durationTicks: [6, 12],
    impactMinutes: [5, 15],
    weatherCondition: 'fog',
    descriptions: [
      'Dense fog with visibility < 100m — automatic safety speed restriction',
      'Fog safety device (FSD) acoustic spacing alert in force'
    ]
  },
  weather_monsoon: {
    category: 'weather',
    name: 'Monsoon Track Waterlogging',
    speedReduction: [0.4, 0.65],
    durationTicks: [6, 14],
    impactMinutes: [8, 18],
    weatherCondition: 'heavy_rain',
    descriptions: [
      'Heavy rain track waterlogging above rail head level',
      'Monsoon flood caution order issued for suburban low-lying stretch',
      'Continuous torrential rainfall — cautious sectional running'
    ]
  },
  ghat_caution: {
    category: 'weather',
    name: 'Western Ghat Gradient & Boulder Fall Caution',
    speedReduction: [0.3, 0.5],
    durationTicks: [5, 10],
    impactMinutes: [4, 10],
    weatherCondition: 'rain',
    descriptions: [
      'Thal/Bhor Ghat rock-fall radar alert — PSR 40 km/h imposed',
      'Banker locomotive coupling and brake continuity pressure check'
    ]
  },

  // 3. Traffic Congestion & Precedence
  suburban_congestion: {
    category: 'congestion',
    name: 'Suburban Peak-Hour EMU Congestion',
    speedReduction: [0.25, 0.45],
    durationTicks: [4, 8],
    impactMinutes: [4, 9],
    congestionDelta: 0.25,
    descriptions: [
      'Mumbai/Pune suburban peak-hour EMU headway regulation',
      'Quadruple line bottleneck approaching suburban junction'
    ]
  },
  freight_precedence: {
    category: 'congestion',
    name: 'Freight Rake Precedence & Loop Line Hold',
    speedReduction: [0.5, 0.7],
    durationTicks: [3, 6],
    impactMinutes: [5, 11],
    congestionDelta: 0.2,
    descriptions: [
      'Preceding double-stack freight container rake crossing loop line',
      'Goods train rake pathing precedence at multi-track junction'
    ]
  },
  platform_occupancy: {
    category: 'congestion',
    name: 'Platform Occupancy & Yard Hold',
    speedReduction: [0.7, 0.9],
    durationTicks: [2, 5],
    impactMinutes: [4, 8],
    congestionDelta: 0.15,
    descriptions: [
      'All terminal platforms currently occupied by delayed services',
      'Outer home signal hold awaiting platform berth clearance'
    ]
  },

  // 4. Civil Engineering & Track Restrictions
  track_maintenance: {
    category: 'track_work',
    name: 'Track Renewal & PSR 30 km/h',
    speedReduction: [0.4, 0.6],
    durationTicks: [6, 12],
    impactMinutes: [4, 10],
    descriptions: [
      'Ballast Cleaning Machine (BCM) track renewal block',
      'Permanent Speed Restriction (PSR 30 km/h) due to rail deep screening'
    ]
  },
  level_crossing: {
    category: 'track_work',
    name: 'Level Crossing Gate Hold',
    speedReduction: [0.5, 0.75],
    durationTicks: [2, 4],
    impactMinutes: [3, 7],
    descriptions: [
      'Interlocked level crossing gate road traffic clearance delay',
      'Level crossing boom closure safety sensor verification'
    ]
  },

  // 5. Rolling Stock & Operational Handover
  acp_incident: {
    category: 'rolling_stock',
    name: 'Passenger Alarm Chain Pulling (ACP)',
    speedReduction: [0.8, 1.0],
    durationTicks: [2, 4],
    impactMinutes: [4, 8],
    descriptions: [
      'Unscheduled Alarm Chain Pulling (ACP) in sleeper coach',
      'Brake pipe pressure drop investigation & guard reset'
    ]
  },
  late_departure: {
    category: 'operational',
    name: 'Turnaround & Pitline Handover Delay',
    speedReduction: [0, 0],
    durationTicks: [0, 0],
    impactMinutes: [4, 10],
    descriptions: [
      'Late arrival of incoming rake from previous service run',
      'Secondary pitline mechanical & water replenishment handover'
    ]
  },
  crew_change: {
    category: 'operational',
    name: 'Loco Pilot & Guard Handover Protocol',
    speedReduction: [0, 0],
    durationTicks: [0, 0],
    impactMinutes: [2, 6],
    descriptions: [
      'Loco Pilot crew breathalyzer test and biometric handover',
      'Guard line clear token exchange protocol'
    ]
  }
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function injectRandomDelay(trigger, currentWeather = 'clear') {
  if (trigger === 'late_departure') {
    if (Math.random() > 0.15) return null;
    const config = DELAY_CATALOG.late_departure;
    return {
      type: 'late_departure',
      category: config.category,
      severity: Math.ceil(Math.random() * 3),
      description: randomChoice(config.descriptions),
      delayMinutes: Math.round(randomBetween(...config.impactMinutes)),
      speedReduction: 0,
      durationTicks: 0
    };
  }

  if (trigger === 'random') {
    const keys = Object.keys(DELAY_CATALOG).filter(k => k !== 'late_departure');
    // Low baseline probability for realistic simulation
    if (Math.random() < 0.05) {
      const type = randomChoice(keys);
      const config = DELAY_CATALOG[type];
      const event = {
        type,
        category: config.category,
        severity: Math.ceil(Math.random() * 4),
        description: randomChoice(config.descriptions),
        speedReduction: randomBetween(...config.speedReduction),
        durationTicks: Math.round(randomBetween(...config.durationTicks)),
        delayMinutes: Math.round(randomBetween(...config.impactMinutes))
      };
      if (config.weatherCondition) {
        event.weatherCondition = config.weatherCondition;
      }
      if (config.congestionDelta) {
        event.congestionDelta = config.congestionDelta;
      }
      return event;
    }
  }

  return null;
}

export function createExplicitDelayEvent(type, customDesc = null) {
  const config = DELAY_CATALOG[type] || DELAY_CATALOG.signal_failure;
  return {
    type,
    category: config.category,
    severity: Math.ceil(Math.random() * 4) + 1,
    description: customDesc || randomChoice(config.descriptions),
    speedReduction: randomBetween(...config.speedReduction),
    durationTicks: Math.round(randomBetween(...config.durationTicks)),
    delayMinutes: Math.round(randomBetween(...config.impactMinutes)),
    weatherCondition: config.weatherCondition || undefined,
    congestionDelta: config.congestionDelta || undefined
  };
}

