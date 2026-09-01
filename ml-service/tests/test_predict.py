"""Tests for the ML prediction service."""
import pytest
from httpx import AsyncClient, ASGITransport
import sys
from pathlib import Path

# Add src to path so we can import the app
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.predict import app

@pytest.fixture
def valid_input():
    return {
        'scheduled_hour': 14,
        'day_of_week': 2,
        'month': 8,
        'is_monsoon': True,
        'weather_condition': 'heavy_rain',
        'station_index': 4,
        'km_from_origin': 634,
        'cumulative_delay_so_far': 12.5,
        'previous_station_delay': 8.0,
        'congestion_level': 0.6,
        'train_type': 'Superfast',
        'stop_duration': 10,
        'num_remaining_stops': 3
    }

@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        r = await client.get('/health')
        assert r.status_code == 200
        data = r.json()
        assert 'status' in data
        assert 'model_version' in data

@pytest.mark.asyncio
async def test_predict_valid(valid_input):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        r = await client.post('/predict', json=valid_input)
        assert r.status_code == 200
        data = r.json()
        assert 'predicted_delay_minutes' in data
        assert 'confidence_lower' in data
        assert 'confidence_upper' in data
        assert 'top_factors' in data
        assert len(data['top_factors']) == 3
        assert data['predicted_delay_minutes'] >= 0
        assert data['confidence_lower'] <= data['predicted_delay_minutes']
        assert data['confidence_upper'] >= data['predicted_delay_minutes']

@pytest.mark.asyncio
async def test_predict_missing_fields():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        r = await client.post('/predict', json={})
        assert r.status_code == 422

@pytest.mark.asyncio
async def test_predict_factors_structure(valid_input):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        r = await client.post('/predict', json=valid_input)
        data = r.json()
        for factor in data['top_factors']:
            assert 'feature' in factor
            assert 'importance' in factor
            assert 'value' in factor
            assert isinstance(factor['importance'], float)
