import { Search, SlidersHorizontal, X } from "lucide-react";
import { STATUS_OPTIONS, TYPE_OPTIONS } from "../utils/reportHelpers";

export default function FilterBar({ filters, onChange, onReset }) {
  const hasFilters =
    filters.status || filters.type || filters.search || filters.ward;

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search reports by title, description, address..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm outline-none transition
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </div>

        {/* Status chips */}
        <button
          onClick={() => onChange({ ...filters, status: "" })}
          className={`text-xs font-medium rounded-full px-3 py-1 transition ${
            !filters.status
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange({ ...filters, status: s.value })}
            className={`text-xs font-medium rounded-full px-3 py-1 transition ${
              filters.status === s.value
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {s.label}
          </button>
        ))}

        {/* Type dropdown */}
        <select
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
          className="text-xs font-medium rounded-full px-3 py-1 bg-slate-100 text-slate-700 border-none outline-none
                     hover:bg-slate-200 transition cursor-pointer"
        >
          <option value="">All types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Ward input */}
        <input
          type="number"
          placeholder="Ward #"
          value={filters.ward}
          onChange={(e) => onChange({ ...filters, ward: e.target.value })}
          className="text-xs font-medium rounded-full px-3 py-1 bg-slate-100 text-slate-700 border-none outline-none
                     hover:bg-slate-200 transition w-20"
          min="1"
          max="32"
        />

        {hasFilters && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}