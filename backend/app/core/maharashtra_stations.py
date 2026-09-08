"""
Maharashtra Railway Stations Dataset
Real coordinates for 60+ stations across Maharashtra
Used for Leaflet map rendering and simulation
"""

MAHARASHTRA_STATIONS = [
    # Mumbai Division - Central Railway
    {
        "id": "CST",
        "name": "Chhatrapati Shivaji Maharaj Terminus",
        "code": "CSTM",
        "latitude": 18.9404,
        "longitude": 72.8378,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Mumbai"
    },
    {
        "id": "MASJ",
        "name": "Masjid",
        "code": "MSJ",
        "latitude": 18.9500,
        "longitude": 72.8350,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "SNRD",
        "name": "Sandhurst Road",
        "code": "SNRD",
        "latitude": 18.9550,
        "longitude": 72.8400,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "BYC",
        "name": "Byculla",
        "code": "BY",
        "latitude": 18.9600,
        "longitude": 72.8450,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "DRD",
        "name": "Dadar",
        "code": "DR",
        "latitude": 18.9750,
        "longitude": 72.8480,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Mumbai"
    },
    {
        "id": "MATU",
        "name": "Matunga",
        "code": "MTN",
        "latitude": 18.9850,
        "longitude": 72.8520,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "SION",
        "name": "Sion",
        "code": "SIN",
        "latitude": 19.0000,
        "longitude": 72.8550,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "KURLA",
        "name": "Kurla Junction",
        "code": "CLA",
        "latitude": 19.0100,
        "longitude": 72.8600,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Mumbai"
    },
    {
        "id": "VKH",
        "name": "Vikhroli",
        "code": "VK",
        "latitude": 19.0200,
        "longitude": 72.8700,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "KJRD",
        "name": "Kanjurmarg",
        "code": "KJMG",
        "latitude": 19.0300,
        "longitude": 72.8800,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "BNAR",
        "name": "Bhandup",
        "code": "BND",
        "latitude": 19.0400,
        "longitude": 72.8900,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "NAHUR",
        "name": "Nahur",
        "code": "NHU",
        "latitude": 19.0500,
        "longitude": 72.9000,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "MLNR",
        "name": "Mulund",
        "code": "MLND",
        "latitude": 19.0600,
        "longitude": 72.9100,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "THANE",
        "name": "Thane",
        "code": "TNA",
        "latitude": 19.2000,
        "longitude": 72.9750,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Thane"
    },
    {
        "id": "KLYN",
        "name": "Kalyan Junction",
        "code": "KYN",
        "latitude": 19.2400,
        "longitude": 73.1350,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Kalyan"
    },
    {
        "id": "DLX",
        "name": "Dombivli",
        "code": "DI",
        "latitude": 19.2200,
        "longitude": 73.1000,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Dombivli"
    },
    {
        "id": "KALVA",
        "name": "Kalva",
        "code": "KLVA",
        "latitude": 19.1900,
        "longitude": 72.9900,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Thane"
    },
    {
        "id": "MBQ",
        "name": "Mumbra",
        "code": "MBQ",
        "latitude": 19.1800,
        "longitude": 73.0100,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Thane"
    },
    # Nashik Division
    {
        "id": "IGP",
        "name": "Igatpuri",
        "code": "IGP",
        "latitude": 19.7000,
        "longitude": 73.5500,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Igatpuri"
    },
    {
        "id": "NKRD",
        "name": "Nashik Road",
        "code": "NK",
        "latitude": 20.0000,
        "longitude": 73.9300,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Nashik"
    },
    {
        "id": "DEOL",
        "name": "Deolali",
        "code": "DDL",
        "latitude": 19.9800,
        "longitude": 73.8000,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Nashik"
    },
    {
        "id": "MMR",
        "name": "Manmad Junction",
        "code": "MMR",
        "latitude": 20.2500,
        "longitude": 74.4500,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Manmad"
    },
    {
        "id": "BSL",
        "name": "Bhusaval Junction",
        "code": "BSL",
        "latitude": 21.0400,
        "longitude": 75.7800,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Bhusaval"
    },
    {
        "id": "JL",
        "name": "Jalgaon",
        "code": "JL",
        "latitude": 21.0100,
        "longitude": 75.5600,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Jalgaon"
    },
    {
        "id": "RBL",
        "name": "Raver",
        "code": "RVR",
        "latitude": 21.1500,
        "longitude": 75.5000,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Raver"
    },
    {
        "id": "BURH",
        "name": "Burhanpur",
        "code": "BAU",
        "latitude": 21.3000,
        "longitude": 76.2300,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Burhanpur"
    },
    {
        "id": "KNE",
        "name": "Khandwa",
        "code": "KNW",
        "latitude": 21.8200,
        "longitude": 76.3500,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Khandwa"
    },
    # Nagpur Division
    {
        "id": "NGP",
        "name": "Nagpur Junction",
        "code": "NGP",
        "latitude": 21.1458,
        "longitude": 79.0882,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Nagpur"
    },
    {
        "id": "AJNI",
        "name": "Ajni",
        "code": "AJNI",
        "latitude": 21.1200,
        "longitude": 79.1000,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Nagpur"
    },
    {
        "id": "WRR",
        "name": "Wardha Junction",
        "code": "WR",
        "latitude": 20.7500,
        "longitude": 78.6000,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Wardha"
    },
    # Mumbai Division - Western Railway
    {
        "id": "CCG",
        "name": "Churchgate",
        "code": "CCG",
        "latitude": 18.9400,
        "longitude": 72.8100,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "MCGM",
        "name": "Marine Lines",
        "code": "MEL",
        "latitude": 18.9450,
        "longitude": 72.8150,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "CLP",
        "name": "Charni Road",
        "code": "CYR",
        "latitude": 18.9500,
        "longitude": 72.8200,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "GTR",
        "name": "Grant Road",
        "code": "GTR",
        "latitude": 18.9550,
        "longitude": 72.8250,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "MCTM",
        "name": "Mumbai Central",
        "code": "BCT",
        "latitude": 18.9600,
        "longitude": 72.8300,
        "division": "Western Railway",
        "is_junction": True,
        "city": "Mumbai"
    },
    {
        "id": "ELP",
        "name": "Elphinstone Road",
        "code": "EPR",
        "latitude": 18.9650,
        "longitude": 72.8350,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "DDR",
        "name": "Dadar Western",
        "code": "DDR",
        "latitude": 18.9750,
        "longitude": 72.8400,
        "division": "Western Railway",
        "is_junction": True,
        "city": "Mumbai"
    },
    {
        "id": "MTVR",
        "name": "Matunga Road",
        "code": "MRU",
        "latitude": 18.9850,
        "longitude": 72.8450,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "MHTM",
        "name": "Mahim Junction",
        "code": "MM",
        "latitude": 19.0000,
        "longitude": 72.8500,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "BDTS",
        "name": "Bandra Terminus",
        "code": "BDTS",
        "latitude": 19.0500,
        "longitude": 72.8550,
        "division": "Western Railway",
        "is_junction": True,
        "city": "Mumbai"
    },
    {
        "id": "ANDC",
        "name": "Andheri",
        "code": "ADH",
        "latitude": 19.1000,
        "longitude": 72.8600,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "VLP",
        "name": "Vile Parle",
        "code": "VLP",
        "latitude": 19.1100,
        "longitude": 72.8700,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "SNR",
        "name": "Santacruz",
        "code": "STC",
        "latitude": 19.1200,
        "longitude": 72.8800,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "KHAR",
        "name": "Khar Road",
        "code": "KHAR",
        "latitude": 19.1300,
        "longitude": 72.8900,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    {
        "id": "BCL",
        "name": "Bandra",
        "code": "BA",
        "latitude": 19.1400,
        "longitude": 72.9000,
        "division": "Western Railway",
        "is_junction": False,
        "city": "Mumbai"
    },
    # Pune Division - Central Railway
    {
        "id": "PANVEL",
        "name": "Panvel",
        "code": "PNVL",
        "latitude": 18.9886,
        "longitude": 73.1214,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Panvel"
    },
    {
        "id": "KARJAT",
        "name": "Karjat",
        "code": "KJT",
        "latitude": 18.9200,
        "longitude": 73.3200,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Karjat"
    },
    {
        "id": "LNL",
        "name": "Lonavala",
        "code": "LNL",
        "latitude": 18.7500,
        "longitude": 73.4000,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Lonavala"
    },
    {
        "id": "KHOP",
        "name": "Khandala",
        "code": "KAD",
        "latitude": 18.7300,
        "longitude": 73.3800,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Khandala"
    },
    {
        "id": "PUNE",
        "name": "Pune Junction",
        "code": "PUNE",
        "latitude": 18.5300,
        "longitude": 73.8800,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Pune"
    },
    {
        "id": "SHIVAJINAGAR",
        "name": "Shivajinagar",
        "code": "SVJR",
        "latitude": 18.5500,
        "longitude": 73.8700,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Pune"
    },
    {
        "id": "KHADKI",
        "name": "Khadki",
        "code": "KK",
        "latitude": 18.5600,
        "longitude": 73.8600,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Pune"
    },
    {
        "id": "DAPODI",
        "name": "Dapodi",
        "code": "DAPD",
        "latitude": 18.5700,
        "longitude": 73.8500,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Pune"
    },
    {
        "id": "SATARA",
        "name": "Satara",
        "code": "STR",
        "latitude": 17.7000,
        "longitude": 74.0000,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Satara"
    },
    {
        "id": "KARAD",
        "name": "Karad",
        "code": "KRD",
        "latitude": 17.3000,
        "longitude": 74.2000,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Karad"
    },
    {
        "id": "SANGLI",
        "name": "Sangli",
        "code": "SLI",
        "latitude": 16.8600,
        "longitude": 74.5800,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Sangli"
    },
    {
        "id": "KOLHAPUR",
        "name": "Kolhapur",
        "code": "KOP",
        "latitude": 16.6950,
        "longitude": 74.2333,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Kolhapur"
    },
    {
        "id": "MIRABAI",
        "name": "Chhatrapati Shahu Maharaj Terminus",
        "code": "KOP",
        "latitude": 16.7000,
        "longitude": 74.2400,
        "division": "Central Railway",
        "is_junction": True,
        "city": "Kolhapur"
    },
    # Additional stations for completeness
    {
        "id": "SINHAGAD",
        "name": "Sinhagad Express Terminal",
        "code": "SGTY",
        "latitude": 18.4500,
        "longitude": 73.9000,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Pune"
    },
    {
        "id": "HADAPSAR",
        "name": "Hadapsar",
        "code": "HDP",
        "latitude": 18.5000,
        "longitude": 73.9200,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Pune"
    },
    {
        "id": "PIMPRI",
        "name": "Pimpri",
        "code": "PMP",
        "latitude": 18.6200,
        "longitude": 73.8000,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Pimpri-Chinchwad"
    },
    {
        "id": "CHINCHWAD",
        "name": "Chinchwad",
        "code": "CCH",
        "latitude": 18.6300,
        "longitude": 73.8100,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Pimpri-Chinchwad"
    },
    {
        "id": "AKURDI",
        "name": "Akurdi",
        "code": "AKRD",
        "latitude": 18.6400,
        "longitude": 73.8200,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Pimpri-Chinchwad"
    },
    {
        "id": "DEHU",
        "name": "Dehu Road",
        "code": "DEHR",
        "latitude": 18.6500,
        "longitude": 73.8300,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Dehu"
    },
    {
        "id": "TALEGAON",
        "name": "Talegaon",
        "code": "TGN",
        "latitude": 18.7200,
        "longitude": 73.6800,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Talegaon Dabhade"
    },
    {
        "id": "WATHAR",
        "name": "Wathar",
        "code": "WTR",
        "latitude": 18.4000,
        "longitude": 74.8000,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Wathar"
    },
    {
        "id": "ISLAMPUR",
        "name": "Islampur",
        "code": "ISR",
        "latitude": 18.3500,
        "longitude": 74.7500,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Islampur"
    },
    {
        "id": "BARAMATI",
        "name": "Baramati",
        "code": "BRMT",
        "latitude": 18.1500,
        "longitude": 74.5800,
        "division": "Central Railway",
        "is_junction": False,
        "city": "Baramati"
    },
]

# Station ID to Station mapping
STATION_MAP = {station["id"]: station for station in MAHARASHTRA_STATIONS}

# Corridor definitions
CORRIDORS = {
    "mumbai_cst_nagpur": [
        "CST", "MASJ", "SNRD", "BYC", "DRD", "MATU", "SION", "KURLA",
        "VKH", "KJRD", "BNAR", "NAHUR", "MLNR", "THANE", "KLYN",
        "DLX", "KALVA", "MBQ", "IGP", "NKRD", "DEOL", "MMR",
        "BSL", "JL", "RBL", "BURH", "KNE", "NGP"
    ],
    "mumbai_cst_kolhapur": [
        "CST", "DRD", "KURLA", "THANE", "PANVEL", "KARJAT", "LNL",
        "KHOP", "PUNE", "SHIVAJINAGAR", "KHADKI", "DAPODI",
        "PIMPRI", "CHINCHWAD", "AKURDI", "DEHU", "TALEGAON",
        "SATARA", "KARAD", "SANGLI", "KOLHAPUR"
    ],
    "mumbai_central_ahmedabad": [
        "CCG", "MCGM", "CLP", "GTR", "MCTM", "ELP", "DDR", "MTVR",
        "MHTM", "BDTS", "ANDC", "VLP", "SNR", "KHAR", "BCL"
    ],
    "pune_nagpur": [
        "PUNE", "SHIVAJINAGAR", "KHADKI", "DAPODI", "HADAPSAR",
        "SINHAGAD", "MMR", "BSL", "KNE", "NGP"
    ],
    "mumbai_cst_solapur": [
        "CST", "DRD", "KURLA", "THANE", "KLYN", "MMR", "BSL",
        "KNE", "NGP"
    ]
}

# Generate all possible station connections for simulation
STATION_CONNECTIONS = {}
for corridor_name, stations in CORRIDORS.items():
    for i in range(len(stations) - 1):
        station_a = stations[i]
        station_b = stations[i + 1]
        if station_a not in STATION_CONNECTIONS:
            STATION_CONNECTIONS[station_a] = []
        if station_b not in STATION_CONNECTIONS:
            STATION_CONNECTIONS[station_b] = []
        STATION_CONNECTIONS[station_a].append(station_b)
        STATION_CONNECTIONS[station_b].append(station_a)

# Remove duplicates and sort
for station in STATION_CONNECTIONS:
    STATION_CONNECTIONS[station] = sorted(list(set(STATION_CONNECTIONS[station])))

# Junction stations (higher congestion probability)
JUNCTION_STATIONS = [
    "CST", "DRD", "KURLA", "THANE", "KLYN", "MMR", "BSL",
    "PUNE", "NGP", "KNE", "PANVEL", "BDTS", "SANGLI", "KOLHAPUR"
]

def get_station_by_id(station_id):
    """Get station details by ID"""
    return STATION_MAP.get(station_id)

def get_stations_by_city(city):
    """Get all stations in a city"""
    return [s for s in MAHARASHTRA_STATIONS if s["city"].lower() == city.lower()]

def get_connected_stations(station_id):
    """Get all stations directly connected to a given station"""
    return STATION_CONNECTIONS.get(station_id, [])

def get_distance_between_stations(station_a_id, station_b_id):
    """
    Calculate approximate distance between two stations in km
    Uses Haversine formula
    """
    from math import radians, sin, cos, sqrt, atan2

    station_a = STATION_MAP[station_a_id]
    station_b = STATION_MAP[station_b_id]

    lat1 = radians(station_a["latitude"])
    lon1 = radians(station_a["longitude"])
    lat2 = radians(station_b["latitude"])
    lon2 = radians(station_b["longitude"])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    # Earth radius in km
    R = 6371.0
    distance = R * c

    return round(distance, 2)

def get_corridor_stations(corridor_name):
    """Get all stations in a corridor"""
    return CORRIDORS.get(corridor_name, [])

def get_all_stations():
    """Get all Maharashtra stations"""
    return MAHARASHTRA_STATIONS.copy()

def get_all_corridors():
    """Get all corridor definitions"""
    return CORRIDORS.copy()

if __name__ == "__main__":
    print(f"Total stations: {len(MAHARASHTRA_STATIONS)}")
    print(f"Total corridors: {len(CORRIDORS)}")
    print(f"Junction stations: {len(JUNCTION_STATIONS)}")

    # Test distance calculation
    distance = get_distance_between_stations("CST", "THANE")
    print(f"Distance CST to Thane: {distance} km")

    distance = get_distance_between_stations("PUNE", "MMR")
    print(f"Distance Pune to Manmad: {distance} km")
