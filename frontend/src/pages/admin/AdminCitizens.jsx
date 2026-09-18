import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Loader2,
  Users,
  Coins,
  Mail,
  MapPin,
  X,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Filter,
  Crown,
  Award,
  TrendingUp,
  AlertCircle,
  Phone,
  Calendar,
} from "lucide-react";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import { badgeStyle } from "../../utils/badgeHelpers";

const TIER_ORDER = ["Bronze", "Silver", "Gold", "Platinum"];

const TIER_COLORS = {
  Bronze: {
    bg: "bg-amber-50",
    fg: "text-amber-700",
    ring: "ring-amber-300",
  },
  Silver: {
    bg: "bg-slate-100",
    fg: "text-slate-700",
    ring: "ring-slate-300",
  },
  Gold: {
    bg: "bg-yellow-50",
    fg: "text-yellow-700",
    ring: "ring-yellow-300",
  },
  Platinum: {
    bg: "bg-primary-50",
    fg: "text-primary-700",
    ring: "ring-primary-300",
  },
};

const badgeNameForPoints = (points) => {
  if (points >= 1500) return "Platinum";
  if (points >= 500) return "Gold";
  if (points >= 100) return "Silver";
  return "Bronze";
};

export default function AdminCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [sortBy, setSortBy] = useState("points");
  const [view, setView] = useState("table"); // table | cards

  const fetchCitizens = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      const { data } = await api.get("/admin/citizens", { params });
      setCitizens(data.citizens);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCitizens, 300);
    return () => clearTimeout(t);
  }, [fetchCitizens]);

  // ============ Derived stats ============
  const stats = useMemo(() => {
    const total = citizens.length;
    const totalPoints = citizens.reduce((s, c) => s + (c.points || 0), 0);
    const tiers = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 };
    citizens.forEach((c) => {
      tiers[badgeNameForPoints(c.points)] += 1;
    });
    const topCitizen = [...citizens].sort(
      (a, b) => (b.points || 0) - (a.points || 0)
    )[0];
    return { total, totalPoints, tiers, topCitizen };
  }, [citizens]);

  // ============ Filtered + sorted ============
  const filtered = useMemo(() => {
    let list = citizens;

    if (tierFilter) {
      list = list.filter(
        (c) => badgeNameForPoints(c.points) === tierFilter
      );
    }

    if (sortBy === "newest") {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortBy === "name") {
      list = [...list].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    } else {
      // points (default)
      list = [...list].sort((a, b) => (b.points || 0) - (a.points || 0));
    }

    return list;
  }, [citizens, tierFilter, sortBy]);

  const activeFilterCount =
    (tierFilter ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <AdminLayout
      title="Citizens"
      subtitle="Registered citizens and their points"
    >
      {/* ============ Summary strip ============ */}
      {!loading && citizens.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <SummaryCard
            icon={Users}
            label="Citizens"
            value={stats.total}
            color="primary"
          />
          <SummaryCard
            icon={Coins}
            label="Total Points"
            value={stats.totalPoints.toLocaleString()}
            color="yellow"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Avg Points"
            value={
              stats.total > 0
                ? Math.round(stats.totalPoints / stats.total)
                : 0
            }
            color="blue"
          />
        </div>
      )}

      {/* ============ Top contributor highlight ============ */}
      {!loading && stats.topCitizen && stats.topCitizen.points > 0 && !tierFilter && !search && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 mb-4 p-4 sm:p-5">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/90">
                Top Contributor
              </p>
              <p className="text-base sm:text-lg font-bold truncate mt-0.5">
                {stats.topCitizen.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-white/90 mt-1">
                <span className="flex items-center gap-1 font-bold">
                  <Coins className="w-3 h-3" />
                  {stats.topCitizen.points} pts
                </span>
                {stats.topCitizen.ward && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Ward {stats.topCitizen.ward}
                  </span>
                )}
              </div>
            </div>
          </div>
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
              placeholder="Search by name or email..."
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
                <option value="points">Most points</option>
                <option value="newest">Newest</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>

            <div className="bg-slate-100 rounded-lg p-0.5 flex">
              <button
                onClick={() => setView("table")}
                title="Table view"
                aria-label="Table view"
                className={`p-1.5 rounded-md transition ${
                  view === "table"
                    ? "bg-white shadow-sm text-primary-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("cards")}
                title="Cards view"
                aria-label="Cards view"
                className={`p-1.5 rounded-md transition ${
                  view === "cards"
                    ? "bg-white shadow-sm text-primary-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Tier chips */}
        <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-0.5">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <FilterChip
            active={!tierFilter}
            onClick={() => setTierFilter("")}
            count={stats.total}
          >
            All tiers
          </FilterChip>
          {TIER_ORDER.map((tier) => {
            const count = stats.tiers[tier] ?? 0;
            if (count === 0 && tierFilter !== tier) return null;
            return (
              <FilterChip
                key={tier}
                active={tierFilter === tier}
                onClick={() =>
                  setTierFilter(tierFilter === tier ? "" : tier)
                }
                count={count}
              >
                {tier}
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
              of {citizens.length} shown
            </p>
            <button
              onClick={() => {
                setTierFilter("");
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
        <SkeletonList view={view} />
      ) : citizens.length === 0 ? (
        <EmptyCitizens
          hasFilters={activeFilterCount > 0}
          onReset={() => {
            setTierFilter("");
            setSearch("");
          }}
        />
      ) : view === "table" ? (
        <CitizensTable citizens={filtered} topId={stats.topCitizen?._id} />
      ) : (
        <CitizensCards citizens={filtered} topId={stats.topCitizen?._id} />
      )}
    </AdminLayout>
  );
}

/* ============ Summary card ============ */
function SummaryCard({ icon: Icon, label, value, color = "primary" }) {
  const COLORS = {
    primary: { bg: "bg-primary-50", fg: "text-primary-700" },
    yellow: { bg: "bg-yellow-50", fg: "text-yellow-700" },
    blue: { bg: "bg-blue-50", fg: "text-blue-700" },
    slate: { bg: "bg-slate-100", fg: "text-slate-700" },
  };
  const c = COLORS[color] || COLORS.primary;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4">
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 ${c.bg}`}
      >
        <Icon className={`w-4 h-4 ${c.fg}`} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-none tabular-nums">
        {value}
      </p>
      <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium mt-1">
        {label}
      </p>
    </div>
  );
}

/* ============ Filter chip ============ */
function FilterChip({ active, onClick, count, children }) {
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

/* ============ Avatar ============ */
function Avatar({ name, size = "w-9 h-9", isTop }) {
  const initial = (name || "U").charAt(0).toUpperCase();
  return (
    <div
      className={`relative ${size} rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs shrink-0`}
    >
      {initial}
      {isTop && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 border border-white flex items-center justify-center">
          <Crown className="w-2.5 h-2.5 text-yellow-900" />
        </span>
      )}
    </div>
  );
}

/* ============ Table view ============ */
function CitizensTable({ citizens, topId }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                Citizen
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                Ward
              </th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                Points
              </th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                Tier
              </th>
            </tr>
          </thead>
          <tbody>
            {citizens.map((c) => {
              const tier = badgeNameForPoints(c.points);
              const isTop = c._id === topId;
              return (
                <tr
                  key={c._id}
                  className={`border-b border-slate-100 last:border-0 transition ${
                    isTop
                      ? "bg-yellow-50/40 hover:bg-yellow-50/60"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} isTop={isTop} />
                      <span className="font-semibold text-slate-900">
                        {c.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 truncate max-w-[220px]">
                    {c.email}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.ward ? `Ward ${c.ward}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-primary-600 tabular-nums">
                      {c.points}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border ${badgeStyle(tier).chip}`}
                    >
                      {tier}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card list */}
      <div className="md:hidden divide-y divide-slate-100">
        {citizens.map((c) => {
          const tier = badgeNameForPoints(c.points);
          const isTop = c._id === topId;
          return (
            <div
              key={c._id}
              className={`p-4 ${
                isTop ? "bg-yellow-50/40" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar name={c.name} size="w-10 h-10" isTop={isTop} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {c.name}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 shrink-0 border ${badgeStyle(tier).chip}`}
                    >
                      {tier}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </p>
                    {c.ward && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        Ward {c.ward}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 font-bold text-primary-600">
                      <Coins className="w-3 h-3 shrink-0" />
                      {c.points} points
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Cards view ============ */
function CitizensCards({ citizens, topId }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {citizens.map((c) => {
        const tier = badgeNameForPoints(c.points);
        const isTop = c._id === topId;
        return (
          <div
            key={c._id}
            className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition p-4 ${
              isTop
                ? "border-yellow-300 ring-2 ring-yellow-200"
                : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <Avatar name={c.name} size="w-12 h-12" isTop={isTop} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {c.name}
                  </p>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 shrink-0 border ${badgeStyle(tier).chip}`}
                  >
                    {tier}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {c.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
                  Points
                </p>
                <p className="text-base font-bold text-primary-600 tabular-nums leading-tight mt-0.5">
                  {c.points}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
                  Ward
                </p>
                <p className="text-base font-bold text-slate-900 tabular-nums leading-tight mt-0.5">
                  {c.ward ?? "—"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============ Empty state ============ */
function EmptyCitizens({ hasFilters, onReset }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 mb-4">
        {hasFilters ? (
          <AlertCircle className="w-8 h-8 text-primary-500" />
        ) : (
          <Users className="w-8 h-8 text-primary-500" />
        )}
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-1">
        {hasFilters ? "No matches found" : "No citizens yet"}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
        {hasFilters
          ? "Try adjusting or clearing your filters."
          : "Citizens will appear here once they register."}
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
function SkeletonList({ view = "table" }) {
  if (view === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-2.5 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
              <div className="h-8 bg-slate-200 rounded" />
              <div className="h-8 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2 animate-pulse"
          >
            <div className="w-9 h-9 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-200 rounded w-1/4" />
              <div className="h-2.5 bg-slate-200 rounded w-1/3" />
            </div>
            <div className="h-3 bg-slate-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}