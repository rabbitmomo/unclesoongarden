import { LucideIcon } from "lucide-react";

interface GardenTipCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const GardenTipCard = ({ icon: Icon, title, description }: GardenTipCardProps) => {
  return (
    <div className="flex gap-3 p-4 rounded-2xl bg-card">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-display text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default GardenTipCard;
