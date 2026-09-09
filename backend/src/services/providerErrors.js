// Shared classification of AI provider failures.
//
// Decides whether a provider error is worth retrying on the OTHER provider
// (transient availability problem) or must propagate immediately (our own
// bug, bad input, or our own misconfigured credentials).
//
// Classification is explicit: HTTP status codes, error names, and
// Node/system error codes. Message-text matching is used only as a last
// resort for network failures, where the Fetch API surfaces a generic
// TypeError.

export const TRANSIENT_PROVIDER_STATUSES = [429, 500, 502, 503, 504];

const NETWORK_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "EPIPE",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);

export const isTimeoutError = (error) =>
  error?.name === "GeminiTimeoutError" ||
  error?.name === "GroqTimeoutError" ||
  error?.name === "AbortError" ||
  error?.code === "ABORT_ERR" ||
  error?.code === "ETIMEDOUT";

export const isNetworkError = (error) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = error.code ?? error.cause?.code;

  if (typeof code === "string" && NETWORK_ERROR_CODES.has(code)) {
    return true;
  }

  // The Fetch API raises a generic TypeError for connection failures.
  // Only treat it as a network error when it is not an abort (aborts are
  // classified as timeouts above) and there is no HTTP status attached.
  if (
    error.name === "TypeError" &&
    error.status === undefined &&
    error.code === undefined
  ) {
    return /fetch failed|network|connection|socket|econn|enotfound|etimedout/i.test(
      error.message || ""
    );
  }

  return false;
};

export const isAuthenticationError = (error) => {
  const status = error?.status ?? error?.code;

  return status === 401 || status === 403;
};

// Transient = the request itself was fine, the provider was not.
// Safe to attempt the fallback provider exactly once.
export const isTransientProviderError = (error) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  // Our own misconfiguration must never trigger a fallback loop.
  if (error.code === "PROVIDER_NOT_CONFIGURED") {
    return false;
  }

  if (isAuthenticationError(error)) {
    return false;
  }

  if (isTimeoutError(error) || isNetworkError(error)) {
    return true;
  }

  const status = error.status ?? (typeof error.code === "number" ? error.code : undefined);

  return TRANSIENT_PROVIDER_STATUSES.includes(status);
};
