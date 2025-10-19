import { cn } from "@/shared/utils";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Проекты" },
    { path: "/events", label: "Мероприятия" },
    { path: "/calendar", label: "Календарь" },
  ];

  return (
    <header className="w-full bg-white/10 backdrop-blur-sm border-b border-gray-400/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black drop-shadow-lg">
                МузЛото
              </h1>
            </div>

            <nav className="hidden md:flex items-end gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    location.pathname === item.path
                      ? "text-blue-500"
                      : "text-gray-500"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
