import { CheckCircle, Bell } from "lucide-react";

interface TaskCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  urgent?: boolean;
  onDone?: () => void;
  onRemind?: () => void;
  gridLayout?: boolean;
}

const TaskCard = ({ emoji, title, subtitle, urgent, onDone, onRemind, gridLayout }: TaskCardProps) => {
  // Grid layout style
  if (gridLayout) {
    return (
      <div
        className={`bg-gradient-to-br from-red-400/20 to-orange-400/10 rounded-2xl p-4 card-shadow flex flex-col justify-between border border-red-400/25 hover:border-red-400/40 active:scale-[0.97] transition-all ${
          urgent ? "ring-2 ring-warning/30" : ""
        }`}
      >
        <div className="flex items-start justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/40 backdrop-blur-sm flex items-center justify-center text-2xl">
            {emoji}
          </div>
        </div>
        <div className="text-center flex-1 flex flex-col justify-center mb-3">
          <h3 className="text-label font-semibold text-foreground line-clamp-2">{title}</h3>
          <p className="text-caption text-muted-foreground mt-1 line-clamp-2">{subtitle}</p>
        </div>
        <div className="flex gap-2 w-full">
          <button
            onClick={onDone}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-lg py-2.5 text-xs font-medium active:scale-[0.95] transition-transform"
          >
            <CheckCircle size={16} /> Done
          </button>
          <button
            onClick={onRemind}
            className="flex-1 flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground rounded-lg py-2.5 text-xs font-medium active:scale-[0.95] transition-transform"
          >
            <Bell size={16} /> Remind
          </button>
        </div>
      </div>
    );
  }

  // Original vertical layout (if needed elsewhere)
  return (
    <div
      className={`bg-card rounded-2xl p-5 card-shadow transition-all animate-fade-up ${
        urgent ? "ring-2 ring-warning/50" : ""
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-title text-foreground">{title}</h3>
          <p className="text-body text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="flex gap-2.5 mt-4">
        <button
          onClick={onDone}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-label active:scale-[0.97] transition-transform"
        >
          <CheckCircle size={18} /> Done
        </button>
        <button
          onClick={onRemind}
          className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl py-3 text-label active:scale-[0.97] transition-transform"
        >
          <Bell size={18} /> Remind
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
