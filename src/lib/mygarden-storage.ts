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

const MY_GARDEN_KEY = "uncle-soon-mygarden";
const LEGACY_TEMP_GARDEN_KEY = "uncle-soon-temp-garden";
const MAX_ITEMS = 20;

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

const parsePlants = (raw: string | null): MyGardenPlant[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMyGardenPlant);
  } catch {
    return [];
  }
};

export const getMyGardenPlants = (): MyGardenPlant[] => {
  const current = parsePlants(safeGetItem(MY_GARDEN_KEY));
  if (current.length > 0) return current;

  // Backward compatibility: read legacy key if the new key is empty.
  return parsePlants(safeGetItem(LEGACY_TEMP_GARDEN_KEY));
};

const setMyGardenPlants = (plants: MyGardenPlant[]) => {
  return safeSetItem(MY_GARDEN_KEY, JSON.stringify(plants));
};

export const saveMyGardenPlant = (
  plant: MyGardenPlant
): { saved: boolean; reason?: "storage" } => {
  const existing = getMyGardenPlants();
  // Upsert by id so revisiting the same analysis can refresh the saved entry.
  const deduped = existing.filter((item) => item.id !== plant.id);
  const updated = [plant, ...deduped].slice(0, MAX_ITEMS);

  if (setMyGardenPlants(updated)) {
    return { saved: true };
  }

  // If mobile storage quota is tight, keep trimming older entries and retry.
  const compacted = [...updated];
  while (compacted.length > 1) {
    compacted.pop();
    if (setMyGardenPlants(compacted)) {
      return { saved: true };
    }
  }

  return { saved: false, reason: "storage" };
};

export const removeMyGardenPlant = (plantId: string): { removed: boolean } => {
  const existing = getMyGardenPlants();
  const updated = existing.filter((item) => item.id !== plantId);

  if (updated.length === existing.length) return { removed: false };

  if (!setMyGardenPlants(updated)) return { removed: false };
  return { removed: true };
};
