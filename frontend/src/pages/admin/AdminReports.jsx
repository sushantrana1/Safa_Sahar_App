import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Loader2,
  Inbox,
  MapPin,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  X,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import {
  STATUS_META,
  TYPE_LABELS,
  timeAgo,
  imageUrl,
} from "../../utils/reportHelpers";

const STATUS_ACTIONS = ["pending", "in_progress", "resolved", "rejected"];

const STATUS_ICON = {
  pending: Clock,
  in_progress: AlertCircle,
  resolved: CheckCircle2,
  rejected: XCircle,
};

const STATUS_COLORS = {
  pending: {
    ring: "ring-yellow-300",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  in_progress: {
    ring: "ring-blue-300",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  resolved: {
    ring: "ring-primary-300",
    bg: "bg-primary-50",
    text: "text-primary-700",
  },
  rejected: {
    ring: "ring-red-300",
    bg: "bg-red-50",
    text: "text-red-700",
  },
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest
  const [view, setView] = useState("list"); // list | grid
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/admin/reports", { params });
      setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchReports, 300);
    return () => clearTimeout(t);
  }, [fetchReports]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const { data } = await api.patch(`/reports/${id}/status`, { status });
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ...data.report } : r))
      );
      toast.success(`Marked as ${STATUS_META[status].label}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  // Derived stats
  const stats = useMemo(() => {
    const total = reports.length;
    const counts = {
      pending: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    };
    reports.forEach((r) => {
      if (counts[r.status] !== undefined) counts[r.status] += 1;
    });
    return { total, ...counts };
  }, [reports]);

  // Sorted list
  const sortedReports = useMemo(() => {
    const list = [...reports];
    if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [reports, sortBy]);

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <AdminLayout
      title="Reports"
      subtitle="Review, filter, and update waste reports"
    >
      {/* ============ Stat cards (clickable filter) ============ */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
          <StatCard
            icon={FileText}
            label="All reports"
            value={stats.total}
            color="slate"
            active={!statusFilter}
            onClick={() => setStatusFilter("")}
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            color="yellow"
            active={statusFilter === "pending"}
            onClick={() =>
              setStatusFilter(statusFilter === "pending" ? "" : "pending")
            }
          />
          <StatCard
            icon={AlertCircle}
            label="In progress"
            value={stats.in_progress}
            color="blue"
            active={statusFilter === "in_progress"}
            onClick={() =>
              setStatusFilter(
                statusFilter === "in_progress" ? "" : "in_progress"
              )
            }
          />
          <StatCard
            icon={CheckCircle2}
            label="Resolved"
            value={stats.resolved}
            color="primary"
            active={statusFilter === "resolved"}
            onClick={() =>
              setStatusFilter(statusFilter === "resolved" ? "" : "resolved")
            }
          />
        </div>
      )}

      {/* ============ Filters ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 mb-4 space-y-3">
        {/* Row 1: Search + Sort + View toggle */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, description, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 text-sm outline-none transition
                         focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-medium bg-white border border-slate-200 rounded-lg pl-8 pr-8 py-2 outline-none cursor-pointer
                           hover:bg-slate-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition appearance-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            {/* View toggle */}
            <div className="bg-slate-100 rounded-lg p-0.5 flex">
              <button
                onClick={() => setView("list")}
                title="List view"
                aria-label="List view"
                className={`p-1.5 rounded-md transition ${
                  view === "list"
                    ? "bg-white shadow-sm text-primary-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("grid")}
                title="Grid view"
                aria-label="Grid view"
                className={`p-1.5 rounded-md transition ${
                  view === "grid"
                    ? "bg-white shadow-sm text-primary-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Status chips */}
        <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-0.5">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <FilterChip
            active={!statusFilter}
            onClick={() => setStatusFilter("")}
            count={stats.total}
          >
            All
          </FilterChip>
          {STATUS_ACTIONS.map((s) => {
            const meta = STATUS_META[s];
            const Icon = STATUS_ICON[s];
            const count = stats[s] ?? 0;
            if (count === 0 && statusFilter !== s) return null;
            return (
              <FilterChip
                key={s}
                active={statusFilter === s}
                onClick={() =>
                  setStatusFilter(statusFilter === s ? "" : s)
                }
                icon={Icon}
                count={count}
              >
                {meta.label}
              </FilterChip>
            );
          })}
        </div>

        {/* Active summary */}
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {reports.length}
              </span>{" "}
              of {stats.total} shown
            </p>
            <button
              onClick={() => {
                setStatusFilter("");
                setSearch("");
              }}
              className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 transition"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ============ Content ============ */}
      {loading ? (
        <SkeletonList count={4} />
      ) : reports.length === 0 ? (
        <EmptyReports
          hasFilters={activeFilterCount > 0}
          onReset={() => {
            setStatusFilter("");
            setSearch("");
          }}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {sortedReports.map((r) => (
            <ReportGridCard
              key={r._id}
              report={r}
              updating={updatingId === r._id}
              onUpdate={updateStatus}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedReports.map((r) => (
            <ReportListCard
              key={r._id}
              report={r}
              updating={updatingId === r._id}
              onUpdate={updateStatus}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

/* ============ Interactive stat card ============ */
function StatCard({ icon: Icon, label, value, color, active, onClick }) {
  const COLORS = {
    slate: {
      bg: "bg-slate-100",
      fg: "text-slate-700",
      ring: "ring-slate-300",
    },
    yellow: {
      bg: "bg-yellow-50",
      fg: "text-yellow-700",
      ring: "ring-yellow-300",
    },
    blue: {
      bg: "bg-blue-50",
      fg: "text-blue-700",
      ring: "ring-blue-300",
    },
    primary: {
      bg: "bg-primary-50",
      fg: "text-primary-700",
      ring: "ring-primary-300",
    },
  };
  const c = COLORS[color] || COLORS.slate;
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white rounded-2xl shadow-sm border p-3 sm:p-4 transition-all duration-200 hover:shadow-md active:scale-[0.98]
        ${
          active
            ? `border-primary-300 ring-2 ${c.ring} shadow-md`
            : "border-slate-100 hover:border-slate-200"
        }
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1`}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${c.bg}`}
        >
          <Icon className={`w-4 h-4 ${c.fg}`} />
        </div>
        {active && (
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-none tabular-nums">
        {value ?? 0}
      </p>
      <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium mt-1">
        {label}
      </p>
    </button>
  );
}

/* ============ Filter chip ============ */
function FilterChip({ active, onClick, icon: Icon, count, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 text-xs font-semibold rounded-full px-3 py-1.5 transition flex items-center gap-1.5 whitespace-nowrap
        ${
          active
            ? "bg-slate-900 text-white shadow-sm"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
      <span
        className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
          active
            ? "bg-white/20 text-white"
            : "bg-white text-slate-600 border border-slate-200"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* ============ Status action buttons (shared) ============ */
function StatusActions({ report, updating, onUpdate, compact = false }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {STATUS_ACTIONS.map((s) => {
        const meta = STATUS_META[s];
        const Icon = STATUS_ICON[s];
        const isCurrent = report.status === s;
        const disabled = isCurrent || updating;
        const colors = STATUS_COLORS[s];

        return (
          <button
            key={s}
            onClick={() => onUpdate(report._id, s)}
            disabled={disabled}
            className={`text-[11px] font-semibold rounded-lg px-2 py-1.5 transition border flex items-center gap-1
              ${
                isCurrent
                  ? `${colors.bg} ${colors.text} border-current opacity-90 cursor-default`
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.97]"
              }
              disabled:cursor-not-allowed`}
            title={meta.label}
          >
            <Icon className="w-3 h-3" />
            <span className={compact ? "hidden sm:inline" : ""}>
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ============ List view card ============ */
function ReportListCard({ report: r, updating, onUpdate }) {
  const meta = STATUS_META[r.status];
  const StatusIcon = meta.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 hover:shadow-md hover:border-slate-200 transition">
      <div className="flex gap-3">
        {/* Thumbnail */}
        <img
          src={imageUrl(r.imageUrl)}
          alt={r.title}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
          loading="lazy"
        />

        <div className="flex-1 min-w-0">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
              {r.title}
            </h3>
            <span
              className={`text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 flex items-center gap-1 shrink-0 ${meta.chipCls}`}
            >
              <StatusIcon className="w-3 h-3" />
              {meta.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-2">
            {r.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {r.address ||
                `${r.location.lat.toFixed(3)}, ${r.location.lng.toFixed(3)}`}
            </span>
            <span>·</span>
            <span className="font-medium text-slate-600">
              {TYPE_LABELS[r.type]}
            </span>
            <span>·</span>
            <span>{timeAgo(r.createdAt)}</span>
            {r.user?.name && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  {r.user.name}
                </span>
              </>
            )}
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <StatusActions
              report={r}
              updating={updating}
              onUpdate={onUpdate}
            />
            <Link
              to={`/reports/${r._id}`}
              className="ml-auto text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 shrink-0
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
            >
              <ExternalLink className="w-3 h-3" />
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Grid view card ============ */
function ReportGridCard({ report: r, updating, onUpdate }) {
  const meta = STATUS_META[r.status];
  const StatusIcon = meta.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-slate-200 transition flex flex-col">
      {/* Image */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <img
          src={imageUrl(r.imageUrl)}
          alt={r.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Status chip overlay */}
        <span
          className={`absolute top-2 right-2 text-[10px] font-bold uppercase rounded-full px-2 py-0.5 flex items-center gap-1 border backdrop-blur-sm bg-white/95 ${meta.chipCls}`}
        >
          <StatusIcon className="w-3 h-3" />
          {meta.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
          {r.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-2">
          {r.description}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {r.address?.split(",")[0] ||
              `${r.location.lat.toFixed(2)}, ${r.location.lng.toFixed(2)}`}
          </span>
          <span>·</span>
          <span>{timeAgo(r.createdAt)}</span>
        </div>

        <div className="mt-auto space-y-2 pt-3 border-t border-slate-100">
          <StatusActions
            report={r}
            updating={updating}
            onUpdate={onUpdate}
            compact
          />
          <Link
            to={`/reports/${r._id}`}
            className="w-full text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-primary-50 transition"
          >
            <ExternalLink className="w-3 h-3" />
            View full report
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ============ Empty state ============ */
function EmptyReports({ hasFilters, onReset }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 mb-4">
        {hasFilters ? (
          <AlertCircle className="w-8 h-8 text-primary-500" />
        ) : (
          <Inbox className="w-8 h-8 text-primary-500" />
        )}
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-1">
        {hasFilters ? "No matches found" : "No reports yet"}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
        {hasFilters
          ? "Try adjusting or clearing your filters."
          : "Reports from citizens will appear here."}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 transition"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/* ============ Loading skeleton ============ */
function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 flex gap-3 animate-pulse"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-2.5 bg-slate-200 rounded w-2/3" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-slate-200 rounded-lg" />
              <div className="h-6 w-16 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}