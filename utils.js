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
 */
export function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

/**
 * Hides the error message.
 */
export function hideError() {
  const errorMessage = document.getElementById("error-message");
  errorMessage.classList.add("hidden");
}

/**
 * Sets the loading state for the convert button.
 */
export function setLoading(isLoading, text = "Convert Files") {
  const convertBtnText = document.getElementById("convert-btn-text");
  const convertBtn = document.getElementById("convert-btn");

  convertBtn.disabled = isLoading;
  convertBtnText.textContent = isLoading ? text : "Convert Files";
}
