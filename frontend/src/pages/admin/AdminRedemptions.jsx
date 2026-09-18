import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Loader2,
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Mail,
  MapPin,
  Search,
  X,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Filter,
  User as UserIcon,
  Calendar,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import { timeAgo } from "../../utils/reportHelpers";

const STATUS_META = {
  pending: {
    label: "Pending",
    icon: Clock,
    chip: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50",
    fg: "text-yellow-700",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    chip: "bg-primary-100 text-primary-800 border-primary-200",
    dot: "bg-primary-500",
    bg: "bg-primary-50",
    fg: "text-primary-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    chip: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
    bg: "bg-red-50",
    fg: "text-red-700",
  },
};

export default function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [view, setView] = useState("list");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRedemptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/redemptions", { params });
      setRedemptions(data.redemptions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);

  const updateStatus = async (id, status) => {
    if (
      status === "cancelled" &&
      !confirm("Cancel this redemption? Points will be refunded to the citizen.")
    )
      return;
    setUpdatingId(id);
    try {
      const { data } = await api.patch(`/redemptions/${id}`, { status });
      setRedemptions((prev) =>
        prev.map((r) => (r._id === id ? data.redemption : r))
      );
      toast.success(`Marked as ${STATUS_META[status].label}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  // ============ Derived stats ============
  const stats = useMemo(() => {
    const total = redemptions.length;
    const pending = redemptions.filter((r) => r.status === "pending").length;
    const delivered = redemptions.filter((r) => r.status === "delivered").length;
    const cancelled = redemptions.filter((r) => r.status === "cancelled").length;
    const pointsPending = redemptions
      .filter((r) => r.status === "pending")
      .reduce((s, r) => s + (r.pointsSpent || 0), 0);
    return { total, pending, delivered, cancelled, pointsPending };
  }, [redemptions]);

  // ============ Filtered + sorted ============
  const filtered = useMemo(() => {
    let list = redemptions;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.rewardTitle?.toLowerCase().includes(q) ||
          r.user?.name?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "oldest") {
      list = [...list].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (sortBy === "points") {
      list = [...list].sort(
        (a, b) => (b.pointsSpent || 0) - (a.pointsSpent || 0)
      );
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return list;
  }, [redemptions, search, sortBy]);

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <AdminLayout
      title="Redemptions"
      subtitle="Fulfill reward redemptions from citizens"
    >
      {/* ============ Stat cards ============ */}
      {!loading && redemptions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
          <StatCard
            icon={Gift}
            label="All"
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
            icon={CheckCircle2}
            label="Delivered"
            value={stats.delivered}
            color="primary"
            active={statusFilter === "delivered"}
            onClick={() =>
              setStatusFilter(
                statusFilter === "delivered" ? "" : "delivered"
              )
            }
          />
          <StatCard
            icon={XCircle}
            label="Cancelled"
            value={stats.cancelled}
            color="red"
            active={statusFilter === "cancelled"}
            onClick={() =>
              setStatusFilter(
                statusFilter === "cancelled" ? "" : "cancelled"
              )
            }
          />
        </div>
      )}

      {/* ============ Pending alert ============ */}
      {!loading && stats.pending > 0 && !statusFilter && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-3 sm:p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-yellow-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-yellow-900">
              {stats.pending} pending redemption
              {stats.pending > 1 ? "s" : ""} need attention
            </p>
            <p className="text-xs text-yellow-800/80 mt-0.5">
              {stats.pointsPending} points awaiting fulfillment
            </p>
          </div>
          <button
            onClick={() => setStatusFilter("pending")}
            className="text-xs font-semibold bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg px-3 py-2 transition shrink-0"
          >
            View
          </button>
        </div>
      )}

      {/* ============ Filters ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 mb-4 space-y-3">
        {/* Row 1: Search + Sort + View */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by reward or citizen..."
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
                <option value="points">Most points</option>
              </select>
            </div>

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
          {Object.entries(STATUS_META).map(([key, meta]) => {
            const Icon = meta.icon;
            const count = stats[key] ?? 0;
            if (count === 0 && statusFilter !== key) return null;
            return (
              <FilterChip
                key={key}
                active={statusFilter === key}
                onClick={() =>
                  setStatusFilter(statusFilter === key ? "" : key)
                }
                icon={Icon}
                count={count}
              >
                {meta.label}
              </FilterChip>
            );
          })}
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {filtered.length}
              </span>{" "}
              of {redemptions.length} shown
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
      ) : redemptions.length === 0 ? (
        <EmptyRedemptions
          hasFilters={activeFilterCount > 0}
          onReset={() => {
            setStatusFilter("");
            setSearch("");
          }}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((r) => (
            <RedemptionGridCard
              key={r._id}
              redemption={r}
              updating={updatingId === r._id}
              onUpdate={updateStatus}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <RedemptionListCard
              key={r._id}
              redemption={r}
              updating={updatingId === r._id}
              onUpdate={updateStatus}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

/* ============ Stat card ============ */
function StatCard({ icon: Icon, label, value, color, active, onClick }) {
  const COLORS = {
    slate: { bg: "bg-slate-100", fg: "text-slate-700", ring: "ring-slate-300" },
    yellow: {
      bg: "bg-yellow-50",
      fg: "text-yellow-700",
      ring: "ring-yellow-300",
    },
    primary: {
      bg: "bg-primary-50",
      fg: "text-primary-700",
      ring: "ring-primary-300",
    },
    red: { bg: "bg-red-50", fg: "text-red-700", ring: "ring-red-300" },
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

/* ============ Reward thumbnail ============ */
function RewardThumb({ redemption, size = "w-14 h-14" }) {
  return (
    <div
      className={`${size} rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center shrink-0 overflow-hidden`}
    >
      {redemption.reward?.imageUrl ? (
        <img
          src={redemption.reward.imageUrl}
          alt={redemption.rewardTitle}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <Gift className="w-6 h-6 text-primary-600" />
      )}
    </div>
  );
}

/* ============ Actions block ============ */
function ActionButtons({ redemption: r, updating, onUpdate, compact }) {
  if (r.status !== "pending") {
    if (r.status === "delivered" && r.deliveredAt) {
      return (
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-primary-500" />
          Delivered {timeAgo(r.deliveredAt)}
        </p>
      );
    }
    if (r.status === "cancelled") {
      return (
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <XCircle className="w-3 h-3 text-red-500" />
          Cancelled · points refunded
        </p>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onUpdate(r._id, "delivered")}
        disabled={updating}
        className="text-xs font-semibold rounded-lg px-3 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white transition shadow-sm shadow-primary-500/20
                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {updating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5" />
        )}
        <span className={compact ? "hidden sm:inline" : ""}>
          Mark delivered
        </span>
      </button>
      <button
        onClick={() => onUpdate(r._id, "cancelled")}
        disabled={updating}
        className="text-xs font-semibold rounded-lg px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100 transition
                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5
                   focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
      >
        <XCircle className="w-3.5 h-3.5" />
        <span className={compact ? "hidden sm:inline" : ""}>
          Cancel + refund
        </span>
      </button>
    </div>
  );
}

/* ============ List card ============ */
function RedemptionListCard({ redemption: r, updating, onUpdate }) {
  const meta = STATUS_META[r.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 hover:shadow-md hover:border-slate-200 transition">
      <div className="flex gap-3 items-start">
        {/* Status left accent */}
        <div className={`w-1 self-stretch rounded-full ${meta.dot}`} />

        <RewardThumb redemption={r} size="w-14 h-14 sm:w-16 sm:h-16" />

        <div className="flex-1 min-w-0">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 text-sm truncate">
              {r.rewardTitle}
            </h3>
            <span
              className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 flex items-center gap-1 shrink-0 border ${meta.chip}`}
            >
              <StatusIcon className="w-3 h-3" />
              {meta.label}
            </span>
          </div>

          {/* User + meta */}
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap mb-3">
            <span className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              <span className="font-medium text-slate-700 truncate">
                {r.user?.name || "Unknown"}
              </span>
            </span>
            {r.user?.email && (
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3" />
                {r.user.email}
              </span>
            )}
            {r.user?.ward && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Ward {r.user.ward}
              </span>
            )}
            <span className="flex items-center gap-1 text-primary-600 font-bold">
              <Coins className="w-3 h-3" />
              {r.pointsSpent}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {timeAgo(r.createdAt)}
            </span>
          </div>

          {/* Actions */}
          <ActionButtons
            redemption={r}
            updating={updating}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}

/* ============ Grid card ============ */
function RedemptionGridCard({ redemption: r, updating, onUpdate }) {
  const meta = STATUS_META[r.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-slate-200 transition flex flex-col">
      {/* Reward image */}
      <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center overflow-hidden">
        {r.reward?.imageUrl ? (
          <img
            src={r.reward.imageUrl}
            alt={r.rewardTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Gift className="w-10 h-10 text-primary-600" />
        )}
        <span
          className={`absolute top-2 right-2 text-[10px] font-bold uppercase rounded-full px-2 py-0.5 flex items-center gap-1 border backdrop-blur-sm bg-white/95 ${meta.chip}`}
        >
          <StatusIcon className="w-3 h-3" />
          {meta.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-slate-900 text-sm truncate">
          {r.rewardTitle}
        </h3>

        {/* User */}
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary-700">
              {(r.user?.name || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="truncate font-medium text-slate-700">
            {r.user?.name || "Unknown"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 flex-wrap">
          <span className="flex items-center gap-1 text-primary-600 font-bold">
            <Coins className="w-3 h-3" />
            {r.pointsSpent}
          </span>
          <span>·</span>
          <span>{timeAgo(r.createdAt)}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 mt-3">
          <ActionButtons
            redemption={r}
            updating={updating}
            onUpdate={onUpdate}
            compact
          />
        </div>
      </div>
    </div>
  );
}

/* ============ Empty state ============ */
function EmptyRedemptions({ hasFilters, onReset }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 mb-4">
        {hasFilters ? (
          <AlertCircle className="w-8 h-8 text-primary-500" />
        ) : (
          <Gift className="w-8 h-8 text-primary-500" />
        )}
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-1">
        {hasFilters ? "No matches found" : "No redemptions yet"}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
        {hasFilters
          ? "Try adjusting or clearing your filters."
          : "Reward redemptions from citizens will appear here."}
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
          <div className="w-1 rounded-full bg-slate-200" />
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
            <div className="flex gap-2 pt-1">
              <div className="h-7 w-28 bg-slate-200 rounded-lg" />
              <div className="h-7 w-28 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}