import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "./config.js";

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [snapshot, setSnapshot] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["polling", "websocket"],
    });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("network:update", (data) => setSnapshot(data));

    fetch("/api/network")
      .then((r) => r.json())
      .then(setSnapshot)
      .catch(() =>
        fetch(`${API_BASE}/api/network`)
          .then((r) => r.json())
          .then(setSnapshot)
          .catch(() => {})
      );

    return () => socket.disconnect();
  }, []);

  const value = useMemo(() => ({ snapshot, connected }), [snapshot, connected]);
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  return useContext(NetworkContext);
}
