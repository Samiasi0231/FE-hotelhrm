// src/components/layout/SidebarNavLink.tsx
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/navigation";

interface Props {
  item: NavItem;
  onClick?: () => void;
}

export function SidebarNavLink({ item, onClick }: Props) {
  const { label, to, icon: Icon } = item;
  const isDashboardRoot = to === "/dashboard" || to === "/super-admin";

  return (
    <NavLink
      to={to}
      end={isDashboardRoot}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:bg-slate-700 hover:text-white",
        )
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </NavLink>
  );
}
