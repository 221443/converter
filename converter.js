import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import JSZip from "https://esm.sh/jszip@3.10.1";

// --- DOM Element References & Constants ---
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const formatSelect = document.getElementById("format-select");
const downloadLink = document.getElementById("download-link");
const downloadBtnText = document.getElementById("download-btn-text");
const newSizeEl = document.getElementById("new-size");
const outputSection = document.getElementById("output-section");
const qualitySlider = document.getElementById("quality-slider");
const RASTER_SCALE_FACTOR = 10;

/**
 * Converts all loaded images/previews into a single multi-page PDF.
 */
async function convertToPdf(imageFiles) {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < imageFiles.length; i++) {
    const { image } = imageFiles[i];
    if (i > 0) doc.addPage();
    
    // The rest of the logic remains the same.
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    canvas.width = width * RASTER_SCALE_FACTOR;
    canvas.height = height * RASTER_SCALE_FACTOR;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const imgProps = doc.getImageProperties(imageDataUrl);
    const pageRatio = pageWidth / pageHeight;
    const imageRatio = imgProps.width / imgProps.height;
    let imgWidth, imgHeight;
    if (imageRatio > pageRatio) {
      imgWidth = pageWidth - 20;
      imgHeight = imgWidth / imageRatio;
    } else {
      imgHeight = pageHeight - 20;
      imgWidth = imgHeight * imageRatio;
    }
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    doc.addImage(imageDataUrl, "JPEG", x, y, imgWidth, imgHeight);
  }
  
  const pdfBlob = doc.output("blob");
  downloadLink.href = URL.createObjectURL(pdfBlob);
  downloadLink.download = "converted-files.pdf";
  downloadBtnText.textContent = "Download All (.pdf)";
  // Ensure formatBytes is available, likely from a `utils.js` module
  // newSizeEl.textContent = formatBytes(pdfBlob.size);
  outputSection.classList.remove("hidden-section");
  outputSection.classList.add("visible-section");
}

/**
 * Converts all loaded images/previews into a zip of individual image files.
 */
async function convertToZip(imageFiles) {
  const zip = new JSZip();
  const format = formatSelect.value;
  const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
  const quality = parseFloat(qualitySlider.value);

  const conversionPromises = imageFiles.map(({ file, image }) => {
    return new Promise((resolve) => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      canvas.width = width * RASTER_SCALE_FACTOR;
      canvas.height = height * RASTER_SCALE_FACTOR;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const originalFilename = file.name;
        const lastDotIndex = originalFilename.lastIndexOf(".");
        const nameWithoutExtension = lastDotIndex > 0 ? originalFilename.substring(0, lastDotIndex) : originalFilename;
        const newFilename = `${nameWithoutExtension}.${format}`;
        zip.file(newFilename, blob);
        resolve();
      }, mimeType, quality);
    });
  });
  await Promise.all(conversionPromises);

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadLink.href = URL.createObjectURL(zipBlob);
  downloadLink.download = "converted-files.zip";
  downloadBtnText.textContent = "Download All (.zip)";
  // Ensure formatBytes is available
  // newSizeEl.textContent = formatBytes(zipBlob.size);
  outputSection.classList.remove("hidden-section");
  outputSection.classList.add("visible-section");
}

export { convertToPdf, convertToZip };