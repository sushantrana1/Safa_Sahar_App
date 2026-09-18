import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Leaf,
  LayoutDashboard,
  FileText,
  Gift,
  Users,
  ArrowLeft,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/redemptions", label: "Redeems", icon: Gift },
  { to: "/admin/citizens", label: "Citizens", icon: Users },
  { to: "/admin/rewards", label: "Rewards", icon: Settings },
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-primary-600" />
              <span className="font-bold text-slate-900">Safa Sahar</span>
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Back to app — icon-only on mobile, full label on desktop */}
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 px-2 sm:px-3 py-2 rounded-lg transition
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              aria-label="Back to app"
            >
              <ArrowLeft className="hidden sm:block w-4 h-4" />
              <span className="hidden sm:inline">Back to app</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 transition
               focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-56 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-57px)]">
          <nav className="p-3 space-y-1 sticky top-[57px]">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 pb-24 lg:pb-6">
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav — 5 items */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                  active ? "text-primary-600" : "text-slate-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
