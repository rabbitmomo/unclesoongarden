import { useParams, useNavigate, useLocation } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import PhotoPromptCard from "@/components/PhotoPromptCard";
import AIToolResult from "@/components/AIToolResult";
import DecisionEngine from "@/components/DecisionEngine";
import { ArrowLeft, Droplets, Sun, Sprout, Calendar, Camera } from "lucide-react";
import { getMyGardenPlants } from "@/lib/mygarden-storage";

const toDisplayPlantName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const parsePercentFromText = (text?: string): number | undefined => {
  if (!text) return undefined;
  const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return undefined;
  const numeric = Number(match[1]);
  if (!Number.isFinite(numeric)) return undefined;
  return Math.max(0, Math.min(100, numeric));
};

const parseSignedPercentFromText = (text?: string): number | undefined => {
  if (!text) return undefined;
  const match = text.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
  if (!match) return undefined;
  const numeric = Number(match[1]);
  if (!Number.isFinite(numeric)) return undefined;
  return numeric;
};

const plantData: Record<string, any> = {
  "1": {
    name: "Chili Plant",
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&h=300&fit=crop",
    status: "healthy" as const,
    stage: "Growing",
    daysSincePlanted: 45,
    lastPhoto: "2 hours ago",
    timeline: [
      { date: "Mar 1", event: "🌱 Seed planted", detail: "Started germination" },
      { date: "Mar 10", event: "🌿 First leaves", detail: "Seedling sprouted" },
      { date: "Mar 20", event: "💧 Fertilized", detail: "Organic fertilizer added" },
      { date: "Today", event: "📸 Health check", detail: "Plant looks healthy" },
    ],
    tips: [
      { icon: Droplets, text: "Water twice daily", detail: "Morning & evening" },
      { icon: Sun, text: "6 hours of sunlight", detail: "Direct sunlight preferred" },
      { icon: Sprout, text: "Fertilize bi-weekly", detail: "Next feed in 3 days" },
    ],
    aiTools: [
      {
        icon: "🍎",
        toolName: "Ripeness Detection",
        description: "Roboflow ML model — analyzing fruit maturity",
        result: { label: "72% Unripe", confidence: 72, severity: "warning" as const, details: "Fruit needs 5-7 more days to reach optimal harvest" },
      },
      {
        icon: "🍃",
        toolName: "Disease Detection",
        description: "CNN vision model — scanning for infections",
        result: { label: "No Disease Found", confidence: 95, severity: "good" as const, details: "Leaves show no signs of fungal or bacterial infection" },
      },
      {
        icon: "🐛",
        toolName: "Pest Detection",
        description: "YOLO object detection — identifying pests",
        result: { label: "Low Risk", confidence: 88, severity: "good" as const, details: "No aphids, mites, or whiteflies detected" },
      },
      {
        icon: "💧",
        toolName: "Water Stress Analysis",
        description: "Leaf color & droop analysis — hydration check",
        result: { label: "Slightly Dry", confidence: 65, severity: "warning" as const, details: "Leaf edges showing minor curl — water recommended today" },
      },
      {
        icon: "🌦",
        toolName: "Weather Integration",
        description: "Local forecast API — Malaysia region",
        result: { label: "Rain Expected PM", severity: "good" as const, details: "72% chance of rain this afternoon — skip evening watering" },
      },
      {
        icon: "📈",
        toolName: "Growth Tracking",
        description: "Photo comparison AI — measuring progress",
        result: { label: "+12% Growth", confidence: 82, severity: "good" as const, details: "Healthy growth rate compared to 3 days ago" },
      },
    ],
    decisions: [
      { action: "Water your plant this morning", reason: "Soil moisture is low & rain may come later — morning watering is best", priority: "high" as const },
      { action: "Do not harvest yet", reason: "Ripeness at 72% — wait 5-7 more days for optimal flavor", priority: "medium" as const },
      { action: "Skip evening watering", reason: "72% rain probability in the afternoon will naturally hydrate", priority: "medium" as const },
      { action: "Check again in 2 days", reason: "Growth is on track, no disease or pest issues found", priority: "low" as const },
    ],
    verdict: "Your plant is healthy but not yet ready for harvest. Keep watering and check again in 2 days.",
  },
  "2": {
    name: "Tomato Plant",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500&h=300&fit=crop",
    status: "attention" as const,
    stage: "Flowering",
    daysSincePlanted: 30,
    lastPhoto: "Yesterday",
    timeline: [
      { date: "Mar 5", event: "🌱 Seed planted", detail: "Started germination" },
      { date: "Mar 15", event: "🌿 Growing well", detail: "Plant developing" },
      { date: "Today", event: "⚠️ Needs attention", detail: "Leaves slightly yellowing" },
    ],
    tips: [
      { icon: Droplets, text: "Reduce watering", detail: "Soil may be too wet" },
      { icon: Sun, text: "Move to partial shade", detail: "Avoid afternoon sun" },
      { icon: Sprout, text: "Add potassium", detail: "Helps with flowering" },
    ],
    aiTools: [
      {
        icon: "🍎",
        toolName: "Ripeness Detection",
        description: "Roboflow ML model — analyzing fruit maturity",
        result: { label: "45% Unripe", confidence: 68, severity: "warning" as const, details: "Flowers present, fruit development in progress" },
      },
      {
        icon: "🍃",
        toolName: "Disease Detection",
        description: "CNN vision model — scanning for infections",
        result: { label: "Minor Issues", confidence: 78, severity: "warning" as const, details: "Slight yellowing detected on lower leaves. Monitor closely" },
      },
      {
        icon: "🐛",
        toolName: "Pest Detection",
        description: "YOLO object detection — identifying pests",
        result: { label: "No Pests", confidence: 92, severity: "good" as const, details: "Plant is pest-free" },
      },
      {
        icon: "💧",
        toolName: "Water Stress Analysis",
        description: "Leaf color & droop analysis — hydration check",
        result: { label: "Over-watered", confidence: 75, severity: "warning" as const, details: "Soil moisture is too high. Reduce watering frequency" },
      },
      {
        icon: "🌦",
        toolName: "Weather Integration",
        description: "Local forecast API — Malaysia region",
        result: { label: "Partial Shade Needed", severity: "good" as const, details: "High UV index this week. Move to partial shade" },
      },
      {
        icon: "📈",
        toolName: "Growth Tracking",
        description: "Photo comparison AI — measuring progress",
        result: { label: "+8% Growth", confidence: 80, severity: "good" as const, details: "Moderate growth rate. Expected for flowering stage" },
      },
    ],
    decisions: [
      { action: "Reduce watering immediately", reason: "Soil is too wet and causing leaf yellowing", priority: "high" as const },
      { action: "Move to partial shade", reason: "High UV index this week may stress the plant", priority: "high" as const },
      { action: "Add potassium fertilizer", reason: "Helps flower development and strengthens leaves", priority: "medium" as const },
      { action: "Schedule follow-up check", reason: "Monitor yellowing leaves over next 3 days", priority: "medium" as const },
    ],
    verdict: "Your Tomato plant needs immediate attention. Reduce watering and provide partial shade. The yellowing should improve within 3 days.",
  },
  "3": {
    name: "Kangkung",
    image: "/kangkung.jpeg",
    status: "healthy" as const,
    stage: "Ready to Harvest",
    daysSincePlanted: 21,
    lastPhoto: "3 hours ago",
    timeline: [
      { date: "Mar 1", event: "🌱 Seeds sown", detail: "Direct sowing" },
      { date: "Today", event: "✅ Ready!", detail: "Can be harvested now" },
    ],
    tips: [
      { icon: Droplets, text: "Keep soil moist", detail: "Water daily" },
      { icon: Sun, text: "Bright sunlight", detail: "Full sun exposure" },
    ],
    aiTools: [
      {
        icon: "🍎",
        toolName: "Ripeness Detection",
        description: "Roboflow ML model — analyzing fruit maturity",
        result: { label: "100% Ready", confidence: 98, severity: "good" as const, details: "Kangkung is at peak harvest maturity" },
      },
      {
        icon: "🍃",
        toolName: "Disease Detection",
        description: "CNN vision model — scanning for infections",
        result: { label: "Healthy Leaves", confidence: 96, severity: "good" as const, details: "No disease detected. Leaves are vibrant and strong" },
      },
      {
        icon: "🐛",
        toolName: "Pest Detection",
        description: "YOLO object detection — identifying pests",
        result: { label: "No Pests", confidence: 94, severity: "good" as const, details: "Pest-free. Safe to harvest" },
      },
      {
        icon: "💧",
        toolName: "Water Stress Analysis",
        description: "Leaf color & droop analysis — hydration check",
        result: { label: "Optimal Hydration", confidence: 91, severity: "good" as const, details: "Plant is well-hydrated and crisp" },
      },
      {
        icon: "🌦",
        toolName: "Weather Integration",
        description: "Local forecast API — Malaysia region",
        result: { label: "Perfect Weather", severity: "good" as const, details: "Ideal harvest conditions today. Morning harvest recommended" },
      },
      {
        icon: "📈",
        toolName: "Growth Tracking",
        description: "Photo comparison AI — measuring progress",
        result: { label: "+18% Growth", confidence: 89, severity: "good" as const, details: "Excellent rapid growth. Ready for harvest" },
      },
    ],
    decisions: [
      { action: "Harvest today", reason: "Kangkung has reached peak maturity", priority: "high" as const },
      { action: "Harvest in the morning", reason: "Leaves are crispest in early morning", priority: "high" as const },
      { action: "Cut above soil level", reason: "Allows for regrowth and potential second harvest", priority: "medium" as const },
      { action: "Plan next planting", reason: "Consider replanting for continuous harvest", priority: "low" as const },
    ],
    verdict: "Your Kangkung is perfect for harvest! Cut it this morning for the crispest leaves. You can replant seeds immediately for a second harvest.",
  },
};

const PlantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { tempPlantId?: string } | null;
  const tempGardenPlants = getMyGardenPlants();
  const tempPlantLookupId = routeState?.tempPlantId || (id === "view" ? tempGardenPlants[0]?.id : id);
  const staticPlant = plantData[id || "1"];
  const tempPlant = tempGardenPlants.find((item) => item.id === tempPlantLookupId);

  const plant =
    staticPlant ||
    (tempPlant
      ? {
          name: toDisplayPlantName(tempPlant.name),
          image: tempPlant.image,
          status:
            tempPlant.overallStatus === "good"
              ? ("healthy" as const)
              : tempPlant.overallStatus === "warning"
                ? ("attention" as const)
                : ("problem" as const),
          stage: "Under AI Tracking",
          daysSincePlanted: 1,
          lastPhoto: "just now",
          timeline: [
            {
              date: "Today",
              event: "📸 Identify result saved",
              detail: "This plant was added temporarily from Identify Results.",
            },
          ],
          tips: [
            { icon: Droplets, text: "Follow watering reminder", detail: "Check moisture before watering" },
            { icon: Sun, text: "Ensure enough light", detail: "Keep in bright area with airflow" },
            { icon: Sprout, text: "Track with new photos", detail: "Run Identify again to update progress" },
          ],
          aiTools:
            tempPlant.analysisSnapshot?.results?.length
              ? tempPlant.analysisSnapshot.results.map((item) => ({
                  icon: item.icon || "🌱",
                  toolName: item.toolName,
                  description: item.description || "From identify result",
                  ...(function () {
                    const toolNameLower = item.toolName.toLowerCase();
                    const isRipenessTool = toolNameLower.includes("ripeness");
                    const isGrowthTool = toolNameLower.includes("growth");
                    const ripenessPercent = parsePercentFromText(item.result);
                    const growthSignedPercent = parseSignedPercentFromText(item.result);

                    let metricPercent: number | undefined;
                    let showProgressBar = false;

                    if (isRipenessTool && ripenessPercent !== undefined) {
                      metricPercent = ripenessPercent;
                      showProgressBar = true;
                    } else if (isGrowthTool && growthSignedPercent !== undefined) {
                      metricPercent = Math.min(100, Math.max(0, Math.abs(growthSignedPercent)));
                      showProgressBar = true;
                    }

                    return {
                      result: {
                        label: item.result,
                        confidence: metricPercent,
                        showProgressBar,
                        modelConfidenceText:
                          item.confidence !== undefined
                            ? `Model confidence: ${Math.round(item.confidence)}%`
                            : undefined,
                        severity:
                          item.severity === "danger"
                            ? ("critical" as const)
                            : (item.severity as "good" | "warning"),
                        details: item.details,
                      },
                    };
                  })(),
                }))
              : [
                  {
                    icon: "📊",
                    toolName: "Saved Analysis Snapshot",
                    description: "Temporary My Garden tracking metadata",
                    result: {
                      label: tempPlant.overallDescription || "Analysis captured",
                      confidence: 100,
                      severity:
                        tempPlant.overallStatus === "good"
                          ? ("good" as const)
                          : tempPlant.overallStatus === "warning"
                            ? ("warning" as const)
                            : ("critical" as const),
                      details: `Tracked ${tempPlant.tracking.analysisCount} tools and ${tempPlant.tracking.recommendationCount} recommendations.`,
                    },
                  },
                ],
          decisions:
            tempPlant.analysisSnapshot?.recommendations?.length
              ? tempPlant.analysisSnapshot.recommendations
              : [
                  {
                    action: "Take next tracking photo in 1-2 days",
                    reason: "Helps Uncle Soon compare growth and health over time",
                    priority: "high" as const,
                  },
                  {
                    action: "Keep this entry temporary",
                    reason: "Temporary entries may be cleared when browser storage is cleared",
                    priority: "low" as const,
                  },
                ],
          verdict:
            tempPlant.analysisSnapshot?.uncleSoonMessage ||
            tempPlant.overallDescription ||
            "This temporary plant entry is saved from your latest identify result.",
        }
      : undefined);

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-body-lg">
        Plant not found 😔
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 max-w-md mx-auto">
      {/* Hero Image */}
      <div className="relative">
        <img
          src={plant.image}
          alt={plant.name}
          className="w-full h-52 object-cover"
          width={500}
          height={208}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-full p-2.5 card-shadow active:scale-95 transition-transform"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="px-4 -mt-4 relative">
        {/* Name Card */}
        <div className="bg-card rounded-2xl p-5 card-shadow mb-5">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-display">{plant.name}</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={plant.status} />
            <span className="text-caption text-muted-foreground flex items-center gap-1">
              <Calendar size={14} /> Day {plant.daysSincePlanted}
            </span>
            <span className="text-caption text-muted-foreground flex items-center gap-1">
              <Camera size={14} /> {plant.lastPhoto}
            </span>
          </div>
        </div>

        {/* AI Photo Prompt */}
        {plant.status === "attention" && (
          <div className="mb-5">
            <PhotoPromptCard
              message={`I noticed your ${plant.name} might need help. Let me take a closer look — upload a photo!`}
              plantName={plant.name}
            />
          </div>
        )}

        {/* Timeline */}
        <h2 className="text-title mb-3">Growth Timeline</h2>
        <div className="bg-card rounded-2xl p-5 card-shadow mb-6">
          {plant.timeline.map((item: any, i: number) => (
            <div key={i} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {i < plant.timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border my-1" />
                )}
              </div>
              <div className="pb-5">
                <p className="text-caption text-muted-foreground">{item.date}</p>
                <p className="text-body-lg font-semibold">{item.event}</p>
                <p className="text-caption text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Analysis Results */}
        <h2 className="text-title mb-3">Uncle Soon's Analysis Report</h2>
        <div className="space-y-4">
          {/* All tool results - horizontal scroll like Identify Results */}
          <div className="overflow-x-auto scrollbar-visible pb-2">
            <div className="flex gap-4 min-w-min">
              {plant.aiTools.map((tool: any, i: number) => (
                <div key={i} className="flex-shrink-0 w-80">
                  <AIToolResult
                    icon={tool.icon}
                    toolName={tool.toolName}
                    description={tool.description}
                    status="done"
                    result={tool.result}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Decision Engine */}
          <DecisionEngine
            decisions={plant.decisions}
            overallVerdict={plant.verdict}
            variant="identify"
          />
        </div>

        {/* Care Tips - keep this as the bottom section */}
        <h2 className="text-title mt-6 mb-3">Care Guide</h2>
        <div className="space-y-2.5">
          {plant.tips.map((tip: any, i: number) => (
            <div key={i} className="bg-card rounded-xl p-4 card-shadow flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <tip.icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-body-lg font-semibold">{tip.text}</p>
                <p className="text-caption text-muted-foreground">{tip.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlantDetailPage;
