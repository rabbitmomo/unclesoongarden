import { Home, Leaf, Calendar, User } from "lucide-react";
import { useState } from "react";
//test lovable
const navItems = [
  { icon: Home, label: "Home" },
  { icon: Leaf, label: "Plants" },
  { icon: Calendar, label: "Schedule" },
  { icon: User, label: "Profile" },
];

const BottomNav = () => {
  const [active, setActive] = useState(0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border px-6 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActive(i)}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              active === i ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className={`w-5 h-5 ${active === i ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
