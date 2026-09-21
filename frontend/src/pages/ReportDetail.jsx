import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  User as UserIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Leaf,
  Trophy,
  Gift,
  Coins,
  Share2,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Hash,
  Tag,
  TrendingUp,
  Pencil,
  Trash2,
  Save,
  X,
  Lock,
} from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  STATUS_META,
  TYPE_LABELS,
  timeAgo,
  imageUrl,
} from "../utils/reportHelpers";

const ADMIN_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", icon: Clock, color: "yellow" },
  {
    value: "in_progress",
    label: "In Progress",
    icon: AlertCircle,
    color: "blue",
  },
  {
    value: "resolved",
    label: "Resolved",
    icon: CheckCircle2,
    color: "primary",
  },
  { value: "rejected", label: "Rejected", icon: XCircle, color: "red" },
];

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    type: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isOwner = !!(user?._id && report?.user?._id === user._id);
  const canEdit = isOwner && !isAdmin && report?.status === "pending";

  const fetchReport = async () => {
    try {
      const { data } = await api.get(`/reports/${id}`);
      setReport(data.report);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load report");
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === report.status) return;
    setUpdating(true);
    try {
      const { data } = await api.patch(`/reports/${id}/status`, {
        status: newStatus,
      });
      setReport(data.report);
      toast.success(`Marked as ${STATUS_META[newStatus].label}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const startEditing = () => {
    setEditForm({
      title: report.title,
      description: report.description,
      type: report.type,
      address: report.address || "",
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const saveEdit = async () => {
    if (!editForm.title.trim() || editForm.title.trim().length < 3) {
      return toast.error("Title must be at least 3 characters");
    }
    if (
      !editForm.description.trim() ||
      editForm.description.trim().length < 10
    ) {
      return toast.error("Description must be at least 10 characters");
    }

    setSaving(true);
    try {
      const { data } = await api.patch(`/reports/${id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        type: editForm.type,
        address: editForm.address.trim(),
      });
      setReport(data.report);
      setEditing(false);
      toast.success("Report updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete this report? This cannot be undone. Points earned from it will remain."
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/reports/${id}`);
      toast.success("Report deleted");
      navigate("/my-reports");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
      setDeleting(false);
    }
  };

  // ============ Loading ============
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="aspect-video bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ============ Not found ============
  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-bold text-lg text-slate-800 mb-1">
            Report not found
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            {error ||
              "This report may have been removed or is no longer available."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition shadow-md shadow-primary-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const meta = STATUS_META[report.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  const timeline = [
    {
      label: "Reported",
      desc: "Submitted to the municipality",
      date: report.createdAt,
      icon: Clock,
      color: "text-slate-600 bg-slate-100",
      done: true,
    },
    {
      label: "In Progress",
      desc: "Being reviewed by ward office",
      date: report.status === "in_progress" ? report.updatedAt : null,
      icon: AlertCircle,
      color: "text-blue-600 bg-blue-100",
      done: ["in_progress", "resolved"].includes(report.status),
    },
    {
      label: "Resolved",
      desc: "Issue addressed and closed",
      date: report.resolvedAt,
      icon: CheckCircle2,
      color: "text-primary-600 bg-primary-100",
      done: report.status === "resolved",
    },
  ];

  if (report.status === "rejected") {
    timeline.push({
      label: "Rejected",
      desc: "Report could not be verified",
      date: report.updatedAt,
      icon: XCircle,
      color: "text-red-600 bg-red-100",
      done: true,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============ Navbar ============ */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition shrink-0
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>

          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 shrink-0"
            aria-label="Safa Sahar home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm shadow-primary-500/20">
              <Leaf className="w-4 h-4 text-white" />
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              Report Details
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 truncate">
              #{report._id.slice(-6).toUpperCase()} · {TYPE_LABELS[report.type]}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Owner-only edit/delete (only while pending) */}
            {canEdit && !editing && (
              <>
                <button
                  onClick={startEditing}
                  className="p-2 rounded-lg text-slate-600 hover:text-primary-700 hover:bg-primary-50 active:bg-primary-100 transition
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                  title="Edit report"
                  aria-label="Edit report"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition
                             disabled:opacity-50 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                  title="Delete report"
                  aria-label="Delete report"
                >
                  {deleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </>
            )}

            {editing && (
              <button
                onClick={cancelEditing}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition
                           focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
                title="Cancel editing"
                aria-label="Cancel editing"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-slate-600 hover:text-primary-700 hover:bg-primary-50 active:bg-primary-100 transition
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              title="Copy link"
              aria-label="Copy link"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <NavIcon to="/leaderboard" icon={Trophy} label="Leaderboard" />
            <NavIcon to="/rewards" icon={Gift} label="Rewards" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {/* ============ Hero Image ============ */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white max-w-2xl mx-auto">
          <div className="h-52 sm:h-64 md:h-72 lg:h-60 bg-slate-100">
            <img
              src={imageUrl(report.imageUrl)}
              alt={report.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-bold uppercase tracking-wide rounded-full px-3 py-1.5 flex items-center gap-1.5 border shadow-sm backdrop-blur-sm bg-white/95 ${meta.chipCls}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {meta.label}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {TYPE_LABELS[report.type]}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-semibold bg-black/50 backdrop-blur-sm text-white rounded-full px-2.5 py-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(report.createdAt)}
            </span>
          </div>
        </div>

        {/* ============ Main Info Card ============ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-5">
            {!editing ? (
              <>
                {/* READ MODE */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                    {report.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center font-bold text-[10px] text-primary-700 shrink-0">
                      {(report.user?.name || "A").charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">
                      Reported by{" "}
                      <span className="font-semibold text-slate-700">
                        {report.user?.name || "Anonymous"}
                      </span>
                      {report.user?.ward && ` · Ward ${report.user.ward}`}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {report.description}
                </p>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary-50 mb-1.5">
                      <Coins className="w-4 h-4 text-primary-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">
                      {report.pointsAwarded}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-1">
                      Points
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 mb-1.5">
                      <Hash className="w-4 h-4 text-slate-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">
                      {report.ward ?? "—"}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-1">
                      Ward
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 mb-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">
                      {new Date(report.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-1">
                      Date
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* EDIT MODE */}
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Edit report
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      You can only edit while the report is pending
                    </p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                    <span>Title</span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {editForm.title.length}/100
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition
                               focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                    <span>Description</span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {editForm.description.length}/1000
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    maxLength={1000}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition
                               focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Type
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition
                               focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                  >
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Landmark / Address{" "}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder="e.g. Ratna Park, Kathmandu"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition
                               focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl py-2.5 transition
                               disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl py-2.5 transition
                               disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2
                               shadow-md shadow-primary-500/20"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ============ Locked notice ============ */}
        {isOwner && !isAdmin && report.status !== "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-900">
                This report is locked
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Once a report is under review or resolved, it can no longer be
                edited or deleted. Contact your ward office if there's an issue.
              </p>
            </div>
          </div>
        )}

        {/* ============ Location Card ============ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900">Location</h3>
              <p className="text-xs text-slate-500 truncate">
                {report.address ||
                  `${report.location.lat.toFixed(
                    4
                  )}, ${report.location.lng.toFixed(4)}`}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 shrink-0
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
            >
              Open
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="h-44 sm:h-56 bg-slate-100">
            <MapContainer
              center={[report.location.lat, report.location.lng]}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[report.location.lat, report.location.lng]} />
            </MapContainer>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100">
            <div className="px-4 py-2.5 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
                Latitude
              </p>
              <p className="text-sm font-bold text-slate-900 tabular-nums">
                {report.location.lat.toFixed(4)}
              </p>
            </div>
            <div className="px-4 py-2.5 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
                Longitude
              </p>
              <p className="text-sm font-bold text-slate-900 tabular-nums">
                {report.location.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* ============ Timeline ============ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Status Timeline
              </h3>
              <p className="text-[11px] text-slate-500">
                Track the progress of your report
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />

            <div className="space-y-5">
              {timeline.map((step, i) => {
                const Icon = step.icon;
                const isActive = step.done;

                return (
                  <div key={i} className="relative flex gap-4">
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition ${
                        isActive
                          ? `${step.color} border-white shadow-sm`
                          : "bg-white text-slate-300 border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 pt-0.5 pb-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p
                          className={`text-sm font-semibold ${
                            isActive ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.date && isActive && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                            {timeAgo(step.date)}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isActive ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============ Admin Actions ============ */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Admin Actions
                </h3>
                <p className="text-[11px] text-slate-500">
                  Update this report's status
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ADMIN_STATUS_OPTIONS.map((opt) => {
                const OptIcon = opt.icon;
                const isCurrent = report.status === opt.value;
                const colorMap = {
                  yellow: "bg-yellow-50 border-yellow-300 text-yellow-800",
                  blue: "bg-blue-50 border-blue-300 text-blue-800",
                  primary:
                    "bg-primary-50 border-primary-300 text-primary-800",
                  red: "bg-red-50 border-red-300 text-red-800",
                };

                return (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    disabled={updating || isCurrent}
                    className={`text-xs font-semibold rounded-xl py-3 px-3 transition flex flex-col items-center gap-1.5 border-2
                      ${
                        isCurrent
                          ? `${colorMap[opt.color]} cursor-default`
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.97]"
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <OptIcon className="w-4 h-4" />
                    {opt.label}
                    {isCurrent && (
                      <span className="text-[9px] uppercase tracking-wider opacity-70">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {updating && (
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
                Updating status...
              </div>
            )}
          </div>
        )}

        {/* ============ Bottom nav strip (citizens only) ============ */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/my-reports"
              className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:bg-slate-50 active:bg-slate-100 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    My Reports
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    View all yours
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </Link>

            <Link
              to="/reports/new"
              className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:bg-slate-50 active:bg-slate-100 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    New Report
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    Earn +10 points
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ Nav icon ============ */ 
function NavIcon({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className="p-2 rounded-lg text-slate-600 hover:text-primary-700 hover:bg-primary-50 active:bg-primary-100 transition
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
    >
      <Icon className="w-5 h-5" />
    </Link>
  );
}