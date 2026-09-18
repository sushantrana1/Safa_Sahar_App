import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
  Coins,
  Gift,
  Loader2,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import { TYPE_LABELS } from "../../utils/reportHelpers";

const TYPE_COLORS = {
  illegal_dumping: "#ef4444",
  missed_pickup: "#f59e0b",
  overflowing_bin: "#3b82f6",
  other: "#64748b",
};

const KPI_PRIMARY = [
  {
    key: "totalReports",
    label: "Total Reports",
    icon: FileText,
    color: "primary",
  },
  {
    key: "pendingReports",
    label: "Pending",
    icon: Clock,
    color: "yellow",
  },
  {
    key: "inProgressReports",
    label: "In Progress",
    icon: AlertCircle,
    color: "blue",
  },
  {
    key: "resolvedReports",
    label: "Resolved",
    icon: CheckCircle2,
    color: "primary",
  },
];

const KPI_SECONDARY = [
  {
    key: "rejectedReports",
    label: "Rejected",
    icon: XCircle,
    color: "red",
  },
  {
    key: "resolvedToday",
    label: "Resolved Today",
    icon: CheckCircle2,
    color: "primary",
  },
  {
    key: "totalCitizens",
    label: "Citizens",
    icon: Users,
    color: "slate",
  },
  {
    key: "totalRewards",
    label: "Rewards Active",
    icon: Coins,
    color: "yellow",
  },
  {
    key: "pendingRedemptions",
    label: "Pending Redeems",
    icon: Gift,
    color: "red",
  },
  {
    key: "deliveredRedemptions",
    label: "Delivered",
    icon: CheckCircle2,
    color: "primary",
  },
];

const COLOR_MAP = {
  primary: {
    bg: "bg-primary-50",
    fg: "text-primary-700",
    border: "border-primary-100",
    chip: "bg-primary-500",
  },
  yellow: {
    bg: "bg-yellow-50",
    fg: "text-yellow-700",
    border: "border-yellow-100",
    chip: "bg-yellow-500",
  },
  blue: {
    bg: "bg-blue-50",
    fg: "text-blue-700",
    border: "border-blue-100",
    chip: "bg-blue-500",
  },
  red: {
    bg: "bg-red-50",
    fg: "text-red-700",
    border: "border-red-100",
    chip: "bg-red-500",
  },
  slate: {
    bg: "bg-slate-100",
    fg: "text-slate-700",
    border: "border-slate-200",
    chip: "bg-slate-500",
  },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout
        title="Dashboard"
        subtitle="Overview of Safa Sahar activity"
      >
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout title="Dashboard" subtitle="Overview">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            {error || "No data available"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  const { kpis, reportsByWard, reportsByType, reportsTrend } = stats;

  const pieData = reportsByType.map((t) => ({
    name: TYPE_LABELS[t.type] || t.type,
    value: t.count,
    color: TYPE_COLORS[t.type] || "#64748b",
  }));

  const totalReportsInPie = pieData.reduce((s, d) => s + d.value, 0);

  // Report resolution rate
  const resolutionRate =
    kpis.totalReports > 0
      ? Math.round((kpis.resolvedReports / kpis.totalReports) * 100)
      : 0;

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of Safa Sahar activity across wards"
    >
      {/* ============ Hero Summary ============ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 text-white shadow-lg shadow-primary-500/20 mb-4">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <p className="text-[11px] uppercase tracking-widest text-primary-100 font-semibold">
                  Live Overview
                </p>
              </div>
              <p className="text-3xl sm:text-4xl font-bold leading-none tabular-nums">
                {kpis.totalReports}
              </p>
              <p className="text-sm text-primary-100 mt-1">
                total reports across all wards
              </p>
            </div>

            {/* Resolution rate ring (small) */}
            <div className="shrink-0 text-right">
              <p className="text-[10px] uppercase tracking-wide text-primary-100 font-semibold mb-1">
                Resolution Rate
              </p>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-14 h-14 rounded-full flex items-center justify-center border-4 border-white/20 relative">
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeDasharray={`${resolutionRate} 100`}
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  </svg>
                  <span className="text-sm font-bold relative z-10">
                    {resolutionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress sub-bar */}
          <div className="flex items-center gap-3 text-xs text-primary-100">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-primary-200" />
              {kpis.resolvedReports} resolved
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-yellow-300" />
              {kpis.pendingReports} pending
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-blue-300" />
              {kpis.inProgressReports} active
            </span>
          </div>
        </div>
      </div>

      {/* ============ Primary KPIs (4 cards) ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {KPI_PRIMARY.map((kpi) => (
          <KpiCard
            key={kpi.key}
            icon={kpi.icon}
            label={kpi.label}
            value={kpis[kpi.key]}
            color={kpi.color}
          />
        ))}
      </div>

      {/* ============ Secondary KPIs (6 chips) ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Additional metrics
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {KPI_SECONDARY.map((kpi) => (
            <MiniStat
              key={kpi.key}
              icon={kpi.icon}
              label={kpi.label}
              value={kpis[kpi.key]}
              color={kpi.color}
            />
          ))}
        </div>
      </div>

      {/* ============ Charts Row ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* 7-day trend */}
        <ChartCard
          icon={TrendingUp}
          title="Reports Trend"
          subtitle="Last 7 days activity"
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={reportsTrend}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={28}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#trendFill)"
                dot={{ fill: "#10b981", r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Reports by type — donut with center total */}
        <ChartCard
          icon={PieIcon}
          title="Reports by Type"
          subtitle="Distribution across categories"
        >
          {pieData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center total */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
                    {totalReportsInPie}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mt-1">
                    Total
                  </p>
                </div>
              </div>

              {/* Custom legend below */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {pieData.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-600 truncate">
                      {entry.name}
                    </span>
                    <span className="ml-auto font-semibold text-slate-900 tabular-nums">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ============ Reports by Ward ============ */}
      <ChartCard
        icon={BarChart3}
        title="Reports by Ward"
        subtitle={`Top ${reportsByWard.length} wards by volume`}
      >
        {reportsByWard.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={reportsByWard}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="ward"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v) => `W${v}`}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(16, 185, 129, 0.06)" }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </AdminLayout>
  );
}

/* ============ KPI Card (large) ============ */
function KpiCard({ icon: Icon, label, value, color = "primary" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.primary;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 hover:shadow-md hover:border-slate-200 transition">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${c.bg}`}
        >
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${c.fg}`} />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums leading-none">
        {value ?? 0}
      </p>
      <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium mt-1.5">
        {label}
      </p>
    </div>
  );
}

/* ============ Mini Stat (small chips) ============ */
function MiniStat({ icon: Icon, label, value, color = "slate" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.slate;
  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}
      >
        <Icon className={`w-3.5 h-3.5 ${c.fg}`} />
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold text-slate-900 tabular-nums leading-none">
          {value ?? 0}
        </p>
        <p className="text-[9px] text-slate-500 uppercase tracking-wide font-semibold mt-0.5 truncate">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ============ Chart Card wrapper ============ */
function ChartCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary-600" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-sm truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ============ Custom tooltip ============ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2">
      <p className="text-xs font-semibold text-slate-700 mb-0.5">
        {label ?? entry.name}
      </p>
      <p className="text-xs text-slate-500">
        <span className="font-bold text-slate-900 tabular-nums">
          {entry.value}
        </span>{" "}
        report{entry.value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

/* ============ Empty chart state ============ */
function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
        <BarChart3 className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-500">No data yet</p>
    </div>
  );
}

/* ============ Loading skeleton ============ */
function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 bg-slate-200 rounded-2xl animate-pulse"
          />
        ))}
      </div>
      <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
      <div className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
    </div>
  );
}