export const fallbackResults = [
  {
    icon: "🍎",
    toolName: "Ripeness Detection",
    result: "72% Unripe",
    confidence: 94,
    severity: "warning",
    details:
      "Your fruit needs 5-7 more days to reach optimal harvest ripeness. Current size and color suggest it's still in the development phase.",
  },
  {
    icon: "🍃",
    toolName: "Disease Detection",
    result: "No Disease Found",
    confidence: 98,
    severity: "good",
    details:
      "Excellent news! Leaves show no signs of fungal, bacterial, or viral infections. Keep maintaining current care practices.",
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
] as const;

export const fallbackRecommendations = [
  {
    action: "Water your plant this morning",
    reason: "Soil moisture is low & rain may come later — morning watering is best",
    priority: "high",
  },
  {
    action: "Do not harvest yet",
    reason: "Ripeness at 72% — wait 5-7 more days for optimal flavor",
    priority: "medium",
  },
  {
    action: "Skip evening watering",
    reason: "72% rain probability in the afternoon will naturally hydrate",
    priority: "medium",
  },
  {
    action: "Check again in 2 days",
    reason: "Growth is on track, no disease or pest issues found",
    priority: "low",
  },
] as const;
