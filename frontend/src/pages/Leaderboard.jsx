import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Medal,
  Award,
  Leaf,
  Gift,
  User as UserIcon,
  Coins,
  MapPin,
  Crown,
  Sparkles,
  Users,
  Target,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import api from "../api/axios";
import { badgeStyle } from "../utils/badgeHelpers";
import { useAuth } from "../context/AuthContext";

export default function Leaderboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/leaderboard");
        setBoard(data.leaderboard);
      } catch (err) {
        console.error(err);
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const top3 = board.slice(0, 3);
  const rest = board.slice(3);
  const myRankIndex = board.findIndex((u) => u._id === user?._id);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  const topScore = board[0]?.points ?? 0;
  const totalPoints = board.reduce((s, u) => s + (u.points || 0), 0);
  const nextAbove = myRank && myRank > 1 ? board[myRank - 2] : null;

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
              Leaderboard
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 truncate">
              Top citizens making Nepal cleaner
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <NavIcon to="/rewards" icon={Gift} label="Rewards" />
            <NavIcon to="/my-reports" icon={UserIcon} label="My Reports" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {/* ============ Loading ============ */}
        {loading && (
          <div className="space-y-4">
            <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-16 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-16 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        )}

        {/* ============ Error ============ */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-3">
              <Trophy className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* ============ Empty ============ */}
        {!loading && !error && board.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-50 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-1">
              Leaderboard is empty
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
              Be the first citizen to earn points and claim the top spot.
            </p>
            <Link
              to="/reports/new"
              className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition shadow-md shadow-primary-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Start earning points
            </Link>
          </div>
        )}

        {/* ============ Main ============ */}
        {!loading && !error && board.length > 0 && (
          <>
            {/* ---- Hero summary ---- */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 text-white shadow-lg shadow-primary-500/20">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-yellow-400/20 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl" />

              <div className="relative p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-yellow-300" />
                  <p className="text-[11px] uppercase tracking-widest text-primary-100 font-semibold">
                    This week's champions
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <HeroStat
                    icon={Users}
                    label="Citizens"
                    value={board.length}
                  />
                  <HeroStat
                    icon={Coins}
                    label="Total pts"
                    value={totalPoints.toLocaleString()}
                  />
                  <HeroStat
                    icon={Target}
                    label="Top score"
                    value={topScore}
                  />
                </div>

                {myRank && (
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3">
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm shrink-0">
                      #{myRank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-primary-100">
                        Your position
                      </p>
                      <p className="text-sm font-bold truncate">
                        {user?.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold tabular-nums leading-none">
                        {user?.points ?? 0}
                      </p>
                      <p className="text-[10px] text-primary-100">points</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ---- Top 3 champions ---- */}
            {top3.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Hall of Fame
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {top3.map((u, i) => (
                    <ChampionCard
                      key={u._id}
                      user={u}
                      rank={i + 1}
                      isMe={u._id === user?._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ---- Full rankings ---- */}
            {rest.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Full Rankings
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Rank 4 – {board.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {rest.map((u, i) => {
                    const rank = i + 4;
                    const bStyle = badgeStyle(u.badge?.name);
                    const isMe = u._id === user?._id;
                    const pointsGap = topScore - u.points;

                    return (
                      <div
                        key={u._id}
                        className={`group flex items-center gap-3 rounded-xl p-3 transition-all duration-200 border
                          ${
                            isMe
                              ? "bg-gradient-to-r from-primary-50 to-white border-primary-200 shadow-sm"
                              : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                          }`}
                      >
                        {/* Rank number */}
                        <div className="w-9 shrink-0 text-center">
                          <p
                            className={`text-base font-bold tabular-nums ${
                              isMe ? "text-primary-700" : "text-slate-400"
                            }`}
                          >
                            {rank}
                          </p>
                        </div>

                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 ${
                            isMe
                              ? "bg-primary-600 text-white shadow-md shadow-primary-500/30"
                              : "bg-primary-50 text-primary-700"
                          }`}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {u.name}
                            </p>
                            {isMe && (
                              <span className="text-[9px] font-bold uppercase text-primary-700 bg-primary-100 rounded px-1.5 py-0.5 shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {u.ward && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Ward {u.ward}
                              </span>
                            )}
                            {!isMe && (
                              <>
                                <span>·</span>
                                <span className="text-slate-400">
                                  {pointsGap} pts below #1
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Points + badge */}
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900 tabular-nums leading-none">
                              {u.points}
                            </p>
                            <p className="text-[9px] text-slate-400 font-semibold uppercase mt-1">
                              pts
                            </p>
                          </div>
                          <span
                            className={`hidden xs:inline-block sm:inline-block text-[9px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 border ${bStyle.chip}`}
                          >
                            {u.badge?.name || "Bronze"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---- Climb hint ---- */}
            {myRank && nextAbove && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium">
                    Climb to rank #{myRank - 1}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {nextAbove.points - (user?.points ?? 0)} points behind{" "}
                    {nextAbove.name}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            )}

            {/* ---- CTA if not on board ---- */}
            {!myRank && (
              <Link
                to="/reports/new"
                className="block bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-4 text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">
                      Claim your spot on the board
                    </p>
                    <p className="text-xs text-primary-100 mt-0.5">
                      Submit a report · earn +10 points instantly
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </div>
              </Link>
            )}
          </>
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

/* ============ Champion card (top 3) ============ */
function ChampionCard({ user, rank, isMe }) {
  const themes = {
    1: {
      bg: "from-yellow-400 to-amber-500",
      ring: "ring-yellow-300",
      fg: "text-yellow-900",
      chip: "bg-yellow-50 text-yellow-800 border-yellow-200",
      icon: Crown,
      label: "Champion",
    },
    2: {
      bg: "from-slate-300 to-slate-400",
      ring: "ring-slate-200",
      fg: "text-slate-800",
      chip: "bg-slate-50 text-slate-700 border-slate-200",
      icon: Medal,
      label: "Runner-up",
    },
    3: {
      bg: "from-amber-500 to-amber-700",
      ring: "ring-amber-200",
      fg: "text-amber-900",
      chip: "bg-amber-50 text-amber-800 border-amber-200",
      icon: Award,
      label: "Third",
    },
  };
  const t = themes[rank];
  const Icon = t.icon;
  const bStyle = badgeStyle(user.badge?.name);

  return (
    <div
      className={`relative rounded-2xl bg-white border border-slate-100 p-4 shadow-sm overflow-hidden ${
        isMe ? "ring-2 ring-primary-300" : ""
      }`}
    >
      {/* Top color strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.bg}`}
      />

      {/* Rank + icon */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.bg} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 border ${t.chip}`}
        >
          #{rank} {t.label}
        </span>
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.bg} flex items-center justify-center font-bold text-white text-lg shrink-0`}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user.name.split(" ")[0]}
            </p>
            {isMe && (
              <span className="text-[9px] font-bold uppercase bg-primary-100 text-primary-700 rounded px-1.5 py-0.5 shrink-0">
                You
              </span>
            )}
          </div>
          {user.ward && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              Ward {user.ward}
            </p>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-primary-600" />
          <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">
            {user.points}
          </p>
        </div>
        <span
          className={`text-[9px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border ${bStyle.chip}`}
        >
          {user.badge?.name || "Bronze"}
        </span>
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