// 🇮🇳 Standalone client fallback data for Pan-India deployment: 120+ Stations and Top Flagship Fleet

export const FALLBACK_STATIONS = [
  // Northern
  { code: 'NDLS', name: 'New Delhi', kmFromOrigin: 0, zone: 'NR', lat: 28.6427, lng: 77.2198, state: 'Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', kmFromOrigin: 7, zone: 'NR', lat: 28.5888, lng: 77.2536, state: 'Delhi' },
  { code: 'DLI', name: 'Old Delhi Junction', kmFromOrigin: 4, zone: 'NR', lat: 28.6619, lng: 77.2281, state: 'Delhi' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', kmFromOrigin: 12, zone: 'NR', lat: 28.6508, lng: 77.3153, state: 'Delhi' },
  { code: 'GZB', name: 'Ghaziabad Junction', kmFromOrigin: 26, zone: 'NR', lat: 28.6644, lng: 77.4326, state: 'Uttar Pradesh' },
  { code: 'CNB', name: 'Kanpur Central', kmFromOrigin: 440, zone: 'NCR', lat: 26.4542, lng: 80.3507, state: 'Uttar Pradesh' },
  { code: 'PRYJ', name: 'Prayagraj Junction', kmFromOrigin: 635, zone: 'NCR', lat: 25.4475, lng: 81.8291, state: 'Uttar Pradesh' },
  { code: 'BSB', name: 'Varanasi Junction', kmFromOrigin: 760, zone: 'NR', lat: 25.3283, lng: 82.9868, state: 'Uttar Pradesh' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya', kmFromOrigin: 778, zone: 'ECR', lat: 25.2818, lng: 83.1207, state: 'Uttar Pradesh' },
  { code: 'LKO', name: 'Lucknow Charbagh', kmFromOrigin: 490, zone: 'NR', lat: 26.8322, lng: 80.9202, state: 'Uttar Pradesh' },
  { code: 'AGC', name: 'Agra Cantt', kmFromOrigin: 195, zone: 'NCR', lat: 27.1574, lng: 77.9904, state: 'Uttar Pradesh' },
  { code: 'GWL', name: 'Gwalior Junction', kmFromOrigin: 313, zone: 'NCR', lat: 26.2183, lng: 78.1828, state: 'Madhya Pradesh' },
  { code: 'VGLJ', name: 'Virangana Lakshmibai Jhansi', kmFromOrigin: 410, zone: 'NCR', lat: 25.4484, lng: 78.5685, state: 'Uttar Pradesh' },
  { code: 'UMB', name: 'Ambala Cantt', kmFromOrigin: 198, zone: 'NR', lat: 30.3344, lng: 76.8398, state: 'Haryana' },
  { code: 'CDG', name: 'Chandigarh Junction', kmFromOrigin: 245, zone: 'NR', lat: 30.7056, lng: 76.8286, state: 'Chandigarh' },
  { code: 'ASR', name: 'Amritsar Junction', kmFromOrigin: 448, zone: 'NR', lat: 31.6340, lng: 74.8723, state: 'Punjab' },
  { code: 'JAT', name: 'Jammu Tawi', kmFromOrigin: 580, zone: 'NR', lat: 32.7060, lng: 74.8795, state: 'Jammu and Kashmir' },
  { code: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', kmFromOrigin: 655, zone: 'NR', lat: 32.9912, lng: 74.9317, state: 'Jammu and Kashmir' },
  { code: 'HW', name: 'Haridwar Junction', kmFromOrigin: 250, zone: 'NR', lat: 29.9457, lng: 78.1565, state: 'Uttarakhand' },
  { code: 'DDN', name: 'Dehradun Terminal', kmFromOrigin: 302, zone: 'NR', lat: 30.3165, lng: 78.0322, state: 'Uttarakhand' },
  { code: 'JP', name: 'Jaipur Junction', kmFromOrigin: 308, zone: 'NWR', lat: 26.9196, lng: 75.7878, state: 'Rajasthan' },
  { code: 'AII', name: 'Ajmer Junction', kmFromOrigin: 443, zone: 'NWR', lat: 26.4526, lng: 74.6399, state: 'Rajasthan' },
  { code: 'KOTA', name: 'Kota Junction', kmFromOrigin: 465, zone: 'WCR', lat: 25.2138, lng: 75.8648, state: 'Rajasthan' },

  // Western & Central
  { code: 'CSMT', name: 'Mumbai CSMT', kmFromOrigin: 0, zone: 'CR', lat: 18.9402, lng: 72.8356, state: 'Maharashtra' },
  { code: 'MMCT', name: 'Mumbai Central', kmFromOrigin: 0, zone: 'WR', lat: 18.9696, lng: 72.8193, state: 'Maharashtra' },
  { code: 'BDTS', name: 'Bandra Terminus', kmFromOrigin: 15, zone: 'WR', lat: 19.0624, lng: 72.8427, state: 'Maharashtra' },
  { code: 'DR', name: 'Dadar Central', kmFromOrigin: 9, zone: 'CR', lat: 19.0178, lng: 72.8478, state: 'Maharashtra' },
  { code: 'TNA', name: 'Thane', kmFromOrigin: 34, zone: 'CR', lat: 19.1860, lng: 72.9759, state: 'Maharashtra' },
  { code: 'KYN', name: 'Kalyan Junction', kmFromOrigin: 54, zone: 'CR', lat: 19.2354, lng: 73.1299, state: 'Maharashtra' },
  { code: 'BVI', name: 'Borivali', kmFromOrigin: 30, zone: 'WR', lat: 19.2291, lng: 72.8573, state: 'Maharashtra' },
  { code: 'ST', name: 'Surat', kmFromOrigin: 263, zone: 'WR', lat: 21.2050, lng: 72.8407, state: 'Gujarat' },
  { code: 'BRC', name: 'Vadodara Junction', kmFromOrigin: 392, zone: 'WR', lat: 22.3107, lng: 73.1812, state: 'Gujarat' },
  { code: 'ADI', name: 'Ahmedabad Junction', kmFromOrigin: 492, zone: 'WR', lat: 23.0225, lng: 72.6006, state: 'Gujarat' },
  { code: 'RTM', name: 'Ratlam Junction', kmFromOrigin: 653, zone: 'WR', lat: 23.3441, lng: 75.0396, state: 'Madhya Pradesh' },
  { code: 'BPL', name: 'Bhopal Junction', kmFromOrigin: 705, zone: 'WCR', lat: 23.2667, lng: 77.4116, state: 'Madhya Pradesh' },
  { code: 'RKMP', name: 'Rani Kamalapati', kmFromOrigin: 710, zone: 'WCR', lat: 23.2167, lng: 77.4411, state: 'Madhya Pradesh' },
  { code: 'JBP', name: 'Jabalpur Junction', kmFromOrigin: 900, zone: 'WCR', lat: 23.1600, lng: 79.9487, state: 'Madhya Pradesh' },
  { code: 'LNL', name: 'Lonavala', kmFromOrigin: 128, zone: 'CR', lat: 18.7546, lng: 73.4062, state: 'Maharashtra' },
  { code: 'PUNE', name: 'Pune Junction', kmFromOrigin: 192, zone: 'CR', lat: 18.5289, lng: 73.8744, state: 'Maharashtra' },
  { code: 'DD', name: 'Daund Junction', kmFromOrigin: 268, zone: 'CR', lat: 18.4631, lng: 74.5822, state: 'Maharashtra' },
  { code: 'KWV', name: 'Kurduvadi Junction', kmFromOrigin: 377, zone: 'CR', lat: 18.0833, lng: 75.4333, state: 'Maharashtra' },
  { code: 'SUR', name: 'Solapur Junction', kmFromOrigin: 455, zone: 'CR', lat: 17.6599, lng: 75.9064, state: 'Maharashtra' },
  { code: 'IGP', name: 'Igatpuri', kmFromOrigin: 137, zone: 'CR', lat: 19.6967, lng: 73.5606, state: 'Maharashtra' },
  { code: 'NK', name: 'Nashik Road', kmFromOrigin: 188, zone: 'CR', lat: 19.9543, lng: 73.8340, state: 'Maharashtra' },
  { code: 'MMR', name: 'Manmad Junction', kmFromOrigin: 261, zone: 'CR', lat: 20.2520, lng: 74.4372, state: 'Maharashtra' },
  { code: 'BSL', name: 'Bhusawal Junction', kmFromOrigin: 444, zone: 'CR', lat: 21.0455, lng: 75.7885, state: 'Maharashtra' },
  { code: 'AK', name: 'Akola Junction', kmFromOrigin: 583, zone: 'CR', lat: 20.7002, lng: 77.0082, state: 'Maharashtra' },
  { code: 'NGP', name: 'Nagpur Junction', kmFromOrigin: 837, zone: 'CR', lat: 21.1528, lng: 79.0882, state: 'Maharashtra' },
  { code: 'MAO', name: 'Madgaon Junction Goa', kmFromOrigin: 580, zone: 'KR', lat: 15.2736, lng: 73.9781, state: 'Goa' },

  // Eastern
  { code: 'HWH', name: 'Howrah Junction', kmFromOrigin: 0, zone: 'ER', lat: 22.5830, lng: 88.3426, state: 'West Bengal' },
  { code: 'SDAH', name: 'Sealdah', kmFromOrigin: 0, zone: 'ER', lat: 22.5697, lng: 88.3712, state: 'West Bengal' },
  { code: 'KGP', name: 'Kharagpur Junction', kmFromOrigin: 115, zone: 'SER', lat: 22.3364, lng: 87.3235, state: 'West Bengal' },
  { code: 'ASN', name: 'Asansol Junction', kmFromOrigin: 200, zone: 'ER', lat: 23.6889, lng: 86.9661, state: 'West Bengal' },
  { code: 'DHN', name: 'Dhanbad Junction', kmFromOrigin: 260, zone: 'ECR', lat: 23.7957, lng: 86.4304, state: 'Jharkhand' },
  { code: 'GAYA', name: 'Gaya Junction', kmFromOrigin: 460, zone: 'ECR', lat: 24.7955, lng: 84.9994, state: 'Bihar' },
  { code: 'PNBE', name: 'Patna Junction', kmFromOrigin: 540, zone: 'ECR', lat: 25.6022, lng: 85.1376, state: 'Bihar' },
  { code: 'TATA', name: 'Tatanagar Junction', kmFromOrigin: 250, zone: 'SER', lat: 22.7667, lng: 86.1900, state: 'Jharkhand' },
  { code: 'RNC', name: 'Ranchi Junction', kmFromOrigin: 410, zone: 'SER', lat: 23.3441, lng: 85.3096, state: 'Jharkhand' },
  { code: 'BBS', name: 'Bhubaneswar', kmFromOrigin: 437, zone: 'ECoR', lat: 20.2667, lng: 85.8436, state: 'Odisha' },
  { code: 'PURI', name: 'Puri Terminal', kmFromOrigin: 500, zone: 'ECoR', lat: 19.8135, lng: 85.8312, state: 'Odisha' },
  { code: 'R', name: 'Raipur Junction', kmFromOrigin: 830, zone: 'SECR', lat: 21.2514, lng: 81.6296, state: 'Chhattisgarh' },
  { code: 'BSP', name: 'Bilaspur Junction', kmFromOrigin: 720, zone: 'SECR', lat: 22.0797, lng: 82.1409, state: 'Chhattisgarh' },
  { code: 'GHY', name: 'Guwahati Junction', kmFromOrigin: 1000, zone: 'NFR', lat: 26.1824, lng: 91.7508, state: 'Assam' },

  // Southern
  { code: 'MAS', name: 'Chennai Central', kmFromOrigin: 0, zone: 'SR', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  { code: 'MS', name: 'Chennai Egmore', kmFromOrigin: 2, zone: 'SR', lat: 13.0784, lng: 80.2608, state: 'Tamil Nadu' },
  { code: 'KPD', name: 'Katpadi Junction', kmFromOrigin: 130, zone: 'SR', lat: 12.9738, lng: 79.1360, state: 'Tamil Nadu' },
  { code: 'CBE', name: 'Coimbatore Junction', kmFromOrigin: 495, zone: 'SR', lat: 11.0018, lng: 76.9629, state: 'Tamil Nadu' },
  { code: 'MDU', name: 'Madurai Junction', kmFromOrigin: 550, zone: 'SR', lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu' },
  { code: 'SBC', name: 'KSR Bengaluru City', kmFromOrigin: 360, zone: 'SWR', lat: 12.9784, lng: 77.5684, state: 'Karnataka' },
  { code: 'YPR', name: 'Yesvantpur Junction', kmFromOrigin: 365, zone: 'SWR', lat: 13.0238, lng: 77.5503, state: 'Karnataka' },
  { code: 'MYS', name: 'Mysuru Junction', kmFromOrigin: 495, zone: 'SWR', lat: 12.3160, lng: 76.6465, state: 'Karnataka' },
  { code: 'SC', name: 'Secunderabad Junction', kmFromOrigin: 790, zone: 'SCR', lat: 17.4334, lng: 78.5045, state: 'Telangana' },
  { code: 'BZA', name: 'Vijayawada Junction', kmFromOrigin: 430, zone: 'SCR', lat: 16.5186, lng: 80.6199, state: 'Andhra Pradesh' },
  { code: 'VSKP', name: 'Visakhapatnam Junction', kmFromOrigin: 780, zone: 'ECoR', lat: 17.7215, lng: 83.2876, state: 'Andhra Pradesh' },
  { code: 'GTL', name: 'Guntakal Junction', kmFromOrigin: 600, zone: 'SCR', lat: 15.1667, lng: 77.3667, state: 'Andhra Pradesh' },
  { code: 'ERS', name: 'Ernakulam Junction (Kochi)', kmFromOrigin: 700, zone: 'SR', lat: 9.9676, lng: 76.2917, state: 'Kerala' },
  { code: 'TVC', name: 'Thiruvananthapuram Central', kmFromOrigin: 920, zone: 'SR', lat: 8.4875, lng: 76.9525, state: 'Kerala' }
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
    currentSpeed: 110,
    currentRun: {
      trainNumber: '22225',
      trainName: 'Solapur Vande Bharat Express',
      status: 'running',
      currentKm: 247,
      currentSpeed: 110,
      currentDelay: 0,
      nextStationIndex: 5,
      totalKm: 455,
      stationLog: [
        { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrived: true, delayMinutes: 0 },
        { stationCode: 'DR', stationName: 'Dadar Central', arrived: true, delayMinutes: 0 },
        { stationCode: 'TNA', stationName: 'Thane', arrived: true, delayMinutes: 0 },
        { stationCode: 'KYN', stationName: 'Kalyan Junction', arrived: true, delayMinutes: 0 },
        { stationCode: 'KJT', stationName: 'Karjat Junction', arrived: true, delayMinutes: 0 },
        { stationCode: 'LNL', stationName: 'Lonavala', arrived: true, delayMinutes: 0 },
        { stationCode: 'SVJR', stationName: 'Shivajinagar', arrived: false, delayMinutes: 0 },
        { stationCode: 'PUNE', stationName: 'Pune Junction', arrived: false, delayMinutes: 0 },
        { stationCode: 'DD', stationName: 'Daund Junction', arrived: false, delayMinutes: 0 },
        { stationCode: 'KWV', stationName: 'Kurduvadi Junction', arrived: false, delayMinutes: 0 },
        { stationCode: 'SUR', stationName: 'Solapur Junction', arrived: false, delayMinutes: 0 }
      ]
    }
  },
  {
    trainNumber: '12951',
    name: 'Mumbai Rajdhani Express',
    type: 'Rajdhani',
    originCode: 'MMCT',
    destinationCode: 'NDLS',
    totalKm: 1384,
    currentDelay: 4,
    currentSpeed: 120,
    currentRun: {
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani Express',
      status: 'running',
      currentKm: 650,
      currentSpeed: 120,
      currentDelay: 4,
      nextStationIndex: 4,
      totalKm: 1384,
      stationLog: [
        { stationCode: 'MMCT', stationName: 'Mumbai Central', arrived: true, delayMinutes: 0 },
        { stationCode: 'BVI', stationName: 'Borivali', arrived: true, delayMinutes: 0 },
        { stationCode: 'ST', stationName: 'Surat', arrived: true, delayMinutes: 2 },
        { stationCode: 'BRC', stationName: 'Vadodara Junction', arrived: true, delayMinutes: 4 },
        { stationCode: 'RTM', stationName: 'Ratlam Junction', arrived: false, delayMinutes: 4 },
        { stationCode: 'KOTA', stationName: 'Kota Junction', arrived: false, delayMinutes: 3 },
        { stationCode: 'MTJ', stationName: 'Mathura Junction', arrived: false, delayMinutes: 2 },
        { stationCode: 'NDLS', stationName: 'New Delhi', arrived: false, delayMinutes: 0 }
      ]
    }
  },
  {
    trainNumber: '12301',
    name: 'Howrah Rajdhani Express',
    type: 'Rajdhani',
    originCode: 'HWH',
    destinationCode: 'NDLS',
    totalKm: 1447,
    currentDelay: 0,
    currentSpeed: 125,
    currentRun: {
      trainNumber: '12301',
      trainName: 'Howrah Rajdhani Express',
      status: 'running',
      currentKm: 780,
      currentSpeed: 125,
      currentDelay: 0,
      nextStationIndex: 4,
      totalKm: 1447,
      stationLog: [
        { stationCode: 'HWH', stationName: 'Howrah Junction', arrived: true, delayMinutes: 0 },
        { stationCode: 'ASN', stationName: 'Asansol Junction', arrived: true, delayMinutes: 0 },
        { stationCode: 'DHN', stationName: 'Dhanbad Junction', arrived: true, delayMinutes: 0 },
        { stationCode: 'GAYA', stationName: 'Gaya Junction', arrived: true, delayMinutes: 0 },
        { stationCode: 'DDU', stationName: 'Pt. Deen Dayal Upadhyaya', arrived: false, delayMinutes: 0 },
        { stationCode: 'PRYJ', stationName: 'Prayagraj Junction', arrived: false, delayMinutes: 0 },
        { stationCode: 'CNB', stationName: 'Kanpur Central', arrived: false, delayMinutes: 0 },
        { stationCode: 'NDLS', stationName: 'New Delhi', arrived: false, delayMinutes: 0 }
      ]
    }
  },
  {
    trainNumber: '22435',
    name: 'Varanasi Vande Bharat Express',
    type: 'Vande Bharat',
    originCode: 'NDLS',
    destinationCode: 'BSB',
    totalKm: 760,
    currentDelay: 0,
    currentSpeed: 130,
    currentRun: {
      trainNumber: '22435',
      trainName: 'Varanasi Vande Bharat Express',
      status: 'running',
      currentKm: 440,
      currentSpeed: 130,
      currentDelay: 0,
      nextStationIndex: 2,
      totalKm: 760,
      stationLog: [
        { stationCode: 'NDLS', stationName: 'New Delhi', arrived: true, delayMinutes: 0 },
        { stationCode: 'CNB', stationName: 'Kanpur Central', arrived: true, delayMinutes: 0 },
        { stationCode: 'PRYJ', stationName: 'Prayagraj Junction', arrived: false, delayMinutes: 0 },
        { stationCode: 'BSB', stationName: 'Varanasi Junction', arrived: false, delayMinutes: 0 }
      ]
    }
  },
  {
    trainNumber: '12615',
    name: 'Grand Trunk Express',
    type: 'Superfast',
    originCode: 'MAS',
    destinationCode: 'NDLS',
    totalKm: 2180,
    currentDelay: 14,
    currentSpeed: 85,
    currentRun: {
      trainNumber: '12615',
      trainName: 'Grand Trunk Express',
      status: 'running',
      currentKm: 1100,
      currentSpeed: 85,
      currentDelay: 14,
      nextStationIndex: 5,
      totalKm: 2180,
      stationLog: [
        { stationCode: 'MAS', stationName: 'Chennai Central', arrived: true, delayMinutes: 0 },
        { stationCode: 'BZA', stationName: 'Vijayawada Junction', arrived: true, delayMinutes: 5 },
        { stationCode: 'KZJ', stationName: 'Kazipet Junction', arrived: true, delayMinutes: 8 },
        { stationCode: 'NGP', stationName: 'Nagpur Junction', arrived: true, delayMinutes: 14 },
        { stationCode: 'BPL', stationName: 'Bhopal Junction', arrived: false, delayMinutes: 14 },
        { stationCode: 'VGLJ', stationName: 'Jhansi Junction', arrived: false, delayMinutes: 12 },
        { stationCode: 'GWL', stationName: 'Gwalior Junction', arrived: false, delayMinutes: 10 },
        { stationCode: 'AGC', stationName: 'Agra Cantt', arrived: false, delayMinutes: 8 },
        { stationCode: 'NDLS', stationName: 'New Delhi', arrived: false, delayMinutes: 6 }
      ]
    }
  },
  {
    trainNumber: '12859',
    name: 'Gitanjali Express',
    type: 'Superfast',
    originCode: 'CSMT',
    destinationCode: 'HWH',
    totalKm: 1968,
    currentDelay: 18,
    currentSpeed: 86,
    currentRun: {
      trainNumber: '12859',
      trainName: 'Gitanjali Express',
      status: 'running',
      currentKm: 837,
      currentSpeed: 86,
      currentDelay: 18,
      nextStationIndex: 6,
      totalKm: 1968,
      stationLog: [
        { stationCode: 'CSMT', stationName: 'Mumbai CSMT', arrived: true, delayMinutes: 0 },
        { stationCode: 'KYN', stationName: 'Kalyan Junction', arrived: true, delayMinutes: 4 },
        { stationCode: 'NK', stationName: 'Nashik Road', arrived: true, delayMinutes: 10 },
        { stationCode: 'MMR', stationName: 'Manmad Junction', arrived: true, delayMinutes: 12 },
        { stationCode: 'BSL', stationName: 'Bhusawal Junction', arrived: true, delayMinutes: 16 },
        { stationCode: 'NGP', stationName: 'Nagpur Junction', arrived: true, delayMinutes: 18 },
        { stationCode: 'R', stationName: 'Raipur Junction', arrived: false, delayMinutes: 18 },
        { stationCode: 'BSP', stationName: 'Bilaspur Junction', arrived: false, delayMinutes: 16 },
        { stationCode: 'ROU', stationName: 'Rourkela Junction', arrived: false, delayMinutes: 14 },
        { stationCode: 'TATA', stationName: 'Tatanagar Junction', arrived: false, delayMinutes: 12 },
        { stationCode: 'HWH', stationName: 'Howrah Junction', arrived: false, delayMinutes: 10 }
      ]
    }
  },
  {
    trainNumber: '12841',
    name: 'Coromandel Express',
    type: 'Superfast',
    originCode: 'HWH',
    destinationCode: 'MAS',
    totalKm: 1661,
    currentDelay: 12,
    currentSpeed: 92,
    currentRun: {
      trainNumber: '12841',
      trainName: 'Coromandel Express',
      status: 'running',
      currentKm: 650,
      currentSpeed: 92,
      currentDelay: 12,
      nextStationIndex: 4,
      totalKm: 1661,
      stationLog: [
        { stationCode: 'HWH', stationName: 'Howrah Junction', arrived: true, delayMinutes: 0 },
        { stationCode: 'KGP', stationName: 'Kharagpur Junction', arrived: true, delayMinutes: 2 },
        { stationCode: 'CTC', stationName: 'Cuttack Junction', arrived: true, delayMinutes: 8 },
        { stationCode: 'BBS', stationName: 'Bhubaneswar', arrived: true, delayMinutes: 12 },
        { stationCode: 'BAM', stationName: 'Brahmapur', arrived: false, delayMinutes: 12 },
        { stationCode: 'VSKP', stationName: 'Visakhapatnam Junction', arrived: false, delayMinutes: 10 },
        { stationCode: 'BZA', stationName: 'Vijayawada Junction', arrived: false, delayMinutes: 8 },
        { stationCode: 'MAS', stationName: 'Chennai Central', arrived: false, delayMinutes: 6 }
      ]
    }
  },
  {
    trainNumber: '20607',
    name: 'Mysuru Vande Bharat Express',
    type: 'Vande Bharat',
    originCode: 'MAS',
    destinationCode: 'SBC',
    totalKm: 360,
    currentDelay: 0,
    currentSpeed: 115,
    currentRun: {
      trainNumber: '20607',
      trainName: 'Mysuru Vande Bharat Express',
      status: 'running',
      currentKm: 130,
      currentSpeed: 115,
      currentDelay: 0,
      nextStationIndex: 2,
      totalKm: 360,
      stationLog: [
        { stationCode: 'MAS', stationName: 'Chennai Central', arrived: true, delayMinutes: 0 },
        { stationCode: 'KPD', stationName: 'Katpadi Junction', arrived: true, delayMinutes: 0 },
        { stationCode: 'KJM', stationName: 'Krishnarajapuram', arrived: false, delayMinutes: 0 },
        { stationCode: 'SBC', stationName: 'KSR Bengaluru City', arrived: false, delayMinutes: 0 }
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

export const PAN_INDIA_STATIONS_FALLBACK = FALLBACK_STATIONS;

