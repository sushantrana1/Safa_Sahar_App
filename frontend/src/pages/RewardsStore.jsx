import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Coins,
  Gift,
  History,
  Leaf,
  Trophy,
  User as UserIcon,
  Search,
  X,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  Package,
  ChevronRight,
  Tag,
  TrendingUp,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import RewardCard from "../components/RewardCard";
import RedeemModal from "../components/RedeemModal";
import { SkeletonList } from "../components/Skeleton";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "voucher", label: "Vouchers" },
  { value: "merchandise", label: "Merch" },
  { value: "service", label: "Services" },
  { value: "other", label: "Other" },
];

export default function RewardsStore() {
  const { user, setUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [onlyAffordable, setOnlyAffordable] = useState(false);

  const fetchRewards = async () => {
    try {
      const { data } = await api.get("/rewards");
      setRewards(data.rewards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleSuccess = () => {
    fetchRewards();
    if (user && selected) {
      setUser({
        ...user,
        points: user.points - selected.pointsCost,
      });
    }
    setSelected(null);
  };

  const myPoints = user?.points ?? 0;

  const filtered = useMemo(() => {
    let list = rewards;
    if (category) list = list.filter((r) => r.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    if (onlyAffordable) {
      list = list.filter((r) => r.pointsCost <= myPoints && r.stock > 0);
    }
    return list;
  }, [rewards, category, search, onlyAffordable, myPoints]);

  const affordableCount = rewards.filter(
    (r) => r.pointsCost <= myPoints && r.stock > 0
  ).length;

  const activeFilterCount =
    (category ? 1 : 0) + (search.trim() ? 1 : 0) + (onlyAffordable ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============ Navbar ============ */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition shrink-0
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            aria-label="Back to home"
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
              Rewards Store
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 truncate">
              Redeem your points for real rewards
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <NavIcon to="/leaderboard" icon={Trophy} label="Leaderboard" />
            <NavIcon to="/my-reports" icon={UserIcon} label="My Reports" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {/* ============ Balance Hero ============ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 text-white shadow-lg shadow-primary-500/20">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary-100 font-medium mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your wallet
                </p>
                <p className="text-3xl sm:text-4xl font-bold leading-none tabular-nums">
                  {myPoints}
                </p>
                <p className="text-sm text-primary-100 mt-1">
                  points available
                </p>
              </div>

              <Link
                to="/redemptions"
                className="flex flex-col items-center gap-1 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-2 hover:bg-white/25 transition shrink-0
                           focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary-700"
              >
                <History className="w-4 h-4" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  History
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg px-3 py-2">
              <Gift className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span className="text-primary-50">
                You can redeem{" "}
                <span className="font-bold text-white">
                  {affordableCount}
                </span>{" "}
                reward{affordableCount !== 1 ? "s" : ""} right now
              </span>
            </div>
          </div>
        </div>

        {/* ============ Filters ============ */}
        {!loading && rewards.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search rewards..."
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
                <button
                  onClick={() => setOnlyAffordable((v) => !v)}
                  className={`text-xs font-semibold rounded-lg px-3 py-2 border transition flex items-center gap-1.5
                    ${
                      onlyAffordable
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Can redeem</span>
                  <span className="sm:hidden">Redeemable</span>
                </button>

                <div className="bg-slate-100 rounded-lg p-0.5 flex">
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
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-0.5">
              <div className="flex items-center gap-1 text-slate-500 text-xs font-medium shrink-0">
                <Tag className="w-3.5 h-3.5" />
              </div>
              {CATEGORIES.map((c) => {
                const count =
                  c.value === ""
                    ? rewards.length
                    : rewards.filter((r) => r.category === c.value).length;
                if (count === 0) return null;
                return (
                  <FilterChip
                    key={c.value || "all"}
                    active={category === c.value}
                    onClick={() => setCategory(c.value)}
                    count={count}
                  >
                    {c.label}
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
                  of {rewards.length} shown
                </p>
                <button
                  onClick={() => {
                    setCategory("");
                    setSearch("");
                    setOnlyAffordable(false);
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
          <SkeletonList count={6} />
        ) : rewards.length === 0 ? (
          <EmptyRewards />
        ) : filtered.length === 0 ? (
          <NoMatches
            onReset={() => {
              setCategory("");
              setSearch("");
              setOnlyAffordable(false);
            }}
          />
        ) : view === "grid" ? (
          /* ⬇️ CHANGED: 2 columns from the smallest breakpoint */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((r) => (
              <RewardCard
                key={r._id}
                reward={r}
                userPoints={myPoints}
                onRedeem={setSelected}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <RewardRow
                key={r._id}
                reward={r}
                userPoints={myPoints}
                onRedeem={setSelected}
              />
            ))}
          </div>
        )}

        {/* ============ Footer hint ============ */}
        {!loading && rewards.length > 0 && (
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium">
                Need more points?
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Earn +10 per verified report
              </p>
            </div>
            <Link
              to="/reports/new"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 shrink-0"
            >
              Report
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {selected && (
        <RedeemModal
          reward={selected}
          onClose={() => setSelected(null)}
          onSuccess={handleSuccess}
        />
      )}
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

/* ============ Reward row (list view) ============ */
function RewardRow({ reward, userPoints, onRedeem }) {
  const affordable = userPoints >= reward.pointsCost;
  const inStock = reward.stock > 0;

  const CATEGORY_LABELS = {
    voucher: "Voucher",
    merchandise: "Merch",
    service: "Service",
    other: "Other",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex gap-3 hover:shadow-md hover:border-slate-200 transition">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center shrink-0 overflow-hidden relative">
        {reward.imageUrl ? (
          <img
            src={reward.imageUrl}
            alt={reward.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Gift className="w-8 h-8 text-primary-600" />
        )}
        <span className="absolute top-1 left-1 text-[9px] font-bold uppercase tracking-wide bg-white/90 text-primary-700 rounded-full px-1.5 py-0.5">
          {CATEGORY_LABELS[reward.category] || "Reward"}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="font-semibold text-slate-900 text-sm truncate">
          {reward.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 mb-2">
          {reward.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto">
          <span className="flex items-center gap-1 text-primary-700 font-bold">
            <Coins className="w-3.5 h-3.5" />
            {reward.pointsCost}
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {inStock ? `${reward.stock} left` : "Out of stock"}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center shrink-0">
        <button
          onClick={() => onRedeem(reward)}
          disabled={!affordable || !inStock}
          className={`text-xs font-semibold rounded-lg px-3 py-2 transition flex items-center gap-1.5 whitespace-nowrap
            ${
              affordable && inStock
                ? "bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-500/20"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
        >
          {!inStock ? (
            "Out"
          ) : !affordable ? (
            <>-{reward.pointsCost - userPoints}</>
          ) : (
            <>Redeem</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ============ Empty state ============ */
function EmptyRewards() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 mb-4">
        <Gift className="w-8 h-8 text-primary-500" />
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-1">
        No rewards yet
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
        Rewards will appear here once admins add them. Check back soon.
      </p>
      <Link
        to="/my-reports"
        className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition shadow-md shadow-primary-500/20"
      >
        <Sparkles className="w-4 h-4" />
        Earn points meanwhile
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
        Try adjusting filters or clearing your search.
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