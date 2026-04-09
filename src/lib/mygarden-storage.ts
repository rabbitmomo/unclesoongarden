import { getApiBaseUrl } from "@/lib/api-base-url";

export type IdentifyOverallStatus = "good" | "warning" | "danger";

export interface MyGardenPlant {
  id: string;
  name: string;
  image: string;
  overallStatus: IdentifyOverallStatus;
  overallDescription?: string;
  analyzedAt: string;
  tracking: {
    analysisCount: number;
    recommendationCount: number;
    lastCheckedAt: string;
    growthSummary?: string;
  };
  analysisSnapshot?: {
    results: Array<{
      icon: string;
      toolName: string;
      description?: string;
      result: string;
      confidence?: number;
      severity: "good" | "warning" | "danger";
      details: string;
    }>;
    recommendations: Array<{
      action: string;
      reason: string;
      priority: "high" | "medium" | "low";
    }>;
    uncleSoonMessage?: string;
  };
}

const API_BASE_URL = getApiBaseUrl();
const DEVICE_ID_KEY = "uncle-soon-device-id";

const isClient = () => typeof window !== "undefined";

const safeGetItem = (key: string): string | null => {
  if (!isClient()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): boolean => {
  if (!isClient()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const ensureDeviceCookie = (deviceId: string) => {
  if (!isClient()) return;
  try {
    document.cookie = `uncle_soon_device_id=${deviceId}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Ignore cookie failures in strict browsers.
  }
};

export const getOrCreateDeviceId = (): string => {
  const existing = safeGetItem(DEVICE_ID_KEY);
  if (existing) {
    ensureDeviceCookie(existing);
    return existing;
  }

  const generated =
    (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
      ? crypto.randomUUID()
      : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  safeSetItem(DEVICE_ID_KEY, generated);
  ensureDeviceCookie(generated);
  return generated;
};

const readJsonResponse = async <T,>(response: Response): Promise<T> => {
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json") && responseText.trimStart().startsWith("<!doctype")) {
    throw new Error("API returned HTML instead of JSON.");
  }

  return JSON.parse(responseText) as T;
};

const isValidStatus = (value: unknown): value is IdentifyOverallStatus =>
  value === "good" || value === "warning" || value === "danger";

const isMyGardenPlant = (value: unknown): value is MyGardenPlant => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as MyGardenPlant;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.image === "string" &&
    isValidStatus(candidate.overallStatus) &&
    typeof candidate.analyzedAt === "string" &&
    !!candidate.tracking &&
    typeof candidate.tracking.analysisCount === "number" &&
    typeof candidate.tracking.recommendationCount === "number" &&
    typeof candidate.tracking.lastCheckedAt === "string" &&
    (candidate.analysisSnapshot === undefined ||
      (Array.isArray(candidate.analysisSnapshot.results) &&
        Array.isArray(candidate.analysisSnapshot.recommendations)))
  );
};

interface ListMyGardenResponse {
  ok: boolean;
  plants: MyGardenPlant[];
}

interface SaveMyGardenResponse {
  ok: boolean;
  id?: string | null;
}

interface RemoveMyGardenResponse {
  ok: boolean;
  removed: boolean;
}

export const getMyGardenPlants = async (): Promise<MyGardenPlant[]> => {
  try {
    const deviceId = getOrCreateDeviceId();
    const response = await fetch(
      `${API_BASE_URL}/api/my-garden?device_id=${encodeURIComponent(deviceId)}`
    );
    const payload = await readJsonResponse<ListMyGardenResponse>(response);
    if (!payload.ok || !Array.isArray(payload.plants)) return [];
    return payload.plants.filter(isMyGardenPlant);
  } catch (error) {
    console.error("Failed to load My Garden plants", error);
    return [];
  }
};

export const saveMyGardenPlant = async (
  plant: MyGardenPlant
): Promise<{ saved: boolean; reason?: "storage" | "network" }> => {
  try {
    const deviceId = getOrCreateDeviceId();
    const response = await fetch(`${API_BASE_URL}/api/my-garden`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_id: deviceId,
        plant,
      }),
    });

    const payload = await readJsonResponse<SaveMyGardenResponse>(response);
    return { saved: Boolean(payload.ok) };
  } catch (error) {
    console.error("Failed to save My Garden plant", error);
    return { saved: false, reason: "network" };
  }
};

export const removeMyGardenPlant = async (plantId: string): Promise<{ removed: boolean }> => {
  try {
    const deviceId = getOrCreateDeviceId();
    const response = await fetch(
      `${API_BASE_URL}/api/my-garden/${encodeURIComponent(plantId)}?device_id=${encodeURIComponent(deviceId)}`,
      {
        method: "DELETE",
      }
    );

    const payload = await readJsonResponse<RemoveMyGardenResponse>(response);
    return { removed: Boolean(payload.ok && payload.removed) };
  } catch (error) {
    console.error("Failed to remove My Garden plant", error);
    return { removed: false };
  }
};
