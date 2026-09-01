"""Feature engineering for the RailMind delay prediction model."""
import pandas as pd
import numpy as np

# Categorical value maps — must match training data exactly
WEATHER_CONDITIONS = ['clear', 'fog', 'heavy_rain', 'rain']
TRAIN_TYPES = ['Express', 'Mail', 'Semi-high-speed', 'Superfast']

# Human-readable feature descriptions for explainability
FEATURE_DESCRIPTIONS = {
    'scheduled_arrival_hour': lambda v: f"{int(v):02d}:00 ({'morning' if v < 12 else 'afternoon' if v < 17 else 'evening'})",
    'day_of_week': lambda v: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][int(v)],
    'month': lambda v: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][int(v)-1],
    'is_monsoon': lambda v: 'Monsoon Season' if v else 'Non-monsoon',
    'station_index': lambda v: f"Station {int(v)+1} of 100",
    'km_from_origin': lambda v: f"{v:.0f} km from origin",
    'cumulative_delay_so_far': lambda v: f"{v:.1f} min accumulated delay",
    'previous_station_delay': lambda v: f"{v:.1f} min at previous station",
    'congestion_level': lambda v: f"{'Low' if v < 0.3 else 'Medium' if v < 0.6 else 'High'} congestion ({v:.0%})",
    'stop_duration': lambda v: f"{int(v)} min stop",
    'num_remaining_stops': lambda v: f"{int(v)} stops remaining",
    'weather_condition_fog': lambda v: 'Foggy conditions' if v else 'No fog',
    'weather_condition_heavy_rain': lambda v: 'Heavy rain' if v else 'No heavy rain',
    'weather_condition_rain': lambda v: 'Rainy conditions' if v else 'No rain',
    'weather_condition_clear': lambda v: 'Clear weather' if v else '',
    'train_type_Express': lambda v: 'Express train' if v else '',
    'train_type_Mail': lambda v: 'Mail train (lower priority)' if v else '',
    'train_type_Semi-high-speed': lambda v: 'Semi-high-speed train' if v else '',
    'train_type_Superfast': lambda v: 'Superfast train' if v else '',
}

# Human-readable feature names
FEATURE_NAMES = {
    'cumulative_delay_so_far': 'Cumulative Delay',
    'previous_station_delay': 'Previous Station Delay',
    'weather_condition_heavy_rain': 'Heavy Rain',
    'weather_condition_rain': 'Rain',
    'weather_condition_fog': 'Fog',
    'weather_condition_clear': 'Clear Weather',
    'scheduled_arrival_hour': 'Time of Day',
    'congestion_level': 'Track Congestion',
    'station_index': 'Route Progress',
    'km_from_origin': 'Distance from Origin',
    'is_monsoon': 'Monsoon Season',
    'month': 'Month',
    'day_of_week': 'Day of Week',
    'stop_duration': 'Stop Duration',
    'num_remaining_stops': 'Remaining Stops',
    'train_type_Express': 'Express Type',
    'train_type_Mail': 'Mail Type',
    'train_type_Semi-high-speed': 'Semi-high-speed Type',
    'train_type_Superfast': 'Superfast Type',
}

def prepare_features(raw: dict, feature_columns: list) -> pd.DataFrame:
    """Convert a raw prediction request dict into a model-ready DataFrame."""
    row = {
        'scheduled_arrival_hour': raw['scheduled_hour'],
        'day_of_week': raw['day_of_week'],
        'month': raw['month'],
        'is_monsoon': int(raw.get('is_monsoon', False)),
        'station_index': raw['station_index'],
        'km_from_origin': raw['km_from_origin'],
        'cumulative_delay_so_far': raw.get('cumulative_delay_so_far', 0),
        'previous_station_delay': raw.get('previous_station_delay', 0),
        'congestion_level': raw.get('congestion_level', 0.3),
        'stop_duration': raw.get('stop_duration', 5),
        'num_remaining_stops': raw.get('num_remaining_stops', 4),
    }
    # One-hot encode weather
    weather = raw.get('weather_condition', 'clear')
    for w in WEATHER_CONDITIONS:
        row[f'weather_condition_{w}'] = 1 if weather == w else 0
    # One-hot encode train type
    train_type = raw.get('train_type', 'Superfast')
    for t in TRAIN_TYPES:
        row[f'train_type_{t}'] = 1 if train_type == t else 0

    df = pd.DataFrame([row])
    # Align columns with training features
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0
    df = df[feature_columns]
    return df

def get_top_factors(raw: dict, feature_importances: dict, n: int = 3) -> list:
    """Return top N contributing factors with human-readable descriptions."""
    # Map raw input values to the one-hot encoded feature names to find which are active
    active_features = {}
    for feat, imp in feature_importances.items():
        active_features[feat] = imp

    sorted_feats = sorted(active_features.items(), key=lambda x: x[1], reverse=True)
    factors = []
    for feat_name, importance in sorted_feats[:n]:
        # Get human-readable value
        desc_fn = FEATURE_DESCRIPTIONS.get(feat_name)
        if desc_fn:
            # Find the raw value for this feature
            raw_val = _get_raw_value(raw, feat_name)
            value_str = desc_fn(raw_val)
        else:
            value_str = str(feat_name)
        
        display_name = FEATURE_NAMES.get(feat_name, feat_name)
        if value_str:  # Skip empty descriptions
            factors.append({
                'feature': display_name,
                'importance': round(importance, 4),
                'value': value_str
            })
    
    # Ensure we have at least n factors
    while len(factors) < n:
        factors.append({'feature': 'Other', 'importance': 0.01, 'value': 'Minor factor'})
    return factors[:n]

def _get_raw_value(raw: dict, feat_name: str):
    """Map a feature column name back to its raw input value."""
    direct_map = {
        'scheduled_arrival_hour': 'scheduled_hour',
        'cumulative_delay_so_far': 'cumulative_delay_so_far',
        'previous_station_delay': 'previous_station_delay',
        'congestion_level': 'congestion_level',
        'station_index': 'station_index',
        'km_from_origin': 'km_from_origin',
        'is_monsoon': 'is_monsoon',
        'month': 'month',
        'day_of_week': 'day_of_week',
        'stop_duration': 'stop_duration',
        'num_remaining_stops': 'num_remaining_stops',
    }
    if feat_name in direct_map:
        return raw.get(direct_map[feat_name], 0)
    # One-hot encoded features
    if feat_name.startswith('weather_condition_'):
        weather = raw.get('weather_condition', 'clear')
        return 1 if feat_name == f'weather_condition_{weather}' else 0
    if feat_name.startswith('train_type_'):
        tt = raw.get('train_type', 'Superfast')
        return 1 if feat_name == f'train_type_{tt}' else 0
    return 0
