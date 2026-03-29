import { Droplets, Sun } from "lucide-react";

interface PlantCardProps {
  name: string;
  image: string;
  water: string;
  light: string;
  category: string;
}

const PlantCard = ({ name, image, water, light, category }: PlantCardProps) => {
  return (
    <div className="rounded-2xl bg-card overflow-hidden shadow-sm active:scale-[0.98] transition-transform">
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          loading="lazy"
          width={512}
          height={512}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <span className="text-xs font-medium text-accent uppercase tracking-wide">
          {category}
        </span>
        <h3 className="font-display text-base font-semibold text-foreground mt-0.5">
          {name}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-garden-moss" />
            {water}
          </span>
          <span className="flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-garden-terracotta" />
            {light}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
