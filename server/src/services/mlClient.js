const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8008';

export async function predictDelay(features) {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
      signal: AbortSignal.timeout(3000)
    });
    if (!response.ok) throw new Error(`ML service returned ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`[ML Client] Prediction failed (${err.message}), using fallback`);
    return fallbackPredict(features);
  }
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
