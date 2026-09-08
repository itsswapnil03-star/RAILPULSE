"""Simulation engine tests."""
import numpy as np

from app.core.maharashtra_stations import MAHARASHTRA_STATIONS, get_distance_between_stations
from app.simulation.engine import SimulationEngine
from app.simulation.events import maybe_inject_delay


def test_station_count():
    assert len(MAHARASHTRA_STATIONS) >= 50


def test_distance_cst_thane_reasonable():
    d = get_distance_between_stations("CST", "THANE")
    assert 20 < d < 50


def test_engine_fleet_size():
    eng = SimulationEngine(n_trains=120, seed=3)
    assert len(eng.trains) == 120
    snap = eng.snapshot()
    assert len(snap) == 120
    s = eng.summary()
    assert s["active_trains"] == 120
    assert s["average_delay_min"] >= 0


def test_tick_advances_and_may_inject_events():
    eng = SimulationEngine(n_trains=40, seed=11)
    before = [(t.segment_index, t.progress, t.delay_minutes) for t in eng.trains]
    for _ in range(25):
        for t in eng.trains:
            t.tick(2.0)
    after = [(t.segment_index, t.progress, t.delay_minutes) for t in eng.trains]
    assert before != after
    # At least some trains still have a valid lat/lon in Maharashtra bbox
    for t in eng.trains[:5]:
        lat, lon = t.latlon()
        assert 15.5 < lat < 22.5
        assert 72.0 < lon < 80.5


def test_live_state_has_shap_fields():
    eng = SimulationEngine(n_trains=8, seed=2)
    live = eng.trains[0].to_live_state()
    assert "explanation" in live
    assert "predicted_delay_min" in live
    assert "confidence_low" in live
    assert "confidence_high" in live


def test_station_board_only_upcoming():
    eng = SimulationEngine(n_trains=80, seed=5)
    board = eng.station_board("CST")
    assert isinstance(board, list)
    for row in board:
        assert "due_predicted" in row
        assert "platform" in row


def test_delay_event_schema():
    rng = np.random.default_rng(0)
    hits = 0
    for _ in range(80):
        ev = maybe_inject_delay(rng, "MMR", 18, 12)
        if ev:
            hits += 1
            assert ev["delay_minutes"] > 0
            assert "event_type" in ev
            assert "description" in ev
    assert hits >= 1


def test_websocket_snapshot(client):
    with client.websocket_connect("/ws/trains") as ws:
        data = ws.receive_json()
        assert data["type"] == "snapshot"
        assert len(data["trains"]) >= 100
        assert "summary" in data
