import { cn } from "@/shared/utils";
import { Calendar, CalendarDays, FolderKanban } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Проекты", icon: FolderKanban },
    { path: "/events", label: "Мероприятия", icon: Calendar },
    { path: "/calendar", label: "Календарь", icon: CalendarDays },
  ];

  return (
    <header className="w-full bg-white/10 backdrop-blur-sm border-b border-gray-400/40 sticky top-0 z-50 px-8">
      <div className="max-w-7xl mx-auto py-4">
        <div className="flex justify-between md:justify-start items-center gap-8">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black drop-shadow-lg">
                Планер
              </h1>
            </div>
            <nav className="hidden md:flex items-end gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      isActive ? "text-blue-500" : "text-gray-500"
                    )}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <nav className="flex md:hidden items-end gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isActive ? "text-blue-500" : "text-gray-500"
                  )}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
