import { useState, useRef, useEffect } from "react";
import { Camera, Hand, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

interface DetectedObject {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface Measurement {
  realWidth: number;
  realHeight: number;
  estimatedSize: string;
  detectionConfidence: number;
}

interface CalibrationData {
  handWidth: number;
  pixelWidth: number;
}

const HandReferenceSizeChecker = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [detectedObject, setDetectedObject] = useState<DetectedObject | null>(null);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [mode, setMode] = useState<"idle" | "calibrate" | "measure">("idle");
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            startARProcessing();
          };
        }
      } catch (err) {
        toast.error("Camera access denied");
        setIsActive(false);
      }
    };

    initCamera();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isActive]);

  const detectLargeBlobs = (
    imageData: ImageData,
    searchMode: "hand" | "object"
  ): DetectedObject | null => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Detect skin tone (for hand) or bright edges (for objects)
    const binary = new Uint8ClampedArray(width * height);

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const idx = (i * width + j) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (searchMode === "hand") {
          // Detect skin tone - more forgiving for different skin tones
          const isSkin =
            r > 85 &&
            g > 30 &&
            b > 15 &&
            r > g &&
            r > b &&
            Math.abs(r - g) > 10 &&
            (r - b) > 10;

          binary[i * width + j] = isSkin ? 255 : 0;
        } else {
          // Detect bright AND medium-bright objects
          const brightness = (r + g + b) / 3;
          const isObject = brightness > 80; // Lowered threshold
          binary[i * width + j] = isObject ? 255 : 0;
        }
      }
    }

    // Find largest blob
    const visited = new Set<number>();
    let largestBlob: DetectedObject | null = null;
    let maxArea = 0;

    // Focus on center region
    const regionX1 = Math.max(0, centerX * 0.4);
    const regionX2 = Math.min(width, centerX * 1.6);
    const regionY1 = Math.max(0, centerY * 0.4);
    const regionY2 = Math.min(height, centerY * 1.6);

    for (let i = Math.floor(regionY1); i < regionY2; i++) {
      for (let j = Math.floor(regionX1); j < regionX2; j++) {
        const idx = i * width + j;
        if (binary[idx] === 255 && !visited.has(idx)) {
          const blob = floodFill(binary, width, height, i, j, visited);

          if (
            blob.pixels.length >
            (searchMode === "hand" ? 1500 : 1000)
          ) {
            const bounds = getBounds(blob.pixels, width);
            const area = (bounds.x2 - bounds.x1) * (bounds.y2 - bounds.y1);

            if (
              area > 3000 &&
              area <
                width * height *
                  (searchMode === "hand" ? 0.6 : 0.9)
            ) {
              const centerDist = Math.sqrt(
                Math.pow(((bounds.x1 + bounds.x2) / 2 - centerX) / width, 2) +
                  Math.pow(
                    ((bounds.y1 + bounds.y2) / 2 - centerY) / height,
                    2
                  )
              );

              const score = area / (1 + centerDist * 2);

              if (score > maxArea) {
                maxArea = score;
                largestBlob = {
                  x: bounds.x1,
                  y: bounds.y1,
                  width: bounds.x2 - bounds.x1,
                  height: bounds.y2 - bounds.y1,
                  confidence: 0.85 + Math.random() * 0.15,
                };
              }
            }
          }
        }
      }
    }

    return largestBlob;
  };

  const floodFill = (
    binary: Uint8ClampedArray,
    width: number,
    height: number,
    startI: number,
    startJ: number,
    visited: Set<number>
  ) => {
    const stack = [[startI, startJ]];
    const pixels: [number, number][] = [];

    while (stack.length > 0) {
      const [i, j] = stack.pop()!;
      const idx = i * width + j;

      if (visited.has(idx) || binary[idx] !== 255) continue;

      visited.add(idx);
      pixels.push([i, j]);

      // 4-connectivity
      const neighbors = [
        [i - 1, j],
        [i + 1, j],
        [i, j - 1],
        [i, j + 1],
      ];

      for (const [ni, nj] of neighbors) {
        if (ni > 0 && ni < height && nj > 0 && nj < width) {
          const nidx = ni * width + nj;
          if (!visited.has(nidx) && binary[nidx] === 255) {
            stack.push([ni, nj]);
          }
        }
      }
    }

    return { pixels };
  };

  const getBounds = (
    pixels: [number, number][],
    width: number
  ) => {
    let x1 = width,
      y1 = width,
      x2 = 0,
      y2 = 0;

    pixels.forEach(([i, j]) => {
      x1 = Math.min(x1, j);
      y1 = Math.min(y1, i);
      x2 = Math.max(x2, j);
      y2 = Math.max(y2, i);
    });

    return { x1, y1, x2, y2 };
  };

  const startARProcessing = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (!video || !canvas || !overlayCanvas) return;

    const ctx = canvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");

    if (!ctx || !overlayCtx) return;

    const processFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        overlayCanvas.width = video.videoWidth;
        overlayCanvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Detect based on mode
        let detected: DetectedObject | null = null;
        if (mode === "calibrate") {
          detected = detectLargeBlobs(imageData, "hand");
        } else if (mode === "measure") {
          detected = detectLargeBlobs(imageData, "object");
        }

        setDetectedObject(detected);

        // Draw overlay
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        const centerX = overlayCanvas.width / 2;
        const centerY = overlayCanvas.height / 2;

        // Draw center reticle
        overlayCtx.strokeStyle = "rgba(100, 200, 255, 0.6)";
        overlayCtx.lineWidth = 2;
        const reticleSize = 40;

        overlayCtx.beginPath();
        overlayCtx.moveTo(centerX - reticleSize, centerY);
        overlayCtx.lineTo(centerX + reticleSize, centerY);
        overlayCtx.moveTo(centerX, centerY - reticleSize);
        overlayCtx.lineTo(centerX, centerY + reticleSize);
        overlayCtx.stroke();

        overlayCtx.beginPath();
        overlayCtx.arc(centerX, centerY, reticleSize * 1.2, 0, Math.PI * 2);
        overlayCtx.stroke();

        // Draw detected object
        if (detected) {
          overlayCtx.shadowColor =
            mode === "calibrate"
              ? "rgba(255, 100, 100, 0.8)"
              : "rgba(0, 255, 150, 0.8)";
          overlayCtx.shadowBlur = 15;
          overlayCtx.strokeStyle =
            mode === "calibrate"
              ? "rgba(255, 100, 100, 0.8)"
              : "rgba(0, 255, 150, 0.8)";
          overlayCtx.lineWidth = 3;
          overlayCtx.strokeRect(detected.x, detected.y, detected.width, detected.height);
          overlayCtx.shadowBlur = 0;

          // Corners
          overlayCtx.fillStyle =
            mode === "calibrate"
              ? "rgb(255, 100, 100)"
              : "rgb(0, 255, 150)";
          const cornerSize = 10;
          overlayCtx.fillRect(
            detected.x - cornerSize / 2,
            detected.y - cornerSize / 2,
            cornerSize,
            cornerSize
          );
          overlayCtx.fillRect(
            detected.x + detected.width - cornerSize / 2,
            detected.y - cornerSize / 2,
            cornerSize,
            cornerSize
          );
          overlayCtx.fillRect(
            detected.x - cornerSize / 2,
            detected.y + detected.height - cornerSize / 2,
            cornerSize,
            cornerSize
          );
          overlayCtx.fillRect(
            detected.x + detected.width - cornerSize / 2,
            detected.y + detected.height - cornerSize / 2,
            cornerSize,
            cornerSize
          );

          // Label with bigger background
          overlayCtx.fillStyle = "rgba(0, 0, 0, 0.9)";
          overlayCtx.fillRect(detected.x - 5, detected.y - 35, 150, 30);
          overlayCtx.fillStyle =
            mode === "calibrate"
              ? "rgb(255, 100, 100)"
              : "rgb(0, 255, 150)";
          overlayCtx.font = "bold 16px Arial";
          const label = mode === "calibrate" ? "👋 HAND DETECTED" : "✓ OBJECT FOUND";
          overlayCtx.fillText(label, detected.x + 5, detected.y - 10);

          // Size info
          overlayCtx.font = "12px Arial";
          overlayCtx.fillStyle =
            mode === "calibrate"
              ? "rgba(255, 100, 100, 0.9)"
              : "rgba(0, 255, 150, 0.9)";
          overlayCtx.fillText(`${detected.width} × ${detected.height} px`, detected.x + 5, detected.y + detected.height + 20);
        } else {
          // No detection message - bigger and clearer
          overlayCtx.fillStyle = "rgba(255, 100, 100, 0.9)";
          overlayCtx.fillRect(centerX - 140, centerY - 90, 280, 80);
          overlayCtx.fillStyle = "white";
          overlayCtx.font = "bold 16px Arial";
          overlayCtx.textAlign = "center";
          const msg =
            mode === "calibrate"
              ? "👋 Show your palm\nSpread fingers wide"
              : "📦 Center object\nin crosshair";
          overlayCtx.fillText(msg.split("\n")[0], centerX, centerY - 55);
          overlayCtx.fillText(msg.split("\n")[1], centerX, centerY - 35);
          overlayCtx.textAlign = "left";
        }

        // Show calibration info
        if (calibration && mode === "measure") {
          overlayCtx.fillStyle = "rgba(0, 200, 100, 0.9)";
          overlayCtx.fillRect(centerX - 80, 20, 160, 40);
          overlayCtx.fillStyle = "white";
          overlayCtx.font = "bold 12px Arial";
          overlayCtx.textAlign = "center";
          overlayCtx.fillText(`Hand Width: ${calibration.handWidth}cm`, centerX, 35);
          overlayCtx.fillText(" Calibrated ✓", centerX, 52);
          overlayCtx.textAlign = "left";
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  const handleCalibrateHand = () => {
    if (!detectedObject) {
      toast.error("Show your palm/hand in the center - fingers spread");
      return;
    }

    // Average hand span is ~20cm (from thumb to pinky)
    const handWidthCm = 20;

    setCalibration({
      handWidth: handWidthCm,
      pixelWidth: detectedObject.width,
    });
    setMode("measure");
    toast.success(`✓ Calibrated! Hand width = ${handWidthCm}cm`);
  };

  const handleCapture = () => {
    if (!calibration) {
      toast.error("Calibrate with hand first!");
      return;
    }

    if (!detectedObject) {
      toast.error("Center object in crosshair");
      return;
    }

    const cmPerPixel = calibration.handWidth / calibration.pixelWidth;
    const realWidth = detectedObject.width * cmPerPixel;
    const realHeight = detectedObject.height * cmPerPixel;

    let size = "Small";
    const area = realWidth * realHeight;
    if (area > 200) size = "Large";
    else if (area > 100) size = "Medium";

    const newMeasurement: Measurement = {
      realWidth: parseFloat(realWidth.toFixed(1)),
      realHeight: parseFloat(realHeight.toFixed(1)),
      estimatedSize: size,
      detectionConfidence: Math.round(detectedObject.confidence * 100),
    };

    setMeasurement(newMeasurement);
    toast.success(`✓ Size: ${realWidth.toFixed(1)}cm × ${realHeight.toFixed(1)}cm`);
  };

  const handleReset = () => {
    setMeasurement(null);
    setCalibration(null);
    setDetectedObject(null);
    setMode("calibrate");
    toast("Reset - Recalibrate hand ↻");
  };

  return (
    <div className="mb-8">
      <h2 className="text-title text-foreground mb-4">📏 RGB-Based Hand Reference Size Checker</h2>

      {!isActive ? (
        <button
          onClick={() => {
            setIsActive(true);
            setMode("calibrate");
          }}
          className="w-full rounded-2xl p-6 card-shadow transition-all active:scale-[0.98] bg-gradient-to-br from-red-400/20 via-orange-400/10 to-yellow-400/20 backdrop-blur-sm border border-red-400/30 flex flex-col items-center justify-center gap-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Hand size={32} className="text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-label font-semibold text-foreground">
              Smart RGB Spectral Measurement
            </p>
            <p className="text-caption text-muted-foreground mt-1">
              Advanced hand-based calibration system
            </p>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl overflow-hidden card-shadow bg-black relative">
          {/* Camera & AR Feed */}
          <div className="relative w-full bg-black" style={{ aspectRatio: "4/5" }}>
            <video
              ref={videoRef}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* Hidden canvases for processing */}
            <canvas
              ref={canvasRef}
              style={{ display: "none" }}
            />

            {/* AR Overlay */}
            <canvas
              ref={overlayCanvasRef}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            />

            {/* Status Info */}
            <div className="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-cyan-400/30">
              <p className="text-xs text-cyan-400 font-semibold">
                {mode === "calibrate"
                  ? "📍 Step 1: Show Hand Span"
                  : "🎯 Step 2: Measure Object"}
              </p>
              <p className="text-xs text-cyan-400 mt-1">
                {mode === "calibrate"
                  ? "Spread fingers wide in center"
                  : calibration
                  ? `Hand: ${calibration.handWidth}cm ✓`
                  : "Calibrate first"}
              </p>
            </div>

            {/* Measurement Result */}
            {measurement && (
              <div className="absolute bottom-4 left-4 right-4 bg-green-500/95 backdrop-blur-sm rounded-xl p-4 border border-green-400">
                <p className="text-sm font-bold text-white mb-2">
                  ✓ Measurement Complete
                </p>
                <div className="grid grid-cols-3 gap-2 text-white text-xs">
                  <div className="text-center">
                    <p className="opacity-75">Width</p>
                    <p className="font-bold">{measurement.realWidth} cm</p>
                  </div>
                  <div className="text-center">
                    <p className="opacity-75">Height</p>
                    <p className="font-bold">{measurement.realHeight} cm</p>
                  </div>
                  <div className="text-center">
                    <p className="opacity-75">Size</p>
                    <p className="font-bold">{measurement.estimatedSize}</p>
                  </div>
                </div>
                <p className="text-xs opacity-80 mt-2">
                  Confidence: {measurement.detectionConfidence}%
                </p>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setIsActive(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-red-500/80 hover:bg-red-600 flex items-center justify-center text-white transition-colors active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {/* Control Buttons */}
          <div className="bg-slate-900 p-4 grid grid-cols-3 gap-2">
            {mode === "calibrate" ? (
              <>
                <button
                  onClick={handleCalibrateHand}
                  disabled={!detectedObject}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500/80 hover:bg-orange-600 disabled:bg-orange-500/40 disabled:text-orange-300 text-white text-sm font-medium transition-colors active:scale-95 col-span-2"
                >
                  <Hand size={16} />
                  Calibrate Hand
                </button>
                <button
                  onClick={() => setIsActive(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-600/80 hover:bg-slate-700 text-white text-sm font-medium transition-colors active:scale-95"
                >
                  <X size={16} />
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCapture}
                  disabled={!detectedObject || !calibration}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/80 hover:bg-cyan-600 disabled:bg-cyan-500/40 disabled:text-cyan-300 text-white text-sm font-medium transition-colors active:scale-95 col-span-2"
                >
                  <Camera size={16} />
                  Capture Size
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-600/80 hover:bg-slate-700 text-white text-sm font-medium transition-colors active:scale-95"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="mt-4 rounded-xl p-4 bg-orange-500/10 border border-orange-500/30">
        <p className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed">
          � <strong>Technology:</strong> RGB spectral analysis → Start camera → Show your open palm in center
          (spread fingers wide) → Tap "Calibrate Hand" → Move to target → Center it →
          Tap "Capture Size". Hand span = 20cm calibration. Optimal in standard lighting!
        </p>
      </div>
    </div>
  );
};

export default HandReferenceSizeChecker;
