// Resolves the backend API base URL for the frontend.
//
// - Development may fall back to a local backend for convenience.
// - Production MUST provide VITE_API_URL. Missing/blank values in a
//   production build are a configuration error and fail loudly instead of
//   silently calling localhost (which would never work in a deployed SPA).

const isProduction = import.meta.env.PROD === true;

const normalizeBaseUrl = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  // Strip a trailing slash so callers can safely append "/api/...".
  return value.trim().replace(/\/+$/, "");
};

export const getApiBaseUrl = () => {
  const configured = normalizeBaseUrl(import.meta.env.VITE_API_URL);

  if (configured) {
    return configured;
  }

  if (isProduction) {
    throw new Error(
      "VITE_API_URL is not configured. Set it on the frontend host (e.g. Vercel) to the production backend URL.",
    );
  }

  return "http://localhost:5000";
};

export const API_BASE_URL = getApiBaseUrl();