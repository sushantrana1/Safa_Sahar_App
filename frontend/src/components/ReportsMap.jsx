import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import { Link } from "react-router-dom";
import { STATUS_META, TYPE_LABELS, timeAgo, imageUrl } from "../utils/reportHelpers";

// Custom colored marker
const makeIcon = (color) =>
  L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background:${color};
        width:18px;
        height:18px;
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -8],
  });

// Fit bounds to markers
function FitBounds({ reports }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(
        reports.map((r) => [r.location.lat, r.location.lng])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [reports, map]);
  return null;
}

export default function ReportsMap({ reports, height = "h-96" }) {
  const center = [27.7172, 85.324]; // Kathmandu

  return (
    <div className={`${height} rounded-xl overflow-hidden border border-slate-200 relative z-0`}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds reports={reports} />

        {reports.map((r) => {
          const meta = STATUS_META[r.status] || STATUS_META.pending;
          return (
            <Marker
              key={r._id}
              position={[r.location.lat, r.location.lng]}
              icon={makeIcon(meta.color)}
            >
              <Popup>
                <div className="w-56">
                  <img
                    src={imageUrl(r.imageUrl)}
                    alt={r.title}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                  <p className="font-semibold text-sm text-slate-900 line-clamp-1">
                    {r.title}
                  </p>
                  <p className="text-xs text-slate-500 mb-1">
                    {TYPE_LABELS[r.type]} · {timeAgo(r.createdAt)}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 mb-2 ${meta.chipCls}`}
                  >
                    {meta.label}
                  </span>
                  <Link
                    to={`/reports/${r._id}`}
                    className="block text-center bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-md py-1.5 transition"
                  >
                    View details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}