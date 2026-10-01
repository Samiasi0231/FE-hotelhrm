import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "./user-avartar";
import {
  Menu,
  Bell,
  Settings,
  CalendarDays,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface Props {
  onOpenSidebar: () => void;
}

export function DashboardHeader({ onOpenSidebar }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
      {/* Mobile menu */}
      <button
        onClick={onOpenSidebar}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative">
          <Bell className="w-5 h-5" />

          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        {/* User dropdown */}
        <div
          ref={dropdownRef}
          className="relative pl-3 border-l border-slate-200"
        >
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition"
          >
            <UserAvatar size="sm" />

            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-700">
                {user?.firstName}
              </p>

              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              {/* User information */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">
                  {user?.firstName} {user?.lastName}
                </p>

                <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
              </div>

              {/* My Schedule */}
              <button
                onClick={() => handleNavigate("/roster/mine")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <CalendarDays className="w-4 h-4" />
                My Schedule
              </button>

              {/* Settings */}
              <button
                onClick={() => handleNavigate("/settings")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <div className="border-t border-slate-100 my-1" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
