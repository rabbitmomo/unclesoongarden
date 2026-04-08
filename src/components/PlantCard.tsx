import type { ReactNode } from "react";
import StatusBadge from "./StatusBadge";
import { ChevronRight } from "lucide-react";

interface PlantCardProps {
  name: string;
  image: string;
  status: "healthy" | "attention" | "problem";
  stage: string;
  lastChecked?: string;
  onClick?: () => void;
  statusAction?: ReactNode;
}

const PlantCard = ({ name, image, status, stage, lastChecked, onClick, statusAction }: PlantCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-2xl p-4 card-shadow hover:card-shadow-hover flex items-center gap-4 active:scale-[0.98] transition-all text-left"
    >
      <img
        src={image}
        alt={name}
        className="w-[72px] h-[72px] rounded-xl object-cover"
        loading="lazy"
        width={72}
        height={72}
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-title text-foreground truncate">{name}</h3>
        <p className="text-caption text-muted-foreground mt-0.5">{stage}</p>
        {lastChecked && (
          <p className="text-caption text-muted-foreground">Checked {lastChecked}</p>
        )}
        <div className="mt-1.5 flex items-center gap-1.5">
          <StatusBadge status={status} size="sm" />
          {statusAction}
        </div>
      </div>
      <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
    </button>
  );
};

export default PlantCard;
