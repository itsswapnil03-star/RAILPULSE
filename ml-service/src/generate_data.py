import pandas as pd
import numpy as np
import random
import os

np.random.seed(42)
random.seed(42)

STATIONS = [
    {'code': 'CSMT', 'name': 'Mumbai CSMT', 'km': 0},
    {'code': 'DR', 'name': 'Dadar Central', 'km': 9},
    {'code': 'TNA', 'name': 'Thane', 'km': 34},
    {'code': 'KYN', 'name': 'Kalyan Junction', 'km': 54},
    {'code': 'PNVL', 'name': 'Panvel Junction', 'km': 69},
    {'code': 'KJT', 'name': 'Karjat Junction', 'km': 100},
    {'code': 'LNL', 'name': 'Lonavala', 'km': 128},
    {'code': 'SVJR', 'name': 'Shivajinagar', 'km': 190},
    {'code': 'PUNE', 'name': 'Pune Junction', 'km': 192},
    {'code': 'DD', 'name': 'Daund Junction', 'km': 268},
    {'code': 'KWV', 'name': 'Kurduvadi Junction', 'km': 377},
    {'code': 'SUR', 'name': 'Solapur Junction', 'km': 455},
    {'code': 'MRJ', 'name': 'Miraj Junction', 'km': 471},
    {'code': 'SLI', 'name': 'Sangli', 'km': 478},
    {'code': 'KOP', 'name': 'Kolhapur CSMT', 'km': 518},
    {'code': 'IGP', 'name': 'Igatpuri', 'km': 137},
    {'code': 'NK', 'name': 'Nashik Road', 'km': 188},
    {'code': 'MMR', 'name': 'Manmad Junction', 'km': 261},
    {'code': 'CSN', 'name': 'Chalisgaon Junction', 'km': 328},
    {'code': 'JL', 'name': 'Jalgaon Junction', 'km': 420},
    {'code': 'BSL', 'name': 'Bhusawal Junction', 'km': 444},
    {'code': 'MKU', 'name': 'Malkapur', 'km': 494},
    {'code': 'AK', 'name': 'Akola Junction', 'km': 583},
    {'code': 'BD', 'name': 'Badnera (Amravati)', 'km': 662},
    {'code': 'WR', 'name': 'Wardha Junction', 'km': 757},
    {'code': 'NGP', 'name': 'Nagpur Junction', 'km': 837},
    {'code': 'G', 'name': 'Gondia Junction', 'km': 967},
    {'code': 'AWB', 'name': 'Chhatrapati Sambhajinagar', 'km': 375},
    {'code': 'J', 'name': 'Jalna', 'km': 438},
    {'code': 'NED', 'name': 'Hazur Sahib Nanded', 'km': 609},
    {'code': 'RN', 'name': 'Ratnagiri', 'km': 307},
    {'code': 'SWV', 'name': 'Sawantwadi Road', 'km': 495}
]

ST_MAP = {s['code']: s for s in STATIONS}

CORRIDORS = {
    'MUMBAI_PUNE_SOLAPUR': ['CSMT', 'DR', 'TNA', 'KYN', 'KJT', 'LNL', 'SVJR', 'PUNE', 'DD', 'KWV', 'SUR'],
    'MUMBAI_PUNE_KOLHAPUR': ['CSMT', 'DR', 'TNA', 'KYN', 'LNL', 'PUNE', 'MRJ', 'SLI', 'KOP'],
    'MUMBAI_NASHIK_NAGPUR': ['CSMT', 'DR', 'TNA', 'KYN', 'IGP', 'NK', 'MMR', 'CSN', 'JL', 'BSL', 'MKU', 'AK', 'BD', 'WR', 'NGP', 'G'],
    'MUMBAI_MARATHWADA': ['CSMT', 'DR', 'TNA', 'KYN', 'IGP', 'NK', 'MMR', 'AWB', 'J', 'NED'],
    'MUMBAI_KONKAN': ['CSMT', 'DR', 'TNA', 'PNVL', 'RN', 'SWV'],
    'PUNE_NAGPUR': ['PUNE', 'DD', 'MMR', 'BSL', 'AK', 'BD', 'WR', 'NGP'],
    'NAGPUR_KOLHAPUR': ['NGP', 'WR', 'BD', 'AK', 'BSL', 'MMR', 'DD', 'PUNE', 'MRJ', 'KOP']
}

def get_stop_duration(train_type, station_index, total_stops):
    if station_index == 0 or station_index == total_stops - 1:
        return 0
    if train_type in ['Superfast', 'Semi-high-speed', 'Vande Bharat']:
        return 2
    elif train_type in ['Express', 'Intercity']:
        return 4
    elif train_type == 'Mail':
        return 6
    return 3

def generate_data():
    data = []
    train_types = ['Vande Bharat', 'Superfast', 'Express', 'Intercity', 'Mail']
    
    # 60 simulated days across Maharashtra railway network
    for day in range(1, 61):
        month = random.randint(1, 12)
        day_of_week = random.randint(0, 6)
        run_date = f"2026-{month:02d}-{random.randint(1,28):02d}"
        
        is_monsoon = month in [6, 7, 8, 9]
        is_winter = month in [11, 12, 1]
        
        if is_monsoon:
            weather_probs = [0.20, 0.35, 0.40, 0.05]
            weather_choices = ['clear', 'rain', 'heavy_rain', 'fog']
        elif is_winter:
            weather_choices = ['clear', 'rain', 'heavy_rain', 'fog']
            weather_probs = [0.70, 0.05, 0.05, 0.20] 
        else:
            weather_choices = ['clear', 'rain', 'heavy_rain', 'fog']
            weather_probs = [0.85, 0.10, 0.05, 0.00]
            
        weather_condition = np.random.choice(weather_choices, p=weather_probs)
        
        for corr_name, corr_stations in CORRIDORS.items():
            for direction in ['UP', 'DOWN']:
                st_codes = corr_stations if direction == 'UP' else list(reversed(corr_stations))
                st_objs = [ST_MAP[c] for c in st_codes]
                train_type = random.choice(train_types)
                train_number = str(random.randint(11000, 22999))
                base_hour = random.uniform(5.0, 23.0)
                
                signal_failure_idx = random.randint(1, len(st_objs)-2) if (random.random() < 0.08) else -1
                
                cumulative_delay = 0.0
                previous_delay = 0.0
                origin_km = st_objs[0]['km']
                
                for station_index, st in enumerate(st_objs):
                    km_from_origin = abs(st['km'] - origin_km)
                    scheduled_arrival_hour = int((base_hour + km_from_origin / 80.0) % 24)
                    
                    if station_index == 0:
                        actual_delay = np.random.gamma(shape=2, scale=4) if (random.random() < 0.18) else 0.0
                    else:
                        base_noise = np.random.gamma(shape=1.8, scale=1.2)
                        actual_delay = 0.88 * previous_delay + base_noise
                        
                        # Peak hour suburban congestion (Kalyan, Thane, Pune approaches)
                        if 8 <= scheduled_arrival_hour <= 11 or 17 <= scheduled_arrival_hour <= 21:
                            actual_delay += np.random.normal(3, 1.2)
                            
                        # Ghat section rain / waterlogging
                        if is_monsoon and (st['code'] in ['KJT', 'LNL', 'IGP']):
                            actual_delay += np.random.uniform(4, 12)
                            
                        if is_winter and weather_condition == 'fog':
                            actual_delay += np.random.uniform(3, 8)
                            
                        if station_index == signal_failure_idx:
                            actual_delay += np.random.uniform(15, 35)
                            
                        congestion_level = np.random.beta(2.5, 4.5)
                        if 8 <= scheduled_arrival_hour <= 11 or 17 <= scheduled_arrival_hour <= 21:
                            congestion_level = min(1.0, congestion_level * 1.4)
                            
                        if congestion_level > 0.7:
                            actual_delay += np.random.uniform(2, 6)
                            
                    actual_delay = max(0.0, round(actual_delay, 1))
                    stop_duration = get_stop_duration(train_type, station_index, len(st_objs))
                    num_remaining_stops = len(st_objs) - 1 - station_index
                    
                    data.append({
                        'train_number': train_number,
                        'train_type': train_type,
                        'run_date': run_date,
                        'month': month,
                        'day_of_week': day_of_week,
                        'station_code': st['code'],
                        'station_index': station_index,
                        'km_from_origin': km_from_origin,
                        'scheduled_arrival_hour': scheduled_arrival_hour,
                        'weather_condition': weather_condition,
                        'is_monsoon': is_monsoon,
                        'congestion_level': round(congestion_level if station_index > 0 else 0.0, 2),
                        'cumulative_delay_minutes': round(cumulative_delay, 1),
                        'previous_station_delay': round(previous_delay, 1),
                        'stop_duration': stop_duration,
                        'num_remaining_stops': num_remaining_stops,
                        'actual_delay_minutes': actual_delay
                    })
                    
                    cumulative_delay += actual_delay
                    previous_delay = actual_delay

    df = pd.DataFrame(data)
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/historical_runs.csv', index=False)
    print(f"Generated {len(df)} rows of Maharashtra historical train telemetry data.")

if __name__ == "__main__":
    generate_data()

