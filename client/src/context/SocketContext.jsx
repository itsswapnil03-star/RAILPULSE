import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { FALLBACK_TRAINS, FALLBACK_ALERTS, FALLBACK_NETWORK_STATS } from '../data/fallbackData';

const SocketContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || '';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [trains, setTrains] = useState(() => new Map(FALLBACK_TRAINS.map(t => [t.trainNumber, t])));
  const [simulatedTime, setSimulatedTime] = useState(() => new Date().toISOString());
  const [recentEvents, setRecentEvents] = useState([]);
  const [alerts, setAlerts] = useState(FALLBACK_ALERTS);
  const [networkStats, setNetworkStats] = useState(FALLBACK_NETWORK_STATS);

  useEffect(() => {
    let isMounted = true;

    // Fast initial fetch to populate trains from backend if reachable
    const loadInitialData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/trains`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const trainsRes = await res.json();
          if (isMounted && Array.isArray(trainsRes) && trainsRes.length > 0) {
            setTrains(new Map(trainsRes.map(t => [t.trainNumber, t])));
          }
        }
      } catch (err) {
        // Fallback already pre-loaded
      }

      try {
        const statsRes = await fetch(`${API_URL}/api/network/stats`);
        const contentType = statsRes.headers.get('content-type') || '';
        if (statsRes.ok && contentType.includes('application/json')) {
          const stats = await statsRes.json();
          if (isMounted && stats) {
            setNetworkStats(stats);
            if (Array.isArray(stats.alerts)) {
              setAlerts(stats.alerts);
            }
          }
        }
      } catch (err) {
        // Fallback already pre-loaded
      }
    };

    loadInitialData();

    // Client-side simulation fallback when socket is disconnected (e.g. Vercel)
    const fallbackInterval = setInterval(() => {
      setSimulatedTime(new Date().toISOString());
      setTrains((prev) => {
        const next = new Map(prev);
        for (const [num, train] of next.entries()) {
          const run = train.currentRun || train;
          const speed = Math.max(30, Math.min(115, Math.round((run.currentSpeed || 80) + (Math.random() * 6 - 3))));
          const newKm = Math.min(run.totalKm || 500, (run.currentKm || 50) + 0.2);
          next.set(num, {
            ...train,
            currentSpeed: speed,
            currentKm: Math.round(newKm),
            currentRun: {
              ...run,
              currentSpeed: speed,
              currentKm: Math.round(newKm)
            }
          });
        }
        return next;
      });
    }, 1500);

    // Connect to the backend in production (VITE_API_URL) or local dev
    const newSocket = io(API_URL || undefined, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      clearInterval(fallbackInterval);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('trains:fleet', (fleetData) => {
      if (Array.isArray(fleetData) && fleetData.length > 0) {
        setTrains(new Map(fleetData.map(t => [t.trainNumber, t])));
      }
    });

    newSocket.on('train:update', (data) => {
      setTrains((prevTrains) => {
        const newTrains = new Map(prevTrains);
        const existing = newTrains.get(data.trainNumber);
        if (existing) {
          newTrains.set(data.trainNumber, { ...existing, currentRun: data });
        } else {
          newTrains.set(data.trainNumber, data);
        }
        return newTrains;
      });
    });

    newSocket.on('simulation:tick', (data) => {
      setSimulatedTime(data.simulatedTime);
      if (Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }
    });

    newSocket.on('conflicts:alerts', (alertsData) => {
      if (Array.isArray(alertsData)) {
        setAlerts(alertsData);
      }
    });

    newSocket.on('delay:event', (data) => {
      setRecentEvents((prevEvents) => {
        const newEvents = [data, ...prevEvents].slice(0, 25);
        return newEvents;
      });
    });

    newSocket.on('network:stats', (data) => {
      setNetworkStats(data);
      if (Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const trainsList = Array.from(trains.values());

  const value = {
    socket,
    connected,
    trains,
    trainsList,
    simulatedTime,
    recentEvents,
    alerts,
    networkStats,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
