import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Gift,
  CheckCircle2,
  Clock,
  XCircle,
  Coins,
  Sparkles,
  ChevronRight,
  Leaf,
  Search,
  X,
  LayoutGrid,
  List as ListIcon,
  Package,
  Calendar,
  TrendingUp,
  Filter,
} from "lucide-react";
import api from "../api/axios";
import { timeAgo } from "../utils/reportHelpers";

const STATUS_META = {
  pending: {
    label: "Pending",
    icon: Clock,
    chip: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
    desc: "Awaiting fulfillment",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    chip: "bg-primary-100 text-primary-800 border-primary-200",
    dot: "bg-primary-500",
    desc: "Successfully delivered",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    chip: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
    desc: "Cancelled · points refunded",
  },
};

export default function MyRedemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list"); // "list" | "grid"

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/redemptions/my");
        setRedemptions(data.redemptions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived stats
  const stats = useMemo(() => {
    const total = redemptions.length;
    const delivered = redemptions.filter((r) => r.status === "delivered").length;
    const pending = redemptions.filter((r) => r.status === "pending").length;
    const cancelled = redemptions.filter((r) => r.status === "cancelled").length;
    const pointsSpent = redemptions
      .filter((r) => r.status !== "cancelled")
      .reduce((s, r) => s + (r.pointsSpent || 0), 0);
    return { total, delivered, pending, cancelled, pointsSpent };
  }, [redemptions]);

  // Filtered
  const filtered = useMemo(() => {
    let list = redemptions;
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.rewardTitle?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [redemptions, statusFilter, search]);

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============ Navbar ============ */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
          <Link
            to="/rewards"
            className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition shrink-0
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            aria-label="Back to rewards"
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
              My Redemptions
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 truncate">
              Track your redeemed rewards
            </p>
          </div>

          <Link
            to="/rewards"
            className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-2 flex items-center gap-1.5 transition shadow-sm shadow-primary-500/20 shrink-0
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Gift className="w-4 h-4" />
            <span className="hidden sm:inline">Store</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {/* ============ Hero ============ */}
        {!loading && redemptions.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 text-white shadow-lg shadow-primary-500/20">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-yellow-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <p className="text-[11px] uppercase tracking-widest text-primary-100 font-semibold">
                    Your redemptions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-primary-100 uppercase tracking-wide font-semibold">
                    Points spent
                  </p>
                  <p className="text-xl font-bold tabular-nums leading-none flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-300" />
                    {stats.pointsSpent}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <HeroStat
                  icon={Gift}
                  label="Total"
                  value={stats.total}
                />
                <HeroStat
                  icon={CheckCircle2}
                  label="Delivered"
                  value={stats.delivered}
                />
                <HeroStat
                  icon={Clock}
                  label="Pending"
                  value={stats.pending}
                />
              </div>
            </div>
          </div>
        )}

        {/* ============ Filters ============ */}
        {!loading && redemptions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 space-y-3">
            {/* Row 1: Search + view toggle */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search redemptions..."
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

              <div className="bg-slate-100 rounded-lg p-0.5 flex self-start sm:self-auto">
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
                  className={`px-2 py-1.5 rounded-md transition text-xs font-semibold flex items-center gap-1 ${
                    view === "grid"
                      ? "bg-white shadow-sm text-primary-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
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
                const count = redemptions.filter(
                  (r) => r.status === key
                ).length;
                if (count === 0) return null;
                const Icon = meta.icon;
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

            {/* Active summary */}
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
        )}

        {/* ============ Content ============ */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 animate-pulse"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : redemptions.length === 0 ? (
          <EmptyRedemptions />
        ) : filtered.length === 0 ? (
          <NoMatches
            onReset={() => {
              setStatusFilter("");
              setSearch("");
            }}
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((r) => (
              <RedemptionCard key={r._id} redemption={r} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <RedemptionRow key={r._id} redemption={r} />
            ))}
          </div>
        )}

        {/* Browse more CTA */}
        {!loading && redemptions.length > 0 && filtered.length > 0 && (
          <Link
            to="/rewards"
            className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:bg-slate-50 active:bg-slate-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Browse more rewards
                </p>
                <p className="text-xs text-slate-500">
                  Redeem more with your points
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ============ Hero stat ============ */
function HeroStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-3">
      <div className="flex items-center gap-1.5 text-primary-100 mb-1.5">
        <Icon className="w-3 h-3" />
        <p className="text-[10px] uppercase tracking-wider font-semibold">
          {label}
        </p>
      </div>
      <p className="text-lg sm:text-xl font-bold text-white tabular-nums leading-none">
        {value}
      </p>
    </div>
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

/* ============ Thumbnail (shared) ============ */
function Thumb({ redemption, size = "w-14 h-14" }) {
  return (
    <div
      className={`${size} rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center shrink-0 overflow-hidden relative`}
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

/* ============ List row ============ */
function RedemptionRow({ redemption: r }) {
  const meta = STATUS_META[r.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex items-center gap-3 hover:shadow-md hover:border-slate-200 transition">
      {/* Status left accent */}
      <div className={`w-1 self-stretch rounded-full ${meta.dot}`} />

      <Thumb redemption={r} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm truncate">
          {r.rewardTitle}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
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
      </div>

      <span
        className={`text-[10px] font-bold uppercase rounded-full px-2 py-1 flex items-center gap-1 shrink-0 border ${meta.chip}`}
      >
        <StatusIcon className="w-3 h-3" />
        <span className="hidden xs:inline sm:inline">{meta.label}</span>
      </span>
    </div>
  );
}

/* ============ Grid card ============ */
function RedemptionCard({ redemption: r }) {
  const meta = STATUS_META[r.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-slate-200 transition flex flex-col">
      {/* Thumbnail banner */}
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

        {/* Status chip */}
        <span
          className={`absolute top-2 right-2 text-[10px] font-bold uppercase rounded-full px-2 py-0.5 flex items-center gap-1 border backdrop-blur-sm bg-white/95 ${meta.chip}`}
        >
          <StatusIcon className="w-3 h-3" />
          {meta.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col">
        <p className="font-semibold text-slate-900 text-sm truncate">
          {r.rewardTitle}
        </p>
        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {timeAgo(r.createdAt)}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-primary-600 font-bold text-sm">
            <Coins className="w-3.5 h-3.5" />
            {r.pointsSpent}
          </span>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
            {meta.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ Empty ============ */
function EmptyRedemptions() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 mb-4">
        <Gift className="w-8 h-8 text-primary-500" />
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-1">
        No redemptions yet
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
        You haven't redeemed any rewards. Browse the store and spend your
        points.
      </p>
      <Link
        to="/rewards"
        className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition shadow-md shadow-primary-500/20
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <Gift className="w-4 h-4" />
        Browse rewards
      </Link>
    </div>
  );
}

/* ============ No matches ============ */
function NoMatches({ onReset }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-3">
        <Search className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-800">No matches</h3>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        Try adjusting filters or search terms.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 transition"
      >
        Clear filters
      </button>
    </div>
  );
}