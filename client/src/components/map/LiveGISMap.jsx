import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { interpolateTrainPosition } from '../../services/api';

// Station icon for route stops
const createRouteStationIcon = (isCovered = false, isCurrent = false, isTerminus = false) => {
  const borderColor = isCovered ? '#10B981' : isCurrent ? '#0ea5e9' : isTerminus ? '#006591' : '#6e7881';
  const bgColor = isCovered ? '#10B981' : isCurrent ? '#0ea5e9' : '#ffffff';
  const size = isTerminus || isCurrent ? 14 : 11;

  return L.divIcon({
    className: 'custom-station-icon',
    html: `
      <div style="
        width: ${size}px; 
        height: ${size}px; 
        background-color: ${bgColor}; 
        border: 2.5px solid ${borderColor}; 
        border-radius: 50%; 
        box-shadow: 0 1px 5px rgba(0,0,0,0.25);
        ${isCurrent ? 'animation: pulse-ring 2s infinite;' : ''}
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// Realistic Train Photo Icon Badge
const createTrainPhotoIcon = (train, speed = 0, isDelayed = false) => {
  const statusColor = isDelayed ? '#EF4444' : '#10B981';
  const isVB = (train?.name || '').toLowerCase().includes('vande');

  // Photo URL of real Indian Railways aerodynamic train
  const photoUrl = isVB
    ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=120&q=80'
    : 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=120&q=80';

  return L.divIcon({
    className: 'custom-train-photo-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <!-- Circular Train Photo Badge -->
        <div style="
          width: 44px; 
          height: 44px; 
          border-radius: 50%; 
          border: 3px solid #006591; 
          background: #ffffff; 
          box-shadow: 0 4px 14px rgba(0,101,145,0.4); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          overflow: hidden; 
          position: relative;
        ">
          <img 
            src="${photoUrl}" 
            alt="Train" 
            style="width: 100%; height: 100%; object-fit: cover;" 
          />
          <!-- Pulse Status Dot -->
          <span style="
            position: absolute; 
            top: 2px; 
            right: 2px; 
            width: 10px; 
            height: 10px; 
            border-radius: 50%; 
            background-color: ${statusColor}; 
            border: 2px solid #ffffff;
            box-shadow: 0 0 6px ${statusColor};
          "></span>
        </div>
        
        <!-- Train Number & Speed Tag -->
        <div style="
          margin-top: 3px; 
          background-color: #0F172A; 
          color: #ffffff; 
          font-family: monospace; 
          font-size: 10px; 
          font-weight: bold; 
          padding: 2px 7px; 
          border-radius: 6px; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3); 
          white-space: nowrap; 
          border: 1px solid #0ea5e9;
        ">
          #${train?.trainNumber || 'TRAIN'} · ${speed} km/h
        </div>
      </div>
    `,
    iconSize: [60, 68],
    iconAnchor: [30, 22]
  });
};

function MapAutoBounds({ bounds, center }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10, animate: true });
    } else if (center && center[0] && center[1]) {
      map.setView(center, 8, { animate: true });
    }
  }, [bounds, center, map]);
  return null;
}

export default function LiveGISMap({ 
  stations = [], 
  trains = [], 
  selectedTrainNumber = null, 
  onSelectTrain = () => {}, 
  onSelectStation = () => {},
  height = '360px'
}) {
  const stationsMap = useMemo(() => {
    return new Map(stations.map(s => [s.code, s]));
  }, [stations]);

  // Find the single active selected train
  const targetTrain = useMemo(() => {
    if (selectedTrainNumber) {
      const found = trains.find(t => t.trainNumber === selectedTrainNumber);
      if (found) return found;
    }
    return trains[0] || null;
  }, [trains, selectedTrainNumber]);

  // Get route stations and coordinates for THIS selected train ONLY
  const routeData = useMemo(() => {
    if (!targetTrain) return { stationsOnRoute: [], coords: [], coveredCoords: [], remainingCoords: [], bounds: [] };

    const run = targetTrain.currentRun || targetTrain;
    const log = run.stationLog || targetTrain.schedule || [];
    const nextIdx = run.nextStationIndex || 0;

    const stationsOnRoute = [];
    const coords = [];
    const coveredCoords = [];
    const remainingCoords = [];

    log.forEach((st, idx) => {
      const stationObj = stationsMap.get(st.stationCode);
      if (stationObj && stationObj.lat && stationObj.lng) {
        const point = [stationObj.lat, stationObj.lng];
        coords.push(point);

        const isCovered = st.arrived || idx < nextIdx;
        const isCurrent = idx === nextIdx && !st.arrived;
        const isTerminus = idx === 0 || idx === log.length - 1;

        stationsOnRoute.push({
          ...st,
          name: stationObj.name || st.stationName,
          lat: stationObj.lat,
          lng: stationObj.lng,
          isCovered,
          isCurrent,
          isTerminus,
          index: idx
        });

        if (isCovered || isCurrent) {
          coveredCoords.push(point);
        }
        if (!isCovered || isCurrent) {
          remainingCoords.push(point);
        }
      }
    });

    return {
      stationsOnRoute,
      coords,
      coveredCoords,
      remainingCoords,
      bounds: coords.length > 0 ? coords : null
    };
  }, [targetTrain, stationsMap]);

  // Interpolated live train position on its route
  const liveTrainPos = useMemo(() => {
    if (!targetTrain) return [19.25, 75.25];
    return interpolateTrainPosition(targetTrain, stationsMap);
  }, [targetTrain, stationsMap]);

  const runObj = targetTrain?.currentRun || targetTrain || {};
  const currentSpeed = Math.round(runObj.currentSpeed || 0);
  const isDelayed = (targetTrain?.currentDelay || runObj.currentDelay || 0) > 10;
  const currentDelay = targetTrain?.currentDelay || runObj.currentDelay || 0;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#E2E8F0] relative shadow-md bg-white" style={{ height }}>
      
      {/* Top Floating Badge with Route Info */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-[#E2E8F0] flex items-center gap-3 text-xs font-sans shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
        <div>
          <div className="font-bold text-[#0F172A] flex items-center gap-2">
            <span>{targetTrain?.name || 'Selected Train'}</span>
            <span className="font-mono text-[#006591]">#{targetTrain?.trainNumber}</span>
          </div>
          <div className="text-[11px] text-[#505f76] mt-0.5">
            Route: <b>{targetTrain?.originCode || 'Origin'} → {targetTrain?.destinationCode || 'Destination'}</b> ({routeData.stationsOnRoute.length} Halts)
          </div>
        </div>
      </div>

      <MapContainer
        center={liveTrainPos}
        zoom={7}
        style={{ width: '100%', height: '100%', backgroundColor: '#f7f9fb' }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Crisp Light OpenStreetMap Base Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* Auto fit map to this train's route */}
        <MapAutoBounds bounds={routeData.bounds} center={liveTrainPos} />

        {/* 1. Covered Route Track Line (Solid Green / Blue) */}
        {routeData.coveredCoords.length > 1 && (
          <Polyline
            positions={routeData.coveredCoords}
            pathOptions={{
              color: '#10B981',
              weight: 5,
              opacity: 0.9,
              lineCap: 'round'
            }}
          />
        )}

        {/* 2. Remaining Route Track Line (Dashed Navy Blue) */}
        {routeData.remainingCoords.length > 1 && (
          <Polyline
            positions={routeData.remainingCoords}
            pathOptions={{
              color: '#006591',
              weight: 4,
              opacity: 0.75,
              dashArray: '8, 8',
              lineCap: 'round'
            }}
          />
        )}

        {/* 3. Render ONLY this train's scheduled station stops */}
        {routeData.stationsOnRoute.map(st => (
          <Marker
            key={st.stationCode}
            position={[st.lat, st.lng]}
            icon={createRouteStationIcon(st.isCovered, st.isCurrent, st.isTerminus)}
            eventHandlers={{
              click: () => onSelectStation(st.stationCode)
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95} permanent={st.isTerminus || st.isCurrent}>
              <div className="px-2 py-1 font-sans text-xs text-[#0F172A] bg-white rounded shadow-sm border border-[#E2E8F0]">
                <div className="font-bold text-[#006591]">{st.name} ({st.stationCode})</div>
                <div className="text-[10px] text-[#505f76]">
                  {st.isCovered ? 'Passed ✓' : st.isCurrent ? 'Next Halt ⚡' : 'Scheduled Halt'}
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* 4. Single Train Realistic Photo Marker */}
        {targetTrain && (
          <Marker
            key={targetTrain.trainNumber}
            position={liveTrainPos}
            icon={createTrainPhotoIcon(targetTrain, currentSpeed, isDelayed)}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="p-2 font-sans text-xs text-[#0F172A] min-w-[210px]">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5 mb-1.5">
                  <span className="font-bold text-[#006591]">#{targetTrain.trainNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    isDelayed ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#10B981]/10 text-[#10B981]'
                  }`}>
                    {currentDelay > 0 ? `+${currentDelay}m` : 'On Time'}
                  </span>
                </div>
                <div className="font-bold text-[#0F172A] text-xs truncate">
                  {targetTrain.name}
                </div>
                <div className="text-[11px] text-[#505f76] mt-1">
                  Corridor: <b>{(targetTrain.originCode || 'CSMT')} → {(targetTrain.destinationCode || 'SUR')}</b>
                </div>
                <div className="text-[11px] text-[#505f76]">
                  Speed: <b className="text-[#006591] font-mono">{currentSpeed} km/h</b>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}