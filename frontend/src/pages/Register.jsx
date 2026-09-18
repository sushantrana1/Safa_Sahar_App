import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Hash,
  Leaf,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Trophy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen",
    ward: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((er) => ({ ...er, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    else if (form.name.trim().length < 2) next.name = "Name is too short";

    if (!form.email) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      next.email = "Enter a valid email";

    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters";

    if (form.phone && !/^[0-9]{10}$/.test(form.phone))
      next.phone = "Enter a valid 10-digit phone";

    if (form.ward) {
      const w = Number(form.ward);
      if (!Number.isInteger(w) || w < 1 || w > 32)
        next.ward = "Ward must be between 1 and 32";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        ...form,
        ward: form.ward ? Number(form.ward) : null,
      });
      toast.success("Welcome to Safa Sahar!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* ============ Left: Brand Panel (desktop only, fixed height) ============ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute bottom-0 -right-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Safa Sahar
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
              Join the
              <br />
              <span className="text-primary-200">movement.</span>
            </h1>
            <p className="text-primary-100/90 text-lg leading-relaxed mb-8">
              Thousands of citizens across Nepal are making their wards
              cleaner — one report at a time.
            </p>

            <div className="space-y-4">
              <Feature
                icon={Trophy}
                title="Earn from day one"
                desc="+10 points for every verified report"
              />
              <Feature
                icon={MapPin}
                title="Real impact, real time"
                desc="Your reports reach the ward office instantly"
              />
              <Feature
                icon={ShieldCheck}
                title="Safe & secure"
                desc="Your data is encrypted and never shared"
              />
            </div>
          </div>

          <p className="text-sm text-primary-100/70">
            Built for a cleaner Nepal · © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* ============ Right: Form Panel (scrollable) ============ */}
      <div className="flex-1 h-screen overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-lg">
            {/* Mobile brand header */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20 mb-3">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Safa Sahar
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Clean Nepal, Together
              </p>
            </div>

            {/* Card / form panel */}
            <div className="bg-white lg:bg-transparent lg:shadow-none rounded-2xl lg:rounded-none shadow-lg lg:shadow-none border border-slate-100 lg:border-0 p-6 sm:p-8 lg:p-0">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Create your account
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  Join Safa Sahar and start making an impact today
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full name"
                    name="name"
                    icon={UserIcon}
                    placeholder="Ram Bahadur"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    autoComplete="name"
                    required
                  />
                  <Input
                    label="Email address"
                    type="email"
                    name="email"
                    icon={Mail}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    icon={Lock}
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    autoComplete="new-password"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-xs text-slate-500 hover:text-primary-600 transition flex items-center gap-1"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Hide password
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Show password
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone (optional)"
                    name="phone"
                    icon={Phone}
                    placeholder="98XXXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                  <Input
                    label="Ward (optional)"
                    type="number"
                    name="ward"
                    icon={Hash}
                    placeholder="1 – 32"
                    value={form.ward}
                    onChange={handleChange}
                    error={errors.ward}
                    min="1"
                    max="32"
                  />
                </div>

                {/* Role selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    I am joining as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "citizen",
                        title: "Citizen",
                        desc: "Report & earn",
                        icon: UserIcon,
                      },
                      {
                        value: "admin",
                        title: "Admin",
                        desc: "Ward staff",
                        icon: ShieldCheck,
                      },
                    ].map((r) => {
                      const Icon = r.icon;
                      const active = form.role === r.value;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, role: r.value }))
                          }
                          className={`relative text-left p-3 rounded-xl border-2 transition-all duration-200
                            ${
                              active
                                ? "border-primary-500 bg-primary-50 shadow-sm"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                          {active && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <Icon
                            className={`w-5 h-5 mb-1 ${
                              active ? "text-primary-600" : "text-slate-500"
                            }`}
                          />
                          <p
                            className={`text-sm font-semibold ${
                              active ? "text-primary-700" : "text-slate-800"
                            }`}
                          >
                            {r.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {r.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-xl py-3 px-4 transition-all duration-200
                             shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
                             flex items-center justify-center gap-2
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white lg:bg-slate-50 px-3 text-slate-400 uppercase tracking-wider font-medium">
                    Already a member?
                  </span>
                </div>
              </div>

              {/* Login CTA */}
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-primary-300 hover:bg-primary-50
                           text-slate-700 hover:text-primary-700 font-medium rounded-xl py-3 px-4 transition-all duration-200
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Sign in instead
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Bottom padding so last content isn't glued to edge on scroll */}
              <div className="h-6 lg:h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Feature bullet ---------------- */
function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-primary-100" strokeWidth={2} />
      </div>
      <div>
        <p className="font-semibold text-sm text-white">{title}</p>
        <p className="text-xs text-primary-100/80 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

/* ---------------- Input field ---------------- */
function Input({ label, icon: Icon, error, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
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
            }`}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}