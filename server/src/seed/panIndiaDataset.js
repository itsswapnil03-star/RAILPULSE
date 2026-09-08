// 🇮🇳 Pan-India National Railway Dataset: 120+ Tier-1/Tier-2 Stations & 500 Active Trains

export const PAN_INDIA_STATIONS = [
  // --- NORTHERN & NORTH-CENTRAL REGION (NR, NCR, NWR) ---
  { code: 'NDLS', name: 'New Delhi', zone: 'NR', lat: 28.6427, lng: 77.2198, state: 'Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', zone: 'NR', lat: 28.5888, lng: 77.2536, state: 'Delhi' },
  { code: 'DLI', name: 'Old Delhi Junction', zone: 'NR', lat: 28.6619, lng: 77.2281, state: 'Delhi' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', zone: 'NR', lat: 28.6508, lng: 77.3153, state: 'Delhi' },
  { code: 'GZB', name: 'Ghaziabad Junction', zone: 'NR', lat: 28.6644, lng: 77.4326, state: 'Uttar Pradesh' },
  { code: 'CNB', name: 'Kanpur Central', zone: 'NCR', lat: 26.4542, lng: 80.3507, state: 'Uttar Pradesh' },
  { code: 'PRYJ', name: 'Prayagraj Junction', zone: 'NCR', lat: 25.4475, lng: 81.8291, state: 'Uttar Pradesh' },
  { code: 'BSB', name: 'Varanasi Junction', zone: 'NR', lat: 25.3283, lng: 82.9868, state: 'Uttar Pradesh' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya (Mughalsarai)', zone: 'ECR', lat: 25.2818, lng: 83.1207, state: 'Uttar Pradesh' },
  { code: 'LKO', name: 'Lucknow Charbagh', zone: 'NR', lat: 26.8322, lng: 80.9202, state: 'Uttar Pradesh' },
  { code: 'LJN', name: 'Lucknow Junction NER', zone: 'NER', lat: 26.8310, lng: 80.9230, state: 'Uttar Pradesh' },
  { code: 'AGC', name: 'Agra Cantt', zone: 'NCR', lat: 27.1574, lng: 77.9904, state: 'Uttar Pradesh' },
  { code: 'AF', name: 'Agra Fort', zone: 'NCR', lat: 27.1818, lng: 78.0163, state: 'Uttar Pradesh' },
  { code: 'MTJ', name: 'Mathura Junction', zone: 'NCR', lat: 27.4924, lng: 77.6737, state: 'Uttar Pradesh' },
  { code: 'GWL', name: 'Gwalior Junction', zone: 'NCR', lat: 26.2183, lng: 78.1828, state: 'Madhya Pradesh' },
  { code: 'VGLJ', name: 'Virangana Lakshmibai Jhansi', zone: 'NCR', lat: 25.4484, lng: 78.5685, state: 'Uttar Pradesh' },
  { code: 'BE', name: 'Bareilly Junction', zone: 'NR', lat: 28.3377, lng: 79.4208, state: 'Uttar Pradesh' },
  { code: 'MB', name: 'Moradabad Junction', zone: 'NR', lat: 28.8386, lng: 78.7733, state: 'Uttar Pradesh' },
  { code: 'GKP', name: 'Gorakhpur Junction', zone: 'NER', lat: 26.7588, lng: 83.3818, state: 'Uttar Pradesh' },
  { code: 'AYC', name: 'Ayodhya Cantt', zone: 'NR', lat: 26.7797, lng: 82.1408, state: 'Uttar Pradesh' },
  { code: 'UMB', name: 'Ambala Cantt Junction', zone: 'NR', lat: 30.3344, lng: 76.8398, state: 'Haryana' },
  { code: 'CDG', name: 'Chandigarh Junction', zone: 'NR', lat: 30.7056, lng: 76.8286, state: 'Chandigarh' },
  { code: 'LDH', name: 'Ludhiana Junction', zone: 'NR', lat: 30.9010, lng: 75.8573, state: 'Punjab' },
  { code: 'JRC', name: 'Jalandhar Cantt', zone: 'NR', lat: 31.3005, lng: 75.6023, state: 'Punjab' },
  { code: 'ASR', name: 'Amritsar Junction', zone: 'NR', lat: 31.6340, lng: 74.8723, state: 'Punjab' },
  { code: 'JAT', name: 'Jammu Tawi', zone: 'NR', lat: 32.7060, lng: 74.8795, state: 'Jammu and Kashmir' },
  { code: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', zone: 'NR', lat: 32.9912, lng: 74.9317, state: 'Jammu and Kashmir' },
  { code: 'HW', name: 'Haridwar Junction', zone: 'NR', lat: 29.9457, lng: 78.1565, state: 'Uttarakhand' },
  { code: 'DDN', name: 'Dehradun Terminal', zone: 'NR', lat: 30.3165, lng: 78.0322, state: 'Uttarakhand' },
  { code: 'JP', name: 'Jaipur Junction', zone: 'NWR', lat: 26.9196, lng: 75.7878, state: 'Rajasthan' },
  { code: 'AII', name: 'Ajmer Junction', zone: 'NWR', lat: 26.4526, lng: 74.6399, state: 'Rajasthan' },
  { code: 'JU', name: 'Jodhpur Junction', zone: 'NWR', lat: 26.2847, lng: 73.0242, state: 'Rajasthan' },
  { code: 'BKN', name: 'Bikaner Junction', zone: 'NWR', lat: 28.0163, lng: 73.3119, state: 'Rajasthan' },
  { code: 'UDZ', name: 'Udaipur City', zone: 'NWR', lat: 24.5713, lng: 73.6980, state: 'Rajasthan' },
  { code: 'KOTA', name: 'Kota Junction', zone: 'WCR', lat: 25.2138, lng: 75.8648, state: 'Rajasthan' },

  // --- WESTERN & CENTRAL REGION (WR, CR, WCR) ---
  { code: 'CSMT', name: 'Mumbai CSMT', zone: 'CR', lat: 18.9402, lng: 72.8356, state: 'Maharashtra' },
  { code: 'MMCT', name: 'Mumbai Central', zone: 'WR', lat: 18.9696, lng: 72.8193, state: 'Maharashtra' },
  { code: 'BDTS', name: 'Bandra Terminus', zone: 'WR', lat: 19.0624, lng: 72.8427, state: 'Maharashtra' },
  { code: 'DR', name: 'Dadar Central', zone: 'CR', lat: 19.0178, lng: 72.8478, state: 'Maharashtra' },
  { code: 'TNA', name: 'Thane', zone: 'CR', lat: 19.1860, lng: 72.9759, state: 'Maharashtra' },
  { code: 'KYN', name: 'Kalyan Junction', zone: 'CR', lat: 19.2354, lng: 73.1299, state: 'Maharashtra' },
  { code: 'PNVL', name: 'Panvel Junction', zone: 'CR', lat: 18.9886, lng: 73.1103, state: 'Maharashtra' },
  { code: 'BVI', name: 'Borivali', zone: 'WR', lat: 19.2291, lng: 72.8573, state: 'Maharashtra' },
  { code: 'BSR', name: 'Vasai Road', zone: 'WR', lat: 19.3813, lng: 72.8311, state: 'Maharashtra' },
  { code: 'ST', name: 'Surat', zone: 'WR', lat: 21.2050, lng: 72.8407, state: 'Gujarat' },
  { code: 'BRC', name: 'Vadodara Junction', zone: 'WR', lat: 22.3107, lng: 73.1812, state: 'Gujarat' },
  { code: 'ADI', name: 'Ahmedabad Junction', zone: 'WR', lat: 23.0225, lng: 72.6006, state: 'Gujarat' },
  { code: 'RJT', name: 'Rajkot Junction', zone: 'WR', lat: 22.3134, lng: 70.7972, state: 'Gujarat' },
  { code: 'RTM', name: 'Ratlam Junction', zone: 'WR', lat: 23.3441, lng: 75.0396, state: 'Madhya Pradesh' },
  { code: 'INDB', name: 'Indore Junction', zone: 'WR', lat: 22.7177, lng: 75.8682, state: 'Madhya Pradesh' },
  { code: 'UJN', name: 'Ujjain Junction', zone: 'WR', lat: 23.1828, lng: 75.7772, state: 'Madhya Pradesh' },
  { code: 'BPL', name: 'Bhopal Junction', zone: 'WCR', lat: 23.2667, lng: 77.4116, state: 'Madhya Pradesh' },
  { code: 'RKMP', name: 'Rani Kamalapati (Habibganj)', zone: 'WCR', lat: 23.2167, lng: 77.4411, state: 'Madhya Pradesh' },
  { code: 'JBP', name: 'Jabalpur Junction', zone: 'WCR', lat: 23.1600, lng: 79.9487, state: 'Madhya Pradesh' },
  { code: 'KTE', name: 'Katni Junction', zone: 'WCR', lat: 23.8343, lng: 80.3957, state: 'Madhya Pradesh' },
  { code: 'STA', name: 'Satna Junction', zone: 'WCR', lat: 24.5800, lng: 80.8300, state: 'Madhya Pradesh' },
  { code: 'KJT', name: 'Karjat Junction', zone: 'CR', lat: 18.9100, lng: 73.3283, state: 'Maharashtra' },
  { code: 'LNL', name: 'Lonavala', zone: 'CR', lat: 18.7546, lng: 73.4062, state: 'Maharashtra' },
  { code: 'SVJR', name: 'Shivajinagar', zone: 'CR', lat: 18.5323, lng: 73.8478, state: 'Maharashtra' },
  { code: 'PUNE', name: 'Pune Junction', zone: 'CR', lat: 18.5289, lng: 73.8744, state: 'Maharashtra' },
  { code: 'DD', name: 'Daund Junction', zone: 'CR', lat: 18.4631, lng: 74.5822, state: 'Maharashtra' },
  { code: 'KWV', name: 'Kurduvadi Junction', zone: 'CR', lat: 18.0833, lng: 75.4333, state: 'Maharashtra' },
  { code: 'SUR', name: 'Solapur Junction', zone: 'CR', lat: 17.6599, lng: 75.9064, state: 'Maharashtra' },
  { code: 'MRJ', name: 'Miraj Junction', zone: 'CR', lat: 16.8277, lng: 74.6469, state: 'Maharashtra' },
  { code: 'SLI', name: 'Sangli', zone: 'CR', lat: 16.8524, lng: 74.5815, state: 'Maharashtra' },
  { code: 'KOP', name: 'Kolhapur CSMT', zone: 'CR', lat: 16.6956, lng: 74.2317, state: 'Maharashtra' },
  { code: 'IGP', name: 'Igatpuri', zone: 'CR', lat: 19.6967, lng: 73.5606, state: 'Maharashtra' },
  { code: 'NK', name: 'Nashik Road', zone: 'CR', lat: 19.9543, lng: 73.8340, state: 'Maharashtra' },
  { code: 'MMR', name: 'Manmad Junction', zone: 'CR', lat: 20.2520, lng: 74.4372, state: 'Maharashtra' },
  { code: 'CSN', name: 'Chalisgaon Junction', zone: 'CR', lat: 20.4633, lng: 75.0142, state: 'Maharashtra' },
  { code: 'JL', name: 'Jalgaon Junction', zone: 'CR', lat: 21.0055, lng: 75.5667, state: 'Maharashtra' },
  { code: 'BSL', name: 'Bhusawal Junction', zone: 'CR', lat: 21.0455, lng: 75.7885, state: 'Maharashtra' },
  { code: 'AK', name: 'Akola Junction', zone: 'CR', lat: 20.7002, lng: 77.0082, state: 'Maharashtra' },
  { code: 'BD', name: 'Badnera (Amravati)', zone: 'CR', lat: 20.8653, lng: 77.7289, state: 'Maharashtra' },
  { code: 'WR', name: 'Wardha Junction', zone: 'CR', lat: 20.7453, lng: 78.6022, state: 'Maharashtra' },
  { code: 'NGP', name: 'Nagpur Junction', zone: 'CR', lat: 21.1528, lng: 79.0882, state: 'Maharashtra' },
  { code: 'G', name: 'Gondia Junction', zone: 'SECR', lat: 21.4589, lng: 80.1961, state: 'Maharashtra' },
  { code: 'AWB', name: 'Chhatrapati Sambhajinagar', zone: 'SCR', lat: 19.8762, lng: 75.3433, state: 'Maharashtra' },
  { code: 'J', name: 'Jalna', zone: 'SCR', lat: 19.8410, lng: 75.8864, state: 'Maharashtra' },
  { code: 'NED', name: 'Hazur Sahib Nanded', zone: 'SCR', lat: 19.1557, lng: 77.3168, state: 'Maharashtra' },
  { code: 'RN', name: 'Ratnagiri', zone: 'KR', lat: 16.9902, lng: 73.3120, state: 'Maharashtra' },
  { code: 'SWV', name: 'Sawantwadi Road', zone: 'KR', lat: 15.9056, lng: 73.8184, state: 'Maharashtra' },
  { code: 'MAO', name: 'Madgaon Junction Goa', zone: 'KR', lat: 15.2736, lng: 73.9781, state: 'Goa' },

  // --- EASTERN & NORTH-EASTERN REGION (ER, SER, ECR, SECR, ECoR, NFR) ---
  { code: 'HWH', name: 'Howrah Junction', zone: 'ER', lat: 22.5830, lng: 88.3426, state: 'West Bengal' },
  { code: 'SDAH', name: 'Sealdah', zone: 'ER', lat: 22.5697, lng: 88.3712, state: 'West Bengal' },
  { code: 'KOAA', name: 'Kolkata Terminal', zone: 'ER', lat: 22.6022, lng: 88.3769, state: 'West Bengal' },
  { code: 'KGP', name: 'Kharagpur Junction', zone: 'SER', lat: 22.3364, lng: 87.3235, state: 'West Bengal' },
  { code: 'ASN', name: 'Asansol Junction', zone: 'ER', lat: 23.6889, lng: 86.9661, state: 'West Bengal' },
  { code: 'DGR', name: 'Durgapur', zone: 'ER', lat: 23.4988, lng: 87.3119, state: 'West Bengal' },
  { code: 'NJP', name: 'New Jalpaiguri', zone: 'NFR', lat: 26.6853, lng: 88.4419, state: 'West Bengal' },
  { code: 'GHY', name: 'Guwahati Junction', zone: 'NFR', lat: 26.1824, lng: 91.7508, state: 'Assam' },
  { code: 'DBRG', name: 'Dibrugarh', zone: 'NFR', lat: 27.4728, lng: 94.9120, state: 'Assam' },
  { code: 'PNBE', name: 'Patna Junction', zone: 'ECR', lat: 25.6022, lng: 85.1376, state: 'Bihar' },
  { code: 'DNR', name: 'Danapur', zone: 'ECR', lat: 25.6267, lng: 85.0447, state: 'Bihar' },
  { code: 'GAYA', name: 'Gaya Junction', zone: 'ECR', lat: 24.7955, lng: 84.9994, state: 'Bihar' },
  { code: 'MFP', name: 'Muzaffarpur Junction', zone: 'ECR', lat: 26.1209, lng: 85.3906, state: 'Bihar' },
  { code: 'BJU', name: 'Barauni Junction', zone: 'ECR', lat: 25.4800, lng: 85.9700, state: 'Bihar' },
  { code: 'DHN', name: 'Dhanbad Junction', zone: 'ECR', lat: 23.7957, lng: 86.4304, state: 'Jharkhand' },
  { code: 'RNC', name: 'Ranchi Junction', zone: 'SER', lat: 23.3441, lng: 85.3096, state: 'Jharkhand' },
  { code: 'TATA', name: 'Tatanagar Junction', zone: 'SER', lat: 22.7667, lng: 86.1900, state: 'Jharkhand' },
  { code: 'BBS', name: 'Bhubaneswar', zone: 'ECoR', lat: 20.2667, lng: 85.8436, state: 'Odisha' },
  { code: 'CTC', name: 'Cuttack Junction', zone: 'ECoR', lat: 20.4625, lng: 85.8830, state: 'Odisha' },
  { code: 'PURI', name: 'Puri Terminal', zone: 'ECoR', lat: 19.8135, lng: 85.8312, state: 'Odisha' },
  { code: 'BAM', name: 'Brahmapur', zone: 'ECoR', lat: 19.3150, lng: 84.7941, state: 'Odisha' },
  { code: 'ROU', name: 'Rourkela Junction', zone: 'SER', lat: 22.2257, lng: 84.8628, state: 'Odisha' },
  { code: 'R', name: 'Raipur Junction', zone: 'SECR', lat: 21.2514, lng: 81.6296, state: 'Chhattisgarh' },
  { code: 'BSP', name: 'Bilaspur Junction', zone: 'SECR', lat: 22.0797, lng: 82.1409, state: 'Chhattisgarh' },
  { code: 'DURG', name: 'Durg Junction', zone: 'SECR', lat: 21.1904, lng: 81.2849, state: 'Chhattisgarh' },

  // --- SOUTHERN & SOUTH-CENTRAL REGION (SR, SCR, SWR, SCoR) ---
  { code: 'MAS', name: 'Chennai Central', zone: 'SR', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  { code: 'MS', name: 'Chennai Egmore', zone: 'SR', lat: 13.0784, lng: 80.2608, state: 'Tamil Nadu' },
  { code: 'TBM', name: 'Tambaram', zone: 'SR', lat: 12.9249, lng: 80.1293, state: 'Tamil Nadu' },
  { code: 'KPD', name: 'Katpadi Junction', zone: 'SR', lat: 12.9738, lng: 79.1360, state: 'Tamil Nadu' },
  { code: 'SA', name: 'Salem Junction', zone: 'SR', lat: 11.6643, lng: 78.1460, state: 'Tamil Nadu' },
  { code: 'ED', name: 'Erode Junction', zone: 'SR', lat: 11.3410, lng: 77.7172, state: 'Tamil Nadu' },
  { code: 'CBE', name: 'Coimbatore Junction', zone: 'SR', lat: 11.0018, lng: 76.9629, state: 'Tamil Nadu' },
  { code: 'TPJ', name: 'Tiruchchirappalli Junction', zone: 'SR', lat: 10.7905, lng: 78.7047, state: 'Tamil Nadu' },
  { code: 'MDU', name: 'Madurai Junction', zone: 'SR', lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu' },
  { code: 'CAPE', name: 'Kanyakumari', zone: 'SR', lat: 8.0883, lng: 77.5385, state: 'Tamil Nadu' },
  { code: 'SBC', name: 'KSR Bengaluru City', zone: 'SWR', lat: 12.9784, lng: 77.5684, state: 'Karnataka' },
  { code: 'YPR', name: 'Yesvantpur Junction', zone: 'SWR', lat: 13.0238, lng: 77.5503, state: 'Karnataka' },
  { code: 'KJM', name: 'Krishnarajapuram', zone: 'SWR', lat: 13.0012, lng: 77.6837, state: 'Karnataka' },
  { code: 'MYS', name: 'Mysuru Junction', zone: 'SWR', lat: 12.3160, lng: 76.6465, state: 'Karnataka' },
  { code: 'UBL', name: 'SSS Hubballi Junction', zone: 'SWR', lat: 15.3524, lng: 75.1479, state: 'Karnataka' },
  { code: 'BGM', name: 'Belagavi', zone: 'SWR', lat: 15.8497, lng: 74.4977, state: 'Karnataka' },
  { code: 'MAJN', name: 'Mangaluru Junction', zone: 'SR', lat: 12.8687, lng: 74.8647, state: 'Karnataka' },
  { code: 'UD', name: 'Udupi', zone: 'KR', lat: 13.3409, lng: 74.7421, state: 'Karnataka' },
  { code: 'SC', name: 'Secunderabad Junction', zone: 'SCR', lat: 17.4334, lng: 78.5045, state: 'Telangana' },
  { code: 'HYB', name: 'Hyderabad Deccan (Nampally)', zone: 'SCR', lat: 17.3916, lng: 78.4674, state: 'Telangana' },
  { code: 'KCG', name: 'Kacheguda', zone: 'SCR', lat: 17.3949, lng: 78.4983, state: 'Telangana' },
  { code: 'KZJ', name: 'Kazipet Junction', zone: 'SCR', lat: 17.9784, lng: 79.5204, state: 'Telangana' },
  { code: 'BZA', name: 'Vijayawada Junction', zone: 'SCR', lat: 16.5186, lng: 80.6199, state: 'Andhra Pradesh' },
  { code: 'VSKP', name: 'Visakhapatnam Junction', zone: 'ECoR', lat: 17.7215, lng: 83.2876, state: 'Andhra Pradesh' },
  { code: 'GTL', name: 'Guntakal Junction', zone: 'SCR', lat: 15.1667, lng: 77.3667, state: 'Andhra Pradesh' },
  { code: 'RU', name: 'Renigunta (Tirupati Outer)', zone: 'SCR', lat: 13.6393, lng: 79.5167, state: 'Andhra Pradesh' },
  { code: 'TPTY', name: 'Tirupati Main', zone: 'SCR', lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh' },
  { code: 'ERS', name: 'Ernakulam Junction (Kochi)', zone: 'SR', lat: 9.9676, lng: 76.2917, state: 'Kerala' },
  { code: 'ERN', name: 'Ernakulam Town', zone: 'SR', lat: 9.9922, lng: 76.2891, state: 'Kerala' },
  { code: 'TCR', name: 'Thrisur', zone: 'SR', lat: 10.5160, lng: 76.2144, state: 'Kerala' },
  { code: 'CLT', name: 'Kozhikode Main', zone: 'SR', lat: 11.2480, lng: 75.7839, state: 'Kerala' },
  { code: 'CAN', name: 'Kannur', zone: 'SR', lat: 11.8745, lng: 75.3704, state: 'Kerala' },
  { code: 'TVC', name: 'Thiruvananthapuram Central', zone: 'SR', lat: 8.4875, lng: 76.9525, state: 'Kerala' },
  { code: 'QLN', name: 'Kollam Junction', zone: 'SR', lat: 8.8879, lng: 76.5956, state: 'Kerala' }
];

export const STATIONS_MAP = new Map(PAN_INDIA_STATIONS.map(s => [s.code, s]));

// --- TRUNK CORRIDORS TEMPLATES FOR GENERATION ---
export const NATIONWIDE_CORRIDORS = {
  // 1. Golden Quadrilateral
  'DELHI_MUMBAI_WR': ['NDLS', 'MTJ', 'KOTA', 'RTM', 'BRC', 'ST', 'BVI', 'MMCT'],
  'MUMBAI_DELHI_WR': ['MMCT', 'BVI', 'ST', 'BRC', 'RTM', 'KOTA', 'MTJ', 'NDLS'],
  'DELHI_HOWRAH_MAIN': ['NDLS', 'CNB', 'PRYJ', 'DDU', 'GAYA', 'DHN', 'ASN', 'HWH'],
  'HOWRAH_DELHI_MAIN': ['HWH', 'ASN', 'DHN', 'GAYA', 'DDU', 'PRYJ', 'CNB', 'NDLS'],
  'DELHI_CHENNAI_GT': ['NDLS', 'AGC', 'GWL', 'VGLJ', 'BPL', 'NGP', 'KZJ', 'BZA', 'MAS'],
  'CHENNAI_DELHI_GT': ['MAS', 'BZA', 'KZJ', 'NGP', 'BPL', 'VGLJ', 'GWL', 'AGC', 'NDLS'],
  'HOWRAH_MUMBAI_CR': ['HWH', 'TATA', 'ROU', 'BSP', 'R', 'G', 'NGP', 'BSL', 'MMR', 'NK', 'KYN', 'CSMT'],
  'MUMBAI_HOWRAH_CR': ['CSMT', 'KYN', 'NK', 'MMR', 'BSL', 'NGP', 'G', 'R', 'BSP', 'ROU', 'TATA', 'HWH'],
  'HOWRAH_CHENNAI_EAST': ['HWH', 'KGP', 'CTC', 'BBS', 'BAM', 'VSKP', 'BZA', 'MAS'],
  'CHENNAI_HOWRAH_EAST': ['MAS', 'BZA', 'VSKP', 'BAM', 'BBS', 'CTC', 'KGP', 'HWH'],
  'MUMBAI_CHENNAI_DECCAN': ['CSMT', 'DR', 'TNA', 'KYN', 'LNL', 'PUNE', 'DD', 'SUR', 'GTL', 'RU', 'MAS'],
  'CHENNAI_MUMBAI_DECCAN': ['MAS', 'RU', 'GTL', 'SUR', 'DD', 'PUNE', 'LNL', 'KYN', 'TNA', 'DR', 'CSMT'],
  
  // 2. High-Density Regional Trunks
  'MUMBAI_PUNE_SOLAPUR': ['CSMT', 'DR', 'TNA', 'KYN', 'KJT', 'LNL', 'SVJR', 'PUNE', 'DD', 'KWV', 'SUR'],
  'SOLAPUR_PUNE_MUMBAI': ['SUR', 'KWV', 'DD', 'PUNE', 'SVJR', 'LNL', 'KJT', 'KYN', 'TNA', 'DR', 'CSMT'],
  'MUMBAI_AHMEDABAD': ['MMCT', 'BVI', 'BSR', 'ST', 'BRC', 'ADI'],
  'AHMEDABAD_MUMBAI': ['ADI', 'BRC', 'ST', 'BSR', 'BVI', 'MMCT'],
  'MUMBAI_GOA_KONKAN': ['CSMT', 'DR', 'TNA', 'PNVL', 'RN', 'SWV', 'MAO'],
  'GOA_MUMBAI_KONKAN': ['MAO', 'SWV', 'RN', 'PNVL', 'TNA', 'DR', 'CSMT'],
  'BENGALURU_CHENNAI': ['SBC', 'KJM', 'KPD', 'MAS'],
  'CHENNAI_BENGALURU': ['MAS', 'KPD', 'KJM', 'SBC'],
  'DELHI_KATRA': ['NDLS', 'UMB', 'LDH', 'JRC', 'JAT', 'SVDK'],
  'KATRA_DELHI': ['SVDK', 'JAT', 'JRC', 'LDH', 'UMB', 'NDLS'],
  'DELHI_VARANASI_VB': ['NDLS', 'CNB', 'PRYJ', 'BSB'],
  'VARANASI_DELHI_VB': ['BSB', 'PRYJ', 'CNB', 'NDLS'],
  'DELHI_LUCKNOW': ['NDLS', 'GZB', 'MB', 'BE', 'LKO'],
  'LUCKNOW_DELHI': ['LKO', 'BE', 'MB', 'GZB', 'NDLS'],
  'BENGALURU_HYDERABAD': ['SBC', 'YPR', 'GTL', 'KCG', 'SC'],
  'HYDERABAD_BENGALURU': ['SC', 'KCG', 'GTL', 'YPR', 'SBC'],
  'CHENNAI_KOCHI_TVC': ['MAS', 'KPD', 'SA', 'ED', 'CBE', 'TCR', 'ERS', 'QLN', 'TVC'],
  'TVC_KOCHI_CHENNAI': ['TVC', 'QLN', 'ERS', 'TCR', 'CBE', 'ED', 'SA', 'KPD', 'MAS'],
  'MUMBAI_NAGPUR': ['CSMT', 'DR', 'KYN', 'IGP', 'NK', 'MMR', 'CSN', 'JL', 'BSL', 'AK', 'BD', 'WR', 'NGP'],
  'NAGPUR_MUMBAI': ['NGP', 'WR', 'BD', 'AK', 'BSL', 'JL', 'CSN', 'MMR', 'NK', 'IGP', 'KYN', 'DR', 'CSMT'],
  'HOWRAH_PATNA': ['HWH', 'ASN', 'DGR', 'DHN', 'GAYA', 'PNBE'],
  'PATNA_HOWRAH': ['PNBE', 'GAYA', 'DHN', 'DGR', 'ASN', 'HWH'],
  'DELHI_AMRITSAR': ['NDLS', 'UMB', 'LDH', 'JRC', 'ASR'],
  'AMRITSAR_DELHI': ['ASR', 'JRC', 'LDH', 'UMB', 'NDLS'],
  'DELHI_JAIPUR_AJMER': ['NDLS', 'GZB', 'JP', 'AII'],
  'AJMER_JAIPUR_DELHI': ['AII', 'JP', 'GZB', 'NDLS'],
  'DELHI_DEHRADUN': ['NDLS', 'GZB', 'HW', 'DDN'],
  'DEHRADUN_DELHI': ['DDN', 'HW', 'GZB', 'NDLS'],
  'KOLKATA_GUWAHATI': ['HWH', 'NJP', 'GHY'],
  'GUWAHATI_KOLKATA': ['GHY', 'NJP', 'HWH']
};

// --- REAL FLAGSHIP TRAIN SEEDS (Curated Top 40 Indian Superfast/Rajdhani/Vande Bharat) ---
export const FLAGSHIP_TRAINS_LIST = [
  { num: '22225', name: 'Solapur Vande Bharat Express', type: 'Vande Bharat', corridor: 'MUMBAI_PUNE_SOLAPUR', speed: 110, delay: 0 },
  { num: '22226', name: 'Mumbai Vande Bharat Express', type: 'Vande Bharat', corridor: 'SOLAPUR_PUNE_MUMBAI', speed: 105, delay: 0 },
  { num: '12951', name: 'Mumbai Rajdhani Express', type: 'Rajdhani', corridor: 'MUMBAI_DELHI_WR', speed: 120, delay: 4 },
  { num: '12952', name: 'New Delhi Rajdhani Express', type: 'Rajdhani', corridor: 'DELHI_MUMBAI_WR', speed: 125, delay: 2 },
  { num: '12301', name: 'Howrah Rajdhani Express', type: 'Rajdhani', corridor: 'HOWRAH_DELHI_MAIN', speed: 125, delay: 0 },
  { num: '12302', name: 'New Delhi Howrah Rajdhani', type: 'Rajdhani', corridor: 'DELHI_HOWRAH_MAIN', speed: 120, delay: 5 },
  { num: '22435', name: 'Varanasi Vande Bharat Express', type: 'Vande Bharat', corridor: 'DELHI_VARANASI_VB', speed: 130, delay: 0 },
  { num: '22436', name: 'New Delhi Vande Bharat Express', type: 'Vande Bharat', corridor: 'VARANASI_DELHI_VB', speed: 125, delay: 0 },
  { num: '22439', name: 'Vande Bharat Express (Katra)', type: 'Vande Bharat', corridor: 'DELHI_KATRA', speed: 120, delay: 0 },
  { num: '20607', name: 'Mysuru Vande Bharat Express', type: 'Vande Bharat', corridor: 'CHENNAI_BENGALURU', speed: 115, delay: 0 },
  { num: '12615', name: 'Grand Trunk Express', type: 'Superfast', corridor: 'CHENNAI_DELHI_GT', speed: 85, delay: 14 },
  { num: '12616', name: 'Grand Trunk Express (UP)', type: 'Superfast', corridor: 'DELHI_CHENNAI_GT', speed: 90, delay: 8 },
  { num: '12621', name: 'Tamil Nadu Express', type: 'Superfast', corridor: 'CHENNAI_DELHI_GT', speed: 95, delay: 6 },
  { num: '12841', name: 'Coromandel Express', type: 'Superfast', corridor: 'HOWRAH_CHENNAI_EAST', speed: 92, delay: 12 },
  { num: '12842', name: 'Coromandel Express (Return)', type: 'Superfast', corridor: 'CHENNAI_HOWRAH_EAST', speed: 88, delay: 10 },
  { num: '12859', name: 'Gitanjali Express', type: 'Superfast', corridor: 'MUMBAI_HOWRAH_CR', speed: 86, delay: 18 },
  { num: '12860', name: 'Gitanjali Express (UP)', type: 'Superfast', corridor: 'HOWRAH_MUMBAI_CR', speed: 84, delay: 16 },
  { num: '12124', name: 'Deccan Queen Superfast', type: 'Superfast', corridor: 'SOLAPUR_PUNE_MUMBAI', speed: 82, delay: 6 },
  { num: '12123', name: 'Deccan Queen (Down)', type: 'Superfast', corridor: 'MUMBAI_PUNE_SOLAPUR', speed: 85, delay: 4 },
  { num: '11008', name: 'Deccan Express', type: 'Express', corridor: 'SOLAPUR_PUNE_MUMBAI', speed: 65, delay: 15 },
  { num: '12151', name: 'Samarsata Superfast Express', type: 'Superfast', corridor: 'MUMBAI_NAGPUR', speed: 88, delay: 18 },
  { num: '12158', name: 'Hutatma Superfast Express', type: 'Superfast', corridor: 'SOLAPUR_PUNE_MUMBAI', speed: 85, delay: 10 },
  { num: '22119', name: 'Madgaon Tejas Express', type: 'Superfast', corridor: 'MUMBAI_GOA_KONKAN', speed: 105, delay: 0 },
  { num: '12004', name: 'Lucknow Shatabdi Express', type: 'Shatabdi', corridor: 'DELHI_LUCKNOW', speed: 110, delay: 2 },
  { num: '12013', name: 'Amritsar Shatabdi Express', type: 'Shatabdi', corridor: 'DELHI_AMRITSAR', speed: 115, delay: 0 },
  { num: '12925', name: 'Paschim Superfast Express', type: 'Superfast', corridor: 'MUMBAI_DELHI_WR', speed: 88, delay: 9 },
  { num: '12625', name: 'Kerala Express', type: 'Superfast', corridor: 'DELHI_CHENNAI_GT', speed: 90, delay: 12 },
  { num: '12027', name: 'Bengaluru Shatabdi Express', type: 'Shatabdi', corridor: 'CHENNAI_BENGALURU', speed: 110, delay: 0 },
  { num: '12809', name: 'Howrah Mumbai Mail', type: 'Mail', corridor: 'HOWRAH_MUMBAI_CR', speed: 75, delay: 22 },
  { num: '12305', name: 'Kolkata Rajdhani Express', type: 'Rajdhani', corridor: 'HOWRAH_DELHI_MAIN', speed: 120, delay: 0 },
  { num: '22895', name: 'Puri Vande Bharat Express', type: 'Vande Bharat', corridor: 'HOWRAH_CHENNAI_EAST', speed: 110, delay: 0 },
  { num: '12261', name: 'Howrah Mumbai Duronto Express', type: 'Duronto', corridor: 'HOWRAH_MUMBAI_CR', speed: 115, delay: 0 },
  { num: '12434', name: 'Chennai Rajdhani Express', type: 'Rajdhani', corridor: 'DELHI_CHENNAI_GT', speed: 120, delay: 3 },
  { num: '12002', name: 'Bhopal Shatabdi Express', type: 'Shatabdi', corridor: 'DELHI_CHENNAI_GT', speed: 130, delay: 0 },
  { num: '12953', name: 'August Kranti Tejas Rajdhani', type: 'Rajdhani', corridor: 'MUMBAI_DELHI_WR', speed: 120, delay: 0 },
  { num: '12262', name: 'Mumbai Howrah Duronto Express', type: 'Duronto', corridor: 'MUMBAI_HOWRAH_CR', speed: 115, delay: 0 },
  { num: '12723', name: 'Telangana Express', type: 'Superfast', corridor: 'DELHI_CHENNAI_GT', speed: 90, delay: 7 },
  { num: '12617', name: 'Mangala Lakshadweep Express', type: 'Superfast', corridor: 'MUMBAI_GOA_KONKAN', speed: 82, delay: 16 },
  { num: '11322', name: 'Nagpur Kolhapur Intercity Express', type: 'Express', corridor: 'MUMBAI_NAGPUR', speed: 72, delay: 9 },
  { num: '11320', name: 'Pune Nagpur Superfast Express', type: 'Superfast', corridor: 'MUMBAI_NAGPUR', speed: 84, delay: 4 }
];

// Helper to compute rough cumulative km along a station list
function buildStationSchedule(stationCodes, avgSpeed = 75, baseHour = 6) {
  let curKm = 0;
  let curTimeMinutes = baseHour * 60;
  const schedule = [];

  for (let i = 0; i < stationCodes.length; i++) {
    const code = stationCodes[i];
    const st = STATIONS_MAP.get(code) || { code, name: code, lat: 20.0, lng: 78.0 };

    if (i > 0) {
      const prevSt = STATIONS_MAP.get(stationCodes[i - 1]) || { lat: 20.0, lng: 78.0 };
      // Great circle rough distance in km
      const dLat = (st.lat - prevSt.lat) * 111;
      const dLng = (st.lng - prevSt.lng) * 96;
      const dist = Math.max(25, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 1.15));
      curKm += dist;
      curTimeMinutes += Math.round((dist / avgSpeed) * 60) + (i === stationCodes.length - 1 ? 0 : 5);
    }

    const h = Math.floor((curTimeMinutes / 60) % 24);
    const m = Math.floor(curTimeMinutes % 60);
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

    schedule.push({
      stationCode: code,
      stationName: st.name,
      kmFromStart: curKm,
      scheduledArrival: timeStr,
      scheduledDeparture: timeStr,
      arrived: false,
      delayMinutes: 0
    });
  }

  return { schedule, totalKm: curKm };
}

// Generate the complete 500-train Fleet across all corridors
export function generatePanIndiaFleet(targetCount = 500) {
  const fleet = [];
  const corridorKeys = Object.keys(NATIONWIDE_CORRIDORS);
  const trainTypes = ['Vande Bharat', 'Rajdhani', 'Shatabdi', 'Superfast', 'Express', 'Mail', 'Duronto', 'Intercity'];
  
  // 1. Add curated Flagship Trains first
  FLAGSHIP_TRAINS_LIST.forEach((ft, idx) => {
    const stationCodes = NATIONWIDE_CORRIDORS[ft.corridor] || NATIONWIDE_CORRIDORS['MUMBAI_PUNE_SOLAPUR'];
    const originSt = STATIONS_MAP.get(stationCodes[0]);
    const destSt = STATIONS_MAP.get(stationCodes[stationCodes.length - 1]);
    const zone = originSt?.zone || destSt?.zone || 'NR';
    const { schedule, totalKm } = buildStationSchedule(stationCodes, ft.speed, (6 + (idx * 0.4)) % 22);
    
    // Simulate initial progress
    const progressRatio = (idx * 0.08 + 0.15) % 0.85;
    const currentKm = Math.round(totalKm * progressRatio);
    const haltsCompleted = Math.max(1, Math.floor(progressRatio * (schedule.length - 1)));
    const nextIdx = Math.min(schedule.length - 1, haltsCompleted);

    const stationLog = schedule.map((s, sIdx) => ({
      ...s,
      arrived: sIdx < haltsCompleted,
      delayMinutes: sIdx < haltsCompleted ? (ft.delay > 0 ? Math.round(ft.delay * (sIdx / haltsCompleted)) : 0) : 0
    }));

    fleet.push({
      trainNumber: ft.num,
      name: ft.name,
      type: ft.type,
      zone,
      originCode: stationCodes[0],
      destinationCode: stationCodes[stationCodes.length - 1],
      totalKm,
      currentKm,
      currentSpeed: ft.speed,
      currentDelay: ft.delay,
      status: 'running',
      schedule: stationLog,
      currentRun: {
        trainNumber: ft.num,
        trainName: ft.name,
        zone,
        status: 'running',
        currentKm,
        totalKm,
        currentSpeed: ft.speed,
        currentDelay: ft.delay,
        nextStationIndex: nextIdx,
        stationLog
      }
    });
  });

  // 2. Procedurally Generate Remaining Trains up to 500
  const usedTrainNumbers = new Set(fleet.map(f => String(f.trainNumber)));
  let trainNumCounter = 13001;
  const prefixes = [
    'Superfast Express', 'Express', 'Mail', 'Intercity Express', 
    'Garib Rath', 'Humsafar Express', 'Jan Shatabdi', 'SF Special'
  ];

  while (fleet.length < targetCount) {
    const corrKey = corridorKeys[fleet.length % corridorKeys.length];
    const stationCodes = NATIONWIDE_CORRIDORS[corrKey];
    const originSt = STATIONS_MAP.get(stationCodes[0]);
    const destSt = STATIONS_MAP.get(stationCodes[stationCodes.length - 1]);
    const zone = originSt?.zone || destSt?.zone || 'NR';
    
    const type = trainTypes[fleet.length % trainTypes.length];
    const prefix = prefixes[fleet.length % prefixes.length];
    
    let trainNumber = String(trainNumCounter++);
    while (usedTrainNumbers.has(trainNumber)) {
      trainNumber = String(trainNumCounter++);
    }
    usedTrainNumbers.add(trainNumber);

    const name = `${originSt?.name.split(' ')[0]} – ${destSt?.name.split(' ')[0]} ${prefix}`;
    const baseSpeed = type === 'Vande Bharat' ? 115 : type === 'Rajdhani' ? 120 : type === 'Superfast' ? 85 : 70;
    const speed = Math.round(baseSpeed + (Math.random() * 16 - 8));
    const delay = Math.random() < 0.35 ? Math.round(Math.random() * 25) : 0;

    const { schedule, totalKm } = buildStationSchedule(stationCodes, speed, (5 + (fleet.length * 0.25)) % 23);
    const progressRatio = (fleet.length * 0.047 + 0.1) % 0.9;
    const currentKm = Math.round(totalKm * progressRatio);
    const haltsCompleted = Math.max(1, Math.floor(progressRatio * (schedule.length - 1)));
    const nextIdx = Math.min(schedule.length - 1, haltsCompleted);

    const stationLog = schedule.map((s, sIdx) => ({
      ...s,
      arrived: sIdx < haltsCompleted,
      delayMinutes: sIdx < haltsCompleted ? (delay > 0 ? Math.round(delay * (sIdx / haltsCompleted)) : 0) : 0
    }));

    fleet.push({
      trainNumber,
      name,
      type,
      zone,
      originCode: stationCodes[0],
      destinationCode: stationCodes[stationCodes.length - 1],
      totalKm,
      currentKm,
      currentSpeed: speed,
      currentDelay: delay,
      status: 'running',
      schedule: stationLog,
      currentRun: {
        trainNumber,
        trainName: name,
        zone,
        status: 'running',
        currentKm,
        totalKm,
        currentSpeed: speed,
        currentDelay: delay,
        nextStationIndex: nextIdx,
        stationLog
      }
    });
  }

  return fleet;
}
