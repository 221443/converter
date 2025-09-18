// utils.js

/**
 * Utility to format bytes into KB, MB, etc.
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Displays an error message.
 * Receives the error element from the appContext.
 */
export function showError(message, appContext) {
  appContext.errorEl.textContent = message;
  appContext.errorEl.classList.remove("hidden");
}

/**
 * Hides the error message.
 * Receives the error element from the appContext.
 */
export function hideError(appContext) {
  appContext.errorEl.classList.add("hidden");
}

/**
 * Sets the loading state for the convert button.
 * Receives button elements from the appContext.
 */
export function setLoading(isLoading, appContext, text = "Converting...") {
  const { convertBtn, convertBtnText } = appContext;
  convertBtn.disabled = isLoading;
  convertBtnText.textContent = isLoading ? text : "Convert Files";
}