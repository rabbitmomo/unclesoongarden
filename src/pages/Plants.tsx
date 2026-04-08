import { useEffect, useMemo, useState } from "react";
import PlantCard from "@/components/PlantCard";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { getMyGardenPlants, removeMyGardenPlant } from "@/lib/mygarden-storage";
import { toast } from "sonner";

const defaultPlants: Array<{
  id: string;
  name: string;
  image: string;
  status: "healthy" | "attention" | "problem";
  stage: string;
  lastChecked: string;
}> = [];

// Default crops disabled for My Garden.
// Uncomment these if you want demo plants again.
// const defaultPlants = [
//   {
//     id: "1",
//     name: "Chili Plant",
//     image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=200&h=200&fit=crop",
//     status: "healthy" as const,
//     stage: "🌿 Growing",
//     lastChecked: "2 hours ago",
//   },
//   {
//     id: "2",
//     name: "Tomato Plant",
//     image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=200&h=200&fit=crop",
//     status: "attention" as const,
//     stage: "🌸 Flowering",
//     lastChecked: "Yesterday",
//   },
//   {
//     id: "3",
//     name: "Kangkung",
//     image: "/kangkung.jpeg",
//     status: "healthy" as const,
//     stage: "🌾 Ready to Harvest",
//     lastChecked: "3 hours ago",
//   },
// ];

const toRelativeTime = (isoDateTime: string) => {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "just now";

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const mapStatusToCard = (status: "good" | "warning" | "danger") => {
  if (status === "good") return "healthy" as const;
  if (status === "warning") return "attention" as const;
  return "problem" as const;
};

const toDisplayPlantName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const PlantsPage = () => {
  const navigate = useNavigate();
  const [myGardenPlants, setMyGardenPlants] = useState(() => getMyGardenPlants());

  useEffect(() => {
    setMyGardenPlants(getMyGardenPlants());
  }, []);

  const allPlants = useMemo(() => {
    const mappedMyGardenPlants = myGardenPlants.map((plant) => ({
      id: plant.id,
      name: toDisplayPlantName(plant.name),
      image: plant.image,
      status: mapStatusToCard(plant.overallStatus),
      stage: plant.tracking.growthSummary ? `📈 ${plant.tracking.growthSummary}` : "📍 AI tracking started",
      lastChecked: toRelativeTime(plant.tracking.lastCheckedAt),
      isTemporary: true,
    }));

    const mappedDefaultPlants = defaultPlants.map((plant) => ({
      ...plant,
      isTemporary: false,
    }));

    return [...mappedMyGardenPlants, ...mappedDefaultPlants];
  }, [myGardenPlants]);

  const handleDeletePlant = (plantId: string) => {
    const result = removeMyGardenPlant(plantId);
    if (!result.removed) {
      toast.error("Unable to delete this plant");
      return;
    }

    setMyGardenPlants(getMyGardenPlants());
    toast.success("Plant removed from My Crops");
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto">
      <h1 className="text-display text-foreground mb-1">My Crops</h1>
      <p className="text-body text-muted-foreground mb-6">
        {allPlants.length} plants being cared for
      </p>

      <div className="space-y-3 mb-6">
        {allPlants.map((plant) => (
          <PlantCard
            key={plant.id}
            name={plant.name}
            image={plant.image}
            status={plant.status}
            stage={plant.stage}
            lastChecked={plant.lastChecked}
            onClick={() => {
              if (plant.isTemporary) {
                navigate("/plants/view", { state: { tempPlantId: plant.id } });
                return;
              }

              navigate(`/plants/${plant.id}`);
            }}
            statusAction={
              plant.isTemporary ? (
                <span
                  className="h-8 w-8 rounded-lg border border-border bg-card/95 text-muted-foreground hover:text-destructive active:scale-95 transition-transform flex items-center justify-center"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeletePlant(plant.id);
                  }}
                  aria-label={`Delete ${plant.name}`}
                  title="Delete"
                  role="button"
                >
                  <Trash2 size={16} />
                </span>
              ) : null
            }
          />
        ))}
      </div>

      <button 
        onClick={() => navigate("/identify")}
        className="w-full bg-card card-shadow text-foreground rounded-2xl py-4 flex items-center justify-center gap-2.5 text-title border-2 border-dashed border-border active:scale-[0.97] transition-transform hover:border-primary/40"
      >
        <Plus size={24} className="text-primary" /> Add New Plant
      </button>
    </div>
  );
};

export default PlantsPage;
