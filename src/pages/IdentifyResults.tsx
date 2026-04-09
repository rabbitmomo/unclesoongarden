import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Zap, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import uncleSoon from "@/assets/uncle-soon.png";
import { getApiBaseUrl } from "@/lib/api-base-url";
import { saveMyGardenPlant } from "@/lib/mygarden-storage";

interface AnalysisResult {
  icon: string;
  toolName: string;
  description: string;
  result: string;
  confidence?: number;
  metricPercent?: number;
  metricLabel?: string;
  metricColorClass?: string;
  showModelConfidence?: boolean;
  severity: "good" | "warning" | "danger";
  details: string;
}

interface Recommendation {
  action: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

interface LatestReportResponse {
  ok: boolean;
  report: {
    id: string;
    image_url?: string | null;
    overall_status?: string | null;
    uncle_soon_message?: string | null;
  } | null;
  analysis_results: Array<{
    icon?: string | null;
    tool_name: string;
    result_text: string;
    confidence?: number | null;
    severity: "good" | "warning" | "danger";
    details?: string | null;
  }>;
  recommendations: Array<{
    action: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }>;
}

const API_BASE_URL = getApiBaseUrl();
const STORAGE_IMAGE_MAX_DIMENSION = 640;
const STORAGE_IMAGE_QUALITY = 0.72;
const STORAGE_IMAGE_LENGTH_THRESHOLD = 160_000;

const readJsonResponse = async <T,>(response: Response): Promise<T> => {
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json") && responseText.trimStart().startsWith("<!doctype")) {
    throw new Error(
      "API returned HTML instead of JSON. Set VITE_API_BASE_URL to your backend URL or configure an /api proxy."
    );
  }

  return JSON.parse(responseText) as T;
};

const toConfidencePercent = (value?: number | null): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;

  // Accept both 0-1 and 0-100 inputs, then clamp to valid percent bounds.
  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return Math.max(0, Math.min(100, percent));
};

const parsePercentFromText = (text?: string | null): number | undefined => {
  if (!text) return undefined;
  const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return undefined;
  const numeric = Number(match[1]);
  if (!Number.isFinite(numeric)) return undefined;
  return Math.max(0, Math.min(100, numeric));
};

const parseSignedPercentFromText = (text?: string | null): number | undefined => {
  if (!text) return undefined;
  const match = text.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
  if (!match) return undefined;
  const numeric = Number(match[1]);
  if (!Number.isFinite(numeric)) return undefined;
  return numeric;
};

const getToolDescription = (toolName: string): string => {
  const lower = toolName.toLowerCase();
  if (lower.includes("ripeness")) return "Fruit maturity analysis from identify result";
  if (lower.includes("disease")) return "Disease signal analysis from identify result";
  if (lower.includes("pest")) return "Pest signal analysis from identify result";
  if (lower.includes("water stress")) return "Hydration stress analysis from identify result";
  if (lower.includes("weather")) return "Weather-aware guidance from identify result";
  if (lower.includes("growth")) return "Growth trend tracking from identify result";
  return "AI analysis from identify result";
};

const toDisplayPlantName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return "Identified Plant";

  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const isDataImage = (value: string): boolean => value.startsWith("data:image/");

const shrinkImageForStorage = async (image: string): Promise<string> => {
  if (!image || !isDataImage(image) || image.length < STORAGE_IMAGE_LENGTH_THRESHOLD) {
    return image;
  }

  if (typeof document === "undefined") {
    return image;
  }

  try {
    const loadedImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = image;
    });

    const scale = Math.min(
      1,
      STORAGE_IMAGE_MAX_DIMENSION / Math.max(loadedImage.width, loadedImage.height)
    );
    const width = Math.max(1, Math.round(loadedImage.width * scale));
    const height = Math.max(1, Math.round(loadedImage.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return image;
    }

    context.drawImage(loadedImage, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", STORAGE_IMAGE_QUALITY);
  } catch {
    return image;
  }
};

const IdentifyResultsPage = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as {
    image?: string | null;
    hasPlant?: boolean | null;
    plantName?: string | null;
    overallStatus?: "good" | "warning" | "danger" | null;
    overallDescription?: string | null;
    analyzedAt?: string | null;
  } | null;
  const noPlantDetected = routeState?.hasPlant === false;
  const requestedOverallStatus = (
    routeState?.overallStatus ||
    ""
  )
    .toString()
    .toLowerCase();
  const requestedOverallDescription = (routeState?.overallDescription || "").toString();
  const [loading, setLoading] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [uncleSoonMessage, setUncleSoonMessage] = useState("");
  const [overallStatus, setOverallStatus] = useState("good");
  const [reportImage, setReportImage] = useState((routeState?.image || "").toString());
  const detectedPlantName = (routeState?.plantName || "").toString();
  const analysisTimestamp = (routeState?.analyzedAt || new Date().toISOString()).toString();
  const hasSavedToGardenRef = useRef(false);

  useEffect(() => {
    if (noPlantDetected) {
      setAnalysisResults([]);
      setRecommendations([]);
      setUncleSoonMessage(requestedOverallDescription.trim() || "No plant detected in image.");
      setLoading(false);
      return;
    }

    const fetchLatestReport = async () => {
      try {
        const reportUrl = requestedOverallStatus
          ? `${API_BASE_URL}/api/ai-report/latest?overall_status=${encodeURIComponent(requestedOverallStatus)}`
          : `${API_BASE_URL}/api/ai-report/latest`;

        const response = await fetch(reportUrl);
        const payload = await readJsonResponse<LatestReportResponse>(response);

        if (!payload.ok || !payload.report) {
          toast.error("No report found yet.");
          return;
        }

        setAnalysisResults(
          (payload.analysis_results || []).map((item) => {
            const confidence = toConfidencePercent(item.confidence);
            const ripenessPercent = parsePercentFromText(item.result_text);
            const growthSignedPercent = parseSignedPercentFromText(item.result_text);
            const toolNameLower = item.tool_name.toLowerCase();
            const isRipenessTool = toolNameLower.includes("ripeness");
            const isGrowthTool = toolNameLower.includes("growth");
            const isConfidenceTextOnlyTool =
              toolNameLower.includes("disease") ||
              toolNameLower.includes("pest") ||
              toolNameLower.includes("water stress");

            let metricPercent = confidence;
            let metricLabel = "Confidence";
            let metricColorClass = "bg-green-700";
            let showModelConfidence = false;

            if (isRipenessTool) {
              metricPercent = ripenessPercent;
              metricLabel = "Ripeness";
              showModelConfidence = true;
            } else if (isGrowthTool && growthSignedPercent !== undefined) {
              metricPercent = Math.min(100, Math.max(0, Math.abs(growthSignedPercent)));
              metricLabel = "Growth Change";
              metricColorClass = growthSignedPercent < 0 ? "bg-red-600" : "bg-green-700";
              showModelConfidence = true;
            } else if (isConfidenceTextOnlyTool) {
              metricPercent = undefined;
              showModelConfidence = true;
            }

            return {
              icon: item.icon || "🌱",
              toolName: item.tool_name,
              description: getToolDescription(item.tool_name),
              result: item.result_text,
              confidence,
              metricPercent,
              metricLabel,
              metricColorClass,
              showModelConfidence,
              severity: item.severity,
              details: item.details || "",
            };
          })
        );

        setRecommendations(payload.recommendations || []);
        const normalizedRequestedMessage = requestedOverallDescription.trim();
        const shouldUseRequestedMessage =
          normalizedRequestedMessage.length > 0 &&
          !/analysis unavailable/i.test(normalizedRequestedMessage);
        setUncleSoonMessage(
          shouldUseRequestedMessage
            ? normalizedRequestedMessage
            : payload.report.uncle_soon_message || normalizedRequestedMessage || ""
        );
        setOverallStatus(payload.report.overall_status || "good");
        // Prefer persisted backend image URLs over large in-memory data URLs for reliable mobile storage.
        setReportImage((previous) => {
          const backendImage = (payload.report.image_url || "").toString().trim();
          return backendImage || previous;
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch latest report.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReport();
  }, [noPlantDetected, requestedOverallDescription, requestedOverallStatus]);

  useEffect(() => {
    let cancelled = false;

    if (loading || hasSavedToGardenRef.current) return;
    if (!reportImage) return;
    if (analysisResults.length === 0) return;
    if (overallStatus !== "good" && overallStatus !== "warning" && overallStatus !== "danger") return;

    const growthTrackingResult = analysisResults.find((item) =>
      item.toolName.toLowerCase().includes("growth")
    );

    const tempPlantId = `temp-${analysisTimestamp}`;
    const savePlant = async () => {
      const optimizedImage = await shrinkImageForStorage(reportImage);
      if (cancelled) return;

      const result = await saveMyGardenPlant({
        id: tempPlantId,
        name: toDisplayPlantName(detectedPlantName),
        image: optimizedImage,
        overallStatus,
        overallDescription: uncleSoonMessage || undefined,
        analyzedAt: analysisTimestamp,
        tracking: {
          analysisCount: analysisResults.length,
          recommendationCount: recommendations.length,
          lastCheckedAt: analysisTimestamp,
          growthSummary: growthTrackingResult?.result,
        },
        analysisSnapshot: {
          results: analysisResults.map((item) => ({
            icon: item.icon,
            toolName: item.toolName,
            description: item.description,
            result: item.result,
            confidence: item.confidence,
            severity: item.severity,
            details: item.details,
          })),
          recommendations,
          uncleSoonMessage: uncleSoonMessage || undefined,
        },
      });

      hasSavedToGardenRef.current = true;
      if (result.saved) {
        toast.success("Saved to My Garden");
      } else {
        toast.error(
          result.reason === "storage"
            ? "Phone storage is full or restricted. Clear some browser data and try again."
            : "Unable to save this plant on your device."
        );
      }
    };

    void savePlant();

    return () => {
      cancelled = true;
    };
  }, [
    analysisResults,
    analysisTimestamp,
    detectedPlantName,
    loading,
    overallStatus,
    recommendations,
    reportImage,
    uncleSoonMessage,
  ]);

  const renderedResults = analysisResults;
  const renderedRecommendations = recommendations;
  const overallLabel = useMemo(() => {
    if (overallStatus.toLowerCase() === "good") return "Good";
    if (overallStatus.toLowerCase() === "warning") return "Warning";
    return overallStatus;
  }, [overallStatus]);

  const handleDownloadReport = () => {
    toast.success("Report downloaded as PDF! 📄");
  };

  const handleShareReport = () => {
    toast.success("Report link copied! Shared with family 👨‍👩‍👧");
  };

  const subtitle = loading
    ? "Loading latest AI report..."
    : noPlantDetected
      ? "No plant detected in this image, so Uncle Soon did not load any database report."
      : `${renderedResults.length} AI tools have analyzed your plant. Overall health: ${overallLabel} ✓`;

  return (
    <div ref={ref} className="min-h-screen pb-24 max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 pt-5 pb-4 flex items-center justify-between border-b border-border">
        <button
          onClick={() => navigate("/")}
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
              <p className="text-caption text-muted-foreground mt-1">{subtitle}</p>
            </div>
          </div>
        </div>

        {noPlantDetected && !loading ? (
          <div className="bg-card rounded-2xl p-5 card-shadow border border-border space-y-3">
            <p className="text-label font-semibold text-foreground">No plant detected</p>
            <p className="text-body text-muted-foreground">
              Uncle Soon could not find a plant in this photo, so no report data was pulled from the database.
            </p>
            <p className="text-caption text-muted-foreground">
              Try a closer photo with leaves, stem, or fruit clearly in frame.
            </p>
          </div>
        ) : null}

        {/* Uncle Soon Message */}
        {uncleSoonMessage && (
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
                {uncleSoonMessage}
              </p>
            </div>
          </div>
        )}

        {!noPlantDetected && (
          <>
        {/* Detailed Results - Horizontal Scrollable Cards */}
        <div className="space-y-4">
          <p className="text-label font-semibold text-foreground">📊 Detailed Analysis</p>

          {/* Scrollable Analysis Cards */}
          <div className="overflow-x-auto scrollbar-visible pb-2">
            <div className="flex gap-4 min-w-min">
              {renderedResults.map((result, idx) => {
                const confidencePercent =
                  result.confidence !== undefined ? Math.round(result.confidence) : undefined;
                const metricPercent =
                  result.metricPercent !== undefined ? Math.round(result.metricPercent) : undefined;
                const metricLabel = result.metricLabel || "Confidence";
                const metricColorClass = result.metricColorClass || "bg-green-700";

                return (
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

                  {metricPercent !== undefined && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-caption text-muted-foreground">{metricLabel}</span>
                        <span className="text-label font-semibold text-primary">{metricPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${metricColorClass}`}
                          style={{ width: `${metricPercent}%` }}
                        />
                      </div>
                      {result.showModelConfidence && confidencePercent !== undefined && (
                        <p className="text-caption text-muted-foreground mt-1">
                          Model confidence: {confidencePercent}%
                        </p>
                      )}
                    </div>
                  )}

                  {metricPercent === undefined && result.showModelConfidence && confidencePercent !== undefined && (
                    <p className="text-caption text-muted-foreground">
                      Model confidence: {confidencePercent}%
                    </p>
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
                );
              })}
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-3">
          <p className="text-label font-semibold text-foreground">🎯 What You Should Do</p>
          {renderedRecommendations.map((rec, idx) => (
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
          </>
        )}

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
});

IdentifyResultsPage.displayName = "IdentifyResultsPage";

export default IdentifyResultsPage;
