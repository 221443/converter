// converter.js

import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import JSZip from "https://esm.sh/jszip@3.10.1";

/**
 * Helper function to update the UI with the final download link and info.
 * It receives all necessary DOM elements and helpers from the appContext.
 */
function updateDownloadUI(blob, filename, appContext) {
  const { downloadLink, downloadBtnText, newSizeEl, outputSection, formatBytes } = appContext;

  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;
  const fileExt = filename.split('.').pop();
  downloadBtnText.textContent = `Download All (.${fileExt})`;
  newSizeEl.textContent = formatBytes(blob.size);

  outputSection.classList.remove("hidden-section");
  outputSection.classList.add("visible-section");
}

/**
 * Helper function to draw an image onto the shared canvas at a higher resolution.
 * This centralizes the rasterization logic used by both PDF and ZIP conversion.
 */
function rasterizeImage(file, image, appContext) {
  const { canvas, ctx, RASTER_SCALE_FACTOR } = appContext;
  
  // Conditionally set the scale factor. Use 1 for non-SVGs.
  const isSvg = file.type === 'image/svg+xml';
  const scaleFactor = isSvg ? RASTER_SCALE_FACTOR : 1;

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  
  canvas.width = width * scaleFactor;
  canvas.height = height * scaleFactor;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

/**
 * Converts images into a single multi-page PDF.
 * This function now only handles the PDF creation logic.
 */
export async function convertToPdf(imageFiles, appContext) {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < imageFiles.length; i++) {
    const { image } = imageFiles[i];
    if (i > 0) doc.addPage();

    rasterizeImage(image, appContext);
    const imageDataUrl = appContext.canvas.toDataURL("image/jpeg", 0.95);

    const imgProps = doc.getImageProperties(imageDataUrl);
    const pageRatio = pageWidth / pageHeight;
    const imageRatio = imgProps.width / imgProps.height;
    
    let imgWidth, imgHeight;
    if (imageRatio > pageRatio) {
      imgWidth = pageWidth - 20; // margin
      imgHeight = imgWidth / imageRatio;
    } else {
      imgHeight = pageHeight - 20; // margin
      imgWidth = imgHeight * imageRatio;
    }
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    doc.addImage(imageDataUrl, "JPEG", x, y, imgWidth, imgHeight);
  }

  const pdfBlob = doc.output("blob");
  updateDownloadUI(pdfBlob, "converted-files.pdf", appContext);
}

/**
 * Converts images into a zip of individual image files.
 * This function now only handles the zipping logic.
 */
export async function convertToZip(imageFiles, appContext) {
  // Destructure only what's needed for setup.
  // We avoid destructuring 'canvas' here to prevent async bugs.
  const { formatSelect, qualitySlider } = appContext;
  const zip = new JSZip();
  const format = formatSelect.value;
  const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
  const quality = parseFloat(qualitySlider.value);

  // Use map to create an array of promises.
  const conversionPromises = imageFiles.map(({ file, image }) => {
    // Each image conversion gets its own promise.
    return new Promise((resolve, reject) => {
      try {
        // 1. Rasterize the image. This modifies the shared canvas.
        rasterizeImage(file, image, appContext);

        // 2. Immediately call .toBlob(). Its callback is async.
        appContext.canvas.toBlob((blob) => {
          const originalFilename = file.name;
          const lastDotIndex = originalFilename.lastIndexOf(".");
          const nameWithoutExtension = lastDotIndex > 0 ? originalFilename.substring(0, lastDotIndex) : originalFilename;
          const newFilename = `${nameWithoutExtension}.${format}`;
          zip.file(newFilename, blob);

          // 3. Resolve the promise once the blob is created and added to the zip.
          resolve();
        }, mimeType, quality);
      } catch (err) {
        reject(err);
      }
    });
  });

  // Wait for all the blob conversions to complete.
  await Promise.all(conversionPromises);

  const zipBlob = await zip.generateAsync({ type: "blob" });
  updateDownloadUI(zipBlob, "converted-images.zip", appContext);
}