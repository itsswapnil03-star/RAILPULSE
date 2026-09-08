import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../utils/constants";

/**
 * Single shared WebSocket subscription. No polling.
 * Reconnects with backoff if the simulation server restarts.
 */
export function useWebSocket() {
  const [trains, setTrains] = useState([]);
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastSentAt, setLastSentAt] = useState(null);
  const wsRef = useRef(null);
  const retryRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "snapshot") {
            setTrains(msg.trains || []);
            setSummary(msg.summary || null);
            setLastSentAt(msg.sent_at);
            if (msg.events?.length) {
              setEvents((prev) => [...msg.events, ...prev].slice(0, 40));
            }
          }
        } catch {
          setError("Malformed live payload");
        }
      };

      ws.onerror = () => {
        setError("Live link interrupted");
      };

      ws.onclose = () => {
        setConnected(false);
        if (cancelled) return;
        const wait = Math.min(8000, 600 * 2 ** retryRef.current);
        retryRef.current += 1;
        timerRef.current = setTimeout(connect, wait);
      };
    };

    connect();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, []);

  return { trains, summary, events, connected, error, lastSentAt };
}
