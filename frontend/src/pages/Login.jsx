import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Leaf,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
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
    if (!form.email) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ============ Left: Brand Panel (desktop only) ============ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800">
        {/* Decorative blurred circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute bottom-0 -right-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Safa Sahar
            </span>
          </div>

          {/* Hero copy */}
          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
              Clean Nepal,
              <br />
              <span className="text-primary-200">Together.</span>
            </h1>
            <p className="text-primary-100/90 text-lg leading-relaxed mb-8">
              Report waste issues, earn points, and redeem real rewards.
              Every report makes your ward cleaner.
            </p>

            {/* Feature bullets */}
            <div className="space-y-4">
              <Feature
                icon={MapPin}
                title="Report with GPS"
                desc="Pin the exact location with photo evidence"
              />
              <Feature
                icon={Trophy}
                title="Earn & compete"
                desc="10 points per report · climb the leaderboard"
              />
              <Feature
                icon={ShieldCheck}
                title="Verified by municipality"
                desc="Reports reach the right ward office"
              />
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-primary-100/70">
            Built for a cleaner Nepal · © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* ============ Right: Form Panel ============ */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20 mb-3">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Safa Sahar</h1>
            <p className="text-sm text-slate-500 mt-1">
              Clean Nepal, Together
            </p>
          </div>

          {/* Card */}
          <div className="bg-white lg:bg-transparent lg:shadow-none rounded-2xl lg:rounded-none shadow-lg lg:shadow-none border border-slate-100 lg:border-0 p-6 sm:p-8 lg:p-0">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  icon={Lock}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="current-password"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-xs text-slate-500 hover:text-primary-600 transition flex items-center gap-1 mt-1"
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
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
                  New to Safa Sahar?
                </span>
              </div>
            </div>

            {/* Sign up CTA */}
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-primary-300 hover:bg-primary-50 
                         text-slate-700 hover:text-primary-700 font-medium rounded-xl py-3 px-4 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Create an account
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Footer */}
            <p className="text-xs text-slate-400 text-center mt-8 leading-relaxed">
              By signing in, you agree to our{" "}
              <a href="#" className="text-slate-500 hover:text-primary-600 underline-offset-2 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-slate-500 hover:text-primary-600 underline-offset-2 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Feature bullet (left panel) ---------------- */
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