import { useEffect, useState, useRef, useMemo } from "react";
import {
  Loader2,
  Plus,
  Gift,
  Trash2,
  Edit3,
  X,
  Save,
  Upload,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Package,
  Coins,
  AlertCircle,
  CheckCircle2,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

const CATEGORIES = ["voucher", "merchandise", "service", "other"];

const CATEGORY_LABELS = {
  voucher: "Voucher",
  merchandise: "Merch",
  service: "Service",
  other: "Other",
};

const EMPTY = {
  title: "",
  description: "",
  pointsCost: 100,
  category: "voucher",
  stock: 50,
  active: true,
  imageUrl: "",
};

export default function AdminRewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | id
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [view, setView] = useState("list");

  const fetchRewards = async () => {
    try {
      const { data } = await api.get("/rewards?activeOnly=false");
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

  const openCreate = () => {
    setForm(EMPTY);
    setEditing("new");
  };

  const openEdit = (reward) => {
    setForm({
      title: reward.title,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category,
      stock: reward.stock,
      active: reward.active,
      imageUrl: reward.imageUrl || "",
    });
    setEditing(reward._id);
  };

  const closeModal = () => {
    setEditing(null);
    setForm(EMPTY);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await api.post("/rewards/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, imageUrl: data.imageUrl }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.description.trim())
      return toast.error("Description is required");
    if (!form.pointsCost || form.pointsCost < 1)
      return toast.error("Points cost must be at least 1");

    setSaving(true);
    try {
      const payload = { ...form, imageUrl: form.imageUrl || null };
      if (editing === "new") {
        await api.post("/rewards", payload);
        toast.success("Reward created");
      } else {
        await api.patch(`/rewards/${editing}`, payload);
        toast.success("Reward updated");
      }
      closeModal();
      fetchRewards();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this reward? This cannot be undone.")) return;
    try {
      await api.delete(`/rewards/${id}`);
      toast.success("Reward deleted");
      fetchRewards();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ============ Derived stats ============
  const stats = useMemo(() => {
    const total = rewards.length;
    const active = rewards.filter((r) => r.active).length;
    const inactive = total - active;
    const stock = rewards.reduce((s, r) => s + (r.stock || 0), 0);
    return { total, active, inactive, stock };
  }, [rewards]);

  // ============ Filtered + sorted ============
  const filtered = useMemo(() => {
    let list = rewards;
    if (categoryFilter)
      list = list.filter((r) => r.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "name") {
      list = [...list].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    } else if (sortBy === "points") {
      list = [...list].sort(
        (a, b) => (b.pointsCost || 0) - (a.pointsCost || 0)
      );
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return list;
  }, [rewards, categoryFilter, search, sortBy]);

  const activeFilterCount =
    (categoryFilter ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <AdminLayout
      title="Manage Rewards"
      subtitle={`${rewards.length} reward${rewards.length !== 1 ? "s" : ""} in your catalogue`}
    >
      {/* ============ Summary strip ============ */}
      {!loading && rewards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
          <SummaryCard
            icon={Gift}
            label="Total"
            value={stats.total}
            color="slate"
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Active"
            value={stats.active}
            color="primary"
          />
          <SummaryCard
            icon={AlertCircle}
            label="Inactive"
            value={stats.inactive}
            color="yellow"
          />
          <SummaryCard
            icon={Package}
            label="Total Stock"
            value={stats.stock}
            color="blue"
          />
        </div>
      )}

      {/* ============ Header Actions ============ */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <p className="text-sm text-slate-500">
          {loading
            ? "Loading..."
            : `Showing ${filtered.length} of ${stats.total}`}
        </p>
        <button
          onClick={openCreate}
          className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold rounded-lg px-3.5 py-2 flex items-center gap-1.5 transition shadow-sm shadow-primary-500/20
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          New reward
        </button>
      </div>

      {/* ============ Filters ============ */}
      {!loading && rewards.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 mb-4 space-y-3">
          {/* Row 1: Search + Sort + View */}
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
              <div className="relative">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-medium bg-white border border-slate-200 rounded-lg pl-8 pr-8 py-2 outline-none cursor-pointer
                             hover:bg-slate-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition appearance-none"
                >
                  <option value="newest">Newest</option>
                  <option value="name">Name (A–Z)</option>
                  <option value="points">Most points</option>
                </select>
              </div>

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

          {/* Row 2: Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-0.5">
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <FilterChip
              active={!categoryFilter}
              onClick={() => setCategoryFilter("")}
              count={stats.total}
            >
              All
            </FilterChip>
            {CATEGORIES.map((cat) => {
              const count = rewards.filter((r) => r.category === cat).length;
              if (count === 0 && categoryFilter !== cat) return null;
              return (
                <FilterChip
                  key={cat}
                  active={categoryFilter === cat}
                  onClick={() =>
                    setCategoryFilter(categoryFilter === cat ? "" : cat)
                  }
                  count={count}
                >
                  {CATEGORY_LABELS[cat]}
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
                  setCategoryFilter("");
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
        <SkeletonList view={view} />
      ) : rewards.length === 0 ? (
        <EmptyRewards onCreate={openCreate} />
      ) : filtered.length === 0 ? (
        <NoMatches
          onReset={() => {
            setCategoryFilter("");
            setSearch("");
          }}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((r) => (
            <RewardGridCard
              key={r._id}
              reward={r}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <RewardListCard
              key={r._id}
              reward={r}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ============ Modal ============ */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-primary-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editing === "new" ? "New reward" : "Edit reward"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <Field label="Title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Rs. 50 Mobile Recharge"
                  maxLength={100}
                  className="input"
                />
                <p className="text-[10px] text-slate-400 text-right mt-0.5 tabular-nums">
                  {form.title.length}/100
                </p>
              </Field>

              {/* Description */}
              <Field label="Description" required>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe what the citizen receives..."
                  maxLength={500}
                  className="input resize-none"
                />
                <p className="text-[10px] text-slate-400 text-right mt-0.5 tabular-nums">
                  {form.description.length}/500
                </p>
              </Field>

              {/* Image */}
              <Field label="Image (optional)">
                {form.imageUrl ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: "" })}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50 transition flex flex-col items-center justify-center gap-2 text-slate-500 disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-medium">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6" />
                        <span className="text-xs font-medium">
                          Upload image
                        </span>
                        <span className="text-[10px] text-slate-400">
                          JPG, PNG, WEBP · max 5MB
                        </span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </Field>

              {/* Points + Stock */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Points cost" required>
                  <input
                    type="number"
                    min="1"
                    value={form.pointsCost}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pointsCost: Number(e.target.value),
                      })
                    }
                    className="input"
                  />
                </Field>
                <Field label="Stock">
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: Number(e.target.value) })
                    }
                    className="input"
                  />
                </Field>
              </div>

              {/* Category */}
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Active toggle */}
              <label className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Active reward
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Visible to citizens in the rewards store
                  </p>
                </div>
              </label>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl py-2.5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-medium rounded-xl py-2.5 transition
                             disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editing === "new" ? "Create" : "Save"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

/* ============ Summary card ============ */
function SummaryCard({ icon: Icon, label, value, color = "slate" }) {
  const COLORS = {
    slate: { bg: "bg-slate-100", fg: "text-slate-700" },
    primary: { bg: "bg-primary-50", fg: "text-primary-700" },
    yellow: { bg: "bg-yellow-50", fg: "text-yellow-700" },
    blue: { bg: "bg-blue-50", fg: "text-blue-700" },
  };
  const c = COLORS[color] || COLORS.slate;
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

/* ============ List card ============ */
function RewardListCard({ reward: r, onEdit, onDelete }) {
  const lowStock = r.stock > 0 && r.stock <= 5;
  const outOfStock = r.stock === 0;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border p-3 flex items-center gap-3 transition ${
        r.active
          ? "border-slate-100 hover:shadow-md hover:border-slate-200"
          : "border-slate-200 bg-slate-50/50"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center shrink-0 overflow-hidden">
        {r.imageUrl ? (
          <img
            src={r.imageUrl}
            alt={r.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <Gift className="w-6 h-6 text-primary-600" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm text-slate-900 truncate">
            {r.title}
          </p>
          {!r.active && (
            <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">
              Inactive
            </span>
          )}
          {outOfStock && (
            <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 rounded-full px-2 py-0.5">
              Out
            </span>
          )}
          {lowStock && (
            <span className="text-[10px] font-bold uppercase bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">
              {r.stock} left
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-primary-700 font-bold">
            <Coins className="w-3 h-3" />
            {r.pointsCost} pts
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            Stock {r.stock}
          </span>
          <span>·</span>
          <span className="capitalize">{CATEGORY_LABELS[r.category]}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(r)}
          className="p-2 rounded-lg hover:bg-slate-100 transition
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
          aria-label="Edit"
          title="Edit"
        >
          <Edit3 className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={() => onDelete(r._id)}
          className="p-2 rounded-lg hover:bg-red-50 transition
                     focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  );
}

/* ============ Grid card ============ */
function RewardGridCard({ reward: r, onEdit, onDelete }) {
  const lowStock = r.stock > 0 && r.stock <= 5;
  const outOfStock = r.stock === 0;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition flex flex-col ${
        r.active
          ? "border-slate-100 hover:shadow-md hover:border-slate-200"
          : "border-slate-200 opacity-90"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center overflow-hidden">
        {r.imageUrl ? (
          <img
            src={r.imageUrl}
            alt={r.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Gift className="w-10 h-10 text-primary-600" />
        )}

        {/* Top-left: category chip */}
        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-white/95 backdrop-blur-sm text-primary-700 rounded-full px-2 py-0.5 shadow-sm">
          {CATEGORY_LABELS[r.category]}
        </span>

        {/* Top-right: status badge */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {!r.active && (
            <span className="text-[10px] font-bold uppercase bg-slate-800/90 text-white rounded-full px-2 py-0.5 shadow-sm">
              Inactive
            </span>
          )}
          {outOfStock && (
            <span className="text-[10px] font-bold uppercase bg-red-500 text-white rounded-full px-2 py-0.5 shadow-sm">
              Out
            </span>
          )}
          {lowStock && (
            <span className="text-[10px] font-bold uppercase bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 shadow-sm">
              {r.stock} left
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
          {r.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-2">
          {r.description}
        </p>

        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1 text-primary-700 font-bold text-sm">
            <Coins className="w-3.5 h-3.5" />
            {r.pointsCost}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(r)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition"
              aria-label="Edit"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <button
              onClick={() => onDelete(r._id)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition"
              aria-label="Delete"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Empty / no matches ============ */
function EmptyRewards({ onCreate }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 mb-4">
        <Gift className="w-8 h-8 text-primary-500" />
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-1">
        No rewards yet
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
        Create your first reward and let citizens redeem their points.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition shadow-md shadow-primary-500/20
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <Plus className="w-4 h-4" />
        Create reward
      </button>
    </div>
  );
}

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

/* ============ Loading skeleton ============ */
function SkeletonList({ view = "list" }) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-slate-200" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex items-center gap-3 animate-pulse"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
          <div className="h-6 w-20 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ============ Field wrapper ============ */
function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}