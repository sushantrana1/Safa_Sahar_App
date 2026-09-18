import { useState, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  MapPin,
  FileText,
  Tag,
  Leaf,
  Trophy,
  Gift,
  Coins,
  Sparkles,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Navigation,
  Crosshair,
  AlertCircle,
  Info,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";

const REPORT_TYPES = [
  {
    value: "illegal_dumping",
    label: "Illegal Dumping",
    desc: "Garbage dumped in public space",
    emoji: "🗑️",
    color: "red",
  },
  {
    value: "missed_pickup",
    label: "Missed Pickup",
    desc: "Waste collection not done",
    emoji: "🚛",
    color: "orange",
  },
  {
    value: "overflowing_bin",
    label: "Overflowing Bin",
    desc: "Public bin is full or broken",
    emoji: "📦",
    color: "yellow",
  },
  {
    value: "other",
    label: "Other",
    desc: "Something else needs attention",
    emoji: "📋",
    color: "slate",
  },
];

const MAX_TITLE = 100;
const MAX_DESC = 1000;

export default function CreateReport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "illegal_dumping",
    lat: null,
    lng: null,
    address: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [dragging, setDragging] = useState(false);

  const validation = useMemo(
    () => ({
      image: !!image,
      title: form.title.trim().length >= 3,
      description: form.description.trim().length >= 10,
      location: !!(form.lat && form.lng),
    }),
    [image, form]
  );

  const completedSteps = Object.values(validation).filter(Boolean).length;
  const progressPct = (completedSteps / 4) * 100;
  const canSubmit = completedSteps === 4 && !loading;

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImage = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setLocating(false);
        toast.success("Location detected");
      },
      () => {
        setLocating(false);
        toast.error("Could not detect location. Please pick on map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePickOnMap = (lat, lng) => {
    setForm((f) => ({ ...f, lat, lng }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validation.image) return toast.error("Please upload a photo");
    if (!validation.title)
      return toast.error("Title must be at least 3 characters");
    if (!validation.description)
      return toast.error("Description must be at least 10 characters");
    if (!validation.location) return toast.error("Please pin a location");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("type", form.type);
      fd.append("lat", form.lat);
      fd.append("lng", form.lng);
      fd.append("address", form.address.trim());
      fd.append("image", image);

      await api.post("/reports", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Report submitted! +10 points earned");
      navigate("/my-reports");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============ Navbar ============ */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition shrink-0
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            aria-label="Back"
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
              Report Waste
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 truncate">
              Earn +10 points per verified report
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <NavIcon to="/leaderboard" icon={Trophy} label="Leaderboard" />
            <NavIcon to="/rewards" icon={Gift} label="Rewards" />
          </div>
        </div>
      </header>

      {/* ============ Content wrapper ============ */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-primary-600 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {completedSteps}/4 steps complete
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary-600 shrink-0">
              <Coins className="w-3.5 h-3.5" />
              +10 pts
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <StepChip
              active={validation.image}
              icon={ImageIcon}
              label="Photo"
            />
            <StepChip
              active={validation.title && validation.description}
              icon={FileText}
              label="Details"
            />
            <StepChip
              active={validation.location}
              icon={MapPin}
              label="Location"
            />
            <StepChip
              active={canSubmit}
              icon={CheckCircle2}
              label="Ready"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Photo Upload */}
          <Section
            number={1}
            title="Photo evidence"
            desc="Show the waste from a distance"
            done={validation.image}
            icon={Camera}
          >
            {!preview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                /* ⬇️ CHANGED: responsive height — smaller on laptop */
                className={`w-full rounded-xl border-2 border-dashed transition cursor-pointer flex flex-col items-center justify-center gap-2 p-4 text-center
                  h-48 sm:h-56 md:h-64 max-w-md mx-auto
                  ${
                    dragging
                      ? "border-primary-500 bg-primary-50"
                      : "border-slate-300 hover:border-primary-400 hover:bg-primary-50/40"
                  }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mb-1">
                  <Camera className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Tap to upload or drag & drop
                </p>
                <p className="text-xs text-slate-500">
                  JPG, PNG, WEBP · max 5MB
                </p>

                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 border border-primary-100 rounded-full px-2.5 py-1">
                    <Upload className="w-3 h-3" />
                    Upload
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2.5 py-1">
                    <Camera className="w-3 h-3" />
                    Camera
                  </span>
                </div>
              </div>
            ) : (
              /* ⬇️ CHANGED: responsive height — smaller on laptop */
              <div className="relative rounded-xl overflow-hidden bg-slate-100 h-48 sm:h-56 md:h-64 max-w-md mx-auto">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-primary-500 text-white rounded-full px-2 py-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Ready
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white rounded-lg px-3 py-1.5 transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3 h-3" />
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-xs font-semibold bg-red-500/80 hover:bg-red-600 backdrop-blur-sm text-white rounded-lg px-2.5 py-1.5 transition flex items-center gap-1.5"
                      aria-label="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
              className="hidden"
            />
          </Section>

          {/* 2. Details */}
          <Section
            number={2}
            title="Details"
            desc="Describe what you see"
            done={validation.title && validation.description}
            icon={FileText}
          >
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary-600" />
                    Title
                  </span>
                  <span
                    className={`text-[11px] tabular-nums ${
                      form.title.length > MAX_TITLE
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {form.title.length}/{MAX_TITLE}
                  </span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={MAX_TITLE}
                  placeholder="e.g. Garbage pile near bus stop"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition
                             focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                  <span>Description</span>
                  <span
                    className={`text-[11px] tabular-nums ${
                      form.description.length > MAX_DESC
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {form.description.length}/{MAX_DESC}
                  </span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={MAX_DESC}
                  rows={4}
                  placeholder="Describe the size, type, and how long it's been there..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition
                             focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                  <Tag className="w-3.5 h-3.5 text-primary-600" />
                  What kind of issue?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_TYPES.map((t) => {
                    const active = form.type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, type: t.value }))
                        }
                        className={`relative text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-200
                          ${
                            active
                              ? "border-primary-500 bg-primary-50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        {active && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <div className="text-xl sm:text-2xl mb-1 leading-none">
                          {t.emoji}
                        </div>
                        <p
                          className={`text-xs font-bold leading-tight ${
                            active ? "text-primary-700" : "text-slate-800"
                          }`}
                        >
                          {t.label}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight hidden sm:block">
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>

          {/* 3. Location */}
          <Section
            number={3}
            title="Location"
            desc="Pin the exact spot on the map"
            done={validation.location}
            icon={MapPin}
          >
            <div className="space-y-3">
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50/50 hover:bg-primary-50 hover:border-primary-400 transition
                           disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                    {locating ? (
                      <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                    ) : (
                      <Crosshair className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {locating
                        ? "Detecting location..."
                        : "Use my current location"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Best for on-site reports
                    </p>
                  </div>
                </div>
                <Navigation className="w-4 h-4 text-primary-600 shrink-0" />
              </button>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <Info className="w-3.5 h-3.5" />
                  <span>Or tap anywhere on the map to pin manually</span>
                </div>
                <LocationPicker
                  lat={form.lat}
                  lng={form.lng}
                  onPick={handlePickOnMap}
                />
              </div>

              {validation.location && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary-50 border border-primary-100">
                  <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" />
                  <p className="text-xs text-primary-800 font-medium">
                    Pinned at {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary-600" />
                    Landmark / Address{" "}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </span>
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. Ratna Park, Kathmandu"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition
                             focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
          </Section>

          {/* 4. Preview */}
          {completedSteps >= 3 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Preview
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    This is how your report will appear
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                {preview && (
                  <div className="h-40 sm:h-48 bg-slate-100">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3 bg-white">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                      {form.title || "Untitled report"}
                    </p>
                    <span className="text-[9px] font-bold uppercase bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 shrink-0">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                    {form.description || "No description yet..."}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {form.address ||
                        (form.lat
                          ? `${form.lat.toFixed(3)}, ${form.lng.toFixed(3)}`
                          : "Location pending")}
                    </span>
                    <span className="flex items-center gap-1 text-primary-600 font-bold">
                      <Coins className="w-3 h-3" />
                      +10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="sticky bottom-3 sm:bottom-4 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full font-semibold rounded-xl py-3.5 px-4 transition-all duration-200 flex items-center justify-center gap-2
                shadow-lg
                ${
                  canSubmit
                    ? "bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-primary-500/30 hover:shadow-primary-500/40"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : canSubmit ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Submit report · +10 points
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Complete {4 - completedSteps} more step
                  {4 - completedSteps > 1 ? "s" : ""}
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
              <Coins className="w-3 h-3 text-primary-600" />
              Points awarded after municipal verification
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============ Section wrapper ============ */
function Section({ number, title, desc, done, icon: Icon, children }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden
        ${done ? "border-primary-200" : "border-slate-100"}`}
    >
      <div className="p-4 sm:p-5 pb-0 flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition
            ${
              done
                ? "bg-primary-500 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
        >
          {done ? <CheckCircle2 className="w-4 h-4" /> : number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
            {Icon && <Icon className="w-4 h-4 text-primary-600 shrink-0" />}
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

/* ============ Step chip ============ */
function StepChip({ active, icon: Icon, label }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all text-center
        ${
          active
            ? "bg-primary-50 border border-primary-200"
            : "bg-slate-50 border border-slate-100"
        }`}
    >
      <Icon
        className={`w-3.5 h-3.5 transition ${
          active ? "text-primary-600" : "text-slate-400"
        }`}
      />
      <span
        className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide transition ${
          active ? "text-primary-700" : "text-slate-500"
        }`}
      >
        {label}
      </span>
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