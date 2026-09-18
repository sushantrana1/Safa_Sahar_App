import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const STATUS_META = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "#eab308", // yellow-500
    chipCls: "bg-yellow-100 text-yellow-800",
    dotCls: "bg-yellow-500",
  },
  in_progress: {
    label: "In Progress",
    icon: AlertCircle,
    color: "#3b82f6", // blue-500
    chipCls: "bg-blue-100 text-blue-800",
    dotCls: "bg-blue-500",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "#10b981", // primary-500
    chipCls: "bg-primary-100 text-primary-800",
    dotCls: "bg-primary-500",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "#ef4444", // red-500
    chipCls: "bg-red-100 text-red-800",
    dotCls: "bg-red-500",
  },
};

export const TYPE_LABELS = {
  illegal_dumping: "Illegal Dumping",
  missed_pickup: "Missed Pickup",
  overflowing_bin: "Overflowing Bin",
  other: "Other",
};

export const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const STATUS_OPTIONS = Object.entries(STATUS_META).map(
  ([value, meta]) => ({ value, label: meta.label })
);

// Time ago helper
export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

// Full image URL
export const imageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const base =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";
  return `${base}${path}`;
};