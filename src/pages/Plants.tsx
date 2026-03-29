import PlantCard from "@/components/PlantCard";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const plants = [
  {
    id: 1,
    name: "Chili Plant",
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=200&h=200&fit=crop",
    status: "healthy" as const,
    stage: "🌿 Growing",
    lastChecked: "2 hours ago",
  },
  {
    id: 2,
    name: "Tomato Plant",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=200&h=200&fit=crop",
    status: "attention" as const,
    stage: "🌸 Flowering",
    lastChecked: "Yesterday",
  },
  {
    id: 3,
    name: "Kangkung",
    image: "/kangkung.jpeg",
    status: "healthy" as const,
    stage: "🌾 Ready to Harvest",
    lastChecked: "3 hours ago",
  },
];

const PlantsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto">
      <h1 className="text-display text-foreground mb-1">My Garden</h1>
      <p className="text-body text-muted-foreground mb-6">
        {plants.length} plants being cared for
      </p>

      <div className="space-y-3 mb-6">
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            {...plant}
            onClick={() => navigate(`/plants/${plant.id}`)}
          />
        ))}
      </div>

      <button 
        onClick={() => navigate("/check")}
        className="w-full bg-card card-shadow text-foreground rounded-2xl py-4 flex items-center justify-center gap-2.5 text-title border-2 border-dashed border-border active:scale-[0.97] transition-transform hover:border-primary/40"
      >
        <Plus size={24} className="text-primary" /> Add New Plant
      </button>
    </div>
  );
};

export default PlantsPage;
