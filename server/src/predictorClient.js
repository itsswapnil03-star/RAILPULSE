const ML_URL = process.env.ML_URL || "http://127.0.0.1:8000";

export async function predictEta(payload) {
  try {
    const res = await fetch(`${ML_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`ML ${res.status}`);
    return await res.json();
  } catch {
    return fallbackPredict(payload);
  }
}

/** Same spirit as ml-service/model.py — used only if FastAPI is down. */
function fallbackPredict(p) {
  const congestion = clamp01(p.congestion_factor);
  const weather = clamp01(p.weather_factor);
  const speed = Math.max(28, p.cruise_speed_kmh || 75);
  const effective = Math.max(22, speed * (1 - 0.38 * congestion) * (1 - 0.22 * weather));
  const travelMin = p.distance_remaining_km > 0 ? (p.distance_remaining_km / effective) * 60 : 0;
  const extra = (6.5 * congestion + 4 * weather) * Math.min(1, p.distance_remaining_km / 180);
  const predicted = Math.round(p.now_epoch_ms + (travelMin + extra) * 60_000);
  const delay = (predicted - p.scheduled_epoch_ms) / 60_000;
  const half = Math.min(28, Math.max(2.5, 3 + 7 * congestion + 5 * weather + 0.018 * p.distance_remaining_km));
  return {
    predicted_epoch_ms: predicted,
    delay_minutes: Math.round(delay * 10) / 10,
    confidence_low_epoch_ms: Math.round(predicted - half * 60_000),
    confidence_high_epoch_ms: Math.round(predicted + half * 60_000),
    confidence_half_width_min: Math.round(half * 10) / 10,
    model_name: "server-fallback",
  };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, Number(v) || 0));
}
