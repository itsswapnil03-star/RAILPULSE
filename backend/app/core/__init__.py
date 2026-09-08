"""
Core module for RailPulse
Contains configuration, constants, and shared utilities
"""

from .maharashtra_stations import (
    MAHARASHTRA_STATIONS,
    STATION_MAP,
    CORRIDORS,
    STATION_CONNECTIONS,
    JUNCTION_STATIONS,
    get_station_by_id,
    get_stations_by_city,
    get_connected_stations,
    get_distance_between_stations,
    get_corridor_stations,
    get_all_stations,
    get_all_corridors,
)

# System configuration
class Config:
    # API Configuration
    API_TITLE = "RailPulse - Dynamic ETA Forecast"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = """
    RailPulse - SIH26028: Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains

    This API provides real-time train position updates, ETA predictions with AI-powered
    explainability (SHAP), and historical data for Maharashtra railway network.

    Features:
    - Real-time WebSocket updates for train positions and ETAs
    - AI-powered delay predictions using XGBoost
    - SHAP-based explainability for each prediction
    - Historical data and analytics
    """

    # Database Configuration
    DATABASE_URL = "postgresql://railpulse:railpulse123@localhost:5432/railpulse"

    # WebSocket Configuration
    WEBSOCKET_PING_INTERVAL = 30  # seconds
    WEBSOCKET_MAX_CONNECTIONS = 1000

    # Simulation Configuration
    SIMULATION_INTERVAL = 2.0  # seconds between simulation ticks
    SIMULATION_SPEED_MULTIPLIER = 1.0  # 1.0 = real-time, higher = faster

    # Train Configuration
    NUM_TRAINS = 120  # Number of trains to simulate
    TRAIN_SPEED_KMPH = 80  # Average speed in km/h
    TRAIN_SPEED_VARIATION = 0.2  # ±20% variation

    # Delay Configuration
    MIN_DELAY_MINUTES = 5
    MAX_DELAY_MINUTES = 60
    DELAY_PROBABILITY = 0.15  # 15% chance of delay per station

    # ML Configuration
    ML_MODEL_PATH = "backend/app/ml/models/xgboost_model.joblib"
    ML_SHAP_PATH = "backend/app/ml/models/shap_explainer.joblib"
    ML_DATASET_PATH = "backend/app/ml/data/synthetic_dataset.csv"
    ML_TRAINING_SIZE = 10000  # Number of synthetic samples

    # Caching
    CACHE_EXPIRY_SECONDS = 300  # 5 minutes

# Delay event types with their properties
DELAY_EVENT_TYPES = [
    {
        "type": "signal_delay",
        "name": "Signal Delay",
        "min_delay": 5,
        "max_delay": 15,
        "probability": 0.30,
        "affected_stations": "all",
        "description": "Delay due to signal maintenance or congestion"
    },
    {
        "type": "platform_congestion",
        "name": "Platform Congestion",
        "min_delay": 3,
        "max_delay": 12,
        "probability": 0.25,
        "affected_stations": "junctions",
        "description": "Delay due to crowded platform at junction station"
    },
    {
        "type": "weather_slowdown",
        "name": "Weather Slowdown",
        "min_delay": 5,
        "max_delay": 25,
        "probability": 0.20,
        "affected_stations": "all",
        "description": "Delay due to rain, fog, or other weather conditions"
    },
    {
        "type": "track_maintenance",
        "name": "Track Maintenance",
        "min_delay": 10,
        "max_delay": 40,
        "probability": 0.15,
        "affected_stations": "all",
        "description": "Delay due to scheduled or emergency track maintenance"
    },
    {
        "type": "passenger_loading",
        "name": "Passenger Loading",
        "min_delay": 2,
        "max_delay": 8,
        "probability": 0.10,
        "affected_stations": "major",
        "description": "Delay due to heavy passenger boarding/alighting"
    }
]

# Major stations (high passenger traffic)
MAJOR_STATIONS = [
    "CST", "DRD", "KURLA", "THANE", "KLYN", "PUNE",
    "NGP", "BSL", "MMR", "BDTS", "PANVEL", "KOLHAPUR"
]

# Time of day effects
time_of_day_effects = {
    "morning_peak": {"start": 7, "end": 10, "delay_multiplier": 1.5},
    "evening_peak": {"start": 17, "end": 20, "delay_multiplier": 1.4},
    "night": {"start": 22, "end": 6, "delay_multiplier": 0.8},
    "off_peak": {"start": 10, "end": 17, "delay_multiplier": 1.0}
}

# Day of week effects
day_of_week_effects = {
    "monday": 1.2,
    "tuesday": 1.1,
    "wednesday": 1.1,
    "thursday": 1.1,
    "friday": 1.3,
    "saturday": 1.0,
    "sunday": 0.9
}

def get_time_of_day_multiplier(hour):
    """Get delay multiplier based on time of day"""
    for period, config in time_of_day_effects.items():
        start = config["start"]
        end = config["end"]
        if start <= end:
            if start <= hour < end:
                return config["delay_multiplier"]
        else:  # Night period (crosses midnight)
            if hour >= start or hour < end:
                return config["delay_multiplier"]
    return 1.0

def get_day_of_week_multiplier(day_index):
    """Get delay multiplier based on day of week (0=Monday, 6=Sunday)"""
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    return day_of_week_effects.get(days[day_index % 7], 1.0)

def is_junction_station(station_id):
    """Check if a station is a junction"""
    return station_id in JUNCTION_STATIONS

def is_major_station(station_id):
    """Check if a station is a major station"""
    return station_id in MAJOR_STATIONS

# Train types and their properties
TRAIN_TYPES = {
    "express": {
        "name": "Express",
        "base_speed": 90,
        "stops": "major_only",
        "priority": "high",
        "color": "#1a237e"  # Navy
    },
    "superfast": {
        "name": "Superfast Express",
        "base_speed": 100,
        "stops": "limited",
        "priority": "very_high",
        "color": "#0d47a1"  # Dark blue
    },
    "passenger": {
        "name": "Passenger",
        "base_speed": 60,
        "stops": "all",
        "priority": "low",
        "color": "#455a64"  # Steel
    },
    "local": {
        "name": "Local",
        "base_speed": 50,
        "stops": "all",
        "priority": "low",
        "color": "#607d8b"  # Light steel
    },
    "semi_fast": {
        "name": "Semi-Fast",
        "base_speed": 75,
        "stops": "selective",
        "priority": "medium",
        "color": "#ffb300"  # Amber
    }
}

# Generate train names based on corridors
CORRIDOR_TRAIN_NAMES = {
    "mumbai_cst_nagpur": [
        "CST-NGP Express", "Mumbai-Nagpur Superfast", "Vidarbha Express",
        "Nagpur Duronto", "Maharashtra Express", "Gitanjali Express",
        "Howrah-Mumbai Mail", "Azad Hind Express", "Sevagram Express"
    ],
    "mumbai_cst_kolhapur": [
        "CST-KOP Express", "Mumbai-Kolhapur Sahyadri", "Mahalaxmi Express",
        "Koyna Express", "Sahyadri Express", "Pandharpur Express"
    ],
    "mumbai_central_ahmedabad": [
        "MMCT-ADI Express", "Mumbai-Ahmedabad Shatabdi",
        "Gujarat Express", "Firozpur-Janata Express"
    ],
    "pune_nagpur": [
        "PUNE-NGP Express", "Pune-Nagpur Duronto", "Nagpur-Pune SF Express"
    ],
    "mumbai_cst_solapur": [
        "CST-SUR Express", "Mumbai-Solapur Express", "Siddheswar Express"
    ]
}
