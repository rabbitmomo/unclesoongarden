import { useState, useRef } from "react";
import { Upload, Leaf, Sparkles, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

interface TutorialItem {
  id: string;
  title: string;
  emoji: string;
  description: string;
  gradient: string;
  steps?: string[];
  hasUpload?: boolean;
}

const tutorials: TutorialItem[] = [
  {
    id: "compost",
    title: "🌱 Make Compost",
    emoji: "♻️",
    description: "Turn kitchen scraps into nutrient-rich fertilizer",
    gradient: "from-green-400/20 via-emerald-400/10 to-teal-400/20",
    hasUpload: true,
    steps: [
      "Collect organic scraps (vegetable peels, fruit waste, leaves)",
      "Layer with dry materials (sawdust, paper)",
      "Maintain moisture & turn weekly",
      "Wait 6-8 weeks for dark, crumbly compost",
      "Use for all your plants!",
    ],
  },
  {
    id: "planting",
    title: "🌿 Planting Techniques",
    emoji: "⛏️",
    description: "Master soil preparation, grafting & propagation",
    gradient: "from-amber-400/20 via-orange-400/10 to-red-400/20",
    steps: [
      "Soil Preparation: Mix loamy soil, compost & perlite (2:1:0.5)",
      "Digging: Create holes 1.5x root ball diameter",
      "Grafting: Cut 45° angle, join & seal with wax",
      "Layering: Low branch bends down, soil covers, shoots up",
      "Spacing: Follow seed packet distance guidelines",
    ],
  },
];

const TutorialSection = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadImage(event.target?.result as string);
      setAnalyzing(true);

      // Simulate AI analysis
      setTimeout(() => {
        setAnalyzing(false);
        toast.success("Detected: Mixed vegetable scraps!\n✅ Great for composting");
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-8">
      <h2 className="text-title text-foreground mb-4">Learn & Grow</h2>

      <div className="space-y-3">
        {tutorials.map((tutorial) => (
          <div key={tutorial.id}>
            {/* Tutorial Card */}
            <button
              onClick={() =>
                setExpandedId(expandedId === tutorial.id ? null : tutorial.id)
              }
              className={`w-full rounded-2xl p-4 card-shadow transition-all active:scale-[0.98] bg-gradient-to-br ${tutorial.gradient} backdrop-blur-sm border border-primary/10 overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0">
                    {tutorial.emoji}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-label font-semibold text-foreground">
                      {tutorial.title}
                    </p>
                    <p className="text-caption text-muted-foreground mt-0.5">
                      {tutorial.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className={`text-muted-foreground transition-transform flex-shrink-0 ${
                    expandedId === tutorial.id ? "rotate-90" : ""
                  }`}
                />
              </div>
            </button>

            {/* Expanded Content */}
            {expandedId === tutorial.id && (
              <div className="bg-card rounded-b-2xl rounded-t-none card-shadow p-5 mt-0 border-t-0 border border-t border-muted animate-fade-up">
                {/* Compost Photo Upload */}
                {tutorial.id === "compost" && !uploadImage && (
                  <div className="mb-5">
                    <button
                      onClick={handleUpload}
                      className="w-full border-2 border-dashed border-primary/40 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload size={20} className="text-primary" />
                      </div>
                      <p className="text-label font-medium text-foreground">
                        Snap Your Scraps
                      </p>
                      <p className="text-caption text-muted-foreground">
                        Upload a photo & we'll analyze it
                      </p>
                    </button>
                  </div>
                )}

                {/* Uploaded Image with Analysis */}
                {uploadImage && (
                  <div className="mb-5 bg-secondary rounded-lg overflow-hidden">
                    <img
                      src={uploadImage}
                      alt="Uploaded scraps"
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3 bg-secondary flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {analyzing ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <p className="text-caption text-muted-foreground">
                              Analyzing...
                            </p>
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} className="text-primary" />
                            <p className="text-caption font-medium">
                              Veggie scraps detected!
                            </p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => setUploadImage(null)}
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Steps */}
                <div className="mb-4">
                  <p className="text-label font-semibold text-foreground mb-3">
                    {tutorial.id === "compost"
                      ? "🔄 Composting Steps"
                      : "📚 Techniques"}
                  </p>
                  <div className="space-y-2">
                    {tutorial.steps?.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 p-3 bg-secondary rounded-lg"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {idx + 1}
                          </span>
                        </div>
                        <p className="text-body text-foreground leading-snug">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Tip */}
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 flex items-start gap-2">
                  <span className="text-lg mt-0.5">💡</span>
                  <div>
                    <p className="text-xs font-semibold text-primary mb-0.5">
                      Uncle Soon's Tip
                    </p>
                    <p className="text-caption text-foreground">
                      {tutorial.id === "compost"
                        ? "Brown (dry) to green (wet) ratio should be 3:1 for best results. Keep it moist like a wrung-out sponge!"
                        : "The best time to plant is usually in the early morning or late afternoon to minimize transplant shock!"}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                {tutorial.id === "compost" && (
                  <button
                    onClick={() => {
                      toast.success(
                        "Saved to your Garden Bible! 📚"
                      );
                    }}
                    className="w-full mt-4 bg-primary text-primary-foreground rounded-lg py-3 text-label font-medium active:scale-95 transition-transform"
                  >
                    Save This Recipe
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        capture="environment"
      />
    </div>
  );
};

export default TutorialSection;
