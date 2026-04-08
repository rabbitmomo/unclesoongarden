import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Image, Camera, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/api-base-url";

type IdentifyMode = "source" | "preview" | "analyzing";

interface CapturedImage {
  url: string;
  file?: File;
}

interface AnalyzeImageApiResponse {
  has_plant: boolean;
  overall_status: "good" | "warning" | "danger" | null;
  overall_description: string | null;
  plant_name: string | null;
  debug?: {
    status: string;
    reason?: string | null;
    model?: string | null;
    mime_type?: string | null;
    image_bytes?: number | null;
    raw_response?: string | null;
    parsed_json?: Record<string, unknown> | null;
    parsed_has_plant?: boolean | null;
    parsed_overall_status?: string | null;
    parsed_plant_name?: string | null;
    parsed_overall_description?: string | null;
    result?: Record<string, unknown> | null;
  } | null;
}

const API_BASE_URL = getApiBaseUrl();

const readJsonResponse = async <T,>(response: Response): Promise<T> => {
  const responseText = await response.text();

  if (!response.ok) {
    console.error("Analyze image API error:", response.status, responseText);
    throw new Error(`Analysis failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json") && responseText.trimStart().startsWith("<!doctype")) {
    throw new Error(
      "API returned HTML instead of JSON. Set VITE_API_BASE_URL to your backend URL or configure an /api proxy."
    );
  }

  return JSON.parse(responseText) as T;
};

const IdentifyCameraPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { sourcePlantName?: string | null } | null;
  const sourcePlantName = (routeState?.sourcePlantName || "").toString().trim();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<IdentifyMode>("source");
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle gallery upload
  const handleGalleryUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle camera snap
  const handleCameraSnap = () => {
    cameraInputRef.current?.click();
  };

  // Process image file
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage({
        url: e.target?.result as string,
        file,
      });
      setMode("preview");
    };
    reader.readAsDataURL(file);
  };

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Start analysis
  const handleStartAnalysis = async () => {
    if (!capturedImage?.file) {
      toast.error("Please upload or capture an image first.");
      return;
    }

    setMode("analyzing");
    setAnalyzing(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", capturedImage.file);

    const analyzeRequest = fetch(`${API_BASE_URL}/api/analyze-image?debug=true`, {
      method: "POST",
      body: formData,
    }).then((response) => readJsonResponse<AnalyzeImageApiResponse>(response));

    // Animation-only progress while the request is running.
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return Math.min(prev + Math.random() * 12, 90);
      });
    }, 300);

    try {
      const payload = await analyzeRequest;
      console.log("Gemini analyze result:", payload);
      if (payload.debug) {
        console.log("Gemini analyze debug:", payload.debug);
      }

      clearInterval(interval);
      setProgress(100);

      if (!payload.has_plant) {
        toast.error(payload.overall_description || "No plant detected in image.");
      } else {
        toast.success(
          `Detected ${payload.plant_name || "plant"} (${payload.overall_status || "warning"})`
        );
      }

      setTimeout(() => {
        setAnalyzing(false);
        const resolvedPlantName = (payload.plant_name || sourcePlantName || "").toString().trim();
        navigate("/identify-results", {
          state: {
            image: capturedImage.url,
            plantName: resolvedPlantName || null,
            overallStatus: payload.overall_status,
            overallDescription: payload.overall_description,
            analyzedAt: new Date().toISOString(),
          },
        });
      }, 500);
    } catch (error) {
      console.error("Analyze image request failed:", error);
      clearInterval(interval);
      setAnalyzing(false);
      setMode("preview");
      setProgress(0);
      toast.error("Failed to analyze image. Check console for details.");
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setMode("source");
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 pt-5 pb-4 flex items-center justify-between border-b border-border">
        <h1 className="text-display">Identify Plant</h1>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>
      </div>

      {/* Source Selection */}
      {mode === "source" && (
        <div className="px-4 pt-8 pb-8 space-y-4 animate-fade-up">
          <p className="text-body text-muted-foreground text-center mb-6">
            Show Uncle Soon your plant for instant identification
          </p>

          {/* Take Photo with Camera */}
          <button
            onClick={handleCameraSnap}
            className="w-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border-2 border-primary/30 hover:border-primary/50 active:scale-[0.97] transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center">
              <Camera size={32} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-label font-semibold text-foreground">Snap a Photo</p>
              <p className="text-caption text-muted-foreground mt-1">Take a fresh photo now</p>
            </div>
          </button>

          {/* Upload from Gallery */}
          <button
            onClick={handleGalleryUpload}
            className="w-full bg-gradient-to-br from-blue-400/20 to-blue-400/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 border-2 border-blue-400/30 hover:border-blue-400/50 active:scale-[0.97] transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center">
              <Image size={32} className="text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-label font-semibold text-foreground">Upload from Gallery</p>
              <p className="text-caption text-muted-foreground mt-1">Choose existing photo</p>
            </div>
          </button>

          {/* Tips Section */}
          <div className="bg-card rounded-2xl p-4 card-shadow mt-6 space-y-3">
            <p className="text-label font-semibold text-foreground">📸 Pro Tips:</p>
            <ul className="text-caption text-muted-foreground space-y-2">
              <li>✓ Capture the leaves & stems clearly</li>
              <li>✓ Good lighting helps AI accuracy</li>
              <li>✓ Avoid shadows on the plant</li>
              <li>✓ Close-up works best (10-30cm away)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Preview & Confirm */}
      {mode === "preview" && capturedImage && (
        <div className="px-4 pt-6 pb-8 space-y-4 animate-fade-up">
          {/* Image Preview */}
          <div className="rounded-2xl overflow-hidden border-2 border-primary/30 card-shadow">
            <img
              src={capturedImage.url}
              alt="Plant"
              className="w-full h-64 object-cover"
            />
          </div>
          {/* test push lovable */}

          {/* Image Details */}
          <div className="bg-card rounded-2xl p-4 card-shadow space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-label text-foreground">Image Ready</p>
              <span className="text-caption text-primary font-semibold">✓ Ready to analyze</span>
            </div>
            <p className="text-caption text-muted-foreground">
              This photo will be analyzed by 6 AI tools to identify your plant and detect any issues.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleStartAnalysis}
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-4 text-label font-semibold active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              <Zap size={20} /> {analyzing ? "Analyzing..." : "Analyze Now"}
            </button>
            <button
              onClick={handleRetake}
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl py-3 text-label active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              <Camera size={18} /> Retake Photo
            </button>
          </div>
        </div>
      )}

      {/* Analysis In Progress */}
      {mode === "analyzing" && (
        <div className="px-4 pt-16 pb-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-6 animate-fade-up">
          {/* Animated Preview */}
          {capturedImage && (
            <div className="rounded-2xl overflow-hidden border-2 border-primary/30 card-shadow mb-4">
              <img
                src={capturedImage.url}
                alt="Analyzing"
                className="w-full h-48 object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Analysis Text */}
          <div className="text-center space-y-2">
            <p className="text-title text-foreground">Uncle Soon is analyzing...</p>
            <p className="text-body text-muted-foreground">Running AI detection tools</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <div className="h-3 bg-muted rounded-full overflow-hidden card-shadow">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-center text-caption text-muted-foreground">
              {Math.round(Math.min(progress, 100))}% complete
            </p>
          </div>

          {/* Analysis Steps */}
          <div className="w-full bg-card rounded-2xl p-4 card-shadow space-y-3 mt-6">
            <p className="text-label font-semibold text-foreground mb-2">Running analyses:</p>
            <div className="space-y-2 text-caption">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍎</span>
                <span className={progress > 16 ? "text-foreground" : "text-muted-foreground"}>
                  Ripeness Detection
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🍃</span>
                <span className={progress > 33 ? "text-foreground" : "text-muted-foreground"}>
                  Disease Detection
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🐛</span>
                <span className={progress > 50 ? "text-foreground" : "text-muted-foreground"}>
                  Pest Detection
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💧</span>
                <span className={progress > 66 ? "text-foreground" : "text-muted-foreground"}>
                  Water Stress Analysis
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🌦</span>
                <span className={progress > 83 ? "text-foreground" : "text-muted-foreground"}>
                  Weather Integration
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📈</span>
                <span className={progress > 95 ? "text-foreground" : "text-muted-foreground"}>
                  Growth Tracking
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};

export default IdentifyCameraPage;
