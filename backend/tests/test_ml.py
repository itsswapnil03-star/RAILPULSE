"""ML dataset, inference, and SHAP explanation tests."""
from app.ml.inference.explain import shap_to_factors
from app.ml.inference.predict import features_from_state, predict_delay
from app.ml.training.dataset import FEATURE_COLUMNS, TARGET_COLUMN, generate_synthetic_dataset


def test_synthetic_dataset_shape_and_patterns():
    df = generate_synthetic_dataset(n_rows=400, seed=1)
    assert len(df) >= 350
    for col in FEATURE_COLUMNS:
        assert col in df.columns
    assert TARGET_COLUMN in df.columns
    assert df[TARGET_COLUMN].min() >= 0
    assert df[TARGET_COLUMN].max() <= 90
    # Peak hours should be statistically worse than night on average
    peak = df[df["hour_of_day"].between(7, 9)][TARGET_COLUMN].mean()
    night = df[(df["hour_of_day"] >= 22) | (df["hour_of_day"] < 6)][TARGET_COLUMN].mean()
    assert peak > night


def test_predict_returns_confidence_and_explanation():
    result = predict_delay(
        {
            "hour_of_day": 18,
            "day_of_week": 0,
            "distance_remaining_km": 220,
            "segment_distance_km": 28,
            "junction_congestion_score": 0.8,
            "weather_flag": 1,
            "is_junction_next": 1,
            "is_major_next": 1,
            "recent_delay_trend": 12,
            "current_delay_min": 9,
            "train_type": "express",
            "speed_kmph": 68,
            "passenger_load": 0.85,
            "scheduled_arrival": "21:40",
        },
        next_station_name="Manmad Junction",
    )
    assert result["predicted_delay_min"] >= 0
    assert result["confidence_low"] <= result["predicted_delay_min"] <= result["confidence_high"]
    assert isinstance(result["explanation"], list)
    assert len(result["explanation"]) >= 1
    assert result["predicted_eta"] is not None
    # Congestion / weather should surface in language for this stressed input
    blob = " ".join(result["explanation"]).lower()
    assert "congestion" in blob or "weather" in blob or "junction" in blob or "peak" in blob


def test_features_from_state_complete():
    feats = features_from_state({"train_type": "superfast", "current_delay_min": 4})
    for col in FEATURE_COLUMNS:
        assert col in feats


def test_shap_to_factors_ranks_top():
    import numpy as np

    values = np.zeros(len(FEATURE_COLUMNS))
    values[FEATURE_COLUMNS.index("junction_congestion_score")] = 9.2
    values[FEATURE_COLUMNS.index("weather_flag")] = 4.1
    values[FEATURE_COLUMNS.index("hour_of_day")] = 3.0
    factors, phrases = shap_to_factors(values, {}, next_station_name="Manmad Junction", top_k=3)
    assert len(factors) == 3
    assert "Manmad" in factors[0].phrase
    assert phrases[0] == factors[0].phrase


def test_predict_endpoint(client):
    r = client.post(
        "/api/predict",
        json={
            "junction_congestion_score": 0.9,
            "weather_flag": 1,
            "hour_of_day": 18,
            "current_delay_min": 10,
            "next_station_name": "Pune Junction",
            "scheduled_arrival": "19:10",
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert "predicted_delay_min" in body
    assert "explanation" in body
    assert "confidence_low" in body
