import { useState, useRef } from "react";
import { Upload, Leaf, Sparkles, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

interface TutorialItem {
  id: string;
  title: string;
  emoji: string;
  iconImage?: string;
  description: string;
  gradient: string;
  steps?: string[];
  hasUpload?: boolean;
  tip: string;
  uploadTitle: string;
  uploadDescription: string;
  analyzeLabel: string;
  analyzeSuccess: string;
  resultLabel: string;
}

type SoilType = "loamy" | "sandy" | "clay" | "compostRich";

const soilProfiles: Record<
  SoilType,
  { label: string; steps: string[]; tip: string }
> = {
  loamy: {
    label: "Loamy Soil",
    steps: [
      "Mix in compost (about 20-30%) to keep structure rich and balanced",
      "Break large clumps and remove stones before planting",
      "Keep soil evenly moist and avoid waterlogging",
      "Apply mulch to hold moisture and reduce heat stress",
      "Top up organic matter every 3-4 weeks",
    ],
    tip: "Loamy soil is ideal for most crops. Maintain it with regular compost and light mulch.",
  },
  sandy: {
    label: "Sandy Soil",
    steps: [
      "Add compost or cocopeat generously to improve water retention",
      "Use raised beds or borders to reduce nutrient loss",
      "Water in smaller amounts but more frequently",
      "Add mulch immediately after planting",
      "Use slow-release fertilizer to prevent leaching",
    ],
    tip: "Sandy soil drains fast, so focus on moisture retention and steady nutrient release.",
  },
  clay: {
    label: "Clay Soil",
    steps: [
      "Mix coarse compost and organic matter to improve aeration",
      "Avoid working the soil when it is too wet",
      "Create raised rows for better drainage",
      "Water deeply but less often",
      "Add gypsum only if compaction is severe",
    ],
    tip: "Clay soil can be very fertile, but drainage and aeration are the keys to healthy roots.",
  },
  compostRich: {
    label: "Compost-Rich Soil",
    steps: [
      "Blend with regular garden soil if texture is too loose",
      "Check moisture before watering to avoid overwatering",
      "Plant nutrient-hungry crops in this bed first",
      "Top with dry mulch to stabilize moisture",
      "Refresh with a thin compost layer every few weeks",
    ],
    tip: "Compost-rich soil is nutrient dense. Balance moisture and structure for best root development.",
  },
};

const tutorials: TutorialItem[] = [
  {
    id: "compost",
    title: "🌱 Make Compost",
    emoji: "♻️",
    description: "Turn kitchen scraps into nutrient-rich fertilizer",
    gradient: "from-green-400/20 via-emerald-400/10 to-teal-400/20",
    hasUpload: true,
    tip: "Brown (dry) to green (wet) ratio should be 3:1 for best results. Keep it moist like a wrung-out sponge!",
    uploadTitle: "Snap Your Scraps",
    uploadDescription: "Upload a photo & we'll analyze it",
    analyzeLabel: "Analyze Scrap",
    analyzeSuccess: "Detected: Mixed vegetable scraps!\n✅ Great for composting",
    resultLabel: "Veggie scraps detected!",
    steps: [
      "Collect organic scraps (vegetable peels, fruit waste, leaves)",
      "Layer with dry materials (sawdust, paper)",
      "Maintain moisture & turn weekly",
      "Wait 6-8 weeks for dark, crumbly compost",
      "Use for all your plants!",
    ],
  },
  {
    id: "soilprep",
    title: "🧪 Soil Preparation",
    emoji: "🪴",
    iconImage: "/soilemoji.jpg",
    description: "Upload soil image, detect soil type, and get preparation steps",
    gradient: "from-amber-400/20 via-orange-400/10 to-red-400/20",
    hasUpload: true,
    tip: "Start with moisture-balanced soil. It should feel crumbly, not dusty or sticky.",
    uploadTitle: "Upload Soil Photo",
    uploadDescription: "Show Uncle Soon your soil so he can suggest preparation steps",
    analyzeLabel: "Analyze Soil",
    analyzeSuccess: "Detected: Soil sample analyzed!\n✅ Preparation guide ready",
    resultLabel: "Soil analyzed!",
    steps: [
      "Analyze soil image first to generate steps",
    ],
  },
];

const detectSoilTypeFromImage = (imageDataUrl: string): Promise<SoilType> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("loamy");
        return;
      }

      const sampleWidth = 64;
      const sampleHeight = 64;
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;
      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);

      const data = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
      let rTotal = 0;
      let gTotal = 0;
      let bTotal = 0;

      for (let i = 0; i < data.length; i += 4) {
        rTotal += data[i];
        gTotal += data[i + 1];
        bTotal += data[i + 2];
      }

      const pixelCount = sampleWidth * sampleHeight;
      const r = rTotal / pixelCount;
      const g = gTotal / pixelCount;
      const b = bTotal / pixelCount;
      const brightness = (r + g + b) / 3;

      if (brightness < 90 && r > g && g > b) {
        resolve("compostRich");
        return;
      }

      if (brightness > 145 && r > g && g > b) {
        resolve("sandy");
        return;
      }

      if (r > 120 && g < 100 && b < 90) {
        resolve("clay");
        return;
      }

      resolve("loamy");
    };

    img.onerror = () => resolve("loamy");
    img.src = imageDataUrl;
  });

const TutorialSection = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [uploadImageById, setUploadImageById] = useState<Record<string, string | null>>({});
  const [analysisCompleteById, setAnalysisCompleteById] = useState<Record<string, boolean>>({});
  const [analyzingById, setAnalyzingById] = useState<Record<string, boolean>>({});
  const [detectedSoilById, setDetectedSoilById] = useState<Record<string, SoilType | undefined>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (tutorialId: string) => {
    setActiveUploadId(tutorialId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tutorialId = activeUploadId || "compost";
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadImageById((prev) => ({ ...prev, [tutorialId]: event.target?.result as string }));
      setAnalysisCompleteById((prev) => ({ ...prev, [tutorialId]: false }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAnalyze = (tutorialId: string) => {
    if (!uploadImageById[tutorialId] || analyzingById[tutorialId]) return;

    setAnalyzingById((prev) => ({ ...prev, [tutorialId]: true }));
    setAnalysisCompleteById((prev) => ({ ...prev, [tutorialId]: false }));

    // Simulate AI analysis only on the frontend.
    setTimeout(() => {
      const uploadedImage = uploadImageById[tutorialId];

      const completeAnalysis = (soilType?: SoilType) => {
        if (soilType) {
          setDetectedSoilById((prev) => ({ ...prev, [tutorialId]: soilType }));
        }

        setAnalyzingById((prev) => ({ ...prev, [tutorialId]: false }));
        setAnalysisCompleteById((prev) => ({ ...prev, [tutorialId]: true }));

        if (tutorialId === "soilprep" && soilType) {
          toast.success(`Detected: ${soilProfiles[soilType].label}\n✅ Preparation guide ready`);
          return;
        }

        const tutorial = tutorials.find((item) => item.id === tutorialId);
        toast.success(tutorial?.analyzeSuccess || "Analysis complete!");
      };

      if (tutorialId === "soilprep" && uploadedImage) {
        detectSoilTypeFromImage(uploadedImage)
          .then((soilType) => completeAnalysis(soilType))
          .catch(() => completeAnalysis("loamy"));
        return;
      }

      completeAnalysis();
    }, 2000);
  };

  return (
    <div className="mb-8">
      <h2 className="text-title text-foreground mb-4">Learn & Grow</h2>

      <div className="space-y-3">
        {tutorials.map((tutorial) => (
          <div key={tutorial.id}>
            {(() => {
              const detectedSoil = detectedSoilById[tutorial.id];
              const shownSteps =
                tutorial.id === "soilprep" && detectedSoil
                  ? soilProfiles[detectedSoil].steps
                  : tutorial.steps;
              const shownTip =
                tutorial.id === "soilprep" && detectedSoil
                  ? soilProfiles[detectedSoil].tip
                  : tutorial.tip;
              const resultLabel =
                tutorial.id === "soilprep" && detectedSoil
                  ? `${soilProfiles[detectedSoil].label} detected!`
                  : tutorial.resultLabel;

              return (
                <>
            {/* Tutorial Card */}
            <button
              onClick={() =>
                setExpandedId(expandedId === tutorial.id ? null : tutorial.id)
              }
              className={`w-full rounded-2xl p-4 card-shadow transition-all active:scale-[0.98] bg-gradient-to-br ${tutorial.gradient} backdrop-blur-sm border border-primary/10 overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    {tutorial.iconImage ? (
                      <img
                        src={tutorial.iconImage}
                        alt={`${tutorial.title} icon`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      tutorial.emoji
                    )}
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
              <div className="bg-card rounded-b-2xl rounded-t-none card-shadow p-5 mt-0 border border-t-0 border-muted animate-fade-up">
                {/* Photo Upload */}
                {tutorial.hasUpload && !uploadImageById[tutorial.id] && (
                  <div className="mb-5">
                    <button
                      onClick={() => handleUpload(tutorial.id)}
                      className="w-full border-2 border-dashed border-primary/40 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload size={20} className="text-primary" />
                      </div>
                      <p className="text-label font-medium text-foreground">
                        {tutorial.uploadTitle}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {tutorial.uploadDescription}
                      </p>
                    </button>
                  </div>
                )}

                {/* Uploaded Image Preview */}
                {uploadImageById[tutorial.id] && (
                  <div className="mb-5 bg-secondary rounded-lg overflow-hidden">
                    <img
                      src={uploadImageById[tutorial.id] || ""}
                      alt={tutorial.id === "soilprep" ? "Uploaded soil" : "Uploaded scraps"}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3 bg-secondary flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {analyzingById[tutorial.id] ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <p className="text-caption text-muted-foreground">
                              Analyzing...
                            </p>
                          </>
                        ) : analysisCompleteById[tutorial.id] ? (
                          <>
                            <Sparkles size={16} className="text-primary" />
                            <p className="text-caption font-medium">
                              {resultLabel}
                            </p>
                          </>
                        ) : (
                          <p className="text-caption text-muted-foreground">
                            Ready to analyze
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setUploadImageById((prev) => ({ ...prev, [tutorial.id]: null }));
                          setAnalyzingById((prev) => ({ ...prev, [tutorial.id]: false }));
                          setAnalysisCompleteById((prev) => ({ ...prev, [tutorial.id]: false }));
                          setDetectedSoilById((prev) => ({ ...prev, [tutorial.id]: undefined }));
                        }}
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {tutorial.hasUpload && uploadImageById[tutorial.id] && !analysisCompleteById[tutorial.id] && (
                  <button
                    onClick={() => handleAnalyze(tutorial.id)}
                    disabled={analyzingById[tutorial.id]}
                    className="w-full mb-5 bg-primary text-primary-foreground rounded-lg py-3 text-label font-medium active:scale-95 transition-transform disabled:opacity-60"
                  >
                    {analyzingById[tutorial.id] ? "Analyzing..." : tutorial.analyzeLabel}
                  </button>
                )}

                {/* Steps */}
                {!tutorial.hasUpload || analysisCompleteById[tutorial.id] ? (
                  <div className="mb-4">
                  <p className="text-label font-semibold text-foreground mb-3">
                    {tutorial.id === "compost"
                      ? "🔄 Composting Steps"
                      : tutorial.id === "soilprep"
                        ? "🧪 Soil Preparation Steps"
                        : "📚 Techniques"}
                  </p>
                  <div className="space-y-2">
                    {shownSteps?.map((step, idx) => (
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
                ) : null}

                {/* Quick Tip */}
                {!tutorial.hasUpload || analysisCompleteById[tutorial.id] ? (
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 flex items-start gap-2">
                    <span className="text-lg mt-0.5">💡</span>
                    <div>
                      <p className="text-xs font-semibold text-primary mb-0.5">
                        Uncle Soon's Tip
                      </p>
                      <p className="text-caption text-foreground">
                        {shownTip}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Action Button */}
                {tutorial.id === "compost" && analysisCompleteById[tutorial.id] && (
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
                </>
              );
            })()}
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
