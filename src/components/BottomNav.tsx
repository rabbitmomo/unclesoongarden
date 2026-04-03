import { NavLink, useLocation } from "react-router-dom";
import { Home, Compass, Camera, Sprout, MoreHorizontal } from "lucide-react";
//test lovable
const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/identify", icon: Camera, label: "Identify", isCenter: true },
  { to: "/plants", icon: Sprout, label: "My Crops" },
  { to: "/profile", icon: MoreHorizontal, label: "More" },
];

const BottomNav = () => {
  const location = useLocation();
  const isDetailPage =
    location.pathname.startsWith("/plants/") ||
    location.pathname.startsWith("/explore/") ||
    location.pathname === "/identify" ||
    location.pathname === "/identify-results";

  if (isDetailPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border safe-bottom z-50">
      <div className="flex justify-around items-center h-[72px] max-w-md mx-auto">
        {tabs.map(({ to, icon: Icon, label, isCenter }) => {
          const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

          if (isCenter) {
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-0.5 px-3 py-1 relative -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Icon size={28} strokeWidth={2.5} className="text-primary-foreground" />
                </div>
                <span className="text-[11px] font-semibold text-primary">{label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 px-3 py-2 relative"
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full" />
              )}
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={`text-[11px] font-semibold ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
