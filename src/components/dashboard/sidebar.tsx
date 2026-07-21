"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Heart,
  Pill,
  Calendar,
  Bot,
  Globe,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/care-recipients", label: "Care Recipients", icon: Heart },
  { href: "/dashboard/medications", label: "Medications", icon: Pill },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/resources", label: "Resources", icon: Globe },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-950 border-r transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link
          href="/dashboard"
          className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Compass
            </span>
          )}
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-blue-600 dark:text-blue-400")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button for collapsed state */}
      {collapsed && (
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mx-auto flex"
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Bottom section */}
      {!collapsed && (
        <div className="p-3 border-t">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
