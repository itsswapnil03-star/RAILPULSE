import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { interpolateTrainPosition } from '../../services/api';
import { getTrainDelay } from '../../utils/trainUtils';

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

// Station icon for general national network junctions
const createGeneralStationIcon = () => {
  return L.divIcon({
    className: 'custom-general-station-icon',
    html: `
      <div style="
        width: 7px; 
        height: 7px; 
        background-color: #ffffff; 
        border: 2px solid #006591; 
        border-radius: 50%; 
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [8, 8],
    iconAnchor: [4, 4]
  });
};

// Compact Train Marker for all other concurrent trains
const createCompactTrainIcon = (train, speed = 0, isDelayed = false) => {
  const statusColor = isDelayed ? '#EF4444' : '#10B981';

  return L.divIcon({
    className: 'custom-compact-train-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="
          width: 12px; 
          height: 12px; 
          border-radius: 50%; 
          background-color: ${statusColor}; 
          border: 2px solid #ffffff; 
          box-shadow: 0 0 6px ${statusColor};
        "></div>
        <div style="
          margin-top: 1px; 
          background-color: #0F172A; 
          color: #ffffff; 
          font-family: monospace; 
          font-size: 9px; 
          font-weight: bold; 
          padding: 1px 4px; 
          border-radius: 4px; 
          box-shadow: 0 1px 4px rgba(0,0,0,0.4); 
          white-space: nowrap; 
          border: 1px solid ${statusColor};
        ">
          #${train?.trainNumber}
        </div>
      </div>
    `,
    iconSize: [38, 26],
    iconAnchor: [19, 6]
  });
};

function MapAutoBounds({ bounds, center, trainKey, recenterTrigger }) {
  const map = useMap();
  const lastKeyRef = React.useRef(null);
  const lastTriggerRef = React.useRef(0);

  useEffect(() => {
    const isNewTrain = Boolean(trainKey && lastKeyRef.current !== trainKey);
    const isManualTrigger = Boolean(recenterTrigger && recenterTrigger !== lastTriggerRef.current);
    const isInitialMount = !lastKeyRef.current && Boolean(trainKey || (bounds && bounds.length > 1));

    if (isNewTrain || isManualTrigger || isInitialMount) {
      lastKeyRef.current = trainKey;
      lastTriggerRef.current = recenterTrigger;

      if (bounds && bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10, animate: true });
      } else if (center && center[0] && center[1]) {
        map.setView(center, 7, { animate: true });
      }
    }
  }, [trainKey, recenterTrigger, bounds, center, map]);

  return null;
}

// Rich Interactive Station Info Popup rendered directly on the GIS Map
function StationMapPopup({ station, trains = [], onOpenBoard }) {
  const code = station.stationCode || station.code;
  const name = station.name || station.stationName || code;
  const zone = station.zone || 'IR';
  const state = station.state || '';

  // Find trains calling at or arriving at this station
  const arrivals = useMemo(() => {
    if (!code || !trains) return [];
    const list = [];
    for (const t of trains) {
      const run = t.currentRun || t;
      const log = run.stationLog || t.schedule || [];
      const entry = log.find(s => s.stationCode === code);
      if (entry && !entry.departed) {
        const delay = getTrainDelay(t);
        list.push({
          trainNumber: t.trainNumber,
          trainName: t.name,
          type: t.type,
          delay,
          scheduledArrival: entry.scheduledArrival || '12:00',
          arrived: entry.arrived,
          platform: ((parseInt(String(t.trainNumber).slice(-1), 10) || 1) % 6) + 1
        });
      }
    }
    return list.slice(0, 4);
  }, [code, trains]);

  return (
    <div className="p-1 font-sans text-xs text-[#0F172A] min-w-[240px] max-w-[280px]">
      <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-2 mb-2">
        <div>
          <div className="font-bold text-sm text-[#006591] flex items-center gap-1.5">
            <span>🏛️</span>
            <span className="truncate max-w-[170px]">{name}</span>
          </div>
          <div className="text-[11px] text-[#505f76] mt-0.5">
            Station Code: <b className="font-mono text-[#0F172A]">{code}</b> {zone ? `· ${zone}` : ''} {state ? `· ${state}` : ''}
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#0ea5e9]/10 text-[#006591] text-[10px] font-bold font-mono">
          Station Hub
        </span>
      </div>

      <div className="mb-2">
        <div className="text-[10px] font-bold text-[#505f76] uppercase tracking-wider mb-1 flex justify-between">
          <span>Upcoming Services</span>
          <span className="text-[#006591] font-mono">{arrivals.length} Active</span>
        </div>

        {arrivals.length === 0 ? (
          <div className="text-[11px] text-[#6e7881] py-1.5 px-2 bg-[#f7f9fb] rounded border border-[#E2E8F0] italic">
            No imminent train arrivals at this time
          </div>
        ) : (
          <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar divide-y divide-[#E2E8F0]/60">
            {arrivals.map(arr => (
              <div key={arr.trainNumber} className="pt-1 flex items-center justify-between text-[11px]">
                <div>
                  <span className="font-mono font-bold text-[#006591]">#{arr.trainNumber}</span>
                  <span className="text-[#505f76] ml-1.5 truncate max-w-[110px] inline-block align-bottom">{arr.trainName}</span>
                </div>
                <div className="text-right font-mono">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    arr.delay > 10 ? 'bg-[#EF4444]/10 text-[#EF4444]' : arr.delay > 0 ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#10B981]/10 text-[#10B981]'
                  }`}>
                    {arr.delay > 0 ? `+${arr.delay}m` : 'On Time'}
                  </span>
                  <span className="text-[10px] text-[#505f76] ml-1">PF {arr.platform}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {onOpenBoard && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenBoard(code);
          }}
          className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-[#006591] hover:bg-[#004e70] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <span>Open Full Station Board</span>
          <span>→</span>
        </button>
      )}
    </div>
  );
}

export default function LiveGISMap({ 
  stations = [], 
  trains = [], 
  selectedTrainNumber = null, 
  onSelectTrain = () => {}, 
  onSelectStation = () => {},
  showAllTrains = false,
  height = '360px'
}) {
  const [isFleetVisible, setIsFleetVisible] = React.useState(showAllTrains);
  const [recenterCount, setRecenterCount] = React.useState(0);

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

  // Get route stations and coordinates for THIS selected train
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

  // Set of station codes on selected train's route
  const routeStationCodes = useMemo(() => {
    return new Set(routeData.stationsOnRoute.map(s => s.stationCode));
  }, [routeData.stationsOnRoute]);

  // Interpolated live train positions for the entire fleet across India
  const fleetPositions = useMemo(() => {
    if (!isFleetVisible) return [];
    // Limit to 200 trains simultaneously on the map for 60fps performance
    return trains.slice(0, 200).map(t => {
      const pos = interpolateTrainPosition(t, stationsMap);
      const delay = getTrainDelay(t);
      const run = t.currentRun || t;
      const speed = Math.round(run.currentSpeed || (delay > 10 ? 65 : 110));
      return {
        ...t,
        lat: pos[0],
        lng: pos[1],
        delay,
        speed,
        isTarget: t.trainNumber === targetTrain?.trainNumber
      };
    }).filter(t => t.lat && t.lng);
  }, [trains, stationsMap, targetTrain, isFleetVisible]);

  // Interpolated live train position for selected train
  const liveTrainPos = useMemo(() => {
    if (!targetTrain) return [21.8, 78.9];
    return interpolateTrainPosition(targetTrain, stationsMap);
  }, [targetTrain, stationsMap]);

  const runObj = targetTrain?.currentRun || targetTrain || {};
  const currentDelay = getTrainDelay(targetTrain);
  const currentSpeed = Math.round(runObj.currentSpeed || (currentDelay > 10 ? 65 : 110));
  const isDelayed = currentDelay > 10;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#E2E8F0] relative shadow-md bg-white" style={{ height }}>
      
      {/* Top Left Floating Badge with Route Info */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-[#E2E8F0] flex items-center gap-3 text-xs font-sans shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
        <div>
          <div className="font-bold text-[#0F172A] flex items-center gap-2">
            <span>{targetTrain?.name || 'Selected Train'}</span>
            <span className="font-mono text-[#006591]">#{targetTrain?.trainNumber}</span>
          </div>
          <div className="text-[11px] text-[#505f76] mt-0.5">
            Route: <b>{targetTrain?.originCode || 'NDLS'} → {targetTrain?.destinationCode || 'HWH'}</b> ({routeData.stationsOnRoute.length} Halts) · Live GPS Active
          </div>
        </div>
      </div>

      {/* Top Right Floating View Mode Switcher */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#E2E8F0] flex items-center gap-1 shadow-md text-xs font-sans">
        <button
          onClick={() => setRecenterCount(c => c + 1)}
          className="px-2.5 py-1 rounded-lg font-bold text-xs text-[#006591] hover:bg-[#006591]/10 transition-all cursor-pointer flex items-center gap-1 border border-[#006591]/20"
          title="Recenter and fit route in view"
        >
          <span>🎯</span> Focus Route
        </button>
        <button
          onClick={() => setIsFleetVisible(false)}
          className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            !isFleetVisible
              ? 'bg-[#006591] text-white shadow-sm'
              : 'text-[#505f76] hover:text-[#0F172A] hover:bg-[#f7f9fb]'
          }`}
          title="Show only the selected train and its scheduled halts"
        >
          Selected Train
        </button>
        <button
          onClick={() => setIsFleetVisible(true)}
          className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            isFleetVisible
              ? 'bg-[#006591] text-white shadow-sm'
              : 'text-[#505f76] hover:text-[#0F172A] hover:bg-[#f7f9fb]'
          }`}
          title="Show all concurrent trains across India"
        >
          <span>🌐</span> Fleet ({trains.length})
        </button>
      </div>

      <MapContainer
        center={liveTrainPos || [21.8, 78.9]}
        zoom={6}
        style={{ width: '100%', height: '100%', backgroundColor: '#f7f9fb' }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Crisp Light OpenStreetMap Base Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* Auto fit map to this train's route ONLY when train changes or user clicks Focus */}
        <MapAutoBounds 
          bounds={routeData.bounds} 
          center={liveTrainPos} 
          trainKey={targetTrain?.trainNumber}
          recenterTrigger={recenterCount}
        />

        {/* 1. Nationwide Railway Junction Nodes (Only shown when Fleet mode is toggled) */}
        {isFleetVisible && stations.map(st => {
          if (routeStationCodes.has(st.code)) return null; // Rendered with higher priority below
          if (!st.lat || !st.lng) return null;

          return (
            <Marker
              key={`all-st-${st.code}`}
              position={[st.lat, st.lng]}
              icon={createGeneralStationIcon()}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
                <div className="px-1.5 py-0.5 font-sans text-[10px] text-[#0F172A] bg-white rounded shadow-sm border border-[#E2E8F0]">
                  <span className="font-bold text-[#006591]">{st.name}</span> ({st.code})
                </div>
              </Tooltip>
              <Popup minWidth={250} maxWidth={290}>
                <StationMapPopup station={st} trains={trains} onOpenBoard={onSelectStation} />
              </Popup>
            </Marker>
          );
        })}

        {/* 2. Covered Route Track Line (Solid Green / Blue) */}
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

        {/* 3. Remaining Route Track Line (Dashed Navy Blue) */}
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

        {/* 4. Scheduled Stops on Selected Train's Route */}
        {routeData.stationsOnRoute.map(st => (
          <Marker
            key={`route-st-${st.stationCode}`}
            position={[st.lat, st.lng]}
            icon={createRouteStationIcon(st.isCovered, st.isCurrent, st.isTerminus)}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95} permanent={st.isTerminus || st.isCurrent}>
              <div className="px-2 py-1 font-sans text-xs text-[#0F172A] bg-white rounded shadow-sm border border-[#E2E8F0]">
                <div className="font-bold text-[#006591]">{st.name} ({st.stationCode})</div>
                <div className="text-[10px] text-[#505f76]">
                  {st.isCovered ? 'Passed ✓' : st.isCurrent ? 'Next Halt ⚡' : 'Scheduled Halt'}
                </div>
              </div>
            </Tooltip>
            <Popup minWidth={250} maxWidth={290}>
              <StationMapPopup station={st} trains={trains} onOpenBoard={onSelectStation} />
            </Popup>
          </Marker>
        ))}

        {/* 5. Other Active Trains Across India (Only shown when Fleet mode is toggled) */}
        {isFleetVisible && fleetPositions.map(t => {
          if (t.isTarget) return null; // Rendered with large photo badge below

          return (
            <Marker
              key={`fleet-trn-${t.trainNumber}`}
              position={[t.lat, t.lng]}
              icon={createCompactTrainIcon(t, t.speed, t.delay > 10)}
              eventHandlers={{
                click: () => onSelectTrain(t.trainNumber)
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <div className="px-2 py-1 font-sans text-xs text-[#0F172A] bg-white rounded shadow-sm border border-[#E2E8F0]">
                  <div className="font-bold text-[#006591]">#{t.trainNumber} · {t.name}</div>
                  <div className="text-[10px] text-[#505f76]">
                    {t.originCode} → {t.destinationCode} | {t.speed} km/h | {t.delay > 0 ? `+${t.delay}m` : 'On Time'}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* 6. Selected Train Highlighted Realistic Photo Marker */}
        {targetTrain && liveTrainPos && (
          <Marker
            key={`target-${targetTrain.trainNumber}`}
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
                  Corridor: <b>{(targetTrain.originCode || 'NDLS')} → {(targetTrain.destinationCode || 'HWH')}</b>
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