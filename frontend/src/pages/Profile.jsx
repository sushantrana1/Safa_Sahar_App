import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Coins,
  MapPin,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  Award,
  TrendingUp,
  Plus,
  Minus,
  Shield,
  Inbox,
  Gift,
  Trophy,
  Calendar,
  Sparkles,
  Leaf,
  LayoutDashboard,
  Settings,
  UserCog,
} from "lucide-react";
import api from "../api/axios";
import { badgeStyle, tierProgress } from "../utils/badgeHelpers";
import { timeAgo } from "../utils/reportHelpers";
import { useAuth } from "../context/AuthContext";

const TXN_META = {
  earned_report: { label: "Report submitted", color: "text-primary-600" },
  earned_bonus: { label: "Bonus awarded", color: "text-primary-600" },
  redeemed: { label: "Reward redeemed", color: "text-red-600" },
  adjusted: { label: "Balance adjusted", color: "text-slate-600" },
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txnLoading, setTxnLoading] = useState(true);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    const load = async () => {
      try {
        const requests = [api.get("/users/me")];
        // Only fetch transactions for citizens
        if (!isAdmin) requests.push(api.get("/users/me/transactions"));

        const [p, t] = await Promise.all(requests);
        setProfile(p.data.user);

        if (t) {
          setTransactions(t.data.transactions);
        } else {
          setTxnLoading(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTxnLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
          <div className="h-8 bg-slate-200 rounded w-32 animate-pulse" />
          <div className="h-56 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const badge = profile.badge?.current;
  const next = profile.badge?.next;
  const progress = tierProgress(profile.points, badge, next);
  const bStyle = badgeStyle(badge?.name);

  return (
    <div className="min-h-screen bg-slate-50 lg:pb-0 pb-20">
      {/* ============ Header ============ */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
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
              My Profile
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 truncate">
              {isAdmin
                ? "Manage your admin account"
                : "Manage your account & track your impact"}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <NavIcon to="/leaderboard" icon={Trophy} label="Leaderboard" />
            {!isAdmin && (
              <>
                <NavIcon to="/rewards" icon={Gift} label="Rewards" />
                <NavIcon to="/my-reports" icon={Inbox} label="My Reports" />
              </>
            )}
            {isAdmin && (
              <NavIcon
                to="/admin"
                icon={LayoutDashboard}
                label="Admin Dashboard"
              />
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {/* ============ Hero Identity Card ============ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 text-white shadow-lg shadow-primary-500/20">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative p-5 sm:p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shrink-0 shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold truncate">
                    {profile.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {/* Only show badge for citizens */}
                  {!isAdmin && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${bStyle.chip} backdrop-blur-sm`}
                    >
                      {badge?.name}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-wide bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2 py-0.5 capitalize flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    {profile.role}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-primary-100 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate max-w-[140px] sm:max-w-none">
                      {profile.email}
                    </span>
                  </span>
                  {profile.ward && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Ward {profile.ward}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Hero stats — DIFFERENT PER ROLE */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {!isAdmin && (
                <>
                  <HeroStat
                    icon={Coins}
                    label="Points"
                    value={profile.points}
                    highlight
                  />
                  <HeroStat
                    icon={FileText}
                    label="Reports"
                    value={profile.reportCount}
                  />
                  <HeroStat
                    icon={CheckCircle2}
                    label="Resolved"
                    value={profile.resolvedCount}
                  />
                </>
              )}
              {isAdmin && (
                <>
                  <HeroStat
                    icon={UserCog}
                    label="Role"
                    value={profile.role === "superadmin" ? "Super" : "Admin"}
                    highlight
                  />
                  <HeroStat
                    icon={Shield}
                    label="Access"
                    value="Full"
                  />
                  <HeroStat
                    icon={Trophy}
                    label="Since"
                    value={new Date(profile.createdAt).getFullYear()}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* ============ Quick actions — role based ============ */}
        {!isAdmin && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <QuickAction
              to="/my-reports"
              icon={Inbox}
              label="My Reports"
              color="slate"
            />
            <QuickAction
              to="/rewards"
              icon={Gift}
              label="Rewards"
              color="primary"
            />
            <QuickAction
              to="/leaderboard"
              icon={Trophy}
              label="Leaderboard"
              color="yellow"
            />
          </div>
        )}

        {isAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <QuickAction
              to="/admin"
              icon={LayoutDashboard}
              label="Dashboard"
              color="primary"
            />
            <QuickAction
              to="/admin/reports"
              icon={FileText}
              label="Manage Reports"
              color="slate"
            />
            <QuickAction
              to="/admin/rewards"
              icon={Settings}
              label="Manage Rewards"
              color="yellow"
            />
            <QuickAction
              to="/admin/citizens"
              icon={Shield}
              label="Citizens"
              color="primary"
            />
          </div>
        )}

        {/* ============ Tier Progress — citizens only ============ */}
        {!isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Tier Progress
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Earn points to unlock higher tiers
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 ${bStyle.chip}`}
              >
                {badge?.name}
              </span>
            </div>

            {next ? (
              <>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-700">
                    {badge.name}
                  </span>
                  <span className="text-slate-500">
                    <span className="font-bold text-primary-600">
                      {progress.remaining}
                    </span>{" "}
                    to {next.name}
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full ${bStyle.bg} transition-all duration-700 ease-out rounded-full`}
                    style={{ width: `${progress.pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>{progress.pct}%</span>
                  <span>{next.min} pts</span>
                </div>

                <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Award className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-600">
                    Reach{" "}
                    <span className="font-semibold text-slate-900">
                      {next.name}
                    </span>{" "}
                    at {next.min} points for bonus perks
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary-50 to-emerald-50 border border-primary-100">
                <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Highest tier reached
                  </p>
                  <p className="text-xs text-slate-500">
                    You've unlocked all tiers
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ Account details ============ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Account details
            </h3>
          </div>

          <div className="space-y-2">
            <DetailRow icon={Mail} label="Email" value={profile.email} />
            {profile.phone && (
              <DetailRow icon={Phone} label="Phone" value={profile.phone} />
            )}
            {profile.ward && (
              <DetailRow
                icon={MapPin}
                label="Ward"
                value={`Ward ${profile.ward}`}
              />
            )}
            <DetailRow
              icon={Shield}
              label="Role"
              value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            />
            <DetailRow
              icon={Calendar}
              label="Member since"
              value={new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </div>
        </div>

        {/* ============ Points History — CITIZENS ONLY ============ */}
        {!isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Points History
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    All your point activity
                  </p>
                </div>
              </div>
              {!txnLoading && transactions.length > 0 && (
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                  {transactions.length}
                </span>
              )}
            </div>

            {txnLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 animate-pulse"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-12" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-3">
                  <Sparkles className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  No activity yet
                </p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Submit a report to start earning points
                </p>
                <Link
                  to="/reports/new"
                  className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg px-3 py-2 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create report
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {transactions.map((t, i) => {
                  const meta = TXN_META[t.type] || TXN_META.adjusted;
                  const positive = t.amount > 0;
                  return (
                    <div
                      key={t._id}
                      className={`flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-slate-50 transition
                        ${i !== transactions.length - 1 ? "border-b border-slate-100" : ""}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          positive
                            ? "bg-primary-50 border border-primary-100"
                            : "bg-red-50 border border-red-100"
                        }`}
                      >
                        {positive ? (
                          <Plus className="w-4 h-4 text-primary-600" />
                        ) : (
                          <Minus className="w-4 h-4 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {t.description}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className={meta.color}>{meta.label}</span>
                          <span>·</span>
                          <span>{timeAgo(t.createdAt)}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-sm font-bold ${
                            positive ? "text-primary-600" : "text-red-600"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {t.amount}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          bal {t.balanceAfter}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
      className="relative p-2 rounded-lg text-slate-600 hover:text-primary-700 hover:bg-primary-50 active:bg-primary-100 transition
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
    >
      <Icon className="w-5 h-5" />
    </Link>
  );
}

/* ============ Hero stat tile ============ */
function HeroStat({ icon: Icon, label, value, highlight }) {
  return (
    <div
      className={`rounded-xl p-2.5 sm:p-3 text-center backdrop-blur-sm border ${
        highlight
          ? "bg-white/15 border-white/25"
          : "bg-white/10 border-white/15"
      }`}
    >
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 text-primary-100" />
      <p className="text-lg sm:text-xl font-bold text-white leading-none">
        {value}
      </p>
      <p className="text-[10px] text-primary-100 uppercase tracking-wide font-medium mt-1">
        {label}
      </p>
    </div>
  );
}

/* ============ Quick action button ============ */
function QuickAction({ to, icon: Icon, label, color = "slate" }) {
  const COLORS = {
    primary: "bg-primary-50 text-primary-700 hover:bg-primary-100",
    slate: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    yellow: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
  };
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 sm:p-4 transition-all duration-200 ${COLORS[color]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[11px] sm:text-xs font-semibold text-center">
        {label}
      </span>
    </Link>
  );
}

/* ============ Detail row ============ */
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
          {label}
        </p>
        <p className="text-sm text-slate-800 truncate font-medium">{value}</p>
      </div>
    </div>
  );
}