"""
RailPulse ML Prediction Service
FastAPI endpoint serving trained GBR model for train delay prediction.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import joblib
import logging
from pathlib import Path
from datetime import datetime

from .features import prepare_features, get_top_factors

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RailPulse ML Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Model version identifier
MODEL_VERSION = f"gbr-v1-{datetime.now().strftime('%Y%m%d')}"

# Load models on startup
models_dir = Path(__file__).parent.parent / 'models'
try:
    model_median = joblib.load(models_dir / 'delay_model_median.joblib')
    model_lower = joblib.load(models_dir / 'delay_model_lower.joblib')
    model_upper = joblib.load(models_dir / 'delay_model_upper.joblib')
    feature_columns = joblib.load(models_dir / 'feature_columns.joblib')
    feature_importances = joblib.load(models_dir / 'feature_importances.joblib')
    models_loaded = True
    logger.info(f"Models loaded successfully from {models_dir}")
except Exception as e:
    models_loaded = False
    logger.warning(f"Could not load models: {e}. Run train_model.py first.")
    model_median = model_lower = model_upper = feature_columns = feature_importances = None


class PredictRequest(BaseModel):
    scheduled_hour: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    month: int = Field(default=8, ge=1, le=12)
    is_monsoon: bool = False
    weather_condition: str = Field(default='clear')
    station_index: int = Field(..., ge=0)
    km_from_origin: float = Field(..., ge=0)
    cumulative_delay_so_far: float = Field(default=0.0, ge=0)
    previous_station_delay: float = Field(default=0.0, ge=0)
    congestion_level: float = Field(default=0.3, ge=0, le=1)
    train_type: str = Field(default='Superfast')
    stop_duration: int = Field(default=5, ge=0)
    num_remaining_stops: int = Field(default=4, ge=0)


class FactorResponse(BaseModel):
    feature: str
    importance: float
    value: str


class PredictResponse(BaseModel):
    predicted_delay_minutes: float
    confidence_lower: float
    confidence_upper: float
    top_factors: List[FactorResponse]
    model_version: str


@app.get('/health')
def health():
    return {
        'status': 'healthy' if models_loaded else 'degraded',
        'model_version': MODEL_VERSION,
        'model_loaded': models_loaded
    }


@app.post('/predict', response_model=PredictResponse)
def predict(req: PredictRequest):
    if not models_loaded:
        raise HTTPException(status_code=503, detail='Models not loaded. Run train_model.py first.')
    
    raw = req.model_dump()
    logger.info(f"Prediction request: station_index={raw['station_index']}, "
                f"cumulative_delay={raw['cumulative_delay_so_far']:.1f}, "
                f"weather={raw['weather_condition']}")
    
    try:
        X = prepare_features(raw, feature_columns)
        
        pred_median = float(model_median.predict(X)[0])
        pred_lower = float(model_lower.predict(X)[0])
        pred_upper = float(model_upper.predict(X)[0])
        
        # Clip to non-negative
        pred_median = max(0.0, round(pred_median, 1))
        pred_lower = max(0.0, round(pred_lower, 1))
        pred_upper = max(0.0, round(pred_upper, 1))
        
        # Ensure interval ordering
        if pred_lower > pred_median:
            pred_lower = pred_median
        if pred_upper < pred_median:
            pred_upper = pred_median
        
        top_factors = get_top_factors(raw, feature_importances, n=3)
        
        return PredictResponse(
            predicted_delay_minutes=pred_median,
            confidence_lower=pred_lower,
            confidence_upper=pred_upper,
            top_factors=top_factors,
            model_version=MODEL_VERSION
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
