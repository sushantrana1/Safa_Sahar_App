export default function StatCard({ icon: Icon, label, value, color = "primary" }) {
  const COLORS = {
    primary: "bg-primary-50 text-primary-700",
    yellow: "bg-yellow-50 text-yellow-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${COLORS[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value ?? 0}</p>
      <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide font-medium">
        {label}
      </p>
    </div>
  );
}