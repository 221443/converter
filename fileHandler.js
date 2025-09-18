/**
 * Processes a single image file using the modern createImageBitmap method.
 * This is more robust and efficient than using FileReader and new Image().
 */
async function handleImageFile(file) {
  try {
    // createImageBitmap decodes the image off the main thread and is optimized for canvas rendering.
    const imageBitmap = await createImageBitmap(file);
    // The image object can now be an ImageBitmap, which works seamlessly with ctx.drawImage.
    return { file, image: imageBitmap };
  } catch (error) {
    console.error("Could not process image file:", file.name, error);
    // Return null so Promise.all doesn't fail for one bad file.
    return null;
  }
}

/**
 * Processes all pages of a single PDF file, creating an image preview for each.
 */
async function handlePdfFile(file) {
  // This function remains unchanged.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
        const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
        const numPages = pdf.numPages;
        const pagePromises = [];

        for (let i = 1; i <= numPages; i++) {
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

              const pageFile = {
                name: `${originalFilename}-page-${pageNum}`,
                size: file.size / numPages,
                type: "application/pdf-page",
              };

              return new Promise((res, rej) => {
                img.onload = () => res({ file: pageFile, image: img });
                img.onerror = rej;
                img.src = tempCanvas.toDataURL("image/png");
              });
            })(i)
          );
        }
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
