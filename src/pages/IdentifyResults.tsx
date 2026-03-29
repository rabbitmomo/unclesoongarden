import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Zap, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import uncleSoon from "@/assets/uncle-soon.png";

interface AnalysisResult {
  icon: string;
  toolName: string;
  result: string;
  confidence?: number;
  severity: "good" | "warning" | "danger";
  details: string;
}

const IdentifyResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const analysisResults: AnalysisResult[] = [
    {
      icon: "🍎",
      toolName: "Ripeness Detection",
      result: "72% Unripe",
      confidence: 94,
      severity: "warning",
      details: "Your fruit needs 5-7 more days to reach optimal harvest ripeness. Current size and color suggest it's still in the development phase.",
    },
    {
      icon: "🍃",
      toolName: "Disease Detection",
      result: "No Disease Found",
      confidence: 98,
      severity: "good",
      details: "Excellent news! Leaves show no signs of fungal, bacterial, or viral infections. Keep maintaining current care practices.",
    },
    {
      icon: "🐛",
      toolName: "Pest Detection",
      result: "Low Risk",
      confidence: 96,
      severity: "good",
      details: "No aphids, mites, whiteflies, or other common pests detected. Your plant is pest-free!",
    },
    {
      icon: "💧",
      toolName: "Water Stress Analysis",
      result: "Slightly Dry",
      confidence: 87,
      severity: "warning",
      details: "Leaf edges showing minor curl indicating slight water stress. Recommend watering in the next 6-12 hours.",
    },
    {
      icon: "🌦️",
      toolName: "Weather Integration",
      result: "Rain Expected PM",
      severity: "good",
      details: "72% chance of rain this afternoon in your region. Skip evening watering and let nature hydrate instead.",
    },
    {
      icon: "📈",
      toolName: "Growth Tracking",
      result: "+12% Growth",
      confidence: 91,
      severity: "good",
      details: "Strong growth rate! Compared to 3 days ago, your plant has grown 12%. Continue current nutrition schedule.",
    },
  ];

  const recommendations = [
    {
      action: "Water your plant this morning",
      reason: "Soil moisture is low & rain may come later — morning watering is best",
      priority: "high" as const,
    },
    {
      action: "Do not harvest yet",
      reason: "Ripeness at 72% — wait 5-7 more days for optimal flavor",
      priority: "medium" as const,
    },
    {
      action: "Skip evening watering",
      reason: "72% rain probability in the afternoon will naturally hydrate",
      priority: "medium" as const,
    },
    {
      action: "Check again in 2 days",
      reason: "Growth is on track, no disease or pest issues found",
      priority: "low" as const,
    },
  ];

  const handleDownloadReport = () => {
    toast.success("Report downloaded as PDF! 📄");
  };

  const handleShareReport = () => {
    toast.success("Report link copied! Shared with family 👨‍👩‍👧");
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 pt-5 pb-4 flex items-center justify-between border-b border-border">
        <button
          onClick={() => navigate("/identify")}
          className="flex items-center gap-2 text-primary active:opacity-70"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-display">Analysis Report</h1>
        <div className="w-8" />
      </div>

      <div className="px-4 pt-6 pb-8 space-y-6">
        {/* Success Message */}
        <div className="bg-gradient-to-br from-green-400/20 to-emerald-400/10 rounded-2xl p-5 border border-green-400/30 card-shadow">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-label font-semibold text-foreground">Analysis Complete!</p>
              <p className="text-caption text-muted-foreground mt-1">
                6 AI tools have analyzed your plant. Overall health: Good ✓
              </p>
            </div>
          </div>
        </div>

        {/* Uncle Soon Message */}
        <div className="bg-card rounded-2xl p-5 card-shadow flex items-start gap-3">
          <img
            src={uncleSoon}
            alt="Uncle Soon"
            className="w-11 h-11 rounded-full border-2 border-primary flex-shrink-0"
            width={44}
            height={44}
          />
          <div>
            <p className="text-label text-primary">Uncle Soon says:</p>
            <p className="text-body text-foreground mt-1">
              Your plant is doing well! Just needs a bit of water soon and some patience for ripening. Keep up the good work! 🌱
            </p>
          </div>
        </div>

        {/* Detailed Results - Horizontal Scrollable Cards */}
        <div className="space-y-4">
          <p className="text-label font-semibold text-foreground">📊 Detailed Analysis</p>

          {/* Scrollable Analysis Cards */}
          <div className="overflow-x-auto scrollbar-visible pb-2">
            <div className="flex gap-4 min-w-min">
              {analysisResults.map((result, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-80 bg-card rounded-2xl p-5 card-shadow space-y-4 border border-border"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-title text-foreground">{result.toolName}</p>
                      <p className="text-body-lg font-semibold text-primary mt-2">{result.result}</p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        result.severity === "good"
                          ? "bg-green-500/20"
                          : result.severity === "warning"
                            ? "bg-amber-500/20"
                            : "bg-red-500/20"
                      }`}
                    >
                      <span className="text-lg">{result.icon}</span>
                    </div>
                  </div>

                  {result.confidence !== undefined && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-caption text-muted-foreground">Confidence</span>
                        <span className="text-label font-semibold text-primary">{result.confidence}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-body text-foreground leading-relaxed">{result.details}</p>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      result.severity === "good"
                        ? "bg-green-500/10 text-green-700"
                        : result.severity === "warning"
                          ? "bg-amber-500/10 text-amber-700"
                          : "bg-red-500/10 text-red-700"
                    }`}
                  >
                    {result.severity === "good" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <span className="text-caption font-medium">
                      {result.severity === "good"
                        ? "No Action Needed"
                        : result.severity === "warning"
                          ? "Monitor & Take Action"
                          : "Immediate Action Required"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-3">
          <p className="text-label font-semibold text-foreground">🎯 What You Should Do</p>
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3 border-l-4 ${
                rec.priority === "high"
                  ? "bg-red-500/5 border-red-500"
                  : rec.priority === "medium"
                    ? "bg-amber-500/5 border-amber-500"
                    : "bg-blue-500/5 border-blue-500"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">
                  {rec.priority === "high" ? "🔴" : rec.priority === "medium" ? "🟡" : "🔵"}
                </span>
                <div>
                  <p className="text-label font-semibold text-foreground">{rec.action}</p>
                  <p className="text-caption text-muted-foreground mt-0.5">{rec.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleDownloadReport}
            className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl py-3 text-label font-medium active:scale-[0.97] transition-transform"
          >
            <Download size={18} /> Download
          </button>
          <button
            onClick={handleShareReport}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-label font-medium active:scale-[0.97] transition-transform"
          >
            <Share2 size={18} /> Share
          </button>
        </div>

        {/* Snap Again Button */}
        <button
          onClick={() => navigate("/identify")}
          className="w-full flex items-center justify-center gap-2 bg-card border-2 border-primary/30 text-primary rounded-xl py-3 text-label font-medium active:scale-[0.97] transition-transform"
        >
          <Zap size={18} /> Analyze Another Plant
        </button>
      </div>
    </div>
  );
};

export default IdentifyResultsPage;
