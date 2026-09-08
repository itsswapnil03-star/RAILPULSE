"""REST API tests."""


def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    body = r.json()
    assert body["name"] == "RailPulse"
    assert body["problem"] == "SIH26028"


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["trains"] >= 100
    assert body["stations"] >= 50


def test_list_stations(client):
    r = client.get("/api/stations")
    assert r.status_code == 200
    body = r.json()
    assert body["count"] >= 50
    ids = {s["id"] for s in body["stations"]}
    assert "CST" in ids
    assert "NGP" in ids
    assert "PUNE" in ids
    assert "KOLHAPUR" in ids


def test_list_trains(client):
    r = client.get("/api/trains")
    assert r.status_code == 200
    body = r.json()
    assert body["count"] >= 100
    t = body["trains"][0]
    for key in ("train_id", "number", "latitude", "longitude", "predicted_delay_min", "explanation"):
        assert key in t


def test_train_detail(client):
    listing = client.get("/api/trains").json()["trains"][0]
    r = client.get(f"/api/trains/{listing['train_id']}")
    assert r.status_code == 200
    detail = r.json()
    assert "stops" in detail
    assert len(detail["stops"]) >= 3
    assert "explanation" in detail


def test_train_not_found(client):
    r = client.get("/api/trains/DOES-NOT-EXIST")
    assert r.status_code == 404


def test_network_summary(client):
    r = client.get("/api/network/summary")
    assert r.status_code == 200
    s = r.json()
    assert s["active_trains"] >= 100
    assert "average_delay_min" in s
    assert s["on_time"] + s["delayed"] + s["heavily_delayed"] >= 1


def test_station_board(client):
    r = client.get("/api/stations/CST/board")
    assert r.status_code == 200
    body = r.json()
    assert body["station"]["id"] == "CST"
    assert "trains" in body


def test_corridors(client):
    r = client.get("/api/corridors")
    assert r.status_code == 200
    body = r.json()
    assert "mumbai_cst_nagpur" in body["corridors"]
    assert "mumbai_cst_kolhapur" in body["corridors"]


def test_search_trains(client):
    r = client.get("/api/trains", params={"q": "T0001"})
    assert r.status_code == 200
    assert r.json()["count"] >= 1
