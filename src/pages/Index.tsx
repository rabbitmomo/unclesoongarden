import { Search, Droplets, Thermometer, Scissors, Sparkles } from "lucide-react";
import PlantCard from "@/components/PlantCard";
import GardenTipCard from "@/components/GardenTipCard";
import BottomNav from "@/components/BottomNav";

import heroImg from "@/assets/hero-garden.jpg";
import monstera from "@/assets/plant-monstera.jpg";
import lavender from "@/assets/plant-lavender.jpg";
import succulent from "@/assets/plant-succulent.jpg";
import basil from "@/assets/plant-basil.jpg";
import rosemary from "@/assets/plant-rosemary.jpg";
import snake from "@/assets/plant-snake.jpg";

const plants = [
  { name: "Monstera", image: monstera, water: "Weekly", light: "Indirect", category: "Indoor" },
  { name: "Lavender", image: lavender, water: "Bi-weekly", light: "Full Sun", category: "Outdoor" },
  { name: "Succulent Mix", image: succulent, water: "Monthly", light: "Bright", category: "Indoor" },
  { name: "Sweet Basil", image: basil, water: "Daily", light: "Full Sun", category: "Herbs" },
  { name: "Rosemary", image: rosemary, water: "Weekly", light: "Full Sun", category: "Herbs" },
  { name: "Snake Plant", image: snake, water: "Bi-weekly", light: "Low Light", category: "Indoor" },
];

const tips = [
  { icon: Droplets, title: "Morning Watering", description: "Water early to reduce evaporation and prevent fungal diseases." },
  { icon: Thermometer, title: "Watch the Frost", description: "Bring tender plants indoors when temperatures drop below 5°C." },
  { icon: Scissors, title: "Prune Regularly", description: "Remove dead leaves to encourage healthy new growth." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-body">Good morning 🌱</p>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            UnclesoonGarden
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
      </header>

      {/* Search */}
      <div className="px-5 mt-3">
        <div className="flex items-center gap-2 bg-card rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search plants, tips..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full font-body"
          />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-5 mt-5">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={heroImg}
            alt="Beautiful garden arrangement"
            width={768}
            height={512}
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="font-display text-lg font-bold text-primary-foreground">
              Spring Planting Guide
            </h2>
            <p className="text-xs text-primary-foreground/80 mt-0.5">
              Best plants to grow this season →
            </p>
          </div>
        </div>
      </div>

      {/* Plant Collection */}
      <section className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold text-foreground">My Plants</h2>
          <button className="text-xs font-medium text-accent">View all</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {plants.map((plant) => (
            <PlantCard key={plant.name} {...plant} />
          ))}
        </div>
      </section>

      {/* Garden Tips */}
      <section className="mt-6 px-5">
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">Garden Tips</h2>
        <div className="flex flex-col gap-2">
          {tips.map((tip) => (
            <GardenTipCard key={tip.title} {...tip} />
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default Index;
