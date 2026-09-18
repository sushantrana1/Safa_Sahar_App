import { Link, useLocation } from "react-router-dom";
import { Home, Plus, Trophy, Gift, User } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/reports/new", label: "Report", icon: Plus },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/profile", label: "Profile", icon: User },
];

export default function CitizenBottomNav() {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
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
  );
}