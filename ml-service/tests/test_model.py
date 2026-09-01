"""Sanity tests for the trained model."""
import pytest
import joblib
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from src.features import prepare_features

models_dir = Path(__file__).parent.parent / 'models'

@pytest.fixture
def model_and_features():
    model = joblib.load(models_dir / 'delay_model_median.joblib')
    cols = joblib.load(models_dir / 'feature_columns.joblib')
    return model, cols

def test_model_files_exist():
    assert (models_dir / 'delay_model_median.joblib').exists()
    assert (models_dir / 'delay_model_lower.joblib').exists()
    assert (models_dir / 'delay_model_upper.joblib').exists()
    assert (models_dir / 'feature_columns.joblib').exists()
    assert (models_dir / 'feature_importances.joblib').exists()

def test_prediction_range(model_and_features):
    model, cols = model_and_features
    raw = {
        'scheduled_hour': 10, 'day_of_week': 3, 'month': 5,
        'is_monsoon': False, 'weather_condition': 'clear',
        'station_index': 2, 'km_from_origin': 200,
        'cumulative_delay_so_far': 5, 'previous_station_delay': 3,
        'congestion_level': 0.3, 'train_type': 'Superfast',
        'stop_duration': 5, 'num_remaining_stops': 5
    }
    X = prepare_features(raw, cols)
    pred = model.predict(X)[0]
    assert 0 <= pred <= 120, f"Prediction {pred} out of reasonable range"

def test_higher_delay_propagation(model_and_features):
    """Higher cumulative delay should lead to higher predicted delay."""
    model, cols = model_and_features
    base = {
        'scheduled_hour': 14, 'day_of_week': 2, 'month': 8,
        'is_monsoon': True, 'weather_condition': 'rain',
        'station_index': 4, 'km_from_origin': 634,
        'congestion_level': 0.5, 'train_type': 'Superfast',
        'stop_duration': 5, 'num_remaining_stops': 3
    }
    
    low_delay = {**base, 'cumulative_delay_so_far': 0, 'previous_station_delay': 0}
    high_delay = {**base, 'cumulative_delay_so_far': 30, 'previous_station_delay': 20}
    
    X_low = prepare_features(low_delay, cols)
    X_high = prepare_features(high_delay, cols)
    
    pred_low = model.predict(X_low)[0]
    pred_high = model.predict(X_high)[0]
    
    assert pred_high > pred_low, f"Expected higher delay with more cumulative delay: {pred_high} vs {pred_low}"
