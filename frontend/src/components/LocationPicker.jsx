import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import { MapPin } from "lucide-react";

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Forces Leaflet to re-measure its container after mount.
 * Fixes broken tile rendering when the parent layout settles late.
 */
function MapResizer() {
  const map = useMap();

  useEffect(() => {
    // Immediate + delayed invalidateSize to handle layout shifts
    const t1 = setTimeout(() => map.invalidateSize(), 0);
    const t2 = setTimeout(() => map.invalidateSize(), 250);

    // Re-measure on window resize
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);

  return null;
}

/**
 * Recenters the map when lat/lng change from outside
 * (e.g., "Use my current location" button).
 */
function RecenterOnChange({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({ lat, lng, onPick }) {
  const defaultCenter = [27.7172, 85.324]; // Kathmandu
  const center = lat && lng ? [lat, lng] : defaultCenter;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary-600" />
          Pin location on map
        </label>
        <span className="text-xs text-slate-500">
          {lat && lng
            ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            : "Tap to place pin"}
        </span>
      </div>

      <div className="h-64 md:h-80 rounded-xl overflow-hidden border border-slate-300 relative z-0">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizer />
          <RecenterOnChange lat={lat} lng={lng} />
          <ClickHandler onPick={onPick} />
          {lat && lng && <Marker position={[lat, lng]} />}
        </MapContainer>
      </div>
    </div>
  );
}