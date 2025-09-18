import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';

/**
 * Processes a single image file, including SVGs.
 */
async function handleImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve({ file, image: img });
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Processes all pages of a single PDF file, creating an image preview for each.
 */
async function handlePdfFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
        const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
        const numPages = pdf.numPages;
        const pagePromises = [];

        for (let i = 1; i <= numPages; i++) {
          // Create a self-invoking async function to process each page
          pagePromises.push(
            (async (pageNum) => {
              const page = await pdf.getPage(pageNum);
              const viewport = page.getViewport({ scale: 1.5 });

              const tempCanvas = document.createElement("canvas");
              const tempCtx = tempCanvas.getContext("2d");
              tempCanvas.height = viewport.height;
              tempCanvas.width = viewport.width;

              await page.render({ canvasContext: tempCtx, viewport }).promise;

              const img = new Image();
              const originalFilename = file.name.substring(0, file.name.lastIndexOf("."));

              // Create a file-like object for each page for consistent handling
              const pageFile = {
                name: `${originalFilename}-page-${pageNum}`,
                size: file.size / numPages, // Approximate size
                type: "application/pdf-page", // Custom type
              };

              // Return a new promise that resolves when the image is loaded
              return new Promise((res, rej) => {
                img.onload = () => res({ file: pageFile, image: img });
                img.onerror = rej;
                img.src = tempCanvas.toDataURL("image/png");
              });
            })(i)
          );
        }
        // Resolve the main promise with an array of all page-image objects
        resolve(await Promise.all(pagePromises));
      } catch (error) {
        console.error("Error processing PDF:", file.name, error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export { handleImageFile, handlePdfFile };