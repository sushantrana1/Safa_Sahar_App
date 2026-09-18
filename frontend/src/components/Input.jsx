export default function Input({ label, icon: Icon, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        <input
          {...props}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition
            ${Icon ? "pl-9" : "pl-3"}
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            }
          `}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}