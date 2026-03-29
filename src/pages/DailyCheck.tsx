import { Camera, Mic, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import uncleSoon from "@/assets/uncle-soon.png";
import AIToolResult from "@/components/AIToolResult";
import DecisionEngine from "@/components/DecisionEngine";

type AnalysisPhase = "idle" | "scanning" | "results";

const aiTools = [
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
];

const decisions = [
  { action: "Water your plant this morning", reason: "Soil moisture is low & rain may come later — morning watering is best", priority: "high" as const },
  { action: "Do not harvest yet", reason: "Ripeness at 72% — wait 5-7 more days for optimal flavor", priority: "medium" as const },
  { action: "Skip evening watering", reason: "72% rain probability in the afternoon will naturally hydrate", priority: "medium" as const },
  { action: "Check again in 2 days", reason: "Growth is on track, no disease or pest issues found", priority: "low" as const },
];

const DailyCheckPage = () => {
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [toolsComplete, setToolsComplete] = useState(0);

  const handleUpload = () => {
    setPhase("scanning");
    setToolsComplete(0);
  };

  // Simulate tools completing one by one
  useEffect(() => {
    if (phase !== "scanning") return;
    if (toolsComplete >= aiTools.length) {
      const t = setTimeout(() => setPhase("results"), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setToolsComplete((c) => c + 1), 1200);
    return () => clearTimeout(t);
  }, [phase, toolsComplete]);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-md mx-auto">
      <h1 className="text-display text-foreground mb-1">Daily Check</h1>
      <p className="text-body text-muted-foreground mb-6">
        Uncle Soon's AI toolkit will analyze your plant
      </p>

      {phase === "idle" && (
        <div className="space-y-4">
          {/* Uncle Soon Prompt */}
          <div className="bg-card rounded-2xl p-5 card-shadow flex items-start gap-3 mb-2">
            <img src={uncleSoon} alt="Uncle Soon" className="w-11 h-11 rounded-full border-2 border-primary flex-shrink-0" width={44} height={44} />
            <div>
              <p className="text-label text-primary">Uncle Soon</p>
              <p className="text-body-lg text-foreground mt-1">
                Show me your plant today! I'll run <strong>6 AI tools</strong> to give you a full health report. 🌿
              </p>
            </div>
          </div>

          {/* Upload Photo */}
          <button
            onClick={handleUpload}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-10 flex flex-col items-center gap-3 active:scale-[0.97] transition-transform card-shadow relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary/80" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Camera size={36} />
              </div>
              <span className="text-heading">Take a Photo</span>
              <span className="text-body opacity-80">or upload from gallery</span>
            </div>
          </button>

          {/* Voice Input */}
          <button className="w-full bg-card card-shadow text-foreground rounded-2xl py-5 flex items-center justify-center gap-3 text-body-lg font-semibold active:scale-[0.97] transition-transform">
            <Mic size={24} className="text-primary" /> Describe your plant instead
          </button>

          {/* AI Tools Preview */}
          <div className="bg-card rounded-2xl p-4 card-shadow">
            <p className="text-label text-foreground mb-3">🧠 AI Tools I'll Use</p>
            <div className="grid grid-cols-2 gap-2">
              {aiTools.map((tool, i) => (
                <div key={i} className="bg-background rounded-xl p-3 flex items-center gap-2">
                  <span className="text-lg">{tool.icon}</span>
                  <span className="text-caption font-semibold text-foreground leading-tight">{tool.toolName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "scanning" && (
        <div className="space-y-4 animate-fade-up">
          {/* Progress Header */}
          <div className="bg-card rounded-2xl p-5 card-shadow flex items-center gap-3">
            <img src={uncleSoon} alt="Uncle Soon" className="w-11 h-11 rounded-full border-2 border-primary flex-shrink-0" width={44} height={44} />
            <div className="flex-1">
              <p className="text-label text-primary">Uncle Soon is analyzing...</p>
              <p className="text-caption text-muted-foreground">Running {toolsComplete}/{aiTools.length} AI tools</p>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(toolsComplete / aiTools.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tools scanning one by one */}
          {aiTools.map((tool, i) => (
            <AIToolResult
              key={i}
              icon={tool.icon}
              toolName={tool.toolName}
              description={tool.description}
              status={i < toolsComplete ? "done" : "scanning"}
              result={i < toolsComplete ? tool.result : undefined}
              delay={i * 200}
            />
          ))}
        </div>
      )}

      {phase === "results" && (
        <div className="space-y-4 animate-fade-up">
          {/* Summary Header */}
          <div className="bg-card rounded-2xl p-5 card-shadow">
            <div className="flex items-center gap-3 mb-3">
              <img src={uncleSoon} alt="Uncle Soon" className="w-11 h-11 rounded-full border-2 border-primary" width={44} height={44} />
              <div>
                <p className="text-label text-primary">Uncle Soon's Full Report</p>
                <p className="text-heading text-foreground">Analysis Complete ✅</p>
              </div>
            </div>
            <p className="text-body text-muted-foreground">
              6 AI tools scanned your plant. Here's what I found:
            </p>
          </div>

          {/* All tool results */}
          {aiTools.map((tool, i) => (
            <AIToolResult
              key={i}
              icon={tool.icon}
              toolName={tool.toolName}
              description={tool.description}
              status="done"
              result={tool.result}
            />
          ))}

          {/* Decision Engine */}
          <DecisionEngine
            decisions={decisions}
            overallVerdict="Your plant is healthy but not yet ready for harvest. Keep watering and check again in 2 days."
          />

          <button
            onClick={() => { setPhase("idle"); setToolsComplete(0); }}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-title active:scale-[0.97] transition-transform"
          >
            Check Another Plant
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyCheckPage;
