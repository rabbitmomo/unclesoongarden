const DEFAULT_BACKEND_URL = "https://unclesoongarden-production.up.railway.app";

export const getApiBaseUrl = (): string => {
  const envValue = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envValue) {
    return envValue.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "";
  }

  const { hostname } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  return isLocalHost ? "" : DEFAULT_BACKEND_URL;
};