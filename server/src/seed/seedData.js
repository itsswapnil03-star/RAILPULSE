import Station from '../models/Station.js';
import Train from '../models/Train.js';
import TrainRun from '../models/TrainRun.js';
import Prediction from '../models/Prediction.js';
import HistoricalTrend from '../models/HistoricalTrend.js';

export const TOTAL_KM = 967;

export const STATIONS_DATA = [
  {
    "code": "CSMT",
    "name": "Mumbai CSMT",
    "kmFromOrigin": 0,
    "zone": "CR",
    "lat": 18.9402,
    "lng": 72.8356
  },
  {
    "code": "DR",
    "name": "Dadar Central",
    "kmFromOrigin": 9,
    "zone": "CR",
    "lat": 19.0178,
    "lng": 72.8478
  },
  {
    "code": "TNA",
    "name": "Thane",
    "kmFromOrigin": 34,
    "zone": "CR",
    "lat": 19.186,
    "lng": 72.9759
  },
  {
    "code": "KYN",
    "name": "Kalyan Junction",
    "kmFromOrigin": 54,
    "zone": "CR",
    "lat": 19.2354,
    "lng": 73.1299
  },
  {
    "code": "PNVL",
    "name": "Panvel Junction",
    "kmFromOrigin": 69,
    "zone": "CR",
    "lat": 18.9886,
    "lng": 73.1103
  },
  {
    "code": "KJT",
    "name": "Karjat Junction",
    "kmFromOrigin": 100,
    "zone": "CR",
    "lat": 18.91,
    "lng": 73.3283
  },
  {
    "code": "LNL",
    "name": "Lonavala",
    "kmFromOrigin": 128,
    "zone": "CR",
    "lat": 18.7546,
    "lng": 73.4062
  },
  {
    "code": "SVJR",
    "name": "Shivajinagar",
    "kmFromOrigin": 190,
    "zone": "CR",
    "lat": 18.5323,
    "lng": 73.8478
  },
  {
    "code": "PUNE",
    "name": "Pune Junction",
    "kmFromOrigin": 192,
    "zone": "CR",
    "lat": 18.5289,
    "lng": 73.8744
  },
  {
    "code": "DD",
    "name": "Daund Junction",
    "kmFromOrigin": 268,
    "zone": "CR",
    "lat": 18.4631,
    "lng": 74.5822
  },
  {
    "code": "KWV",
    "name": "Kurduvadi Junction",
    "kmFromOrigin": 377,
    "zone": "CR",
    "lat": 18.0833,
    "lng": 75.4333
  },
  {
    "code": "SUR",
    "name": "Solapur Junction",
    "kmFromOrigin": 455,
    "zone": "CR",
    "lat": 17.6599,
    "lng": 75.9064
  },
  {
    "code": "MRJ",
    "name": "Miraj Junction",
    "kmFromOrigin": 471,
    "zone": "CR",
    "lat": 16.8286,
    "lng": 74.6464
  },
  {
    "code": "SLI",
    "name": "Sangli",
    "kmFromOrigin": 478,
    "zone": "CR",
    "lat": 16.8624,
    "lng": 74.5772
  },
  {
    "code": "KOP",
    "name": "Kolhapur CSMT",
    "kmFromOrigin": 518,
    "zone": "CR",
    "lat": 16.6956,
    "lng": 74.2433
  },
  {
    "code": "IGP",
    "name": "Igatpuri",
    "kmFromOrigin": 137,
    "zone": "CR",
    "lat": 19.6967,
    "lng": 73.5594
  },
  {
    "code": "NK",
    "name": "Nashik Road",
    "kmFromOrigin": 188,
    "zone": "CR",
    "lat": 19.9575,
    "lng": 73.8354
  },
  {
    "code": "MMR",
    "name": "Manmad Junction",
    "kmFromOrigin": 261,
    "zone": "CR",
    "lat": 20.252,
    "lng": 74.4365
  },
  {
    "code": "CSN",
    "name": "Chalisgaon Junction",
    "kmFromOrigin": 328,
    "zone": "CR",
    "lat": 20.4639,
    "lng": 75.0125
  },
  {
    "code": "JL",
    "name": "Jalgaon Junction",
    "kmFromOrigin": 420,
    "zone": "CR",
    "lat": 21.0077,
    "lng": 75.5626
  },
  {
    "code": "BSL",
    "name": "Bhusawal Junction",
    "kmFromOrigin": 444,
    "zone": "CR",
    "lat": 21.0455,
    "lng": 75.7873
  },
  {
    "code": "MKU",
    "name": "Malkapur",
    "kmFromOrigin": 494,
    "zone": "CR",
    "lat": 20.8847,
    "lng": 76.2025
  },
  {
    "code": "AK",
    "name": "Akola Junction",
    "kmFromOrigin": 583,
    "zone": "CR",
    "lat": 20.7096,
    "lng": 77.0082
  },
  {
    "code": "BD",
    "name": "Badnera (Amravati)",
    "kmFromOrigin": 662,
    "zone": "CR",
    "lat": 20.8667,
    "lng": 77.7333
  },
  {
    "code": "WR",
    "name": "Wardha Junction",
    "kmFromOrigin": 757,
    "zone": "CR",
    "lat": 20.7453,
    "lng": 78.6022
  },
  {
    "code": "NGP",
    "name": "Nagpur Junction",
    "kmFromOrigin": 837,
    "zone": "CR",
    "lat": 21.1524,
    "lng": 79.0882
  },
  {
    "code": "G",
    "name": "Gondia Junction",
    "kmFromOrigin": 967,
    "zone": "SECR",
    "lat": 21.4602,
    "lng": 80.1961
  },
  {
    "code": "AWB",
    "name": "Chhatrapati Sambhajinagar",
    "kmFromOrigin": 375,
    "zone": "SCR",
    "lat": 19.8644,
    "lng": 75.3138
  },
  {
    "code": "J",
    "name": "Jalna",
    "kmFromOrigin": 438,
    "zone": "SCR",
    "lat": 19.8347,
    "lng": 75.8816
  },
  {
    "code": "NED",
    "name": "Hazur Sahib Nanded",
    "kmFromOrigin": 609,
    "zone": "SCR",
    "lat": 19.1526,
    "lng": 77.3189
  },
  {
    "code": "RN",
    "name": "Ratnagiri",
    "kmFromOrigin": 307,
    "zone": "KR",
    "lat": 16.988,
    "lng": 73.3283
  },
  {
    "code": "SWV",
    "name": "Sawantwadi Road",
    "kmFromOrigin": 495,
    "zone": "KR",
    "lat": 15.908,
    "lng": 73.824
  }
];

export const CORRIDORS = {
  "MUMBAI_PUNE_SOLAPUR": [
    "CSMT",
    "DR",
    "TNA",
    "KYN",
    "KJT",
    "LNL",
    "SVJR",
    "PUNE",
    "DD",
    "KWV",
    "SUR"
  ],
  "MUMBAI_PUNE_KOLHAPUR": [
    "CSMT",
    "DR",
    "TNA",
    "KYN",
    "LNL",
    "PUNE",
    "MRJ",
    "SLI",
    "KOP"
  ],
  "MUMBAI_NASHIK_NAGPUR": [
    "CSMT",
    "DR",
    "TNA",
    "KYN",
    "IGP",
    "NK",
    "MMR",
    "CSN",
    "JL",
    "BSL",
    "MKU",
    "AK",
    "BD",
    "WR",
    "NGP",
    "G"
  ],
  "MUMBAI_MARATHWADA": [
    "CSMT",
    "DR",
    "TNA",
    "KYN",
    "IGP",
    "NK",
    "MMR",
    "AWB",
    "J",
    "NED"
  ],
  "MUMBAI_KONKAN": [
    "CSMT",
    "DR",
    "TNA",
    "PNVL",
    "RN",
    "SWV"
  ],
  "PUNE_NAGPUR": [
    "PUNE",
    "DD",
    "MMR",
    "BSL",
    "AK",
    "BD",
    "WR",
    "NGP"
  ],
  "NAGPUR_KOLHAPUR": [
    "NGP",
    "WR",
    "BD",
    "AK",
    "BSL",
    "MMR",
    "DD",
    "PUNE",
    "MRJ",
    "KOP"
  ]
};

export const TRAINS_DATA = [
  {
    "trainNumber": "22225",
    "name": "Solapur Vande Bharat",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "06:05",
    "avgSpeed": 105,
    "stopMins": 2
  },
  {
    "trainNumber": "22226",
    "name": "Solapur Vande Bharat",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "06:30",
    "avgSpeed": 105,
    "stopMins": 2
  },
  {
    "trainNumber": "22223",
    "name": "Shirdi Vande Bharat",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "UP",
    "depTime": "06:20",
    "avgSpeed": 105,
    "stopMins": 2
  },
  {
    "trainNumber": "22224",
    "name": "Shirdi Vande Bharat",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "DOWN",
    "depTime": "07:15",
    "avgSpeed": 105,
    "stopMins": 2
  },
  {
    "trainNumber": "20705",
    "name": "Jalna Vande Bharat",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "UP",
    "depTime": "06:45",
    "avgSpeed": 105,
    "stopMins": 2
  },
  {
    "trainNumber": "20706",
    "name": "Jalna Vande Bharat",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "DOWN",
    "depTime": "05:30",
    "avgSpeed": 105,
    "stopMins": 2
  },
  {
    "trainNumber": "22229",
    "name": "Goa Vande Bharat",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_KONKAN",
    "direction": "UP",
    "depTime": "05:25",
    "avgSpeed": 110,
    "stopMins": 2
  },
  {
    "trainNumber": "22230",
    "name": "Goa Vande Bharat",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_KONKAN",
    "direction": "DOWN",
    "depTime": "06:10",
    "avgSpeed": 110,
    "stopMins": 2
  },
  {
    "trainNumber": "20825",
    "name": "Bilaspur Vande Bharat",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "06:45",
    "avgSpeed": 105,
    "stopMins": 2
  },
  {
    "trainNumber": "20826",
    "name": "Nagpur Vande Bharat",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "07:30",
    "avgSpeed": 105,
    "stopMins": 2
  },
  {
    "trainNumber": "12123",
    "name": "Deccan Queen Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "07:10",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "12124",
    "name": "Deccan Queen Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "07:15",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "12125",
    "name": "Pragati Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "07:45",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "12126",
    "name": "Pragati Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "07:50",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "12127",
    "name": "Mumbai Pune Intercity",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "06:40",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "12128",
    "name": "Pune Mumbai Intercity",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "08:05",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11007",
    "name": "Deccan Express",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "07:00",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11008",
    "name": "Deccan Express",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "07:35",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11009",
    "name": "Sinhagad Express",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "06:50",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11010",
    "name": "Sinhagad Express",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "06:05",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "12157",
    "name": "Hutatma Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "06:00",
    "avgSpeed": 90,
    "stopMins": 4
  },
  {
    "trainNumber": "12158",
    "name": "Hutatma Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "06:30",
    "avgSpeed": 90,
    "stopMins": 4
  },
  {
    "trainNumber": "12169",
    "name": "Pune Solapur Intercity",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "07:30",
    "avgSpeed": 90,
    "stopMins": 3
  },
  {
    "trainNumber": "12170",
    "name": "Solapur Pune Intercity",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "08:00",
    "avgSpeed": 90,
    "stopMins": 3
  },
  {
    "trainNumber": "12115",
    "name": "Siddheshwar Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "05:45",
    "avgSpeed": 80,
    "stopMins": 5
  },
  {
    "trainNumber": "12116",
    "name": "Siddheshwar Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "06:00",
    "avgSpeed": 80,
    "stopMins": 5
  },
  {
    "trainNumber": "11029",
    "name": "Koyna Express",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_KOLHAPUR",
    "direction": "UP",
    "depTime": "08:40",
    "avgSpeed": 70,
    "stopMins": 5
  },
  {
    "trainNumber": "11030",
    "name": "Koyna Express",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_KOLHAPUR",
    "direction": "DOWN",
    "depTime": "08:15",
    "avgSpeed": 70,
    "stopMins": 5
  },
  {
    "trainNumber": "17411",
    "name": "Mahalaxmi Express",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_KOLHAPUR",
    "direction": "UP",
    "depTime": "06:20",
    "avgSpeed": 75,
    "stopMins": 5
  },
  {
    "trainNumber": "17412",
    "name": "Mahalaxmi Express",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_KOLHAPUR",
    "direction": "DOWN",
    "depTime": "06:50",
    "avgSpeed": 75,
    "stopMins": 5
  },
  {
    "trainNumber": "12105",
    "name": "Vidarbha Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "05:35",
    "avgSpeed": 85,
    "stopMins": 4
  },
  {
    "trainNumber": "12106",
    "name": "Vidarbha Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "06:00",
    "avgSpeed": 85,
    "stopMins": 4
  },
  {
    "trainNumber": "12139",
    "name": "Sewagram Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "06:55",
    "avgSpeed": 80,
    "stopMins": 5
  },
  {
    "trainNumber": "12140",
    "name": "Sewagram Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "07:15",
    "avgSpeed": 80,
    "stopMins": 5
  },
  {
    "trainNumber": "12289",
    "name": "Nagpur Duronto",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "06:15",
    "avgSpeed": 100,
    "stopMins": 2
  },
  {
    "trainNumber": "12290",
    "name": "Nagpur Duronto",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "06:40",
    "avgSpeed": 100,
    "stopMins": 2
  },
  {
    "trainNumber": "12111",
    "name": "CSMT Amravati Express",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "07:55",
    "avgSpeed": 80,
    "stopMins": 4
  },
  {
    "trainNumber": "12112",
    "name": "Amravati CSMT Express",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "07:05",
    "avgSpeed": 80,
    "stopMins": 4
  },
  {
    "trainNumber": "12109",
    "name": "Panchavati Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "06:15",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "12110",
    "name": "Panchavati Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "07:00",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "12859",
    "name": "Gitanjali Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "06:00",
    "avgSpeed": 90,
    "stopMins": 4
  },
  {
    "trainNumber": "12860",
    "name": "Gitanjali Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "07:40",
    "avgSpeed": 90,
    "stopMins": 4
  },
  {
    "trainNumber": "12137",
    "name": "Punjab Mail",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "07:35",
    "avgSpeed": 85,
    "stopMins": 4
  },
  {
    "trainNumber": "12138",
    "name": "Punjab Mail",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "05:10",
    "avgSpeed": 85,
    "stopMins": 4
  },
  {
    "trainNumber": "12809",
    "name": "Mumbai Howrah Mail",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "07:10",
    "avgSpeed": 85,
    "stopMins": 4
  },
  {
    "trainNumber": "12810",
    "name": "Howrah Mumbai Mail",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "06:45",
    "avgSpeed": 85,
    "stopMins": 4
  },
  {
    "trainNumber": "12151",
    "name": "Samarsata Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "08:35",
    "avgSpeed": 90,
    "stopMins": 4
  },
  {
    "trainNumber": "12152",
    "name": "Samarsata Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "05:30",
    "avgSpeed": 90,
    "stopMins": 4
  },
  {
    "trainNumber": "11057",
    "name": "Amritsar Express",
    "type": "Express",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "06:30",
    "avgSpeed": 70,
    "stopMins": 6
  },
  {
    "trainNumber": "11058",
    "name": "Amritsar Express",
    "type": "Express",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "05:45",
    "avgSpeed": 70,
    "stopMins": 6
  },
  {
    "trainNumber": "17617",
    "name": "Tapovan Express",
    "type": "Express",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "UP",
    "depTime": "05:30",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "17618",
    "name": "Tapovan Express",
    "type": "Express",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "DOWN",
    "depTime": "06:15",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "17057",
    "name": "Devagiri Express",
    "type": "Express",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "UP",
    "depTime": "06:30",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "17058",
    "name": "Devagiri Express",
    "type": "Express",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "DOWN",
    "depTime": "06:50",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11401",
    "name": "Nandigram Express",
    "type": "Express",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "UP",
    "depTime": "06:35",
    "avgSpeed": 70,
    "stopMins": 5
  },
  {
    "trainNumber": "11402",
    "name": "Nandigram Express",
    "type": "Express",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "DOWN",
    "depTime": "06:50",
    "avgSpeed": 70,
    "stopMins": 5
  },
  {
    "trainNumber": "17611",
    "name": "Rajya Rani Express",
    "type": "Express",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "UP",
    "depTime": "06:45",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "17612",
    "name": "Rajya Rani Express",
    "type": "Express",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "DOWN",
    "depTime": "07:00",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "10103",
    "name": "Mandovi Express",
    "type": "Express",
    "corridor": "MUMBAI_KONKAN",
    "direction": "UP",
    "depTime": "07:10",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "10104",
    "name": "Mandovi Express",
    "type": "Express",
    "corridor": "MUMBAI_KONKAN",
    "direction": "DOWN",
    "depTime": "07:15",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "10111",
    "name": "Konkan Kanya Express",
    "type": "Express",
    "corridor": "MUMBAI_KONKAN",
    "direction": "UP",
    "depTime": "06:00",
    "avgSpeed": 70,
    "stopMins": 5
  },
  {
    "trainNumber": "10112",
    "name": "Konkan Kanya Express",
    "type": "Express",
    "corridor": "MUMBAI_KONKAN",
    "direction": "DOWN",
    "depTime": "06:20",
    "avgSpeed": 70,
    "stopMins": 5
  },
  {
    "trainNumber": "12051",
    "name": "Jan Shatabdi Express",
    "type": "Superfast",
    "corridor": "MUMBAI_KONKAN",
    "direction": "UP",
    "depTime": "05:10",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "12052",
    "name": "Jan Shatabdi Express",
    "type": "Superfast",
    "corridor": "MUMBAI_KONKAN",
    "direction": "DOWN",
    "depTime": "06:30",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "22119",
    "name": "Tejas Express",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_KONKAN",
    "direction": "UP",
    "depTime": "05:50",
    "avgSpeed": 100,
    "stopMins": 2
  },
  {
    "trainNumber": "22120",
    "name": "Tejas Express",
    "type": "Semi-high-speed",
    "corridor": "MUMBAI_KONKAN",
    "direction": "DOWN",
    "depTime": "06:15",
    "avgSpeed": 100,
    "stopMins": 2
  },
  {
    "trainNumber": "12619",
    "name": "Matsyagandha Express",
    "type": "Superfast",
    "corridor": "MUMBAI_KONKAN",
    "direction": "UP",
    "depTime": "06:20",
    "avgSpeed": 80,
    "stopMins": 4
  },
  {
    "trainNumber": "12620",
    "name": "Matsyagandha Express",
    "type": "Superfast",
    "corridor": "MUMBAI_KONKAN",
    "direction": "DOWN",
    "depTime": "06:35",
    "avgSpeed": 80,
    "stopMins": 4
  },
  {
    "trainNumber": "12133",
    "name": "Mangaluru Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_KONKAN",
    "direction": "UP",
    "depTime": "07:02",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "12134",
    "name": "Mangaluru Superfast",
    "type": "Superfast",
    "corridor": "MUMBAI_KONKAN",
    "direction": "DOWN",
    "depTime": "07:30",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "12135",
    "name": "Pune Nagpur Superfast",
    "type": "Superfast",
    "corridor": "PUNE_NAGPUR",
    "direction": "UP",
    "depTime": "05:40",
    "avgSpeed": 85,
    "stopMins": 4
  },
  {
    "trainNumber": "12136",
    "name": "Nagpur Pune Superfast",
    "type": "Superfast",
    "corridor": "PUNE_NAGPUR",
    "direction": "DOWN",
    "depTime": "06:00",
    "avgSpeed": 85,
    "stopMins": 4
  },
  {
    "trainNumber": "12221",
    "name": "Pune Howrah Duronto",
    "type": "Superfast",
    "corridor": "PUNE_NAGPUR",
    "direction": "UP",
    "depTime": "06:15",
    "avgSpeed": 95,
    "stopMins": 2
  },
  {
    "trainNumber": "12222",
    "name": "Howrah Pune Duronto",
    "type": "Superfast",
    "corridor": "PUNE_NAGPUR",
    "direction": "DOWN",
    "depTime": "06:45",
    "avgSpeed": 95,
    "stopMins": 2
  },
  {
    "trainNumber": "11403",
    "name": "Nagpur Kolhapur Express",
    "type": "Express",
    "corridor": "NAGPUR_KOLHAPUR",
    "direction": "UP",
    "depTime": "05:15",
    "avgSpeed": 70,
    "stopMins": 6
  },
  {
    "trainNumber": "11404",
    "name": "Kolhapur Nagpur Express",
    "type": "Express",
    "corridor": "NAGPUR_KOLHAPUR",
    "direction": "DOWN",
    "depTime": "05:30",
    "avgSpeed": 70,
    "stopMins": 6
  },
  {
    "trainNumber": "11045",
    "name": "Deekshabhoomi Express",
    "type": "Express",
    "corridor": "NAGPUR_KOLHAPUR",
    "direction": "UP",
    "depTime": "05:55",
    "avgSpeed": 70,
    "stopMins": 6
  },
  {
    "trainNumber": "11046",
    "name": "Deekshabhoomi Express",
    "type": "Express",
    "corridor": "NAGPUR_KOLHAPUR",
    "direction": "DOWN",
    "depTime": "06:15",
    "avgSpeed": 70,
    "stopMins": 6
  },
  {
    "trainNumber": "11256",
    "name": "Mumbai Pune Kolhapur Superfast #11256",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_KOLHAPUR",
    "direction": "UP",
    "depTime": "05:15",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11258",
    "name": "Mumbai Nashik Nagpur Intercity #11258",
    "type": "Intercity",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "05:25",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11260",
    "name": "Mumbai Marathwada Superfast #11260",
    "type": "Superfast",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "UP",
    "depTime": "05:36",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11262",
    "name": "Mumbai Konkan Express #11262",
    "type": "Express",
    "corridor": "MUMBAI_KONKAN",
    "direction": "DOWN",
    "depTime": "05:46",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11264",
    "name": "Pune Nagpur Superfast #11264",
    "type": "Superfast",
    "corridor": "PUNE_NAGPUR",
    "direction": "UP",
    "depTime": "05:56",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11266",
    "name": "Nagpur Kolhapur Intercity #11266",
    "type": "Intercity",
    "corridor": "NAGPUR_KOLHAPUR",
    "direction": "DOWN",
    "depTime": "06:06",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11268",
    "name": "Mumbai Pune Solapur Superfast #11268",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "06:16",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11270",
    "name": "Mumbai Pune Kolhapur Express #11270",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_KOLHAPUR",
    "direction": "DOWN",
    "depTime": "06:27",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11272",
    "name": "Mumbai Nashik Nagpur Superfast #11272",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "06:37",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11274",
    "name": "Mumbai Marathwada Intercity #11274",
    "type": "Intercity",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "DOWN",
    "depTime": "06:47",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11276",
    "name": "Mumbai Konkan Superfast #11276",
    "type": "Superfast",
    "corridor": "MUMBAI_KONKAN",
    "direction": "UP",
    "depTime": "06:57",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11278",
    "name": "Pune Nagpur Express #11278",
    "type": "Express",
    "corridor": "PUNE_NAGPUR",
    "direction": "DOWN",
    "depTime": "07:07",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11280",
    "name": "Nagpur Kolhapur Superfast #11280",
    "type": "Superfast",
    "corridor": "NAGPUR_KOLHAPUR",
    "direction": "UP",
    "depTime": "07:18",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11282",
    "name": "Mumbai Pune Solapur Intercity #11282",
    "type": "Intercity",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "07:28",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11284",
    "name": "Mumbai Pune Kolhapur Superfast #11284",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_KOLHAPUR",
    "direction": "UP",
    "depTime": "07:38",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11286",
    "name": "Mumbai Nashik Nagpur Express #11286",
    "type": "Express",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "07:48",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11288",
    "name": "Mumbai Marathwada Superfast #11288",
    "type": "Superfast",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "UP",
    "depTime": "07:58",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11290",
    "name": "Mumbai Konkan Intercity #11290",
    "type": "Intercity",
    "corridor": "MUMBAI_KONKAN",
    "direction": "DOWN",
    "depTime": "08:09",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11292",
    "name": "Pune Nagpur Superfast #11292",
    "type": "Superfast",
    "corridor": "PUNE_NAGPUR",
    "direction": "UP",
    "depTime": "08:19",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11294",
    "name": "Nagpur Kolhapur Express #11294",
    "type": "Express",
    "corridor": "NAGPUR_KOLHAPUR",
    "direction": "DOWN",
    "depTime": "08:29",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11296",
    "name": "Mumbai Pune Solapur Superfast #11296",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "08:39",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11298",
    "name": "Mumbai Pune Kolhapur Intercity #11298",
    "type": "Intercity",
    "corridor": "MUMBAI_PUNE_KOLHAPUR",
    "direction": "DOWN",
    "depTime": "08:49",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11300",
    "name": "Mumbai Nashik Nagpur Superfast #11300",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "09:00",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11302",
    "name": "Mumbai Marathwada Express #11302",
    "type": "Express",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "DOWN",
    "depTime": "09:10",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11304",
    "name": "Mumbai Konkan Superfast #11304",
    "type": "Superfast",
    "corridor": "MUMBAI_KONKAN",
    "direction": "UP",
    "depTime": "09:20",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11306",
    "name": "Pune Nagpur Intercity #11306",
    "type": "Intercity",
    "corridor": "PUNE_NAGPUR",
    "direction": "DOWN",
    "depTime": "09:30",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11308",
    "name": "Nagpur Kolhapur Superfast #11308",
    "type": "Superfast",
    "corridor": "NAGPUR_KOLHAPUR",
    "direction": "UP",
    "depTime": "09:40",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11310",
    "name": "Mumbai Pune Solapur Express #11310",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "DOWN",
    "depTime": "09:51",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11312",
    "name": "Mumbai Pune Kolhapur Superfast #11312",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_KOLHAPUR",
    "direction": "UP",
    "depTime": "10:01",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11314",
    "name": "Mumbai Nashik Nagpur Intercity #11314",
    "type": "Intercity",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "DOWN",
    "depTime": "10:11",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11316",
    "name": "Mumbai Marathwada Superfast #11316",
    "type": "Superfast",
    "corridor": "MUMBAI_MARATHWADA",
    "direction": "UP",
    "depTime": "10:21",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11318",
    "name": "Mumbai Konkan Express #11318",
    "type": "Express",
    "corridor": "MUMBAI_KONKAN",
    "direction": "DOWN",
    "depTime": "10:31",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11320",
    "name": "Pune Nagpur Superfast #11320",
    "type": "Superfast",
    "corridor": "PUNE_NAGPUR",
    "direction": "UP",
    "depTime": "10:42",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11322",
    "name": "Nagpur Kolhapur Intercity #11322",
    "type": "Intercity",
    "corridor": "NAGPUR_KOLHAPUR",
    "direction": "DOWN",
    "depTime": "10:52",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11324",
    "name": "Mumbai Pune Solapur Superfast #11324",
    "type": "Superfast",
    "corridor": "MUMBAI_PUNE_SOLAPUR",
    "direction": "UP",
    "depTime": "11:02",
    "avgSpeed": 85,
    "stopMins": 3
  },
  {
    "trainNumber": "11326",
    "name": "Mumbai Pune Kolhapur Express #11326",
    "type": "Express",
    "corridor": "MUMBAI_PUNE_KOLHAPUR",
    "direction": "DOWN",
    "depTime": "11:12",
    "avgSpeed": 75,
    "stopMins": 4
  },
  {
    "trainNumber": "11328",
    "name": "Mumbai Nashik Nagpur Superfast #11328",
    "type": "Superfast",
    "corridor": "MUMBAI_NASHIK_NAGPUR",
    "direction": "UP",
    "depTime": "11:22",
    "avgSpeed": 85,
    "stopMins": 3
  }
];

export async function seedDatabase(simulatedDateOverride = null) {
  await Station.deleteMany({});
  await Train.deleteMany({});
  await TrainRun.deleteMany({});
  await Prediction.deleteMany({});

  await Station.insertMany(STATIONS_DATA);

  const stationMap = new Map(STATIONS_DATA.map(s => [s.code, s]));
  const today = simulatedDateOverride || new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();

  for (const tConf of TRAINS_DATA) {
    const corrCodes = CORRIDORS[tConf.corridor] || CORRIDORS['MUMBAI_PUNE_SOLAPUR'];
    const stationCodes = tConf.direction === 'UP' ? [...corrCodes] : [...corrCodes].reverse();
    const trainStations = stationCodes.map(c => stationMap.get(c)).filter(Boolean);

    if (trainStations.length < 2) continue;

    let schedule = [];
    let accumulatedStopMins = 0;
    const originKm = trainStations[0].kmFromOrigin;
    const destKm = trainStations[trainStations.length - 1].kmFromOrigin;
    const totalCorrKm = Math.abs(destKm - originKm) || 200;

    for (let i = 0; i < trainStations.length; i++) {
      const st = trainStations[i];
      const kmFromStart = Math.abs(st.kmFromOrigin - originKm);
      
      let arrivalOffset = (kmFromStart / tConf.avgSpeed) * 60 + accumulatedStopMins;
      let stopDuration = (i === 0 || i === trainStations.length - 1) ? 0 : tConf.stopMins;
      let departureOffset = arrivalOffset + stopDuration;

      if (i === 0) {
        arrivalOffset = null;
        departureOffset = 0;
      }
      if (i === trainStations.length - 1) {
        departureOffset = null;
      }
      
      if (i > 0 && i < trainStations.length - 1) {
        accumulatedStopMins += stopDuration;
      }

      schedule.push({
        stationCode: st.code,
        stationName: st.name,
        arrivalOffset: arrivalOffset !== null ? Math.round(arrivalOffset) : null,
        departureOffset: departureOffset !== null ? Math.round(departureOffset) : null,
        stopDuration: stopDuration,
        kmFromStart: kmFromStart
      });
    }

    await Train.create({
      trainNumber: tConf.trainNumber,
      name: tConf.name,
      type: tConf.type,
      direction: tConf.direction,
      originCode: trainStations[0].code,
      destinationCode: trainStations[trainStations.length - 1].code,
      schedule: schedule
    });

    const [hours, minutes] = tConf.depTime.split(':').map(Number);
    const departureTime = new Date(year, month, date, hours, minutes, 0);

    // Spread trains across states: 60% actively running mid-route, 40% scheduled
    const trainIdx = TRAINS_DATA.indexOf(tConf);
    const isRunning = (trainIdx % 10) < 6; // 60% running
    
    let initialKm = 0;
    let nextStationIdx = 0;
    let runStatus = 'not_started';
    let baseDelay = 0;

    if (isRunning && schedule.length > 2) {
      runStatus = 'running';
      // Pick random mid-route progress between 15% and 85%
      const progressFraction = 0.15 + ((trainIdx * 17) % 70) / 100;
      initialKm = Math.round(totalCorrKm * progressFraction);
      
      // Find next station index
      for (let sIdx = 0; sIdx < schedule.length; sIdx++) {
        if (schedule[sIdx].kmFromStart > initialKm) {
          nextStationIdx = sIdx;
          break;
        }
      }
      if (nextStationIdx === 0) nextStationIdx = 1;

      // Realistic delay based on corridor and randomness
      const delaySeed = (trainIdx * 7) % 10;
      if (delaySeed > 6) {
        baseDelay = 12 + (trainIdx % 15); // Significant delay (12-27 min)
      } else if (delaySeed > 2) {
        baseDelay = 3 + (trainIdx % 8); // Minor delay (3-10 min)
      } else {
        baseDelay = 0; // On time
      }
    }

    const stationLog = schedule.map((stop, sIdx) => {
      const isPassed = isRunning && sIdx < nextStationIdx;
      const stopDelay = isPassed ? Math.max(0, Math.round(baseDelay * (sIdx / Math.max(1, nextStationIdx)))) : (sIdx === nextStationIdx ? baseDelay : 0);

      return {
        stationCode: stop.stationCode,
        stationName: stop.stationName,
        scheduledArrival: stop.arrivalOffset !== null ? new Date(departureTime.getTime() + stop.arrivalOffset * 60000) : null,
        scheduledDeparture: stop.departureOffset !== null ? new Date(departureTime.getTime() + stop.departureOffset * 60000) : null,
        actualArrival: isPassed ? new Date(departureTime.getTime() + (stop.arrivalOffset + stopDelay) * 60000) : null,
        actualDeparture: isPassed ? new Date(departureTime.getTime() + (stop.departureOffset + stopDelay) * 60000) : null,
        delayMinutes: stopDelay,
        arrived: isPassed,
        departed: isPassed
      };
    });

    await TrainRun.create({
      trainNumber: tConf.trainNumber,
      trainName: tConf.name,
      trainType: tConf.type,
      direction: tConf.direction,
      status: runStatus,
      currentKm: initialKm,
      totalKm: totalCorrKm,
      currentSpeed: isRunning ? tConf.avgSpeed : 0,
      nextStationIndex: nextStationIdx,
      departureTime: departureTime,
      stationLog: stationLog,
      weather: { condition: 'clear', temperature: 29 },
      congestionLevel: baseDelay > 10 ? 0.65 : 0.25,
      predictionHistory: []
    });
  }

  // Seed 7-Day Rolling Historical Trend Log for Corridor Analytics (Feature 3)
  await HistoricalTrend.deleteMany({});
  const corridorKeys = ['CSMT-SUR', 'CSMT-NGP', 'PUNE-NGP', 'CSMT-MAO', 'PUNE-KOP'];
  const historicalEntries = [];

  for (let d = 7; d >= 0; d--) {
    const logDate = new Date(today);
    logDate.setDate(logDate.getDate() - d);
    const dateStr = logDate.toISOString().split('T')[0];

    for (const corr of corridorKeys) {
      const baseCorrDelay = corr.includes('NGP') ? 14 : corr.includes('SUR') ? 8 : 10;
      const numServices = 12 + ((d * 3 + corr.length) % 8);

      for (let s = 0; s < numServices; s++) {
        const trainNum = 11000 + ((d * 20 + s * 7) % 500);
        const randomNoise = ((s * 13 + d * 7) % 11) - 5;
        const predicted = Math.max(0, baseCorrDelay + randomNoise);
        const actualDelta = ((s * 5 + d * 3) % 7) - 3;
        const actual = Math.max(0, predicted + actualDelta);

        const serviceTimestamp = new Date(logDate);
        serviceTimestamp.setHours(6 + (s % 16), (s * 23) % 60, 0, 0);

        historicalEntries.push({
          timestamp: serviceTimestamp,
          trainNumber: String(trainNum),
          corridor: corr,
          stationCode: corr.split('-')[1] || 'SUR',
          predictedDelay: Math.round(predicted * 10) / 10,
          actualDelay: Math.round(actual * 10) / 10,
          date: dateStr
        });
      }
    }
  }

  await HistoricalTrend.insertMany(historicalEntries);
}
