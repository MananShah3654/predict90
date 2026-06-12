import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { avatarUrl } from "@/lib/api";
import WCLogo from "@/components/WCLogo";
import {
  LayoutDashboard, CalendarClock, Target, Trophy, Users, Gem, Shield, LogOut, UserRound,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/matches", label: "Matches", icon: CalendarClock },
  { to: "/predict", label: "Bracket", icon: Target },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/leagues", label: "Leagues", icon: Users },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <header className="backdrop-blur-2xl bg-black/60 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" data-testid="nav-logo" className="flex items-center gap-2">
            <WCLogo variant="mark" className="h-9 w-auto" />
            <span className="font-display text-2xl tracking-wide hidden sm:inline">PREDICT<span className="gold-text">90</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                data-testid={`nav-${label.toLowerCase()}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    isActive ? "bg-[#FFD700]/15 text-[#FFD700]" : "text-white/70 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {!user.is_premium && (
              <Link to="/premium" data-testid="nav-premium" className="btn-gold px-4 py-1.5 text-xs hidden sm:block">
                <Gem size={12} className="inline mr-1 -mt-0.5" /> Premium
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger data-testid="nav-avatar-menu" className="outline-none">
                <img
                  src={user.picture || avatarUrl(user.username)}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className={`w-9 h-9 rounded-full border-2 object-cover ${user.is_premium ? "border-[#FFD700]" : "border-white/20"}`}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#11141D] border-white/10 text-white">
                <div className="px-3 py-2">
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-xs text-white/50">@{user.username}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem data-testid="menu-profile" onClick={() => navigate("/profile")} className="cursor-pointer">
                  <UserRound size={14} className="mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-premium" onClick={() => navigate("/premium")} className="cursor-pointer">
                  <Gem size={14} className="mr-2" /> Premium {user.is_premium && <span className="ml-1 text-[#FFD700] text-xs">Active</span>}
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem data-testid="menu-admin" onClick={() => navigate("/admin")} className="cursor-pointer">
                    <Shield size={14} className="mr-2" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem data-testid="menu-logout" onClick={handleLogout} className="cursor-pointer text-red-400">
                  <LogOut size={14} className="mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 backdrop-blur-2xl bg-black/80 border-t border-white/10 flex justify-around py-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={`mobile-nav-${label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-semibold ${
                isActive ? "text-[#FFD700]" : "text-white/60"
              }`
            }
          >
            <Icon size={20} /> {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
};
