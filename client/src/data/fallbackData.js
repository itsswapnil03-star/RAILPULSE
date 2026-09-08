import { PAN_INDIA_STATIONS, generatePanIndiaFleet } from './panIndiaDataset';

// 🇮🇳 Standalone client fallback data for Pan-India deployment: 120+ Stations and 500 Trains
export const FALLBACK_STATIONS = PAN_INDIA_STATIONS;
export const PAN_INDIA_STATIONS_FALLBACK = PAN_INDIA_STATIONS;
export const FALLBACK_TRAINS = generatePanIndiaFleet(500);

export const FALLBACK_ALERTS = [
  {
    id: 'alert-1',
    trainNumber: '11008',
    trainName: 'Deccan Express',
    conflictingTrainNumber: '12124',
    conflictingTrainName: 'Deccan Queen',
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
    trainNumber: '12951',
    trainName: 'Mumbai Rajdhani Express',
    conflictingTrainNumber: '12925',
    conflictingTrainName: 'Paschim Superfast',
    stationCode: 'KOTA',
    stationName: 'Kota Junction',
    severity: 'high',
    description: 'Trunk line headway spacing < 4km approaching Kota Junction outer signal.',
    recommendation: 'Clear green wave for #12951 (Rajdhani); regulate speed on #12925 to 50 km/h.',
    actionPayload: {
      alertId: 'alert-2',
      actionType: 'green_wave',
      targetTrainNumber: '12951',
      holdStationName: 'Kota',
      recommendation: 'Prioritize Rajdhani #12951; regulate #12925'
    }
  },
  {
    id: 'alert-3',
    trainNumber: '12615',
    trainName: 'Grand Trunk Express',
    conflictingTrainNumber: '12434',
    conflictingTrainName: 'Chennai Rajdhani',
    stationCode: 'NGP',
    stationName: 'Nagpur Junction',
    severity: 'medium',
    description: 'Diamond crossing route lock conflict approaching Nagpur Central.',
    recommendation: 'Hold #12615 on loop line 2 for 4 mins to allow high-speed Rajdhani transit.',
    actionPayload: {
      alertId: 'alert-3',
      actionType: 'precedence_hold',
      targetTrainNumber: '12615',
      holdStationName: 'Nagpur',
      recommendation: 'Hold Grand Trunk #12615; give transit clearance to #12434'
    }
  }
];

export const FALLBACK_NETWORK_STATS = {
  averageDelay: 5.8,
  maxDelay: 22,
  trainsOnTime: 412,
  trainsDelayed: 68,
  trainsSeverelyDelayed: 20,
  totalActive: 500,
  punctualityRate: 96.0,
  alerts: FALLBACK_ALERTS,
  highRiskAlerts: 2,
  delayHistory: [
    { time: '05:00', avgDelay: 2.1 },
    { time: '06:00', avgDelay: 3.5 },
    { time: '07:00', avgDelay: 5.2 },
    { time: '08:00', avgDelay: 5.8 }
  ]
};

