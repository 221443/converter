// app.js

import { formatBytes, showError, hideError, setLoading } from "./utils.js";
import { handleImageFile, handlePdfFile } from "./fileHandler.js";
import { convertToPdf, convertToZip } from "./converter.js";

// The App Context object: one place to hold all DOM elements and state.
const appContext = {
  imageInput: document.getElementById("image-input"),
  previewGrid: document.getElementById("preview-grid"),
  imageDetails: document.getElementById("image-details"),
  fileCountEl: document.getElementById("file-count"),
  totalSizeEl: document.getElementById("total-size"),
  formatSelect: document.getElementById("format-select"),
  qualityContainer: document.getElementById("quality-container"),
  qualitySlider: document.getElementById("quality-slider"),
  qualityValue: document.getElementById("quality-value"),
  convertBtn: document.getElementById("convert-btn"),
  convertBtnText: document.getElementById("convert-btn-text"),
  outputSection: document.getElementById("output-section"),
  errorEl: document.getElementById("error-message"),
  canvas: document.getElementById("canvas"),
  ctx: document.getElementById("canvas").getContext("2d"),
  downloadLink: document.getElementById("download-link"),
  downloadBtnText: document.getElementById("download-btn-text"),
  newSizeEl: document.getElementById("new-size"),
  RASTER_SCALE_FACTOR: 10,
  formatBytes: formatBytes,
  imageFiles: [], 
  previewUrls: [], 
};

// --- Event Listeners ---

appContext.imageInput.addEventListener("change", (e) => handleFileSelect(e, appContext));

appContext.formatSelect.addEventListener("change", () => {
  const { formatSelect, qualityContainer } = appContext;
  const selectedFormat = formatSelect.value;
  const isQualityVisible = selectedFormat === "jpeg" || selectedFormat === "webp" || selectedFormat === "jpg";
  qualityContainer.style.display = isQualityVisible ? "block" : "none";
});

appContext.qualitySlider.addEventListener("input", () => {
  appContext.qualityValue.textContent = appContext.qualitySlider.value;
});

appContext.convertBtn.addEventListener("click", () => processFiles(appContext));

// --- Functions ---

async function handleFileSelect(event, context) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  setLoading(true, context);
  context.imageFiles = [];
  context.previewGrid.innerHTML = "";
  hideError(context);
  context.outputSection.classList.remove("visible-section");
  context.outputSection.classList.add("hidden-section");

  const filePromises = Array.from(files).map((file) => {
    if (file.type.startsWith("image/")) {
      return handleImageFile(file);
    } else if (file.type === "application/pdf") {
      return handlePdfFile(file);
    } else {
      console.warn(`Skipping unsupported file type: ${file.name}`);
      return Promise.resolve(null);
    }
  });

  try {
    const results = await Promise.all(filePromises);
    context.imageFiles = results.flat().filter(Boolean);

    if (context.imageFiles.length === 0) {
      showError("No valid image or PDF files were selected.", context);
      context.imageDetails.classList.add("hidden-section");
      return;
    }
    displayPreviewsAndDetails(context);
  } catch (error) {
    console.error("Error loading files:", error);
    showError("There was an error loading one or more files.", context);
  } finally {
    setLoading(false, context);
  }
}

function displayPreviewsAndDetails(context) {
  const { imageFiles, previewGrid, fileCountEl, totalSizeEl, imageDetails, formatBytes } = context;
  let totalSize = 0;
  previewGrid.innerHTML = "";

  imageFiles.forEach(({ file, previewUrl }) => {
    totalSize += file.size;
    const previewEl = document.createElement("img");
    previewEl.src = previewUrl;
    if (previewUrl.startsWith("blob:")) {
      context.previewUrls.push(previewUrl);
    }

    previewEl.alt = file.name;
    previewEl.title = `${file.name} (${formatBytes(file.size)})`;
    previewEl.className = "w-full h-full object-cover rounded-md shadow-sm";
    previewGrid.appendChild(previewEl);
  });

  fileCountEl.textContent = imageFiles.length;
  totalSizeEl.textContent = formatBytes(totalSize);

  imageDetails.classList.remove("hidden-section");
  imageDetails.classList.add("visible-section");
}

async function processFiles(context) {
  if (context.imageFiles.length === 0) {
    showError("No files selected to convert.", context);
    return;
  }
  const format = context.formatSelect.value;
  setLoading(true, context, "Converting...");

  try {
    if (format === "pdf") {
      await convertToPdf(context.imageFiles, context);
    } else {
      await convertToZip(context.imageFiles, context);
    }
  } catch (error) {
    console.error("Conversion failed:", error);
    showError("An unexpected error occurred during conversion.", context);
  } finally {
    setLoading(false, context);
  }
}
