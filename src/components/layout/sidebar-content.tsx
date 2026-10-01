import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { publicClient } from "@/api/services";
import { navItems, superAdminItems } from "@/config/navigation";
import { SidebarNavLink } from "./sidebar-navlink";
import { UserAvatar } from "./user-avartar";
import { Hotel, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const { data } = useQuery({
    queryKey: ["platform-logo"],
    queryFn: () =>
      publicClient
        .get("/super-admin/branding/logo")
        .then((r) => r.data?.data ?? r.data),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const logoUrl = data?.logo;
  const showLogo = logoUrl && !imgError;

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || ""),
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          {showLogo ? (
            <img
              src={logoUrl}
              alt="Platform logo"
              className="w-full h-full object-contain p-0.5"
              onError={() => setImgError(true)}
            />
          ) : (
            <Hotel className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">HotelMS</h1>
          <p className="text-slate-400 text-xs mt-0.5">Management Platform</p>
        </div>
      </div>

      {/* Nav links — single mapped block, reused for both nav groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {visibleItems.map((item) => (
          <SidebarNavLink key={item.to} item={item} onClick={onNavigate} />
        ))}

        {user?.role === "SUPER_ADMIN" && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Super Admin
              </p>
            </div>
            {superAdminItems.map((item) => (
              <SidebarNavLink key={item.to} item={item} onClick={onNavigate} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom: settings + logout + user */}
      <div className="px-3 py-4 border-t border-slate-700 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-700 hover:text-white",
            )
          }
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>

        <div className="flex items-center gap-3 px-3 py-2 mt-2">
          <UserAvatar size="sm" />
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-slate-400 text-xs capitalize truncate">
              {user?.role?.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
