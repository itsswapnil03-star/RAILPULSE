const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8009';

export async function predictDelay(features) {
  const urls = [ML_SERVICE_URL, 'http://127.0.0.1:8008', 'http://localhost:8009'];
  for (const url of urls) {
    try {
      const response = await fetch(`${url}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) return await response.json();
    } catch (err) {}
  }
  return fallbackPredict(features);
}

function fallbackPredict(features) {
  const baseDelay = (features.cumulative_delay_so_far || 0) * 0.7 + 
                    (features.previous_station_delay || 0) * 0.3;
  const weatherPenalty = features.weather_condition === 'heavy_rain' ? 5 : 
                         features.weather_condition === 'rain' ? 2 : 
                         features.weather_condition === 'fog' ? 4 : 0;
  const predicted = Math.max(0, baseDelay + weatherPenalty + (features.congestion_level || 0) * 3);
  return {
    predicted_delay_minutes: Math.round(predicted * 10) / 10,
    confidence_lower: Math.max(0, Math.round((predicted - 5) * 10) / 10),
    confidence_upper: Math.round((predicted + 8) * 10) / 10,
    top_factors: [
      { feature: 'Cumulative Delay', importance: 0.5, value: `${features.cumulative_delay_so_far?.toFixed(1) || '0.0'} min (fallback)` },
      { feature: 'Weather', importance: 0.3, value: features.weather_condition },
      { feature: 'Congestion', importance: 0.2, value: `${((features.congestion_level || 0) * 100).toFixed(0)}%` }
    ],
    model_version: 'fallback-linear-v1'
  };
}
