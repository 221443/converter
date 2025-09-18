import { formatBytes, showError, hideError, setLoading } from "./utils.js";
import { handleImageFile, handlePdfFile } from "./fileHandler.js";
import { convertToPdf, convertToZip } from "./converter.js";

// DOM element references
const imageInput = document.getElementById("image-input");
const previewGrid = document.getElementById("preview-grid");
const imageDetails = document.getElementById("image-details");
const fileCountEl = document.getElementById("file-count");
const totalSizeEl = document.getElementById("total-size");
const formatSelect = document.getElementById("format-select");
const qualityContainer = document.getElementById("quality-container");
const qualitySlider = document.getElementById("quality-slider");
const qualityValue = document.getElementById("quality-value");
const convertBtn = document.getElementById("convert-btn");
const outputSection = document.getElementById("output-section");
const canvas = document.getElementById("canvas");

let imageFiles = []; // Will store {file, image object}

// --- Event Listeners ---

// Listen for file input changes
imageInput.addEventListener("change", handleFileSelect);

// Listen for format changes to show/hide quality slider
formatSelect.addEventListener("change", () => {
  const selectedFormat = formatSelect.value;
  // PDF output doesn't have a quality setting
  const isQualityVisible = selectedFormat === "jpeg" || selectedFormat === "webp";
  qualityContainer.style.display = isQualityVisible ? "block" : "none";
});

// Update quality value display when slider moves
qualitySlider.addEventListener("input", () => {
  qualityValue.textContent = qualitySlider.value;
});

// Listen for convert button clicks
convertBtn.addEventListener("click", processFiles);

// --- Functions ---

/**
 * Handles the file selection event for multiple files (images and PDFs).
 */
async function handleFileSelect(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  setLoading(true, "Loading files...");
  // Reset state
  imageFiles = [];
  previewGrid.innerHTML = "";
  hideError();
  outputSection.classList.remove("visible-section");
  outputSection.classList.add("hidden-section");

  const filePromises = Array.from(files).map((file) => {
    if (file.type.startsWith("image/")) {
      // SVG is also image/svg+xml, so it is handled by handleImageFile now
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
    imageFiles = results.flat().filter(Boolean); // Flatten results for multi-page PDFs

    if (imageFiles.length === 0) {
      showError("No valid image or PDF files were selected.");
      imageDetails.classList.remove("visible-section");
      imageDetails.classList.add("hidden-section");
      return;
    }

    displayPreviewsAndDetails();
  } catch (error) {
    console.error("Error loading files:", error);
    showError("There was an error loading one or more files.");
  } finally {
    setLoading(false);
  }
}

/**
 * Displays image previews and file details in the UI.
 */
function displayPreviewsAndDetails() {
  let totalSize = 0;
  previewGrid.innerHTML = "";
  imageFiles.forEach(({ file, image }) => {
    totalSize += file.size;
    const previewEl = document.createElement("img");
    previewEl.src = image.src;
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

/**
 * Main function to route to the correct conversion method based on user selection.
 */
async function processFiles() {
  if (imageFiles.length === 0) {
    showError("No files selected to convert.");
    return;
  }
  const format = formatSelect.value;
  setLoading(true, "Converting...");

  if (format === "pdf") {
    await convertToPdf(imageFiles);
  } else {
    await convertToZip(imageFiles);
  }
  setLoading(false);
}
