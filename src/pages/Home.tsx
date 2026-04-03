// GitHub Sync Test — 2026-03-29
import { useState } from "react";
import TaskCard from "@/components/TaskCard";
import StatusBadge from "@/components/StatusBadge";
import UncleSoonGuide from "@/components/UncleSoonGuide";
import TutorialSection from "@/components/TutorialSection";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

interface Task {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  urgent: boolean;
}

const initialTasks: Task[] = [
  { id: "1", emoji: "💧", title: "Water your Chili plant", subtitle: "Morning watering — soil looks dry", urgent: true },
  { id: "2", emoji: "🌱", title: "Fertilize Tomato tomorrow", subtitle: "It's been 14 days since last feed", urgent: false },
];

const plantSummary = [
  { name: "Chili Plant", status: "healthy" as const },
  { name: "Tomato Plant", status: "attention" as const },
  { name: "Kangkung", status: "healthy" as const },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const handleTaskDone = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      toast.success(`🎉 ${task.title} — Great job! ✅`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleTaskRemind = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      toast(
        <div className="flex flex-col gap-2">
          <p className="font-medium">Set reminder for {task.title}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.success("Reminder set for 1 hour 🔔");
              }}
              className="text-xs px-3 py-1 bg-primary text-white rounded"
            >
              1 hour
            </button>
            <button
              onClick={() => {
                toast.success("Reminder set for tomorrow 🔔");
              }}
              className="text-xs px-3 py-1 bg-primary text-white rounded"
            >
              Tomorrow
            </button>
            <button
              onClick={() => {
                toast.success("Reminder set for 3 days 🔔");
              }}
              className="text-xs px-3 py-1 bg-primary text-white rounded"
            >
              3 days
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-caption text-muted-foreground">{greeting} 👋</p>
          <h1 className="text-heading text-foreground">My Garden</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
          <Leaf size={16} className="text-primary" />
          <span className="text-label text-foreground">3 plants</span>
        </div>
      </div>

      {/* Uncle Soon — Hero Character Section */}
      <div className="mb-8 animate-fade-up">
        <UncleSoonGuide />
      </div>

      {/* Seed-to-Harvest Timeline */}
      <h2 className="text-title text-foreground mb-3">Growth Progress</h2>
      <div className="bg-card rounded-2xl p-5 card-shadow mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-label text-foreground">Chili Plant</span>
          <span className="text-caption text-primary font-semibold">Day 45 / 60</span>
        </div>
        <div className="relative h-3 w-full rounded-full bg-secondary overflow-hidden mb-3">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: "75%" }} />
        </div>
        <div className="flex justify-between text-caption text-muted-foreground">
          <span>🌱 Sowed</span>
          <span>🌿 Transplant</span>
          <span>🌶️ Harvest</span>
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-caption text-primary font-semibold">Day 1</span>
          <span className="text-caption text-muted-foreground">Day 30</span>
          <span className="text-caption text-muted-foreground">Day 60</span>
        </div>
      </div>

      {/* Actionable Advice from Uncle Soon */}
      <h2 className="text-title text-foreground mb-4">Uncle Soon's Advice</h2>
      <div className="mb-8">
        <div className="flex gap-3 overflow-x-auto scrollbar-visible pb-2" style={{ scrollBehavior: 'smooth' }}>
          {[
            { emoji: "📅", text: "Harvest chili by Apr 15", detail: "Based on current growth rate" },
            { emoji: "💧", text: "Water 2x daily", detail: "Morning 7am & evening 6pm" },
            { emoji: "🧪", text: "Fertilize every 2 weeks", detail: "Next feed: Mar 28" },
            { emoji: "☀️", text: "6 hours sunlight needed", detail: "Move pot to south-facing area" },
            { emoji: "🌱", text: "Extra tip bonus", detail: "Keep learning & growing" },
          ].map((advice, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-56 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl p-4 card-shadow flex flex-col items-center justify-center text-center border border-primary/20 hover:border-primary/40 active:scale-[0.97] transition-all"
              style={{ minWidth: '224px' }}
            >
              <div className="w-14 h-14 rounded-xl bg-white/40 backdrop-blur-sm flex items-center justify-center text-3xl mb-2.5 flex-shrink-0">
                {advice.emoji}
              </div>
              <p className="text-label font-semibold text-foreground leading-tight mb-1 line-clamp-2">{advice.text}</p>
              <p className="text-caption text-muted-foreground line-clamp-2">{advice.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-title text-foreground">Today's Tasks</h2>
        <span className="text-caption text-muted-foreground">{tasks.length} remaining</span>
      </div>
      {tasks.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              {...task}
              gridLayout
              onDone={() => handleTaskDone(task.id)}
              onRemind={() => handleTaskRemind(task.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-cyan-400/20 to-teal-400/10 rounded-2xl p-8 card-shadow text-center border border-cyan-400/30 mb-8">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-title text-foreground mb-1">Congratulations!</p>
          <p className="text-body text-muted-foreground">All tasks completed today! 🌟</p>
        </div>
      )}

      {/* Plant Health Overview */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-title text-foreground">Your Garden</h2>
        <button
          onClick={() => navigate("/plants")}
          className="text-label text-primary active:opacity-70"
        >
          View All
        </button>
      </div>
      <div className="space-y-2.5">
        {plantSummary.map((plant, i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 card-shadow flex items-center justify-between"
          >
            <span className="text-body-lg font-semibold">{plant.name}</span>
            <StatusBadge status={plant.status} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
