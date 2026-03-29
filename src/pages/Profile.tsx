import uncleSoon from "@/assets/uncle-soon.png";
import { Bell, Settings, HelpCircle, ChevronRight } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl p-6 card-shadow flex flex-col items-center mb-6">
        <img
          src={uncleSoon}
          alt="Uncle Soon"
          className="w-20 h-20 rounded-full border-4 border-primary mb-3"
          width={80}
          height={80}
        />
        <h1 className="text-display">My Farm</h1>
        <p className="text-body text-muted-foreground">Guided by Uncle Soon 🌱</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {[
          { label: "Active Days", value: "45" },
          { label: "Healthy", value: "2/3" },
          { label: "Tasks Done", value: "128" },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl p-4 card-shadow text-center">
            <p className="text-heading text-primary">{stat.value}</p>
            <p className="text-caption text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="space-y-2.5">
        {[
          { icon: Bell, label: "Reminders", desc: "Set daily reminder times" },
          { icon: Settings, label: "Settings", desc: "Language, text size" },
          { icon: HelpCircle, label: "Help", desc: "How to use this app" },
        ].map((item, i) => (
          <button
            key={i}
            className="w-full bg-card rounded-xl p-4 card-shadow flex items-center gap-3.5 active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-body-lg font-semibold">{item.label}</p>
              <p className="text-caption text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
