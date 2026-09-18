import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  LogOut,
  User as UserIcon,
  Coins,
  Inbox,
  Map as MapIcon,
  List,
  Loader2,
  Plus,
  Trophy,
  Gift,
  Settings,
  LayoutDashboard,
  MapPin,
  Sparkles,
  Compass,
  AlertCircle,
  Users,
  ClipboardList,
  Bell,
  ChevronRight,
  Clock,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ReportCard from "../components/ReportCard";
import ReportsMap from "../components/ReportsMap";
import FilterBar from "../components/FilterBar";
import { SkeletonList } from "../components/Skeleton";
import CitizenBottomNav from "../components/CitizenBottomNav";
import { timeAgo } from "../utils/reportHelpers";

const EMPTY_FILTERS = { status: "", type: "", search: "", ward: "" };

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("map");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const userInitial = user?.name?.charAt(0).toUpperCase() || "?";

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      if (filters.ward) params.ward = filters.ward;

      const { data } = await api.get("/reports", { params });
      setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchReports, 300);
    return () => clearTimeout(t);
  }, [fetchReports]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 lg:pb-0 pb-20">
      {/* ============ Top Nav ============ */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm shadow-primary-500/20">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg text-slate-900 hidden sm:inline">
              Safa Sahar
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Points pill — CITIZENS ONLY */}
            {!isAdmin && (
              <div className="flex items-center gap-1.5 bg-primary-50 text-primary-700 rounded-full pl-2.5 pr-3 py-1.5 text-xs sm:text-sm font-semibold border border-primary-100">
                <Coins className="w-3.5 h-3.5" />
                {user?.points ?? 0}
              </div>
            )}

            {/* Report CTA — CITIZENS ONLY */}
            {!isAdmin && (
              <Link
                to="/reports/new"
                className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-2 flex items-center gap-1.5 transition-all shadow-sm shadow-primary-500/20
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Report</span>
              </Link>
            )}

            {/* 🔔 Notification bell — ADMINS ONLY (left of Admin button) */}
            {isAdmin && <NotificationBell />}

            {/* Admin Dashboard shortcut */}
            {isAdmin && (
              <Link
                to="/admin"
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-2 flex items-center gap-1.5 transition-all shadow-sm shadow-primary-500/20
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="sm:inline">Admin</span>
              </Link>
            )}

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shrink-0
                           hover:shadow-md hover:shadow-primary-500/30 active:scale-95 transition
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="User menu"
              >
                {userInitial}
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-20">
                    <div className="px-4 py-3 bg-gradient-to-br from-primary-50 to-white border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm shadow-primary-500/30">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      {!isAdmin && (
                        <div className="flex items-center gap-3 mt-3 text-xs">
                          <span className="flex items-center gap-1 text-primary-700 font-medium">
                            <Coins className="w-3 h-3" />
                            {user?.points ?? 0} pts
                          </span>
                          {user?.ward && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <MapPin className="w-3 h-3" />
                              Ward {user.ward}
                            </span>
                          )}
                        </div>
                      )}

                      {isAdmin && (
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 flex items-center gap-1">
                            <LayoutDashboard className="w-3 h-3" />
                            {user?.role}
                          </span>
                          {user?.ward && (
                            <span className="flex items-center gap-1 text-xs text-slate-600">
                              <MapPin className="w-3 h-3" />
                              Ward {user.ward}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <MenuLink
                        to="/profile"
                        icon={UserIcon}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Profile
                      </MenuLink>
                      <MenuLink
                        to="/leaderboard"
                        icon={Trophy}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Leaderboard
                      </MenuLink>
                    </div>

                    {!isAdmin && (
                      <div className="py-1 border-t border-slate-100">
                        <MenuLink
                          to="/my-reports"
                          icon={Inbox}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Reports
                        </MenuLink>
                        <MenuLink
                          to="/rewards"
                          icon={Gift}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Rewards Store
                        </MenuLink>
                      </div>
                    )}

                    {isAdmin && (
                      <>
                        <div className="px-4 pt-2 pb-1 border-t border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Admin Controls
                          </p>
                        </div>
                        <div className="py-1">
                          <MenuLink
                            to="/admin"
                            icon={LayoutDashboard}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Dashboard
                          </MenuLink>
                          <MenuLink
                            to="/admin/reports"
                            icon={ClipboardList}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Manage Reports
                          </MenuLink>
                          <MenuLink
                            to="/admin/redemptions"
                            icon={Gift}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Manage Redemptions
                          </MenuLink>
                          <MenuLink
                            to="/admin/rewards"
                            icon={Settings}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Manage Rewards
                          </MenuLink>
                          <MenuLink
                            to="/admin/citizens"
                            icon={Users}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Citizens
                          </MenuLink>
                        </div>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============ Main ============ */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-4">
        {!isAdmin && (
          <div className="lg:hidden flex items-center justify-between bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-4 text-white shadow-md shadow-primary-500/20">
            <div>
              <p className="text-xs text-primary-100 font-medium">Namaste,</p>
              <p className="text-base font-bold truncate max-w-[180px]">
                {user?.name?.split(" ")[0]}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-primary-100">
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {user?.points ?? 0} pts
                </span>
                {user?.ward && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Ward {user.ward}
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        )}

        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600 flex items-center gap-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                <span className="text-slate-500">Loading reports...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary-600" />
                <span>
                  <span className="font-bold text-slate-900">
                    {reports.length}
                  </span>{" "}
                  <span className="text-slate-500">
                    report{reports.length !== 1 ? "s" : ""}
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="ml-2 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                      {activeFilterCount} filter
                      {activeFilterCount > 1 ? "s" : ""}
                    </span>
                  )}
                </span>
              </span>
            )}
          </p>

          <div className="bg-white rounded-xl border border-slate-200 p-1 flex shadow-sm">
            <button
              onClick={() => setView("map")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                view === "map"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                view === "list"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {loading && reports.length === 0 ? (
          <SkeletonList count={6} />
        ) : reports.length === 0 ? (
          <EmptyFeed
            hasFilters={activeFilterCount > 0}
            onReset={() => setFilters(EMPTY_FILTERS)}
            isAdmin={isAdmin}
          />
        ) : (
          <>
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
              <div className="sticky top-[72px] self-start">
                <ReportsMap
                  reports={reports}
                  height="h-[calc(100vh-260px)]"
                />
              </div>
              <div className="space-y-3 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-1">
                {reports.map((r) => (
                  <ReportCard key={r._id} report={r} />
                ))}
              </div>
            </div>

            <div className="lg:hidden">
              {view === "map" ? (
                <ReportsMap reports={reports} height="h-[45vh]" />
              ) : (
                <div className="space-y-3">
                  {reports.map((r) => (
                    <ReportCard key={r._id} report={r} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {!isAdmin && <CitizenBottomNav />}
    </div>
  );
}

/* ============================================================
   🔔 NotificationBell — only for admins
   ============================================================ */
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = useCallback(async () => {
    try {
      const { data } = await api.get("/reports", {
        params: { status: "pending", limit: 5 },
      });
      setPending(data.reports || []);
    } catch (err) {
      console.error("Notification fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [fetchPending]);

  const count = pending.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-primary-700 hover:bg-primary-50 active:bg-primary-100 transition
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={`Notifications${count ? ` (${count} pending)` : ""}`}
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <>
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
              {count > 9 ? "9+" : count}
            </span>
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] rounded-full bg-red-500 opacity-60 animate-ping pointer-events-none" />
          </>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-20">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-primary-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-primary-700" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    Notifications
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {count === 0
                      ? "All caught up"
                      : `${count} pending report${count > 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              {count > 0 && (
                <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 rounded-full px-2 py-0.5">
                  New
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : count === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 mb-2">
                    <Bell className="w-6 h-6 text-primary-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    All caught up
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No pending reports
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {pending.map((r) => (
                    <li key={r._id}>
                      <Link
                        to="/admin/reports"
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 overflow-hidden">
                          {r.imageUrl ? (
                            <img
                              src={
                                r.imageUrl.startsWith("http")
                                  ? r.imageUrl
                                  : `http://localhost:5000${r.imageUrl}`
                              }
                              alt={r.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <Inbox className="w-5 h-5 text-primary-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                            {r.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {timeAgo(r.createdAt)}
                            </span>
                            {r.user?.name && (
                              <>
                                <span>·</span>
                                <span className="truncate">{r.user.name}</span>
                              </>
                            )}
                          </p>
                        </div>

                        <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0 mt-2" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              to="/admin/reports"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition border-t border-slate-100
                         focus:outline-none"
            >
              <span className="text-xs font-semibold text-primary-700">
                View all reports
              </span>
              <ChevronRight className="w-4 h-4 text-primary-600" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

/* ============ Menu link ============ */
function MenuLink({ to, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-700 transition"
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
}

/* ============ Empty state ============ */
function EmptyFeed({ hasFilters, onReset, isAdmin }) {
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
          ? "Try adjusting or clearing your filters to see more results."
          : "Be the first to report a waste issue in your ward and start earning points."}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {hasFilters ? (
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg px-4 py-2 transition"
          >
            Clear filters
          </button>
        ) : !isAdmin ? (
          <Link
            to="/reports/new"
            className="inline-flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition shadow-md shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" />
            Report first issue
          </Link>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Tip: Create a citizen account to report waste.
          </p>
        )}
      </div>
    </div>
  );
}