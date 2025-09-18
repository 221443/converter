/**
 * Processes a single image file, creating an ImageBitmap for processing
 * and an Object URL for previews.
 */
async function handleImageFile(file) {
  try {
    const imageBitmap = await createImageBitmap(file);
    // This line creates the URL needed for the thumbnail preview.
    const previewUrl = URL.createObjectURL(file);
	console.log("previewUrl:", previewUrl);    
    // Ensure the returned object includes the 'previewUrl'.
    return { file, image: imageBitmap, previewUrl: previewUrl };
  } catch (error) {
    console.error("Could not process image file:", file.name, error);
    return null;
  }
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
                img.onload = () => {
                  // Ensure the returned object for PDF pages also includes the 'previewUrl'.
                  res({ file: pageFile, image: img, previewUrl: img.src });
                };
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