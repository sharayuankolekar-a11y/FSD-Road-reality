import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './Badges';
import { ago } from '../utils/formatters';

// Hazard marker custom icon
const createHazardIcon = (status) =>
  L.divIcon({
    className: '',
    html: `<div class="marker-dot ${status === 'resolved' ? 'safe' : ''}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

// User location custom icon
const userIcon = L.divIcon({
  className: '',
  html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(59,130,246,0.7);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Component to re-center map when user location or center prop changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapView({ hazards = [], userLocation = null, center = null, onSelect }) {
  // Determine initial center
  const defaultCenter = [12.8834, 74.8397]; // Default initial view if no location
  let initialCenter = defaultCenter;

  if (userLocation && userLocation.latitude && userLocation.longitude) {
    initialCenter = [userLocation.latitude, userLocation.longitude];
  } else if (center) {
    initialCenter = center;
  } else if (hazards.length > 0 && hazards[0].latitude && hazards[0].longitude) {
    initialCenter = [hazards[0].latitude, hazards[0].longitude];
  }

  return (
    <MapContainer
      center={initialCenter}
      zoom={14}
      scrollWheelZoom
      className="h-full w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapRecenter center={initialCenter} />

      {/* User / Selected Location Marker */}
      {userLocation && userLocation.latitude && userLocation.longitude && (
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
          <Popup>
            <div className="text-center min-w-36">
              <p className="font-extrabold text-sm text-blue-600">
                📍 {userLocation.isManual ? 'Selected Location' : 'You are here'}
              </p>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                {userLocation.placeName || `${userLocation.latitude.toFixed(4)}°, ${userLocation.longitude.toFixed(4)}°`}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Hazard Markers */}
      {hazards.map((h) => {
        if (!h.latitude || !h.longitude || isNaN(h.latitude) || isNaN(h.longitude)) return null;

        return (
          <Marker
            key={h.id}
            position={[h.latitude, h.longitude]}
            icon={createHazardIcon(h.status)}
            eventHandlers={{ click: () => onSelect?.(h) }}
          >
            <Popup>
              <div className="min-w-48">
                <b className="text-base text-slate-900">{h.category}</b>
                <p className="my-1 text-sm text-slate-600">{h.address}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge value={h.severity} kind="severity" />
                  <span className="text-xs text-slate-500">{ago(h.reportedAt)}</span>
                </div>
                <Link
                  className="mt-3 block text-sm font-bold text-brand hover:underline"
                  to={`/hazards/${h.id}`}
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
