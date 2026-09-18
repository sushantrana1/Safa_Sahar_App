import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Inbox,
  FileText,
  Clock,
  CheckCircle2,
  Coins,
  Search,
  AlertCircle,
  Leaf,
  Gift,
  Trophy,
  X,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import api from "../api/axios";
import ReportCard from "../components/ReportCard";
import { SkeletonList } from "../components/Skeleton";
import { STATUS_META } from "../utils/reportHelpers";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list"); // "list" | "grid"
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | points

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get("/reports/my");
        setReports(data.reports);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // ============ Derived stats ============
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === "pending").length;
    const inProgress = reports.filter((r) => r.status === "in_progress").length;
    const resolved = reports.filter((r) => r.status === "resolved").length;
    const rejected = reports.filter((r) => r.status === "rejected").length;
    const points = reports.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);
    const resolveRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, pending, inProgress, resolved, rejected, points, resolveRate };
  }, [reports]);

  // ============ Filtered + sorted list ============
  const filtered = useMemo(() => {
    let list = reports;
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.address || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "oldest") {
      list = [...list].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (sortBy === "points") {
      list = [...list].sort(
        (a, b) => (b.pointsAwarded || 0) - (a.pointsAwarded || 0)
      );
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return list;
  }, [reports, statusFilter, search, sortBy]);

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============ Enhanced Navbar ============ */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
          {/* Back */}
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition shrink-0
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>

          {/* Brand pill (desktop) */}
          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 shrink-0"
            aria-label="Safa Sahar home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm shadow-primary-500/20">
              <Leaf className="w-4 h-4 text-white" />
            </div>
          </Link>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              My Reports
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 truncate">
              {loading
                ? "Loading..."
                : `${stats.total} report${stats.total !== 1 ? "s" : ""} · ${stats.points} points earned`}
            </p>
          </div>

          {/* Quick nav */}
          <div className="flex items-center gap-1 shrink-0">
            <NavIcon to="/rewards" icon={Gift} label="Rewards" />
            <NavIcon to="/leaderboard" icon={Trophy} label="Leaderboard" />
          </div>

          {/* New report CTA */}
          <Link
            to="/reports/new"
            className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-2 flex items-center gap-1.5 transition-all shadow-sm shadow-primary-500/20
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New report</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-4">
        {/* ============ Hero Summary Card ============ */}
        {!loading && reports.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 text-white shadow-lg shadow-primary-500/20">
            {/* decorative blurs */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary-100 font-medium mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Your impact
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold leading-none">
                    {stats.total}
                  </p>
                  <p className="text-sm text-primary-100 mt-1">
                    report{stats.total !== 1 ? "s" : ""} submitted
                  </p>
                </div>

                {/* Points pill on hero */}
                <Link
                  to="/rewards"
                  className="flex flex-col items-end rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-2 hover:bg-white/25 transition shrink-0
                             focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary-700"
                >
                  <div className="flex items-center gap-1 text-[10px] text-primary-100 font-medium uppercase tracking-wide">
                    <Coins className="w-3 h-3" />
                    Points
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.points}</p>
                </Link>
              </div>

              {/* Resolve progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-primary-100 mb-2">
                  <span className="font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Resolution rate
                  </span>
                  <span className="font-bold text-white">
                    {stats.resolveRate}%
                  </span>
                </div>
                <div className="w-full bg-white/15 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${stats.resolveRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ Interactive Stat Cards ============ */}
        {!loading && reports.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
              value={stats.inProgress}
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

        {/* ============ Filter Bar ============ */}
        {!loading && reports.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 space-y-3">
            {/* Row 1: Search + Sort + View toggle */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by title, description, or address..."
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
                    <option value="points">Most points</option>
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

            {/* Row 2: Status chips (horizontal scroll) */}
            <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-0.5 scrollbar-hide">
              <FilterChip
                active={!statusFilter}
                onClick={() => setStatusFilter("")}
                count={stats.total}
              >
                All
              </FilterChip>
              {Object.entries(STATUS_META).map(([key, meta]) => {
                const count = reports.filter((r) => r.status === key).length;
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

            {/* Active filters summary */}
            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {filtered.length}
                  </span>{" "}
                  of {reports.length} shown
                  {activeFilterCount > 0 && (
                    <span className="ml-1.5 text-primary-600 font-medium">
                      · {activeFilterCount} filter
                      {activeFilterCount > 1 ? "s" : ""}
                    </span>
                  )}
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
          <SkeletonList count={4} />
        ) : reports.length === 0 ? (
          <EmptyReports />
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
              <ReportCard key={r._id} report={r} compact />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <ReportCard key={r._id} report={r} />
            ))}
          </div>
        )}

        {/* ============ Bottom CTA (mobile) ============ */}
        {!loading && reports.length > 0 && (
          <Link
            to="/reports/new"
            className="sm:hidden flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 p-3 hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Report another issue
                </p>
                <p className="text-xs text-slate-500">
                  Earn +10 points per report
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
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

/* ============ Interactive stat card ============ */
function StatCard({ icon: Icon, label, value, color, active, onClick }) {
  const COLORS = {
    slate: { bg: "bg-slate-100", fg: "text-slate-700", ring: "ring-slate-300" },
    yellow: {
      bg: "bg-yellow-50",
      fg: "text-yellow-700",
      ring: "ring-yellow-300",
    },
    blue: { bg: "bg-blue-50", fg: "text-blue-700", ring: "ring-blue-300" },
    primary: {
      bg: "bg-primary-50",
      fg: "text-primary-700",
      ring: "ring-primary-300",
    },
  };
  const c = COLORS[color];
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white rounded-xl shadow-sm border p-3 sm:p-4 transition-all duration-200 hover:shadow-md active:scale-[0.98]
        ${
          active
            ? `border-primary-300 ring-2 ${c.ring} shadow-md`
            : "border-slate-100 hover:border-slate-200"
        }
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1`}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg}`}
        >
          <Icon className={`w-4 h-4 ${c.fg}`} />
        </div>
        {active && (
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 leading-none">
        {value}
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

/* ============ Empty state ============ */
function EmptyReports() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 mb-4">
        <Inbox className="w-8 h-8 text-primary-500" />
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-1">
        No reports yet
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
        Report a waste issue in your ward and start earning points. Every
        verified report gives you{" "}
        <span className="font-semibold text-primary-600">+10 points</span>.
      </p>
      <Link
        to="/reports/new"
        className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition shadow-md shadow-primary-500/20
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <Plus className="w-4 h-4" />
        Create first report
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 text-left">
        <TipItem
          title="Take a clear photo"
          desc="Show the waste from a distance so it's identifiable"
        />
        <TipItem
          title="Pin the exact spot"
          desc="Use GPS or tap the map for accuracy"
        />
        <TipItem
          title="Add details"
          desc="Describe the type and size of the waste"
        />
      </div>
    </div>
  );
}

function TipItem({ title, desc }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <p className="text-xs font-bold text-slate-800 mb-0.5">{title}</p>
      <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ============ No matches state ============ */
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