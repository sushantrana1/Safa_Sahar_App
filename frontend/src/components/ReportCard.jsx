import { Link } from "react-router-dom";
import { MapPin, User as UserIcon } from "lucide-react";
import {
  STATUS_META,
  TYPE_LABELS,
  timeAgo,
  imageUrl,
} from "../utils/reportHelpers";

export default function ReportCard({ report, compact = false }) {
  const meta = STATUS_META[report.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  return (
    <Link
      to={`/reports/${report._id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-3"
    >
      <div className="flex gap-3">
        <img
          src={imageUrl(report.imageUrl)}
          alt={report.title}
          className={`rounded-lg object-cover shrink-0 ${
            compact ? "w-16 h-16" : "w-20 h-20"
          }`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
              {report.title}
            </h3>
            <span
              className={`text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 flex items-center gap-1 shrink-0 ${meta.chipCls}`}
            >
              <StatusIcon className="w-3 h-3" />
              {meta.label}
            </span>
          </div>

          {!compact && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-2">
              {report.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {report.address ||
                `${report.location.lat.toFixed(3)}, ${report.location.lng.toFixed(3)}`}
            </span>
            <span>·</span>
            <span className="font-medium text-slate-600">
              {TYPE_LABELS[report.type]}
            </span>
            <span>·</span>
            <span>{timeAgo(report.createdAt)}</span>
          </div>

          {!compact && report.user?.name && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
              <UserIcon className="w-3 h-3" />
              {report.user.name}
              {report.user.ward && ` · Ward ${report.user.ward}`}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}