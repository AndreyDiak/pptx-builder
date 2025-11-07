import logoImage from "@/assets/logo.jpg";
import { ThemeToggle } from "@/components/ui/base/theme_toggle";
import { cn } from "@/shared/utils";
import { Calendar, CalendarDays } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: "/events", label: "Мероприятия", icon: Calendar },
    // { path: "/projects", label: "Проекты", icon: FolderKanban },
    { path: "/calendar", label: "Календарь", icon: CalendarDays },
  ];

  return (
    <header className="w-full bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm border-b border-gray-400/40 dark:border-gray-600/40 sticky top-0 z-50 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-4">
        <div className="flex justify-between items-center gap-8">
          <div className="flex items-center gap-8">
            <div>
              <Link to="/" className="block">
                <img
                  src={logoImage}
                  alt="Планер"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                />
              </Link>
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
                      isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
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
          <div className="flex items-center gap-2">
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
                      isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                    )}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
