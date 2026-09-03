// Standalone client fallback data for static hosting (e.g. Vercel) when backend is offline

export const FALLBACK_STATIONS = [
  { code: 'CSMT', name: 'Mumbai CSMT', kmFromOrigin: 0, zone: 'CR', lat: 18.9402, lng: 72.8356 },
  { code: 'DR', name: 'Dadar Central', kmFromOrigin: 9, zone: 'CR', lat: 19.0178, lng: 72.8478 },
  { code: 'TNA', name: 'Thane', kmFromOrigin: 34, zone: 'CR', lat: 19.1860, lng: 72.9759 },
  { code: 'KYN', name: 'Kalyan Junction', kmFromOrigin: 54, zone: 'CR', lat: 19.2354, lng: 73.1299 },
  { code: 'PNVL', name: 'Panvel Junction', kmFromOrigin: 69, zone: 'CR', lat: 18.9886, lng: 73.1103 },
  { code: 'KJT', name: 'Karjat Junction', kmFromOrigin: 100, zone: 'CR', lat: 18.9100, lng: 73.3283 },
  { code: 'LNL', name: 'Lonavala', kmFromOrigin: 128, zone: 'CR', lat: 18.7546, lng: 73.4062 },
  { code: 'SVJR', name: 'Shivajinagar', kmFromOrigin: 190, zone: 'CR', lat: 18.5323, lng: 73.8478 },
  { code: 'PUNE', name: 'Pune Junction', kmFromOrigin: 192, zone: 'CR', lat: 18.5289, lng: 73.8744 },
  { code: 'DD', name: 'Daund Junction', kmFromOrigin: 268, zone: 'CR', lat: 18.4631, lng: 74.5822 },
  { code: 'KWV', name: 'Kurduvadi Junction', kmFromOrigin: 377, zone: 'CR', lat: 18.0833, lng: 75.4333 },
  { code: 'SUR', name: 'Solapur Junction', kmFromOrigin: 455, zone: 'CR', lat: 17.6599, lng: 75.9064 },
  { code: 'MRJ', name: 'Miraj Junction', kmFromOrigin: 471, zone: 'CR', lat: 16.8277, lng: 74.6469 },
  { code: 'SLI', name: 'Sangli', kmFromOrigin: 478, zone: 'CR', lat: 16.8524, lng: 74.5815 },
  { code: 'KOP', name: 'Kolhapur CSMT', kmFromOrigin: 518, zone: 'CR', lat: 16.6956, lng: 74.2317 },
  { code: 'IGP', name: 'Igatpuri', kmFromOrigin: 137, zone: 'CR', lat: 19.6967, lng: 73.5606 },
  { code: 'NK', name: 'Nashik Road', kmFromOrigin: 188, zone: 'CR', lat: 19.9543, lng: 73.8340 },
  { code: 'MMR', name: 'Manmad Junction', kmFromOrigin: 261, zone: 'CR', lat: 20.2520, lng: 74.4372 },
  { code: 'BSL', name: 'Bhusawal Junction', kmFromOrigin: 444, zone: 'CR', lat: 21.0455, lng: 75.7885 },
  { code: 'AK', name: 'Akola Junction', kmFromOrigin: 583, zone: 'CR', lat: 20.7002, lng: 77.0082 },
  { code: 'BD', name: 'Badnera (Amravati)', kmFromOrigin: 662, zone: 'CR', lat: 20.8653, lng: 77.7289 },
  { code: 'WR', name: 'Wardha Junction', kmFromOrigin: 757, zone: 'CR', lat: 20.7453, lng: 78.6022 },
  { code: 'NGP', name: 'Nagpur Junction', kmFromOrigin: 837, zone: 'CR', lat: 21.1528, lng: 79.0882 },
  { code: 'AWB', name: 'Chhatrapati Sambhajinagar', kmFromOrigin: 375, zone: 'SCR', lat: 19.8762, lng: 75.3433 },
  { code: 'J', name: 'Jalna', kmFromOrigin: 438, zone: 'SCR', lat: 19.8410, lng: 75.8864 },
  { code: 'NED', name: 'Hazur Sahib Nanded', kmFromOrigin: 609, zone: 'SCR', lat: 19.1557, lng: 77.3168 },
  { code: 'RN', name: 'Ratnagiri', kmFromOrigin: 307, zone: 'KR', lat: 16.9902, lng: 73.3120 },
  { code: 'SWV', name: 'Sawantwadi Road', kmFromOrigin: 495, zone: 'KR', lat: 15.9056, lng: 73.8184 }
];

export const FALLBACK_TRAINS = [
  {
    trainNumber: '22225',
    name: 'Solapur Vande Bharat Express',
    type: 'Vande Bharat',
    originCode: 'CSMT',
    destinationCode: 'SUR',
    totalKm: 455,
    currentDelay: 0,
    currentSpeed: 108,
    currentRun: {
      trainNumber: '22225',
      trainName: 'Solapur Vande Bharat Express',
      status: 'running',
      currentKm: 128,
      currentSpeed: 108,
      currentDelay: 0,
      nextStationIndex: 5,
      totalKm: 455,
      stationLog: [
        { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T06:05:00Z' },
        { stationCode: 'DR', stationName: 'Dadar Central', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T06:14:00Z' },
        { stationCode: 'TNA', stationName: 'Thane', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T06:32:00Z' },
        { stationCode: 'KYN', stationName: 'Kalyan Junction', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T06:52:00Z' },
        { stationCode: 'KJT', stationName: 'Karjat Junction', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T07:22:00Z' },
        { stationCode: 'LNL', stationName: 'Lonavala', arrived: false, delayMinutes: 0, scheduledArrival: '2026-09-01T07:53:00Z' },
        { stationCode: 'SVJR', stationName: 'Shivajinagar', arrived: false, delayMinutes: 0, scheduledArrival: '2026-09-01T09:08:00Z' },
        { stationCode: 'PUNE', stationName: 'Pune Junction', arrived: false, delayMinutes: 0, scheduledArrival: '2026-09-01T09:20:00Z' },
        { stationCode: 'DD', stationName: 'Daund Junction', arrived: false, delayMinutes: 0, scheduledArrival: '2026-09-01T10:23:00Z' },
        { stationCode: 'KWV', stationName: 'Kurduvadi Junction', arrived: false, delayMinutes: 0, scheduledArrival: '2026-09-01T11:28:00Z' },
        { stationCode: 'SUR', stationName: 'Solapur Junction', arrived: false, delayMinutes: 0, scheduledArrival: '2026-09-01T12:35:00Z' }
      ]
    }
  },
  {
    trainNumber: '12124',
    name: 'Deccan Queen Superfast',
    type: 'Superfast',
    originCode: 'PUNE',
    destinationCode: 'CSMT',
    totalKm: 192,
    currentDelay: 6,
    currentSpeed: 78,
    currentRun: {
      trainNumber: '12124',
      trainName: 'Deccan Queen Superfast',
      status: 'running',
      currentKm: 138,
      currentSpeed: 78,
      currentDelay: 6,
      nextStationIndex: 4,
      totalKm: 192,
      stationLog: [
        { stationCode: 'PUNE', stationName: 'Pune Junction', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T07:15:00Z' },
        { stationCode: 'SVJR', stationName: 'Shivajinagar', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T07:23:00Z' },
        { stationCode: 'LNL', stationName: 'Lonavala', arrived: true, delayMinutes: 4, scheduledArrival: '2026-09-01T08:16:00Z' },
        { stationCode: 'KJT', stationName: 'Karjat Junction', arrived: true, delayMinutes: 6, scheduledArrival: '2026-09-01T09:03:00Z' },
        { stationCode: 'KYN', stationName: 'Kalyan Junction', arrived: false, delayMinutes: 6, scheduledArrival: '2026-09-01T09:43:00Z' },
        { stationCode: 'TNA', stationName: 'Thane', arrived: false, delayMinutes: 8, scheduledArrival: '2026-09-01T10:03:00Z' },
        { stationCode: 'DR', stationName: 'Dadar Central', arrived: false, delayMinutes: 7, scheduledArrival: '2026-09-01T10:23:00Z' },
        { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrived: false, delayMinutes: 6, scheduledArrival: '2026-09-01T10:40:00Z' }
      ]
    }
  },
  {
    trainNumber: '11008',
    name: 'Deccan Express',
    type: 'Express',
    originCode: 'PUNE',
    destinationCode: 'CSMT',
    totalKm: 192,
    currentDelay: 15,
    currentSpeed: 54,
    currentRun: {
      trainNumber: '11008',
      trainName: 'Deccan Express',
      status: 'running',
      currentKm: 174,
      currentSpeed: 54,
      currentDelay: 15,
      nextStationIndex: 5,
      totalKm: 192,
      stationLog: [
        { stationCode: 'PUNE', stationName: 'Pune Junction', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T15:15:00Z' },
        { stationCode: 'SVJR', stationName: 'Shivajinagar', arrived: true, delayMinutes: 2, scheduledArrival: '2026-09-01T15:23:00Z' },
        { stationCode: 'LNL', stationName: 'Lonavala', arrived: true, delayMinutes: 8, scheduledArrival: '2026-09-01T16:28:00Z' },
        { stationCode: 'KJT', stationName: 'Karjat Junction', arrived: true, delayMinutes: 12, scheduledArrival: '2026-09-01T17:18:00Z' },
        { stationCode: 'KYN', stationName: 'Kalyan Junction', arrived: true, delayMinutes: 14, scheduledArrival: '2026-09-01T18:08:00Z' },
        { stationCode: 'TNA', stationName: 'Thane', arrived: false, delayMinutes: 15, scheduledArrival: '2026-09-01T18:38:00Z' },
        { stationCode: 'DR', stationName: 'Dadar Central', arrived: false, delayMinutes: 16, scheduledArrival: '2026-09-01T19:08:00Z' },
        { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrived: false, delayMinutes: 15, scheduledArrival: '2026-09-01T19:35:00Z' }
      ]
    }
  },
  {
    trainNumber: '12151',
    name: 'Samarsata Superfast Express',
    type: 'Superfast',
    originCode: 'CSMT',
    destinationCode: 'NGP',
    totalKm: 837,
    currentDelay: 18,
    currentSpeed: 68,
    currentRun: {
      trainNumber: '12151',
      trainName: 'Samarsata Superfast Express',
      status: 'running',
      currentKm: 261,
      currentSpeed: 68,
      currentDelay: 18,
      nextStationIndex: 6,
      totalKm: 837,
      stationLog: [
        { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T20:35:00Z' },
        { stationCode: 'DR', stationName: 'Dadar Central', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T20:48:00Z' },
        { stationCode: 'KYN', stationName: 'Kalyan Junction', arrived: true, delayMinutes: 8, scheduledArrival: '2026-09-01T21:32:00Z' },
        { stationCode: 'IGP', stationName: 'Igatpuri', arrived: true, delayMinutes: 14, scheduledArrival: '2026-09-01T23:25:00Z' },
        { stationCode: 'NK', stationName: 'Nashik Road', arrived: true, delayMinutes: 16, scheduledArrival: '2026-09-02T00:15:00Z' },
        { stationCode: 'MMR', stationName: 'Manmad Junction', arrived: true, delayMinutes: 18, scheduledArrival: '2026-09-02T01:25:00Z' },
        { stationCode: 'BSL', stationName: 'Bhusawal Junction', arrived: false, delayMinutes: 20, scheduledArrival: '2026-09-02T04:00:00Z' },
        { stationCode: 'AK', stationName: 'Akola Junction', arrived: false, delayMinutes: 22, scheduledArrival: '2026-09-02T05:50:00Z' },
        { stationCode: 'BD', stationName: 'Badnera (Amravati)', arrived: false, delayMinutes: 20, scheduledArrival: '2026-09-02T07:15:00Z' },
        { stationCode: 'WR', stationName: 'Wardha Junction', arrived: false, delayMinutes: 18, scheduledArrival: '2026-09-02T08:45:00Z' },
        { stationCode: 'NGP', stationName: 'Nagpur Junction', arrived: false, delayMinutes: 18, scheduledArrival: '2026-09-02T10:15:00Z' }
      ]
    }
  },
  {
    trainNumber: '11322',
    name: 'Nagpur Kolhapur Intercity Express',
    type: 'Express',
    originCode: 'NGP',
    destinationCode: 'KOP',
    totalKm: 1045,
    currentDelay: 9,
    currentSpeed: 62,
    currentRun: {
      trainNumber: '11322',
      trainName: 'Nagpur Kolhapur Intercity Express',
      status: 'running',
      currentKm: 471,
      currentSpeed: 62,
      currentDelay: 9,
      nextStationIndex: 6,
      totalKm: 1045,
      stationLog: [
        { stationCode: 'NGP', stationName: 'Nagpur Junction', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T18:00:00Z' },
        { stationCode: 'WR', stationName: 'Wardha Junction', arrived: true, delayMinutes: 2, scheduledArrival: '2026-09-01T19:15:00Z' },
        { stationCode: 'BD', stationName: 'Badnera (Amravati)', arrived: true, delayMinutes: 4, scheduledArrival: '2026-09-01T20:45:00Z' },
        { stationCode: 'AK', stationName: 'Akola Junction', arrived: true, delayMinutes: 7, scheduledArrival: '2026-09-01T22:10:00Z' },
        { stationCode: 'BSL', stationName: 'Bhusawal Junction', arrived: true, delayMinutes: 8, scheduledArrival: '2026-09-02T00:15:00Z' },
        { stationCode: 'MMR', stationName: 'Manmad Junction', arrived: true, delayMinutes: 9, scheduledArrival: '2026-09-02T02:50:00Z' },
        { stationCode: 'DD', stationName: 'Daund Junction', arrived: false, delayMinutes: 10, scheduledArrival: '2026-09-02T07:25:00Z' },
        { stationCode: 'PUNE', stationName: 'Pune Junction', arrived: false, delayMinutes: 9, scheduledArrival: '2026-09-02T08:50:00Z' },
        { stationCode: 'MRJ', stationName: 'Miraj Junction', arrived: false, delayMinutes: 8, scheduledArrival: '2026-09-02T13:45:00Z' },
        { stationCode: 'KOP', stationName: 'Kolhapur CSMT', arrived: false, delayMinutes: 8, scheduledArrival: '2026-09-02T15:20:00Z' }
      ]
    }
  },
  {
    trainNumber: '11320',
    name: 'Pune Nagpur Superfast Express',
    type: 'Superfast',
    originCode: 'PUNE',
    destinationCode: 'NGP',
    totalKm: 890,
    currentDelay: 4,
    currentSpeed: 84,
    currentRun: {
      trainNumber: '11320',
      trainName: 'Pune Nagpur Superfast Express',
      status: 'running',
      currentKm: 268,
      currentSpeed: 84,
      currentDelay: 4,
      nextStationIndex: 2,
      totalKm: 890,
      stationLog: [
        { stationCode: 'PUNE', stationName: 'Pune Junction', arrived: true, delayMinutes: 0, scheduledArrival: '2026-09-01T17:40:00Z' },
        { stationCode: 'DD', stationName: 'Daund Junction', arrived: true, delayMinutes: 2, scheduledArrival: '2026-09-01T18:50:00Z' },
        { stationCode: 'MMR', stationName: 'Manmad Junction', arrived: false, delayMinutes: 4, scheduledArrival: '2026-09-01T23:35:00Z' },
        { stationCode: 'BSL', stationName: 'Bhusawal Junction', arrived: false, delayMinutes: 5, scheduledArrival: '2026-09-02T02:00:00Z' },
        { stationCode: 'AK', stationName: 'Akola Junction', arrived: false, delayMinutes: 4, scheduledArrival: '2026-09-02T03:55:00Z' },
        { stationCode: 'BD', stationName: 'Badnera (Amravati)', arrived: false, delayMinutes: 4, scheduledArrival: '2026-09-02T05:20:00Z' },
        { stationCode: 'WR', stationName: 'Wardha Junction', arrived: false, delayMinutes: 3, scheduledArrival: '2026-09-02T06:50:00Z' },
        { stationCode: 'NGP', stationName: 'Nagpur Junction', arrived: false, delayMinutes: 4, scheduledArrival: '2026-09-02T08:15:00Z' }
      ]
    }
  }
];

export const FALLBACK_ALERTS = [
  {
    id: 'alert-1',
    trainNumber: '11008',
    trainName: 'Deccan Express',
    conflictingTrainNumber: '12124',
    conflictingTrainName: 'Deccan Queen Superfast',
    stationCode: 'TNA',
    stationName: 'Thane Junction',
    severity: 'high',
    description: 'Simultaneous Platform 1 berthing overlap detected within 4-minute buffer window.',
    recommendation: 'Grant precedence to #12124 (Superfast); divert #11008 to Platform 3 loop.',
    actionPayload: {
      alertId: 'alert-1',
      actionType: 'platform_divert',
      targetTrainNumber: '11008',
      holdStationName: 'Thane',
      recommendation: 'Divert #11008 to Platform 3 loop; prioritize #12124'
    }
  },
  {
    id: 'alert-2',
    trainNumber: '12151',
    trainName: 'Samarsata Superfast Express',
    conflictingTrainNumber: '11320',
    conflictingTrainName: 'Pune Nagpur Superfast',
    stationCode: 'MMR',
    stationName: 'Manmad Junction',
    severity: 'medium',
    description: 'Crossover track occupancy conflict approaching Manmad diamond crossing.',
    recommendation: 'Regulate speed of #12151 to 45 km/h for 3 minutes.',
    actionPayload: {
      alertId: 'alert-2',
      actionType: 'speed_regulation',
      targetTrainNumber: '12151',
      holdStationName: 'Manmad',
      recommendation: 'Apply 45 km/h PSR for 3 minutes on #12151'
    }
  }
];

export const FALLBACK_NETWORK_STATS = {
  averageDelay: 7.2,
  maxDelay: 18,
  trainsOnTime: 4,
  trainsDelayed: 2,
  trainsSeverelyDelayed: 0,
  totalActive: 6,
  punctualityRate: 98.4,
  alerts: FALLBACK_ALERTS,
  highRiskAlerts: 1,
  delayHistory: [
    { time: '05:00', avgDelay: 2.1 },
    { time: '06:00', avgDelay: 3.5 },
    { time: '07:00', avgDelay: 6.8 },
    { time: '08:00', avgDelay: 7.2 }
  ]
};
