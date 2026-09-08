import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { INDIA_CENTER, INDIA_BOUNDS, TILE_URL, TILE_ATTR } from "../utils/constants";
import { statusOf } from "../utils/format";

/* ── Custom marker factory ─────────────────────────────────────── */
function makeTrainIcon(color = "#1a2f52", accent = "#f0b429") {
  return L.divIcon({
    className: "",
    html: `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="24" height="16" rx="3" fill="${color}" stroke="${accent}" stroke-width="1.5"/>
      <rect x="7" y="11" width="7" height="5" rx="1" fill="${accent}" opacity="0.7"/>
      <rect x="18" y="11" width="7" height="5" rx="1" fill="${accent}" opacity="0.7"/>
      <rect x="4" y="22" width="24" height="3" rx="1" fill="${accent}" opacity="0.4"/>
      <circle cx="10" cy="27" r="2.5" fill="${accent}"/>
      <circle cx="22" cy="27" r="2.5" fill="${accent}"/>
    </svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

const ICON_MAP = {
  on_time: makeTrainIcon("#1a2f52", "#3dcc8a"),
  delayed: makeTrainIcon("#2a1f04", "#f0b429"),
  heavily_delayed: makeTrainIcon("#2b0e0a", "#e85d4c"),
  arrived: makeTrainIcon("#1a2535", "#8b9aab"),
};

function trainIcon(train) {
  return ICON_MAP[train.status] ?? ICON_MAP.on_time;
}

function junctionIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:8px;height:8px;border-radius:50%;
      background:#f0b429;box-shadow:0 0 4px #f0b429;
      border:1px solid rgba(240,180,41,0.8);
    "/>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });
}

/* ── Components ────────────────────────────────────────────────── */
function RoutePolylines({ corridors }) {
  const lines = useMemo(
    () =>
      Object.entries(corridors || {}).map(([key, stns]) => {
        const pts = stns.map((s) => [s.latitude, s.longitude]);
        return (
          <Polyline
            key={key}
            positions={pts}
            pathOptions={{ color: "#455a64", weight: 2.5, opacity: 0.6, dashArray: "4 6" }}
          />
        );
      }),
    [corridors]
  );
  return <>{lines}</>;
}

function StationDots({ stations, onStationClick }) {
  return (
    <>
      {(stations || [])
        .filter((s) => s.is_junction)
        .map((s) => (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            icon={junctionIcon()}
            eventHandlers={{ click: () => onStationClick?.(s) }}
          >
            <Popup>
              <div className="min-w-[120px] p-2">
                <p className="font-semibold text-navy-900">{s.name}</p>
                <p className="text-[10px] text-steel-500">{s.code} · {s.city}</p>
              </div>
            </Popup>
          </Marker>
        ))}
    </>
  );
}

function TrainMarkers({ trains, selectedTrain, onSelect }) {
  return (
    <>
      {(trains || []).map((t) => (
        <Marker
          key={t.train_id}
          position={[t.latitude, t.longitude]}
          icon={trainIcon(t)}
          zIndexOffset={t.train_id === selectedTrain ? 1000 : 0}
          eventHandlers={{ click: () => onSelect?.(t) }}
        >
          <Popup>
            <div style={{ minWidth: 160, fontSize: 11 }}>
              <p style={{ fontWeight: 700, color: "#1a2f52", marginBottom: 1 }}>{t.name}</p>
              <p style={{ color: "#5b6b7a", fontSize: 9 }}>#{t.number}</p>
              <p style={{ marginTop: 3 }}>
                <span style={{ color: "#5b6b7a" }}>Status: </span>
                <span style={{ color: t.delay_minutes >= 20 ? "#e85d4c" : t.delay_minutes >= 5 ? "#d97706" : "#3dcc8a" }}>
                  {t.delay_minutes >= 1 ? `+${t.delay_minutes.toFixed(0)} min` : "On time"}
                </span>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

/* ── Main Map — White Background ───────────────────────────────── */
export default function RailMap({
  trains = [],
  selectedTrain = null,
  setSelectedTrain,
  corridors = {},
  stations = [],
  showStations = false,
  onStationClick,
}) {
  return (
    <MapContainer
      center={INDIA_CENTER}
      zoom={5}
      minZoom={4}
      maxZoom={12}
      // Set to white background
      style={{ height: "100%", width: "100%", background: "#ffffff" }}
      maxBounds={INDIA_BOUNDS}
      zoomControl={true} // Keep zoom controls
      attributionControl={false} // Remove attribution to clean up map
    >
      <TileLayer url={TILE_URL} />
      <RoutePolylines corridors={corridors} />
      {showStations && (
        <StationDots stations={stations} onStationClick={onStationClick} />
      )}
      <TrainMarkers
        trains={trains}
        selectedTrain={selectedTrain}
        onSelect={setSelectedTrain}
      />
    </MapContainer>
  );
}
