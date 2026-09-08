import { useEffect, useState } from "react";
import { API_BASE } from "../utils/constants";

export function useStations() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetch(`${API_BASE}/stations`)
      .then((r) => {
        if (!r.ok) throw new Error("stations");
        return r.json();
      })
      .then((d) => {
        if (live) setStations(d.stations || []);
      })
      .catch(() => live && setError("Could not load stations"))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  return { stations, error, loading };
}

export function useCorridors() {
  const [corridors, setCorridors] = useState({});
  useEffect(() => {
    fetch(`${API_BASE}/corridors`)
      .then((r) => r.json())
      .then((d) => setCorridors(d.corridors || {}))
      .catch(() => {});
  }, []);
  return corridors;
}

export function useTrainDetail(trainId) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trainId) {
      setDetail(null);
      return;
    }
    let live = true;
    setLoading(true);
    fetch(`${API_BASE}/trains/${trainId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => live && setDetail(d))
      .catch(() => live && setError("Could not load train"))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [trainId]);

  return { detail, error, loading, setDetail };
}

export function useTrend() {
  const [points, setPoints] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/network/trend`)
      .then((r) => r.json())
      .then((d) => setPoints(d.points || []))
      .catch(() => {});
  }, []);
  return points;
}

export function useStationBoard(stationId) {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stationId) return;
    let live = true;
    setLoading(true);
    fetch(`${API_BASE}/stations/${stationId}/board`)
      .then((r) => {
        if (!r.ok) throw new Error("board");
        return r.json();
      })
      .then((d) => live && setBoard(d))
      .catch(() => live && setError("Could not load station board"))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [stationId]);

  return { board, error, loading, setBoard };
}
