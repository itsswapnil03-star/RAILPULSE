import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [trains, setTrains] = useState(new Map());
  const [simulatedTime, setSimulatedTime] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [networkStats, setNetworkStats] = useState({ delayHistory: [], alerts: [] });

  useEffect(() => {
    let isMounted = true;

    // Fast initial fetch to populate trains immediately without waiting for socket
    const loadInitialData = async () => {
      try {
        const [trainsRes, statsRes] = await Promise.all([
          fetch('/api/trains').then(r => r.json()),
          fetch('/api/network/stats').then(r => r.json()).catch(() => ({}))
        ]);
        if (isMounted && Array.isArray(trainsRes) && trainsRes.length > 0) {
          setTrains(new Map(trainsRes.map(t => [t.trainNumber, t])));
        }
        if (isMounted && statsRes) {
          setNetworkStats(statsRes);
          if (Array.isArray(statsRes.alerts)) {
            setAlerts(statsRes.alerts);
          }
        }
      } catch (err) {
        console.error('Initial trains fetch error:', err);
      }
    };

    loadInitialData();

    // Connect via Vite proxy or relative host
    const newSocket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
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
