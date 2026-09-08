"""
Simulated ETA model for RailPulse (SIH26028).

This is a weighted operational formula, not a trained neural net.
Replace SimulatedETAModel.predict() with a loaded LSTM / Gradient Boosting
artifact trained on historical rake running times — keep the same input/output
shape so Express does not need to change.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class PredictRequest:
    scheduled_epoch_ms: int
    now_epoch_ms: int
    distance_remaining_km: float
    current_delay_min: float
    congestion_factor: float  # 0.0 (clear) … 1.0 (severe)
    weather_factor: float  # 0.0 (clear) … 1.0 (fog/heavy rain)
    cruise_speed_kmh: float = 75.0


@dataclass
class PredictResult:
    predicted_epoch_ms: int
    delay_minutes: float
    confidence_low_epoch_ms: int
    confidence_high_epoch_ms: int
    confidence_half_width_min: float
    model_name: str


class SimulatedETAModel:
    """Swap this class for a trained model wrapper with the same predict() signature."""

    name = "simulated-weighted-v1"

    def predict(self, req: PredictRequest) -> PredictResult:
        # --- simulated model — replace with trained LSTM/Gradient Boosting ---
        # using historical section running times, halt dwell, and congestion indices.
        congestion = _clamp01(req.congestion_factor)
        weather = _clamp01(req.weather_factor)
        speed = max(28.0, req.cruise_speed_kmh)

        # Congestion and weather reduce effective speed on remaining km.
        effective_speed = speed * (1.0 - 0.38 * congestion) * (1.0 - 0.22 * weather)
        effective_speed = max(22.0, effective_speed)

        travel_min = 0.0
        if req.distance_remaining_km > 0:
            travel_min = (req.distance_remaining_km / effective_speed) * 60.0

        # Residual delay is not fully recovered; weather/congestion add extra slip.
        unrecovered = req.current_delay_min * (0.72 + 0.18 * congestion)
        extra_slip = (6.5 * congestion + 4.0 * weather) * min(
            1.0, req.distance_remaining_km / 180.0
        )

        arrival_from_now_min = travel_min + max(0.0, unrecovered * 0.15) + extra_slip
        predicted_ms = int(req.now_epoch_ms + arrival_from_now_min * 60_000)

        # If still behind the public timetable, keep the later of schedule+delay vs physics.
        scheduled_plus_delay_ms = int(
            req.scheduled_epoch_ms + max(0.0, req.current_delay_min) * 60_000
        )
        if req.distance_remaining_km < 8:
            predicted_ms = max(predicted_ms, scheduled_plus_delay_ms)

        delay_minutes = (predicted_ms - req.scheduled_epoch_ms) / 60_000.0

        half_width = (
            3.0
            + 7.0 * congestion
            + 5.0 * weather
            + 0.018 * max(0.0, req.distance_remaining_km)
        )
        half_width = min(28.0, max(2.5, half_width))

        return PredictResult(
            predicted_epoch_ms=predicted_ms,
            delay_minutes=round(delay_minutes, 1),
            confidence_low_epoch_ms=int(predicted_ms - half_width * 60_000),
            confidence_high_epoch_ms=int(predicted_ms + half_width * 60_000),
            confidence_half_width_min=round(half_width, 1),
            model_name=self.name,
        )


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, float(value)))


# Single instance — load a .pkl / ONNX file here when a trained model exists.
eta_model = SimulatedETAModel()
